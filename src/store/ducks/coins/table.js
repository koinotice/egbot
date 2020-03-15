import { put, takeLatest, select } from 'redux-saga/effects';
import { fetchCoins } from './coins';

const initialState = {
  offset: null,
  sortBy: 'rank',
  order: 'asc',
  search: '',
};

export const MAX_COINS_PER_PAGE = 50;

const ORDER_ENUM = {
  asc: 'asc',
  desc: 'desc'
};

/* *********************************************** Actions *********************************************** */

const FETCH_NEXT_PAGE = 'coins/FETCH_NEXT_PAGE';
const FETCH_PREV_PAGE = 'coins/FETCH_PREV_PAGE';
const FETCH_FIRST_PAGE = 'coins/FETCH_FIRST_PAGE';
const FETCH_LAST_PAGE = 'coins/FETCH_LAST_PAGE';
const FETCH_AND_SORT_BY = 'coins/FETCH_AND_SORT_BY';
const SET_OFFSET = 'coins/SET_OFFSET';
const SET_SORT_BY = 'coins/SET_SORT_BY';
const SET_ORDER = 'coins/SET_ORDER';
const SET_SEARCH = 'coins/SET_SEARCH';
const SEARCH_COINS = 'coins/SEARCH_COINS';
const RESET_TABLE = 'coins/RESET_TABLE';

/* ******************************************* Actions Creators ****************************************** */

function fetchNextPage() {
  return {
    type: FETCH_NEXT_PAGE
  };
}

function fetchPrevPage() {
  return {
    type: FETCH_PREV_PAGE
  };
}

function fetchFirstPage() {
  return {
    type: FETCH_FIRST_PAGE
  };
}

function fetchLastPage() {
  return {
    type: FETCH_LAST_PAGE
  };
}

function fetchAndSortBy(sortBy) {
  return {
    type: FETCH_AND_SORT_BY,
    sortBy
  };
}

function setOffset(offset) {
  return {
    type: SET_OFFSET,
    offset
  };
}

function setSortBy(sortBy) {
  return {
    type: SET_SORT_BY,
    sortBy
  };
}

function setOrder(order) {
  return {
    type: SET_ORDER,
    order
  };
}

function setSearch(search) {
  return {
    type: SET_SEARCH,
    search
  };
}

function searchCoins(search) {
  return {
    type: SEARCH_COINS,
    search
  };
}

function resetTable() {
  return {
    type: RESET_TABLE
  };
}

/* *********************************************** Reducers *********************************************** */

function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case SET_OFFSET:
      return {
        ...state,
        offset: action.offset
      };
    case SET_SORT_BY:
      return {
        ...state,
        sortBy: action.sortBy
      };
    case SET_ORDER:
      return {
        ...state,
        order: action.order
      };
    case SET_SEARCH:
      return {
        ...state,
        search: action.search
      };
    case RESET_TABLE:
      return initialState;
    default:
      return state;
  }
}

/* ************************************************ Sagas ************************************************ */

function* fetchNextPageWorker() {
  const state = yield select();
  const {
    table: {
      offset,
      sortBy,
      order,
      search
    },
    summary: { numCoins }
  } = state.coins;

  const newOffset = offset === null ? 0 : offset + MAX_COINS_PER_PAGE;
  if (newOffset > numCoins) {
    return;
  }

  yield put(setOffset(newOffset));
  yield put(fetchCoins(newOffset, MAX_COINS_PER_PAGE, sortBy, order, search));
}

function* fetchPrevPageWorker() {
  const state = yield select();
  const {
    table: {
      offset,
      sortBy,
      order,
      search
    }
  } = state.coins;

  const newOffset = offset - MAX_COINS_PER_PAGE;
  if (newOffset < 0) {
    return;
  }

  yield put(setOffset(newOffset));
  yield put(fetchCoins(newOffset, MAX_COINS_PER_PAGE, sortBy, order, search));
}

function* fetchFirstPageWorker() {
  const state = yield select();
  const {
    table: {
      offset,
      sortBy,
      order,
      search
    }
  } = state.coins;
  if (offset === 0) {
    return;
  }
  const newOffset = 0;
  yield put(setOffset(newOffset));
  yield put(fetchCoins(newOffset, MAX_COINS_PER_PAGE, sortBy, order, search));
}

function* fetchLastPageWorker() {
  const state = yield select();
  const {
    table: {
      offset,
      sortBy,
      order,
      search
    },
    summary: { globalSummary: { numCoins } }
  } = state.coins;

  let newOffset;
  if (numCoins % MAX_COINS_PER_PAGE === 0) {
    newOffset = numCoins - MAX_COINS_PER_PAGE;
  } else {
    newOffset = numCoins - (numCoins % MAX_COINS_PER_PAGE);
  }

  if (newOffset === offset) {
    return;
  }

  yield put(setOffset(newOffset));
  yield put(fetchCoins(newOffset, MAX_COINS_PER_PAGE, sortBy, order, search));
}

function* fetchAndSortByWorker(action) {
  const state = yield select();
  const {
    table: {
      offset,
      order,
      sortBy,
      search
    }
  } = state.coins;
  const { sortBy: newSortBy } = action;

  let newOrder = order;
  if (newSortBy === sortBy) {
    newOrder = order === ORDER_ENUM.asc ? ORDER_ENUM.desc : ORDER_ENUM.asc;
    yield put(setOrder(newOrder));
  } else {
    yield put(setSortBy(newSortBy));
  }

  yield put(fetchCoins(offset, MAX_COINS_PER_PAGE, newSortBy, newOrder, search));
}

function* searchCoinsWorker(action) {
  const state = yield select();
  const {
    table: {
      order,
      sortBy
    }
  } = state.coins;
  const { search } = action;

  const offset = 0;

  yield put(setSearch(search));
  yield put(setOffset(offset));
  yield put(fetchCoins(offset, MAX_COINS_PER_PAGE, sortBy, order, search));
}

function* fetchNextPageWatcher() {
  yield takeLatest(FETCH_NEXT_PAGE, fetchNextPageWorker);
}

function* fetchPrevPageWatcher() {
  yield takeLatest(FETCH_PREV_PAGE, fetchPrevPageWorker);
}

function* fetchFirstPageWatcher() {
  yield takeLatest(FETCH_FIRST_PAGE, fetchFirstPageWorker);
}

function* fetchlastPageWatcher() {
  yield takeLatest(FETCH_LAST_PAGE, fetchLastPageWorker);
}

function* fetchAndSortByWatcher() {
  yield takeLatest(FETCH_AND_SORT_BY, fetchAndSortByWorker);
}

function* searchCoinsWatcher() {
  yield takeLatest(SEARCH_COINS, searchCoinsWorker);
}

export { fetchNextPage, fetchPrevPage, fetchFirstPage, fetchLastPage, fetchAndSortBy, searchCoins, resetTable };

export const sagas = [
  fetchNextPageWatcher,
  fetchPrevPageWatcher,
  fetchFirstPageWatcher,
  fetchlastPageWatcher,
  fetchAndSortByWatcher,
  searchCoinsWatcher
];

export default reducer;



// WEBPACK FOOTER //
// ./src/store/ducks/coins/table.js