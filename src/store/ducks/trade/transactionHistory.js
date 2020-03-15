import { takeEvery, call, put, select } from 'redux-saga/effects';
import { getTransactionsBy, getTransactions } from '../../../api/private/transactions';
import logger from '../../../utils/logger';

const initialState = {
  transactionHistory: [],
  isLoaded: false,
};

/* *********************************************** Actions *********************************************** */

const FETCH_TRANSACTION_HISTORY = 'trade/FETCH_TRANSACTION_HISTORY';
const FETCH_TRANSACTION_HISTORY_COMPLETE = 'trade/FETCH_TRANSACTION_HISTORY_COMPLETE';


/* ******************************************* Actions Creators ****************************************** */

function fetchTransactionHistory(accountId) {
  return {
    type: FETCH_TRANSACTION_HISTORY,
    overrideAccountId: accountId
  };
}

function fetchTransactionHistoryComplete(transactionHistory) {
  return {
    type: FETCH_TRANSACTION_HISTORY_COMPLETE,
    transactionHistory,
  };
}

/* *********************************************** Reducers *********************************************** */

function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case FETCH_TRANSACTION_HISTORY_COMPLETE:
      return {
        ...state,
        transactionHistory: action.transactionHistory,
        isLoaded: true,
      };
    default:
      return state;
  }
}

/* ************************************************ Sagas ************************************************ */


function handleTransactionsResponse(currentTransactionHistory, transactionResponse) {
  if (transactionResponse && transactionResponse.error) {
    logger.error('error getting trade history data');
    return currentTransactionHistory;
  }

  return transactionResponse.map(transaction =>
    ({
      id: transaction.transactionid,
      accountId: transaction.accountid,
      type: transaction.type,
      asset: transaction.asset,
      fullName: transaction.fullName,
      fee: transaction.fee.cost,
      feeCurrency: transaction.fee.currency,
      amount: transaction.amount,
      timestamp: transaction.e_timestamp,
    }));
}

function* fetchTransactionHistoryWorker(action) {
  const state = yield select();
  const { transactionHistory } = state.trade.transactionHistory;
  const accountId = action.overrideAccountId !== null ? action.overrideAccountId : state.trade.interactions.currentAccountId;

  const tradeResponse = accountId ? yield call(getTransactionsBy, accountId) : yield call(getTransactions);

  const formattedResponse = handleTransactionsResponse(transactionHistory, tradeResponse);
  yield put(fetchTransactionHistoryComplete(formattedResponse));
}

function* fetchTransactionHistoryWatcher() {
  yield takeEvery(FETCH_TRANSACTION_HISTORY, fetchTransactionHistoryWorker);
}


/* ******************************************************************************************************* */

export { fetchTransactionHistory };

export const sagas = [
  fetchTransactionHistoryWatcher,
];

export default reducer;



// WEBPACK FOOTER //
// ./src/store/ducks/trade/transactionHistory.js