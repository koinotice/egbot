import { put, takeLatest, select, call } from 'redux-saga/effects';
import { createReferrer, getReferrerInfo, getRewards } from '../../../api/payments/referrals';

const initialState = {
  token: '',
  totalReferred: 0,
  totalEarned: 0,
  rewards: [],
  referrerLoaded: false,
  rewardsLoaded: false
};

/* *********************************************** Actions *********************************************** */

const FETCH_REFERRER_INFO = 'referrals/FETCH_REFERRER_INFO';
const SET_REFERRER_INFO = 'referrals/SET_REFERRER_INFO';
const FETCH_REWARDS = 'referrals/FETCH_REWARDS';
const SET_REWARDS = 'referrals/SET_REWARDS';
const MAKE_REFERRER = 'referrals/MAKE_REFERRER';
const SET_REFERRER_LOADED = 'referrals/SET_REFERRER_LOADED';
const SET_REWARDS_LOADED = 'referrals/SET_REWARDS_LOADED';

/* ******************************************* Actions Creators ****************************************** */

function fetchReferrerInfo() {
  return {
    type: FETCH_REFERRER_INFO
  };
}

function setReferrerInfo(token, totalReferred, totalEarned) {
  return {
    type: SET_REFERRER_INFO,
    token,
    totalReferred,
    totalEarned
  };
}

function fetchRewards() {
  return {
    type: FETCH_REWARDS
  };
}

function setRewards(rewards) {
  return {
    type: SET_REWARDS,
    rewards
  };
}

function makeReferrer() {
  return {
    type: MAKE_REFERRER
  };
}

function setReferrerLoaded() {
  return {
    type: SET_REFERRER_LOADED
  };
}

function setRewardsLoaded() {
  return {
    type: SET_REWARDS_LOADED
  };
}
/* *********************************************** Reducers *********************************************** */

function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case SET_REFERRER_INFO:
      return {
        ...state,
        token: action.token,
        totalReferred: action.totalReferred,
        totalEarned: action.totalEarned
      };
    case SET_REWARDS:
      return {
        ...state,
        rewards: action.rewards
      };
    case SET_REFERRER_LOADED:
      return {
        ...state,
        referrerLoaded: true
      };
    case SET_REWARDS_LOADED:
      return {
        ...state,
        rewardsLoaded: true
      };
    default:
      return state;
  }
}

/* ************************************************ Sagas ************************************************ */

function* makeReferrerWorker() {
  const { token, numReferred, totalEarned } = yield call(createReferrer);
  yield put(setReferrerInfo(token, numReferred, totalEarned));
}

function* fetchReferrerInfoWorker() {
  const { token, numReferred, totalEarned } = yield call(getReferrerInfo);
  yield put(setReferrerInfo(token, numReferred, totalEarned));
  yield put(setReferrerLoaded());
  if (token) {
    yield put(fetchRewards());
    return;
  }
  yield put(setRewardsLoaded());
}

function* fetchRewardsWorker() {
  const state = yield select();
  const { token } = state.referrals.referrals;
  if (token) {
    const rewards = yield call(getRewards);
    yield put(setRewards(rewards));
  }
  yield put(setRewardsLoaded());
}

function* makeReferrerWatcher() {
  yield takeLatest(MAKE_REFERRER, makeReferrerWorker);
}

function* fetchReferrerInfoWatcher() {
  yield takeLatest(FETCH_REFERRER_INFO, fetchReferrerInfoWorker);
}

function* fetchRewardsWatcher() {
  yield takeLatest(FETCH_REWARDS, fetchRewardsWorker);
}

export { makeReferrer, fetchReferrerInfo, fetchRewards };
export const sagas = [makeReferrerWatcher, fetchReferrerInfoWatcher, fetchRewardsWatcher];
export default reducer;



// WEBPACK FOOTER //
// ./src/store/ducks/referrals/referrals.js