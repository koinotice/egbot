import axios from 'axios';
import { PUBLIC_API_ROOT } from '../../config/apiConfig';

async function getCoinInfo(symbol) {
  const options = {
    method: 'GET',
    headers: {
      'content-type': 'application/json'
    },
    params: {
      symbols: symbol
    },
    url: `${PUBLIC_API_ROOT}/coins/`
  };

  return axios(options);
}

async function getCoinsSummary() {
  const options = {
    method: 'GET',
    headers: {
      'content-type': 'application/json'
    },
    url: `${PUBLIC_API_ROOT}/coins/summary`,
  };

  return axios(options);
}

async function getCoinProfile(symbol) {
  const options = {
    method: 'GET',
    headers: {
      'content-type': 'application/json'
    },
    params: {
      symbol
    },
    url: `${PUBLIC_API_ROOT}/coins/profile`,
  };

  return axios(options);
}

async function getCoins(offset, limit, sortBy, order, search) {
  const options = {
    method: 'GET',
    headers: {
      'content-type': 'application/json'
    },
    params: {
      offset,
      limit,
      sort_by: sortBy,
      order,
      search
    },
    url: `${PUBLIC_API_ROOT}/coins/page`,
  };

  return axios(options);
}

export { getCoinInfo, getCoinsSummary, getCoinProfile, getCoins };



// WEBPACK FOOTER //
// ./src/api/public/coins.js