import { delay } from 'redux-saga';
import { put, takeLatest, all, call, select } from 'redux-saga/effects';
import isEqual from 'lodash/isEqual';
import { IS_PRIVATE_INSTANCE } from '../../../config/globalConfig';
import { getUserProducts, getUserFeatures } from '../../../api/payments/users';
import logger from '../../../utils/logger';

const initialState = {
  isPrivateInstance: false,
  products: [],
  features: {},
  paywallModalVisible: false,
  paywallLoaded: false,
  paywallTitle: undefined,
};

const FETCH_INTERVAL = 3600000;

/* *********************************************** Actions *********************************************** */

const INIT_PAYWALL = 'global/INIT_PAYWALL';
const FETCH_PRODUCTS_AND_FEATURES = 'global/FETCH_PRODUCTS_AND_FEATURES';
const START_PAYWALL_FETCH_INTERVAL = 'global/START_PAYWALL_FETCH_INTERVAL';
const SET_IS_PRIVATE_INSTANCE = 'global/SET_IS_PRIVATE_INSTANCE';
const SET_PRODUCTS = 'global/SET_PRODUCTS';
const SET_FEATURES = 'global/SET_FEATURES';
const SHOW_PAYWALL_MODAL = 'global/SHOW_PAYWALL_MODAL';
const HIDE_PAYWALL_MODAL = 'global/HIDE_PAYWALL_MODAL';
const SET_PAYWALL_LOADED = 'global/SET_PAYWALL_LOADED';

/* ******************************************* Actions Creators ****************************************** */

function initPaywall() {
  return {
    type: INIT_PAYWALL
  };
}

function fetchProductsAndFeatures() {
  return {
    type: FETCH_PRODUCTS_AND_FEATURES
  };
}

function startPaywallFetchInterval() {
  return {
    type: START_PAYWALL_FETCH_INTERVAL
  };
}

function setIsPrivateInstance(isPrivateInstance) {
  return {
    type: SET_IS_PRIVATE_INSTANCE,
    isPrivateInstance
  };
}

function setProducts(products) {
  return {
    type: SET_PRODUCTS,
    products
  };
}

function setFeatures(features) {
  return {
    type: SET_FEATURES,
    features
  };
}

function showPaywallModal(paywallTitle = undefined) {
  return {
    type: SHOW_PAYWALL_MODAL,
    paywallTitle,
  };
}

function hidePaywallModal() {
  return {
    type: HIDE_PAYWALL_MODAL
  };
}

function setPaywallLoaded() {
  return {
    type: SET_PAYWALL_LOADED
  };
}

/* *********************************************** Reducers *********************************************** */

function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case SET_IS_PRIVATE_INSTANCE:
      return {
        ...state,
        isPrivateInstance: action.isPrivateInstance
      };
    case SET_PRODUCTS:
      return {
        ...state,
        products: action.products
      };
    case SET_FEATURES:
      return {
        ...state,
        features: action.features
      };
    case SHOW_PAYWALL_MODAL:
      return {
        ...state,
        paywallModalVisible: true,
        paywallTitle: action.paywallTitle
      };
    case HIDE_PAYWALL_MODAL:
      return {
        ...state,
        paywallModalVisible: false
      };
    case SET_PAYWALL_LOADED:
      return {
        ...state,
        paywallLoaded: true
      };
    default:
      return state;
  }
}

/* ************************************************ Sagas ************************************************ */

function* initPaywallWorker() {
  yield put(setIsPrivateInstance(IS_PRIVATE_INSTANCE));
  if (IS_PRIVATE_INSTANCE) {
    yield put(setPaywallLoaded());
    return;
  }

  yield put(startPaywallFetchInterval());
  yield put(setPaywallLoaded());
}

function* initPaywallWatcher() {
  yield takeLatest(INIT_PAYWALL, initPaywallWorker);
}

function formatFeaturesObject(features) {
  return features.reduce((acc, cur) => {
    const { name, ...rest } = cur;
    acc[name.toUpperCase()] = rest;
    return acc;
  }, {});
}

function* fetchProductsAndFeaturesWorker() {
  const [products, features] = yield all([
    call(getUserProducts),
    call(getUserFeatures)
  ]);

  if (products.error || features.error) {
    logger.error('error getting user products and or features');
    return;
  }

  const formattedFeatures = formatFeaturesObject(features);

  const state = yield select();
  if (!isEqual(products, state.global.paywall.products)) {
    yield put(setProducts(products));
  }
  if (!isEqual(formattedFeatures, state.global.paywall.features)) {
    yield put(setFeatures(formattedFeatures));
  }
}

function* fetchProductsAndFeaturesWatcher() {
  yield takeLatest(FETCH_PRODUCTS_AND_FEATURES, fetchProductsAndFeaturesWorker);
}

function* startPaywallFetchIntervalWorker() {
  while (true) {
    yield put(fetchProductsAndFeatures());
    yield delay(FETCH_INTERVAL);
  }
}

function* startPaywallFetchIntervalWatcher() {
  yield takeLatest(START_PAYWALL_FETCH_INTERVAL, startPaywallFetchIntervalWorker);
}

export { initPaywall, fetchProductsAndFeatures, showPaywallModal, hidePaywallModal };
export const sagas = [initPaywallWatcher, fetchProductsAndFeaturesWatcher, startPaywallFetchIntervalWatcher];
export default reducer;



// WEBPACK FOOTER //
// ./src/store/ducks/global/paywall.js