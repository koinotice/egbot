import { put, takeLatest, select, take, call, takeEvery } from 'redux-saga/effects';
import { delay, eventChannel } from 'redux-saga';
import { getRawBalancesForAccount } from '../../../api/tradeSelectData';
import logger from '../../../utils/logger';
import { subscribePrivateStream, unsubscribePrivateStream } from '../../../api/private/privateStreams';
import { fetchBalances as fetchAllBalances } from '../global/balances';

const SUBSCRIPTION_TYPE = 'balanceStream';
let currentSubscribeAccountId = -1;

const initialState = {
  balance: {},
  isLoading: false
};

let cachedAccountBalances = [];

let streamConnected = false;
const INITIAL_RECONNECT_TIMEOUT = 1000; // first reconnect attempt in 1 sec, exponentially increasing thereafter
let reconnectTimeout = INITIAL_RECONNECT_TIMEOUT;

/* *********************************************** Actions *********************************************** */
const FETCH_CURRENT_BALANCE = 'trade/FETCH_CURRENT_BALANCE';
const FETCH_CURRENT_BALANCE_UPDATE = 'trade/FETCH_CURRENT_BALANCE_UPDATE';
const SUBSCRIBE_BALANCE_STREAM = 'trade/SUBSCRIBE_BALANCE_STREAM';
const UNSUBSCRIBE_BALANCE_STREAM = 'trade/UNSUBSCRIBE_BALANCE_STREAM';
const BALANCES_LOADING = 'trade/BALANCES_LOADING';

/* ******************************************* Actions Creators ****************************************** */

function setBalances(data) {
  return {
    type: FETCH_CURRENT_BALANCE_UPDATE,
    data
  };
}

function fetchBalances() {
  return {
    type: FETCH_CURRENT_BALANCE,
  };
}

function subscribeBalanceStream() {
  return {
    type: SUBSCRIBE_BALANCE_STREAM,
  };
}

function unsubscribeBalanceStream() {
  return {
    type: UNSUBSCRIBE_BALANCE_STREAM,
  };
}

function setBalancesLoading() {
  return {
    type: BALANCES_LOADING
  };
}


/* *********************************************** Reducers *********************************************** */

function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case BALANCES_LOADING:
      return {
        ...state,
        isLoading: true
      };
    case FETCH_CURRENT_BALANCE_UPDATE:
      return {
        ...state,
        balance: action.data,
        isLoading: false
      };
    default:
      return state;
  }
}

/* ************************************************ Sagas ************************************************ */


function initStream(subscriptionPayload) {
  return eventChannel((emit) => {
    subscribePrivateStream(subscriptionPayload, emit);
    return () => {};
  });
}


const getDefaultBalance = (asset, accountId) => {
  return {
    asset: asset.toUpperCase(),
    accountId,
    used: 0,
    free: 0,
    total: 0,
  };
};

function populatorBalanceObject(asset, accountId, balanceObject) {
  return {
    asset,
    accountId,
    used: parseFloat(balanceObject.used),
    free: parseFloat(balanceObject.free),
    total: parseFloat(balanceObject.total),
  };
}

function formatPairBalances(currentPair, accountId, balances) {
  const asset = currentPair.split('/');
  const baseAsset = asset[0];
  const quoteAsset = asset[1];

  const quoteBalance = balances.filter(assetObj => assetObj.asset === quoteAsset);
  const baseBalance = balances.filter(assetObj => assetObj.asset === baseAsset);

  return {
    quoteBalance: quoteBalance.length
      ? populatorBalanceObject(quoteAsset, accountId, quoteBalance[0])
      : getDefaultBalance(quoteAsset, accountId),
    baseBalance: baseBalance.length
      ? populatorBalanceObject(baseAsset, accountId, baseBalance[0])
      : getDefaultBalance(baseAsset, accountId),
  };
}

