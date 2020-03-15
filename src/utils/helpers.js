import numeral from 'numeral';
import 'numeral/locales';
import uniq from 'lodash/uniq';
import { FIATS } from '../config/globalConfig';

/* ************************************************ styling helpers ************************************************ */
function getChangeColor(changeVal, theme) {
  const green = theme ? theme.palette.icons.green : '#7ED321';
  const red = theme ? theme.palette.icons.red : '#D35847';

  return (changeVal >= 0) ? green : red;
}

function getAssetsFrom(pairs) {
  const assetSets = new Set();
  pairs.forEach((pair) => {
    const [base, quote] = pair.split('/');
    assetSets.add(base);
    assetSets.add(quote);
  });
  return Array.from(assetSets);
}

function getBasePrecisionFrom(value, precisionForPair) {
  if ((typeof value) === 'number') {
    return precisionForPair.base ? value.toFixed(precisionForPair.base) : value.toFixed(8);
  }
  return precisionForPair.base ? parseFloat(value).toFixed(precisionForPair.base) : parseFloat(value).toFixed(8);
}

function getQuotePrecisionFrom(value, precisionForPair) {
  if ((typeof value) === 'number') {
    return precisionForPair.quote ? value.toFixed(precisionForPair.quote) : value.toFixed(8);
  }
  return precisionForPair.quote ? parseFloat(value).toFixed(precisionForPair.quote) : parseFloat(value).toFixed(8);
}

function getPricePrecisionFrom(value, precisionForPair) {
  if ((typeof value) === 'number') {
    return precisionForPair && precisionForPair.price ? value.toFixed(precisionForPair.price) : value.toFixed(8);
  }
  return precisionForPair && precisionForPair.price ? parseFloat(value).toFixed(precisionForPair.price) : parseFloat(value).toFixed(8);
}

function getAmountPrecisionFrom(value, precisionForPair) {
  if ((typeof value) === 'number') {
    return precisionForPair ? value.toFixed(precisionForPair.amount) : value.toFixed(8);
  }
  return precisionForPair ? parseFloat(value).toFixed(precisionForPair.amount) : parseFloat(value).toFixed(8);
}

function getTotalPrecisionFrom(value, precisionForPair) {
  const precision = (precisionForPair.amount + precisionForPair.price) > 8 ? 8 : (precisionForPair.amount + precisionForPair.price);
  if ((typeof value) === 'number') {
    return value.toFixed(precision);
  }
  return parseFloat(value).toFixed(precision);
}

function getBTCUSDPrice(prices, price24h) {
  if (prices['BTC/USD']) {
    return price24h ? prices['BTC/USD'].price24h : prices['BTC/USD'].price;
  }
  return 0;
}

function isFiat(asset) {
  return FIATS.includes(asset);
}

function getAveragePriceObject(pair, prices) {
  if (prices[pair]) {
    return prices[pair];
  }
  return null;
}

function getPriceInPrefCurrency(asset, prefCurrency, prices, forex, price24h = false, btcUSDPriceOverride = false) {
  const btcUSDPrice = btcUSDPriceOverride || getBTCUSDPrice(prices, price24h);
  let conversionFactor;
  if (prefCurrency === 'BTC') {
    conversionFactor = 1 / btcUSDPrice; // ie USD -> BTC
  } else {
    conversionFactor = forex[`USD/${prefCurrency}`]; // ie USD -> GBP
  }
  // if asset is BTC, return BTC/USD price or avg BTC/USD price from fiat exchanges
  if (asset === 'BTC') {
    return btcUSDPrice * conversionFactor;
  }

  // if asset is fiat return foreign exchange rate
  if (forex[`USD/${asset}`]) return (1 / forex[`USD/${asset}`]) * conversionFactor;


  // get asset price against BTC and then convert to prefCurrency
  let priceObj = getAveragePriceObject(`${asset}/BTC`, prices);
  if (priceObj) {
    return price24h ?
      (priceObj.price24h * btcUSDPrice * conversionFactor) :
      (priceObj.price * btcUSDPrice * conversionFactor);
  }

  // get BTC price against asset and convert to USD (mostly stablecoins)
  priceObj = getAveragePriceObject(`BTC/${asset}`, prices);
  if (priceObj) {
    return price24h ?
      (1 / priceObj.price24h) * btcUSDPrice * conversionFactor :
      (1 / priceObj.price) * btcUSDPrice * conversionFactor;
  }

  // if asset price is only available against USD
  priceObj = getAveragePriceObject(`${asset}/USD`, prices);
  if (priceObj) {
    return price24h ? parseFloat(priceObj.price24h) * conversionFactor : parseFloat(priceObj.price) * conversionFactor;
  }

  // finally return 0 if not found
  return 0;
}

