import axios from 'axios';
import { PRIVATE_API_ROOT } from '../../config/apiConfig';


async function postManualTransaction(accountId, asset, amount, fee, timestamp, transactionType) {
  const options = {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    url: `${PRIVATE_API_ROOT}/transactions/accounts/${accountId}/`,
    data: {
      asset,
      amount,
      fee,
      timestamp,
      type: transactionType,
    }
  };
  return axios(options);
}

async function putManualTransaction(accountId, transactionId, asset, amount, fee, timestamp, transactionType) {
  const options = {
    method: 'PUT',
    headers: {
      'content-type': 'application/json',
    },
    url: `${PRIVATE_API_ROOT}/transactions/${transactionId}`,
    data: {
      accountId,
      asset,
      amount,
      fee,
      timestamp,
      type: transactionType,
    }
  };
  return axios(options);
}

async function getTransactionsBy(accountId) {
  const options = {
    method: 'GET',
    headers: {
      'content-type': 'application/json',
    },
    url: `${PRIVATE_API_ROOT}/transactions/accounts/${accountId}/`,
  };
  return axios(options);
}

async function getTransactions() {
  const options = {
    method: 'GET',
    headers: {
      'content-type': 'application/json',
    },
    url: `${PRIVATE_API_ROOT}/transactions/`,
  };
  return axios(options);
}

async function deleteTransaction(id) {
  const options = {
    method: 'DELETE',
    headers: {
      'content-type': 'application/json',
    },
    url: `${PRIVATE_API_ROOT}/transactions/${id}`,
  };
  return axios(options);
}

export { postManualTransaction, putManualTransaction, getTransactionsBy, getTransactions, deleteTransaction };



// WEBPACK FOOTER //
// ./src/api/private/transactions.js