function* fetchBalanceWorker() {
  const state = yield select();
  const { currentAccountId, currentPair } = state.trade.interactions;
  const { accounts } = state.global.accounts;

  if (accounts.length && currentAccountId && currentPair) {
    const asset = currentPair.split('/');
    const baseAsset = asset[0];
    const quoteAsset = asset[1];
    cachedAccountBalances = yield call(getRawBalancesForAccount, currentAccountId, quoteAsset, baseAsset);
    if (cachedAccountBalances.error) {
      logger.info(`initial pair balance fetch error, re-attempting in ${reconnectTimeout}ms`);
      yield call(delay, reconnectTimeout);
      reconnectTimeout *= 2;
      yield put(fetchBalances());
      return;
    }
    reconnectTimeout = INITIAL_RECONNECT_TIMEOUT;


    const formattedPairBalances = formatPairBalances(currentPair, currentAccountId, cachedAccountBalances);
    yield put(setBalances(formattedPairBalances));

    // don't need to re-subscribe if already subscribed to account
    if (currentSubscribeAccountId !== currentAccountId || !streamConnected) {
      currentSubscribeAccountId = currentAccountId;
      yield put(subscribeBalanceStream());
    }
  }
}

function* tradeFetchBalanceWatcher() {
  yield takeLatest(FETCH_CURRENT_BALANCE, fetchBalanceWorker);
}


function* subscribeBalanceStreamWorker() {
  const state = yield select();
  const { currentAccountId: accountId } = state.trade.interactions;

  logger.debug(`subscribing private [${SUBSCRIPTION_TYPE}] for accountId=${accountId}`);
  const subscriptionPayload = {
    subscriptionType: SUBSCRIPTION_TYPE, eventType: 'subscribe', accountId
  };

  if (!streamConnected) {
    const balanceStreamEventChannel = yield call(initStream, subscriptionPayload);

    while (true) {
      const data = yield take(balanceStreamEventChannel);

      if (data.subscriptionType === 'RECONNECT') {
        logger.info('disconnected from balance stream, re-initializing');
        balanceStreamEventChannel.close();
        streamConnected = false;
        yield put(fetchBalances());
      }

      if (data.subscriptionType === SUBSCRIPTION_TYPE) {
        const currentState = yield select();
        const { currentPair } = currentState.trade.interactions;
        const { balance: oldBalances } = currentState.trade.pairBalances;

        if ((data.accountId).toString() === currentState.trade.interactions.currentAccountId) {
          cachedAccountBalances = cachedAccountBalances.map((cachedAsset) => {
            const updatedAsset = data.balances && data.balances.length && data.balances.find(streamAsset => streamAsset.asset === cachedAsset.asset);
            if (updatedAsset) cachedAsset = updatedAsset;
            return cachedAsset;
          });


          const balances = formatPairBalances(currentPair, data.accountId, cachedAccountBalances);
          if (Object.keys(balances).length) {
            yield put(setBalances(balances));
          }
          if (JSON.stringify(oldBalances) !== JSON.stringify(balances)) {
            yield put(fetchAllBalances());
          }
        }
      }
    }
  } else {
    yield call(subscribePrivateStream, subscriptionPayload);
  }
}

function* subscribeBalanceStreamWatcher() {
  yield takeEvery(SUBSCRIBE_BALANCE_STREAM, subscribeBalanceStreamWorker);
}

function unsubscribeBalanceStreamWorker() {
  logger.debug(`unsubscribing private [${SUBSCRIPTION_TYPE}]`);
  unsubscribePrivateStream(SUBSCRIPTION_TYPE);
  currentSubscribeAccountId = -1;
}

function* unsubscribeBalanceStreamWatcher() {
  yield takeEvery(UNSUBSCRIBE_BALANCE_STREAM, unsubscribeBalanceStreamWorker);
}

/* ******************************************************************************************************* */

export { // action creators
  fetchBalances,
  unsubscribeBalanceStream,
  setBalancesLoading
};
export const sagas = [
  tradeFetchBalanceWatcher,
  subscribeBalanceStreamWatcher,
  unsubscribeBalanceStreamWatcher,
];
export default reducer;



// WEBPACK FOOTER //
// ./src/store/ducks/trade/pairBalances.js