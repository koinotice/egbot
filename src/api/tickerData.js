import { getPrices } from './public/prices';

const formatPricesByMarket = (prices, exchange) => {
  return Object.keys(prices).reduce((accumulator, current) => {
    const next = accumulator;
    const market = current.split('/')[1];
    if (next[market]) {
      next[market] = Object.assign(accumulator[market], { [current]: prices[current][exchange] });
    } else {
      next[market] = Object.assign({}, { [current]: prices[current][exchange] });
    }
    return next;
  }, {});
};


const getTicker = async (argumentObject) => {
  const exchange = argumentObject.dataParam;

  // don't return if no exchange given
  if (!exchange) {
    return {};
  }
  const prices = await getPrices(exchange);
  const formatted = await formatPricesByMarket(prices, exchange);

  return {
    bySymbol: prices,
    byMarket: formatted,
  };
};


export default getTicker;



// WEBPACK FOOTER //
// ./src/api/tickerData.js