import axios from 'axios';
import { PRIVATE_API_ROOT } from '../../config/apiConfig';

async function executeOrderFor(accountId, pair, type, side, amount, price, stopPrice) {
  const options = {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    data: {
      accountId,
      symbol: pair,
      type,
      side,
      amount,
      price,
      stopPrice,
    },
    url: `${PRIVATE_API_ROOT}/orders/`,
  };

  return axios(options);
}

async function cancelOrderFor(accountId, orderId) {
  const options = {
    method: 'DELETE',
    headers: {
      'content-type': 'application/json',
    },
    data: {
      accountId,
      e_orderId: orderId
    },
    url: `${PRIVATE_API_ROOT}/orders/`,
  };

  return axios(options);
}

async function cancelAllOrdersFor(accountIds, pairs) {
  const options = {
    method: 'DELETE',
    headers: {
      'content-type': 'application/json',
    },
    data: {
      accountIds: accountIds ? [accountIds] : [],
      pairs: pairs ? [pairs] : [],
    },
    url: `${PRIVATE_API_ROOT}/orders/all`,
  };

  return axios(options);
}

async function getAllOrders(status, limit, accountId, pair) {
  const params = {
    status,
    limit,
    accountId,
    pairs: pair,
  };

  const options = {
    method: 'GET',
    headers: {
      'content-type': 'application/json',
    },
    url: `${PRIVATE_API_ROOT}/orders/`,
    params,
  };

  return axios(options);
}

export {
  executeOrderFor,
  cancelOrderFor,
  getAllOrders,
  cancelAllOrdersFor,
};



// WEBPACK FOOTER //
// ./src/api/private/orders.js