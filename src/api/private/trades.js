import axios from 'axios';
import { PRIVATE_API_ROOT } from '../../config/apiConfig';

async function syncAndGetTradesFor(accountId, pair) {
  const options = {
    method: 'GET',
    headers: {
      'content-type': 'application/json',
    },
    url: `${PRIVATE_API_ROOT}/trades/pair/accounts/${accountId}/`,
    params: {
      pair
    }
  };

  return axios(options);
}


async function getTradesBy(accountId, pairs) {
  const options = {
    method: 'GET',
    headers: {
      'content-type': 'application/json',
    },
    url: `${PRIVATE_API_ROOT}/trades/accounts/${accountId}/`,
    params: {
      pairs
    }
  };

  return axios(options);
}

async function getAllTrades() {
  const params = {
    limit: 100,
  };

  const options = {
    method: 'GET',
    headers: {
      'content-type': 'application/json',
    },
    url: `${PRIVATE_API_ROOT}/trades/`,
    params,
  };

  return axios(options);
}

async function postManualTrade(accountId, pair, side, amount, price, fee, feeAsset, timestamp) {
  const options = {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    url: `${PRIVATE_API_ROOT}/trades/accounts/${accountId}/`,
    data: {
      pair,
      side,
      amount,
      price,
      fee,
      feeAsset,
      timestamp,
    }
  };
  return axios(options);
}

async function deleteTrade(id) {
  const options = {
    method: 'DELETE',
    headers: {
      'content-type': 'application/json',
    },
    url: `${PRIVATE_API_ROOT}/trades/${id}`,
  };
  return axios(options);
}

async function putManualTrade(accountId, tradeId, pair, side, amount, price, fee, feeAsset, timestamp) {
  const options = {
    method: 'PUT',
    headers: {
      'content-type': 'application/json',
    },
    url: `${PRIVATE_API_ROOT}/trades/${tradeId}`,
    data: {
      accountId,
      pair,
      side,
      amount,
      price,
      fee,
      feeAsset,
      timestamp,
    }
  };
  return axios(options);
}

export { syncAndGetTradesFor, getAllTrades, postManualTrade, deleteTrade, putManualTrade, getTradesBy };



// WEBPACK FOOTER //
// ./src/api/private/trades.js