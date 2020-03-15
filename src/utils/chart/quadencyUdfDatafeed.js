import { UDFCompatibleDatafeed } from '../../lib/trading_view/datafeeds/udf/lib/udf-compatible-datafeed';

export default class QuadencyUdfDatafeed extends UDFCompatibleDatafeed {
  constructor(datafeedURL, exchange, pair) {
    super(datafeedURL);
    this.currentResolution = null;
    this.subscriptionCallBack = null;
    this.currentBar = {};
    this.exchange = exchange;
    this.pair = pair;

    this.WEEK = 604800000;
    this.DAY = 86400000;
    this.MINUTE = 60000;

    this.resetCacheFn = null;
  }

  resetFeed() {
    if (this.resetCacheFn) {
      this.resetCacheFn();
      this.resetCacheFn = null;
    }
  }

  setExchange(exchange) {
    this.exchange = exchange;
  }

  setPair(pair) {
    this.pair = pair;
  }

  resolutionToTime(resolution) {
    // if no resolution, there's probably an issue, but default to minute;
    if (!resolution) {
      return this.MINUTE;
    }

    const unit = resolution.slice(resolution.length - 1, resolution.length);
    if (unit === 'D') {
      // assuming D = week, xD = x days
      if (resolution === 'D') {
        return this.WEEK;
      }
      const value = parseInt(resolution.slice(0, resolution.length - 1), 10);
      return (value * this.DAY);
    }

    const value = parseInt(resolution.slice(0, resolution.length), 10);
    return (value * this.MINUTE);
  }

  getNearestBarTime(resolution) {
    const currentTime = Date.now();
    return ((Math.floor(currentTime / this.resolutionToTime(resolution)) * this.resolutionToTime(resolution)));
  }

  buildCurrentBarFromLastBar(resolution, lastBar) {
    if (Object.keys(this.currentBar).length) {
      return;
    }
    const currentBarTime = this.getNearestBarTime(resolution);
    if (!Object.keys(lastBar).length || (Object.keys(lastBar).length && currentBarTime < lastBar.time)) {
      return;
    }

    if (currentBarTime > lastBar.time) {
      this.currentBar = {
        time: currentBarTime,
        open: lastBar.close,
        high: lastBar.close,
        low: lastBar.close,
        close: lastBar.close,
        volume: 0,
      };
      return;
    }
    if (currentBarTime === lastBar.time) {
      this.currentBar = {
        time: currentBarTime,
        open: lastBar.open,
        high: lastBar.high,
        low: lastBar.low,
        close: lastBar.close,
        volume: lastBar.volume,
      };
    }
  }

  getBars(symbolInfo, resolution, rangeStartDate, rangeEndDate, onResult, onError) {
    this.currentResolution = resolution;
    const overrideOnResult = (bars, meta) => {
      if (symbolInfo.currentExchange === this.exchange && symbolInfo.name === this.pair) {
        const lastBar = (bars.length > 0) ? bars[bars.length - 1] : {};
        this.buildCurrentBarFromLastBar(resolution, lastBar);
        onResult(bars, meta);
        return;
      }
      this.currentBar = {};
    };
    symbolInfo.currentExchange = this.exchange;
    super.getBars(symbolInfo, resolution, rangeStartDate, rangeEndDate, overrideOnResult, onError);
  }

  tickerOlderThanCurrentBarTime(ticker, currentBarTime) {
    if (ticker.ts < this.currentBar.time) {
      return;
    }
    const tickerPrice = parseFloat(ticker.price);
    this.currentBar = {
      time: currentBarTime,
      open: this.currentBar.close,
      high: tickerPrice,
      low: tickerPrice,
      close: tickerPrice,
      volume: 0,
    };
    if (this.subscriptionCallBack) {
      this.subscriptionCallBack(JSON.parse(JSON.stringify(this.currentBar)));
    }
  }

  tickerEqualCurrentBarTime(ticker, currentBarTime) {
    if (ticker.ts < this.currentBar.time) {
      return;
    }

    const tickerPrice = parseFloat(ticker.price);
    const tickerVolume = parseFloat(ticker.volume);
    this.currentBar = {
      time: currentBarTime,
      open: this.currentBar.open,
      high: tickerPrice > this.currentBar.high ? tickerPrice : this.currentBar.high,
      low: tickerPrice < this.currentBar.low ? tickerPrice : this.currentBar.low,
      close: tickerPrice,
      volume: this.currentBar.volume + tickerVolume,
    };
    if (this.subscriptionCallBack) {
      this.subscriptionCallBack(JSON.parse(JSON.stringify(this.currentBar)));
    }
  }

  tickerNewerThanCurrentBarTime(ticker, currentBarTime) {
    // no bars for awhile, update to new bar
    if (ticker.ts < this.currentBar.time) {
      return;
    }

    if (this.currentBar.time < currentBarTime) {
      const tickerPrice = parseFloat(ticker.price);
      const tickerVolume = parseFloat(ticker.amount);
      this.currentBar = {
        time: currentBarTime,
        open: this.currentBar.close,
        high: tickerPrice > this.currentBar.close ? tickerPrice : this.currentBar.close,
        low: tickerPrice < this.currentBar.close ? tickerPrice : this.currentBar.close,
        close: tickerPrice,
        volume: tickerVolume,
      };
    } else {
      const tickerPrice = parseFloat(ticker.price);
      const tickerVolume = parseFloat(ticker.amount);
      this.currentBar = {
        time: currentBarTime,
        open: this.currentBar.open,
        high: tickerPrice > this.currentBar.high ? tickerPrice : this.currentBar.high,
        low: tickerPrice < this.currentBar.low ? tickerPrice : this.currentBar.low,
        close: tickerPrice,
        volume: this.currentBar.volume + tickerVolume,
      };
    }

    if (this.subscriptionCallBack) {
      this.subscriptionCallBack(JSON.parse(JSON.stringify(this.currentBar)));
    }
  }

  updateCurrentCandle(ticker) {
    const currentBarTime = this.getNearestBarTime(this.currentResolution);
    if (!Object.keys(this.currentBar).length) {
      return;
    }

    // create new bar from latest prices
    if (ticker.ts < currentBarTime) {
      this.tickerOlderThanCurrentBarTime(ticker, currentBarTime);
      return;
    }

    // update bar with highs/lows/closes/volumes
    if (ticker.ts === currentBarTime) {
      this.tickerEqualCurrentBarTime(ticker, currentBarTime);
      return;
    }

    this.tickerNewerThanCurrentBarTime(ticker, currentBarTime);
  }


  // eslint-disable-next-line no-unused-vars
  subscribeBars(symbolInfo, resolution, onTick, listenerGuid, onResetCacheNeededCallback) {
    this.resetCacheFn = onResetCacheNeededCallback;
    this.subscriptionCallBack = onTick;
  }

  unsubscribeBars(listenerGuid) {
    this.currentBar = {};
    this.currentResolution = null;
    this.subscriptionCallBack = null;
    super.unsubscribeBars(listenerGuid);
  }

  resolveSymbol(symbolName, onSymbolResolvedCallback, onResolveErrorCallback) {
    const symbol = symbolName.includes(':') ? symbolName.split(':')[1] : symbolName;
    super.resolveSymbol(symbol, onSymbolResolvedCallback, onResolveErrorCallback);
  }
}



// WEBPACK FOOTER //
// ./src/utils/chart/quadencyUdfDatafeed.js