function convertGivenUSDRate(toCurrency, usdRate, prices, forex) {
  const btcUSDPrice = getBTCUSDPrice(prices, false);

  if (toCurrency === 'USD') {
    return usdRate;
  }
  if (toCurrency === 'BTC') {
    return usdRate * (1 / btcUSDPrice);
  }
  if (forex[`USD/${toCurrency}`]) {
    return usdRate * forex[`USD/${toCurrency}`];
  }
  return 0;
}

function getPairsForAsset(asset, exchangeMarkets) {
  const quoteAssets = uniq(Object.keys(exchangeMarkets).map((pair) => {
    return exchangeMarkets[pair].quote;
  }));
  return Object.keys(exchangeMarkets).filter((market) => {
    return exchangeMarkets[market].active &&
      (
        (exchangeMarkets[market].base === asset) ||
        (exchangeMarkets[market].quote === asset && quoteAssets.includes(exchangeMarkets[market].base))
      );
  }).sort();
}

function getPairForSparkline(symbol, prefCurrency, prices) {
  if (prefCurrency === 'BTC') {
    return `${symbol}/BTC`;
  }

  const allPairs = Object.keys(prices);
  let pair = allPairs.find((p) => {
    const [base, quote] = p.split('/');
    if (base === symbol) {
      return quote.includes(prefCurrency);
    }
    return false;
  });
  if (!pair) {
    pair = allPairs.find((p) => {
      const [base, quote] = p.split('/');
      if (base === symbol) {
        return quote.includes('USD') || quote.includes('USDT');
      }
      return false;
    });
  }
  return pair;
}

/* ************************************************ number formatters ************************************************ */

function setLocale(symbol) {
  switch (symbol) {
    case 'GBP':
      numeral.locale('en-gb');
      break;
    case 'EUR':
      numeral.locale('es-es');
      break;
    case 'ZAR':
      numeral.locale('en-za');
      break;
    case 'JPY':
      numeral.locale('chs');
      break;
    default:
      numeral.locale('en');
      break;
  }
}

// value is of type number
function formatAmount(symbol, value, abbrv = false) {
  let format;

  if (Math.abs(value) < 0.01 || !isFiat(symbol)) {
    format = abbrv ? '0.000a' : '0,0.00[000000]';
  } else {
    format = abbrv ? '0.000a' : '0,0.00';
  }

  const number = numeral(value);
  return number.format(format);
}

function formatCurrency(symbol, value, abbrv = false) {
  if (!isFiat(symbol)) return formatAmount(symbol, value, abbrv);

  const number = numeral(value);
  let format;
  if (Math.abs(value) < 0.01) {
    format = abbrv ? '$0.000a' : '$0,0.00[000000]';
  } else {
    format = abbrv ? '$0.000a' : '$0,0.00';
  }

  return number.format(format);
}

function formatChangePct(symbol, value) {
  value *= 100;
  if (Math.abs(value) > 0.01) {
    return value >= 0 ? `+${value.toFixed(2)}%` : `${value.toFixed(2)}%`;
  }
  return value >= 0 ? `+${value.toFixed(4)}%` : `${value.toFixed(4)}%`;
}

/* ************************************************ string formatters ************************************************ */

function ellipsize(text, length) {
  if (text.length > length) { return `${text.substring(0, length)}...`; }
  return text;
}

/* ************************************************ misc util functions ********************************************** */

function calcPercentChange(newVal, oldVal) {
  const change = newVal - oldVal;
  const quotient = change / oldVal;
  if (isNaN(quotient)) return 0;
  return quotient;
}

function isMarketPrefCurrency(market, prefCurrency) {
  return market === prefCurrency;
}

export {
  getAssetsFrom,
  getChangeColor,
  formatCurrency,
  formatChangePct,
  formatAmount,
  getPricePrecisionFrom,
  getAmountPrecisionFrom,
  getBasePrecisionFrom,
  getQuotePrecisionFrom,
  getTotalPrecisionFrom,
  getPriceInPrefCurrency,
  convertGivenUSDRate,
  getPairsForAsset,
  getPairForSparkline,
  isMarketPrefCurrency,
  ellipsize,
  calcPercentChange,
  isFiat,
  setLocale,
};



// WEBPACK FOOTER //
// ./src/utils/helpers.js