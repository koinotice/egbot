import { put, takeLatest, call, select } from 'redux-saga/effects';
import getAccounts, { postManualAccount, deleteAccount as deleteAccountById, updateAccountLabel as updateAccountLabelById } from '../../../api/private/accounts';
import { postManualTrade, deleteTrade as deleteTradeById, putManualTrade } from '../../../api/private/trades';
import {
  deleteTransaction as deleteTransactionById,
  postManualTransaction,
  putManualTransaction
} from '../../../api/private/transactions';
import { fetchMarkets } from './exchangeMarkets';
import { updateAccount } from '../trade/interactions';
import { fetchBalances } from './balances';
import { subscribeOpenOrders } from './orders';
import { fetchUserTradeHistory } from '../trade/userTradeHistory';
import { fetchTransactionHistory } from '../trade/transactionHistory';
import logger from '../../../utils/logger';
import { showNotification } from './notifications';

const initialState = {
  accounts: [],
  accountsLoaded: false
};

/* *********************************************** Actions *********************************************** */

const FETCH_ACCOUNTS = 'global/FETCH_ACCOUNTS';
const DELETE_ACCOUNT = 'global/DELETE_ACCOUNT';
const UPDATE_ACCOUNT_LABEL = 'global/UPDATE_ACCOUNT_LABEL';
const CREATE_MANUAL_ACCOUNT = 'global/CREATE_MANUAL_ACCOUNT';
const CREATE_MANUAL_TRANSACTIONS = 'global/CREATE_MANUAL_TRANSACTIONS';
const UPDATE_MANUAL_TRANSACTIONS = 'global/UPDATE_MANUAL_TRANSACTIONS';
const DELETE_MANUAL_TRANSACTIONS = 'global/DELETE_MANUAL_TRANSACTIONS';
const CREATE_MANUAL_TRADES = 'global/CREATE_MANUAL_TRADES';
const UPDATE_MANUAL_TRADES = 'global/UPDATE_MANUAL_TRADES';
const DELETE_MANUAL_TRADES = 'global/DELETE_MANUAL_TRADES';
const SET_ACCOUNTS = 'global/SET_ACCOUNTS';


/* ******************************************* Actions Creators ****************************************** */

function fetchAccounts() {
  return {
    type: FETCH_ACCOUNTS,
  };
}

function deleteAccount(accountId) {
  return {
    type: DELETE_ACCOUNT,
    accountId,
  };
}

function updateAccountLabel(accountId, newLabel) {
  return {
    type: UPDATE_ACCOUNT_LABEL,
    accountId,
    newLabel,
  };
}

function setAccounts(data) {
  return {
    type: SET_ACCOUNTS,
    data
  };
}

function createManualAccount(label) {
  return {
    type: CREATE_MANUAL_ACCOUNT,
    label,
  };
}

function createManualTrade(accountId, pair, side, amount, price, fee, feeAsset, timestamp) {
  return {
    type: CREATE_MANUAL_TRADES,
    accountId,
    pair,
    side,
    amount,
    price,
    fee,
    feeAsset,
    timestamp,
  };
}

function createManualTransaction(accountId, asset, timestamp, transactionType, amount, fee) {
  return {
    type: CREATE_MANUAL_TRANSACTIONS,
    accountId,
    asset,
    timestamp,
    transactionType,
    amount,
    fee,
  };
}

function updateManualTransaction(accountId, transactionId, asset, timestamp, transactionType, amount, fee) {
  return {
    type: UPDATE_MANUAL_TRANSACTIONS,
    accountId,
    transactionId,
    asset,
    timestamp,
    transactionType,
    amount,
    fee,
  };
}

function updateManualTrade(accountId, tradeId, pair, side, amount, price, fee, feeAsset, timestamp) {
  return {
    type: UPDATE_MANUAL_TRADES,
    accountId,
    tradeId,
    pair,
    side,
    amount,
    price,
    fee,
    feeAsset,
    timestamp,
  };
}

function deleteManualTransaction(transactionId) {
  return {
    type: DELETE_MANUAL_TRANSACTIONS,
    transactionId,
  };
}

function deleteManualTrade(tradeId) {
  return {
    type: DELETE_MANUAL_TRADES,
    tradeId,
  };
}

/* *********************************************** Reducers *********************************************** */

function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case SET_ACCOUNTS:
      return {
        ...state,
        accounts: action.data,
        accountsLoaded: true
      };
    default:
      return state;
  }
}

/* ************************************************ Sagas ************************************************ */

function* fetchAccountsWorker() {
  const accounts = yield call(getAccounts);
  if (accounts.error) {
    logger.error('Error fetching accounts:', accounts.error);
    return;
  }

  yield put(setAccounts(accounts));
  if (!accounts.length) return;

  yield put(fetchBalances());
  yield put(subscribeOpenOrders(true));
  const state = yield select();
  const { marketsLoaded } = state.global.markets;
  if (!marketsLoaded) {
    yield put(fetchMarkets());
  }
}

function* fetchAccountsWatcher() {
  yield takeLatest(FETCH_ACCOUNTS, fetchAccountsWorker);
}

function* deleteAccountWorker(data) {
  const { accountId } = data;
  const response = yield call(deleteAccountById, accountId);
  if (response.error) {
    logger.error('Error deleting account:', response.error);
    yield put(showNotification({ error: 'Could not delete account! Please try again later.' }));
    return;
  }
  yield put(showNotification({ data: 'Account Deleted!' }));
  yield put(fetchAccounts());
}

