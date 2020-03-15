import debounce from 'lodash/debounce';
import logger from '../logger';
import { formatAmount } from '../helpers';
import { getTradesBy } from '../../api/private/trades';
import { getSessionToken } from '../token';

export default class ChartTradeHistoryHandler {
  constructor(exchange, account, pair, chart = null) {
    this.exchange = exchange;
    this.account = account;
    this.pair = pair;
    this.chart = chart;

    this.tradeHistoryData = [];
    this.tradeIndicators = [];

    this.debouncedFilterTradesToVisibleRange = debounce(this.filterTradesToVisibleRange, 500);

    this.chart.onVisibleRangeChanged().subscribe(this, () => {
      this.debouncedFilterTradesToVisibleRange();
    });
    if (this.account) this.fetchTrades();
  }

  clearTradeHistoryFromChart() {
    if (!this.tradeIndicators.length) {
      return;
    }

    this.tradeIndicators.forEach(tradeIndicator => tradeIndicator.remove());
    this.tradeIndicators = [];
  }

  createSellIndicator = () => (
    this.chart.createExecutionShape()
      .setArrowColor('#F00')
      .setDirection('sell')
  )

  createBuyIndicator = () => (
    this.chart.createExecutionShape()
      .setArrowColor('#0F0')
      .setDirection('buy')
  )

  async drawTradesOnChart(trades) {
    if (!this.chart) {
      logger.error('no reference to chart');
      return;
    }

    this.clearTradeHistoryFromChart();
    trades.forEach((trade) => {
      const base = trade.pair.split('/')[0];
      const { side } = trade;
      const price = parseFloat(trade.price);
      const amount = formatAmount(base, trade.amount);
      const timestamp = new Date(trade.e_timestamp).getTime() / 1000;

      const tradeIndicator = side.toUpperCase() === 'BUY' ? this.createBuyIndicator() : this.createSellIndicator();
      tradeIndicator
        .setPrice(amount)
        .setTime(timestamp)
        .setTooltip(`${side.toUpperCase()} ${amount} @ ${price}`);
      this.tradeIndicators.push(tradeIndicator);
    });
  }

  filterTradesToVisibleRange() {
    if (!this.tradeHistoryData.length) {
      return;
    }

    const visibleRange = this.chart.getVisibleRange();
    const fromTimeInMs = visibleRange.from * 1000;
    const toTimeInMs = ((visibleRange.to * 1000) === 0 || (visibleRange.to * 1000) > Date.now()) ? Date.now() : visibleRange.to * 1000;

    const visibleTrades = this.tradeHistoryData.filter((trade) => {
      const timestampInMs = new Date(trade.e_timestamp).getTime();
      return (timestampInMs >= fromTimeInMs && timestampInMs <= toTimeInMs);
    });

    this.drawTradesOnChart(visibleTrades);
  }

  async fetchTrades() {
    if (!getSessionToken()) return;

    this.tradeHistoryData = await getTradesBy(this.account, this.pair);
    this.debouncedFilterTradesToVisibleRange();
  }

  showTradesOnChart(exchange, account, pair) {
    const oldExchange = this.exchange;
    const oldAccount = this.account;
    const oldPair = this.pair;

    this.exchange = exchange;
    this.account = account;
    this.pair = pair;

    if (this.exchange !== oldExchange || this.account !== oldAccount || this.pair !== oldPair) {
      this.clearTradeHistoryFromChart();
      if (this.account) this.fetchTrades();
    }
  }
}



// WEBPACK FOOTER //
// ./src/utils/chart/chartTradeHistoryHandler.js