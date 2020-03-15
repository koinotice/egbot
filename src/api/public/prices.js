import axios from 'axios';
import { PUBLIC_API_ROOT } from '../../config/apiConfig';

async function getPrices(exchanges, pairs) {
  const options = {
    method: 'GET',
    headers: {
      'content-type': 'application/json',
    },
    params: {
      exchanges: exchanges ? exchanges.toUpperCase() : null,
      pairs
    },
    url: `${PUBLIC_API_ROOT}/prices/`,
  };

  return axios(options);
}

async function getAveragePrices() {
  const options = {
    method: 'GET',
    headers: {
      'content-type': 'application/json',
    },
    url: `${PUBLIC_API_ROOT}/prices/averages`,
  };

  return axios(options);
}

async function getAvgPriceHistory(pair, interval = '1h', bars = 24) {
  const options = {
    method: 'GET',
    headers: {
      'content-type': 'application/json',
    },
    params: {
      pairs: pair ? pair.toUpperCase() : null,
      interval,
      bars
    },
    url: `${PUBLIC_API_ROOT}/prices/history/averages`,
  };

  return axios(options);
}


async function getPriceTimeFrame(exchange, pair, dataFrequency) {
  const interval = dataFrequency.toLowerCase() === 'daily' ? '1d' : '1m';
  const options = {
    method: 'GET',
    headers: {
      'content-type': 'application/json'
    },
    url: `${PUBLIC_API_ROOT}/prices/timeframes/exchange/${exchange.toUpperCase()}/pair/${pair.toUpperCase().replace('/', '%2F')}/interval/${interval}`
  };
  return axios(options);
}

export { getPrices, getAvgPriceHistory, getAveragePrices, getPriceTimeFrame };



// WEBPACK FOOTER //
// ./src/api/public/prices.js