function* deleteAccountWatcher() {
  yield takeLatest(DELETE_ACCOUNT, deleteAccountWorker);
}

function* updateAccountLabelWorker(data) {
  const { accountId, newLabel } = data;
  const response = yield call(updateAccountLabelById, accountId, newLabel);
  if (response.error) {
    logger.error('Error updating account:', response.error);
    yield put(showNotification({ error: 'Could not update account label! Please try again later.' }));
    return;
  }
  yield put(showNotification({ data: 'Account Label Updated!' }));
  yield put(fetchAccounts());
}

function* updateAccountLabelWatcher() {
  yield takeLatest(UPDATE_ACCOUNT_LABEL, updateAccountLabelWorker);
}

function* createManualAccountWorker(data) {
  const { label } = data;
  const response = yield call(postManualAccount, label);
  if (response.error) {
    logger.error('Error creating manual account:', response.error);
    return;
  }

  const accounts = yield call(getAccounts);
  if (accounts.error) {
    logger.error('Error fetching accounts:', accounts.error);
    return;
  }
  yield put(setAccounts(accounts));
  yield put(updateAccount(response.id));
}

function* createManualAccountWatcher() {
  yield takeLatest(CREATE_MANUAL_ACCOUNT, createManualAccountWorker);
}


function* createManualTradeWorker(data) {
  const {
    accountId, pair, side, amount, price, fee, feeAsset, timestamp
  } = data;
  const response = yield call(postManualTrade, accountId, pair, side, amount, price, fee, feeAsset, timestamp);
  if (response.error) {
    logger.error('Error creating manual trade:', response.error);
    return;
  }
  yield put(fetchBalances());
  yield put(fetchUserTradeHistory());
}

function* createManualTradeWatcher() {
  yield takeLatest(CREATE_MANUAL_TRADES, createManualTradeWorker);
}


function* createManualTransactionWorker(data) {
  const {
    accountId, asset, amount, fee, timestamp, transactionType
  } = data;
  const response = yield call(postManualTransaction, accountId, asset, amount, fee, timestamp, transactionType);
  if (response.error) {
    logger.error('Error creating manual transaction:', response.error);
    return;
  }
  yield put(fetchBalances());
  yield put(fetchTransactionHistory(accountId));
}

function* createManualTransactionWatcher() {
  yield takeLatest(CREATE_MANUAL_TRANSACTIONS, createManualTransactionWorker);
}


function* updateManualTransactionWorker(data) {
  const {
    accountId, transactionId, asset, amount, fee, timestamp, transactionType
  } = data;

  const response = yield call(putManualTransaction, accountId, transactionId, asset, amount, fee, timestamp, transactionType);
  if (response.error) {
    logger.error('Error updating manual transaction:', response.error);
    return;
  }
  yield put(fetchBalances());
  yield put(fetchTransactionHistory(accountId));
}

function* updateManualTransactionWatcher() {
  yield takeLatest(UPDATE_MANUAL_TRANSACTIONS, updateManualTransactionWorker);
}

function* updateManualTradeWorker(data) {
  const {
    accountId, tradeId, pair, side, amount, price, fee, feeAsset, timestamp
  } = data;

  const response = yield call(putManualTrade, accountId, tradeId, pair, side, amount, price, fee, feeAsset, timestamp);
  if (response.error) {
    logger.error('Error updating manual trade:', response.error);
    return;
  }
  yield put(fetchBalances());
  yield put(fetchUserTradeHistory());
}

function* updateManualTradeWatcher() {
  yield takeLatest(UPDATE_MANUAL_TRADES, updateManualTradeWorker);
}


function* deleteManualTransactionWorker(data) {
  const deleteTransactionResponse = yield call(deleteTransactionById, data.transactionId);
  if (deleteTransactionResponse.error) {
    logger.error('Error deleting manual transaction:', deleteTransactionResponse.error);
    return;
  }

  const state = yield select();
  const { currentAccountId } = state.trade.interactions;

  yield put(fetchBalances());
  yield put(fetchTransactionHistory(currentAccountId));
}

function* deleteManualTransactionWatcher() {
  yield takeLatest(DELETE_MANUAL_TRANSACTIONS, deleteManualTransactionWorker);
}

function* deleteManualTradeWorker(data) {
  const response = yield call(deleteTradeById, data.tradeId);
  if (response.error) {
    logger.error('Error deleting manual trade:', response.error);
    return;
  }

  yield put(fetchBalances());
  yield put(fetchUserTradeHistory());
}

function* deleteManualTradeWatcher() {
  yield takeLatest(DELETE_MANUAL_TRADES, deleteManualTradeWorker);
}

/* ******************************************************************************************************* */

export { // action creators
  fetchAccounts,
  deleteAccount,
  updateAccountLabel,
  createManualAccount,
  createManualTrade,
  updateManualTrade,
  deleteManualTrade,
  createManualTransaction,
  updateManualTransaction,
  deleteManualTransaction,
};
export const sagas = [
  fetchAccountsWatcher,
  deleteAccountWatcher,
  updateAccountLabelWatcher,
  createManualAccountWatcher,
  createManualTradeWatcher,
  createManualTransactionWatcher,
  updateManualTransactionWatcher,
  deleteManualTransactionWatcher,
  updateManualTradeWatcher,
  deleteManualTradeWatcher,
];
export default reducer;



// WEBPACK FOOTER //
// ./src/store/ducks/global/accounts.js