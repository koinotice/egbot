import { takeLatest, put, select, call } from 'redux-saga/effects';
import { executeOrderFor, } from '../../../api/private/orders';
import { fetchProductsAndFeatures } from '../global/paywall';
import logger from '../../../utils/logger';
import { showNotification } from '../global/notifications';
import { sanitizeScientificNotation } from '../../../utils/numbers';

const ORDER_TYPES = {
  MARKET: 0,
  LIMIT: 1,
  STOP: 2,
};
Object.freeze(ORDER_TYPES);

const ORDER_SIDE = {
  BUY: 'BUY',
  SELL: 'SELL',
};
Object.freeze(ORDER_SIDE);

const initialState = {
  orderAmount: '',
  orderPrice: '',
  feeTotal: 0,
  orderTotal: 0,
  orderStopPrice: '',
  orderType: ORDER_TYPES.MARKET,
  orderSide: ORDER_SIDE.BUY,
  requestPending: false
};


/* *********************************************** Actions *********************************************** */

const SET_LIMIT_PRICE = 'trade/SET_LIMIT_PRICE';
const ORDER_FORM_UPDATE_SIDE = 'trade/ORDER_FORM_UPDATE_SIDE';
const ORDER_FORM_UPDATE_TYPE = 'trade/ORDER_FORM_UPDATE_TYPE';
const ORDER_FORM_UPDATE_AMOUNT = 'trade/ORDER_FORM_UPDATE_AMOUNT';
const ORDER_FORM_UPDATE_TOTAL = 'trade/ORDER_FORM_UPDATE_TOTAL';
const ORDER_FORM_UPDATE_PRICE = 'trade/ORDER_FORM_UPDATE_PRICE';
const ORDER_FORM_UPDATE_STOP_PRICE = 'trade/ORDER_FORM_UPDATE_STOP_PRICE';
const ORDER_FORM_UPDATE_FEE_TOTAL = 'trade/ORDER_FORM_UPDATE_FEE_TOTAL';
const ORDER_FORM_SUBMIT_ORDER = 'trade/ORDER_FORM_SUBMIT_ORDER';
const ORDER_FORM_CLEAR = 'trade/ORDER_FORM_CLEAR';
const SET_ORDER_REQUEST_PENDING = 'trade/SET_ORDER_REQUEST_PENDING';

/* ******************************************* Actions Creators ****************************************** */

function clearOrderForm(orderType = ORDER_TYPES.MARKET) {
  return {
    type: ORDER_FORM_CLEAR,
    orderType,
  };
}

function setLimitPrice(orderPrice, orderSide) {
  return {
    type: SET_LIMIT_PRICE,
    orderPrice,
    orderSide
  };
}

function updateOrderPrice(price) {
  return {
    type: ORDER_FORM_UPDATE_PRICE,
    orderPrice: price,
  };
}

function updateOrderFeeTotal(feeTotal) {
  return {
    type: ORDER_FORM_UPDATE_FEE_TOTAL,
    feeTotal,
  };
}

function updateOrderTotal(total) {
  return {
    type: ORDER_FORM_UPDATE_TOTAL,
    orderTotal: parseFloat(total.toFixed(8)),
  };
}

function updateStopPrice(price) {
  return {
    type: ORDER_FORM_UPDATE_STOP_PRICE,
    orderStopPrice: price,
  };
}

function updateOrderSide(side) {
  return {
    type: ORDER_FORM_UPDATE_SIDE,
    orderSide: side,
  };
}

function updateOrderType(type) {
  return {
    type: ORDER_FORM_UPDATE_TYPE,
    orderType: type,
  };
}

function updateOrderAmount(amount) {
  return {
    type: ORDER_FORM_UPDATE_AMOUNT,
    orderAmount: amount,
  };
}

function submitOrder() {
  return {
    type: ORDER_FORM_SUBMIT_ORDER,
  };
}

function setRequestPending() {
  return {
    type: SET_ORDER_REQUEST_PENDING
  };
}

/* *********************************************** Reducers *********************************************** */

function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case SET_LIMIT_PRICE:
      return {
        ...state,
        orderPrice: action.orderPrice,
        orderType: ORDER_TYPES.LIMIT,
        orderSide: action.orderSide,
      };
    case ORDER_FORM_CLEAR:
      return {
        ...state,
        orderAmount: '',
        orderPrice: '',
        orderStopPrice: '',
        orderTotal: 0,
        orderType: action.orderType,
        orderSide: ORDER_SIDE.BUY,
      };
    case ORDER_FORM_UPDATE_SIDE:
      return {
        ...state,
        orderSide: action.orderSide,
      };
    case ORDER_FORM_UPDATE_TYPE:
      return {
        ...state,
        orderType: action.orderType,
      };
    case ORDER_FORM_UPDATE_AMOUNT:
      return {
        ...state,
        orderAmount: action.orderAmount,
      };
    case ORDER_FORM_UPDATE_FEE_TOTAL:
      return {
        ...state,
        feeTotal: action.feeTotal,
      };
    case ORDER_FORM_UPDATE_TOTAL:
      return {
        ...state,
        orderTotal: action.orderTotal,
      };
    case ORDER_FORM_UPDATE_PRICE:
      return {
        ...state,
        orderPrice: action.orderPrice,
      };
    case ORDER_FORM_UPDATE_STOP_PRICE:
      return {
        ...state,
        orderStopPrice: action.orderStopPrice,
      };
    case SET_ORDER_REQUEST_PENDING:
      return {
        ...state,
        requestPending: !state.requestPending
      };
    default:
      return state;
  }
}

/* ************************************************ Sagas ************************************************ */

function getOrderTypeFrom(id) {
  if (id === ORDER_TYPES.MARKET) {
    return 'MARKET';
  }

  if (id === ORDER_TYPES.LIMIT) {
    return 'LIMIT';
  }

  if (id === ORDER_TYPES.STOP) {
    return 'STOP_LOSS_LIMIT';
  }
}

/**
 * Find price that can fill order and buffer price by one order
 */
function getBestOrderPrice(orderAmount, orderTotal, side, orderbook) {
  if (side.toUpperCase() === 'BUY') {
    const { asks } = orderbook;

    // if orderTotal is provided for buy this means pre-fill was used
    if (orderTotal) {
      let total = 0;
      let index = asks.length - 1;
      while (total < orderTotal && index >= 0) {
        total += parseFloat(asks[index].total);
        index--;
      }
      return index < 0 ? asks[0].price : asks[index].price;
    }

    const orderAmountNum = orderAmount ? parseFloat(orderAmount) : 0;
    let totalVolume = 0;
    let index = asks.length - 1;
    while (totalVolume < orderAmountNum && index >= 0) {
      totalVolume += parseFloat(asks[index].volume);
      index--;
    }
    return index < 0 ? asks[0].price : asks[index].price;
  }

  // SELL
  const { bids } = orderbook;
  const orderAmountNum = orderAmount ? parseFloat(orderAmount) : 0;
  let totalVolume = 0;
  let index = 0;
  while (totalVolume < orderAmountNum && index < bids.length) {
    totalVolume += parseFloat(bids[index].volume);
    index++;
  }
  return index === bids.length ? bids[bids.length - 1].price : bids[index].price;
}


function* submitOrderWorker() {
  const state = yield select();
  const { currentPair, currentAccountId, currentExchange } = state.trade.interactions;
  const { exchanges } = state.global.exchanges;

  const {
    orderType, orderSide, orderAmount, orderPrice, orderStopPrice
  } = state.trade.orderForm;

  const submitOrderType = getOrderTypeFrom(orderType);
  let submitOrderPrice = orderPrice;
  if (submitOrderType === 'MARKET') {
    const { orderBookStreamData } = state.trade.orderBook;
    const unsanitizedPrice = getBestOrderPrice(orderAmount, null, orderSide, orderBookStreamData);
    submitOrderPrice = (sanitizeScientificNotation(parseFloat(unsanitizedPrice))).toString();
  }

  const submitOrderAmount = parseFloat(orderAmount);

  logger.debug(`submitting order for 
    pair=${currentPair} 
    ordertype=${submitOrderType} 
    orderSide=${orderSide} 
    amount=${submitOrderAmount} 
    orderStopPrice=${orderStopPrice}
    price=${submitOrderPrice}`);

  yield put(setRequestPending()); // disable form
  const submitOrderResponse = yield call(
    executeOrderFor,
    currentAccountId,
    currentPair,
    submitOrderType,
    orderSide,
    submitOrderAmount,
    submitOrderPrice,
    orderStopPrice,
  );
  yield put(setRequestPending()); // enable form
  if (submitOrderResponse.error) {
    logger.debug(`submit order failed because ${submitOrderResponse.error}`);
    yield put(showNotification({
      error: submitOrderResponse.error,
    }));

    if (submitOrderResponse.status === 403) {
      yield put(fetchProductsAndFeatures());
    }
    return;
  }

  if ((submitOrderResponse.status).toUpperCase() === 'REJECTED') {
    logger.debug('submit order failed because rejected');
    yield put(showNotification({
      error: submitOrderResponse.rejectReason ? `Exchange rejected order because: ${submitOrderResponse.rejectReason}` : 'Exchange rejected order',
    }));
    return;
  }

  logger.debug(`submit order success for accountId=${currentAccountId}: ${JSON.stringify(submitOrderResponse)}`);
  yield put(updateOrderAmount(''));
  yield put(updateOrderPrice(''));
  yield put(updateStopPrice(''));
  yield put(updateOrderTotal(0));
  yield put(updateOrderFeeTotal(0));
  yield put(showNotification({
    data: `Successfully submitted order to ${exchanges[currentExchange].exchange_label}`,
  }));
}

function* submitOrderWatcher() {
  yield takeLatest(ORDER_FORM_SUBMIT_ORDER, submitOrderWorker);
}


function getFee(orderType, currentPair, exchangeMarketsData) {
  if (orderType === ORDER_TYPES.MARKET && exchangeMarketsData[currentPair].taker) {
    return exchangeMarketsData[currentPair].taker;
  } else if (exchangeMarketsData[currentPair].maker) {
    return exchangeMarketsData[currentPair].maker;
  }
  return 0;
}

function* setPriceWorker() {
  const state = yield select();
  const { orderAmount, orderPrice, orderType } = state.trade.orderForm;
  const { currentPair } = state.trade.interactions;
  const { exchangeMarketsData } = state.trade.markets;

  const fee = getFee(orderType, currentPair, exchangeMarketsData);
  const feeTotal = fee * parseFloat(orderAmount || 0) * parseFloat(orderPrice);
  const total = (parseFloat(orderAmount || 0) * parseFloat(orderPrice)) + feeTotal;

  yield put(updateOrderTotal(total));
  yield put(updateOrderFeeTotal(feeTotal));
}

function* setPriceWatcher() {
  yield takeLatest(SET_LIMIT_PRICE, setPriceWorker);
}

/* ******************************************************************************************************* */

export { ORDER_TYPES, ORDER_SIDE, getBestOrderPrice }; // helpers
export { // action creators
  setLimitPrice,
  updateOrderPrice,
  updateOrderFeeTotal,
  updateOrderTotal,
  updateStopPrice,
  updateOrderSide,
  updateOrderType,
  updateOrderAmount,
  submitOrder,
  clearOrderForm,
};
export const sagas = [
  submitOrderWatcher,
  setPriceWatcher,
];
export default reducer;



// WEBPACK FOOTER //
// ./src/store/ducks/trade/orderForm.js