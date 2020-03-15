import { select, put, takeLatest, call, all } from 'redux-saga/effects';
import { getCoinProfile } from '../../../api/public/coins';
import { getPrices, getAvgPriceHistory } from '../../../api/public/prices';
import Logger from '../../../utils/logger';
import { convertGivenUSDRate } from '../../../utils/helpers';

const CHART_TIMEFRAMES = {
  DAY: { interval: '5m', bars: 288 },
  WEEK: { interval: '30m', bars: 336 },
  MONTH: { interval: '1h', bars: 720 },
  THREE_MONTHS: { interval: '1d', bars: 90 },
  SIX_MONTHS: { interval: '1d', bars: 180 },
  ONE_YEAR: { interval: '1d', bars: 365 },
  ALL: { interval: '1d', bars: 3650 }
};

const initialState = {
  stats: {
    name: undefined,
    symbol: undefined,
    tagline: undefined,
    overview: undefined,
    background: undefined,
    rank: undefined,
    circulatingSupply: undefined,
    marketCap: undefined,
    y2050: {
      marketCap: undefined,
      percentSupplyIssued: undefined,
      supply: undefined
    },
    allTimeHigh: {
      date: undefined,
      percentDown: undefined,
      price: undefined
    },
    roi: {
      oneWeek: undefined,
      oneMonth: undefined,
      threeMonth: undefined,
      oneYear: undefined
    }
  },
  statsLoaded: false,
  chart: [],
  chartMarkets: [],
  chartQuote: '',
  chartTimeFrame: {},
  chartLoaded: false
};

let statsCache = null;

/* *********************************************** Actions *********************************************** */

const INIT_COIN_OVERVIEW = 'coins/INIT_COIN_OVERVIEW';
const REFRESH_COIN_OVERVIEW = 'coins/REFRESH_COIN_OVERVIEW';
const CLEAR_COIN_OVERVIEW = 'coins/CLEAR_COIN_OVERVIEW';
const FETCH_COIN_STATS = 'coins/FETCH_COIN_STATS';
const FETCH_CHART_MARKETS = 'coins/FETCH_CHART_MARKETS';
const FETCH_COIN_CHART = 'coins/FETCH_COIN_CHART';
const SET_COIN_STATS = 'coins/SET_COIN_STATS';
const SET_CHART_MARKETS = 'coins/SET_CHART_MARKETS';
const SET_CHART_QUOTE = 'coins/SET_CHART_QUOTE';
const UPDATE_CHART_QUOTE = 'coins/UPDATE_CHART_QUOTE';
const SET_COIN_CHART = 'coins/SET_COIN_CHART';
const UPDATE_CHART_TIMEFRAME = 'coins/UPDATE_CHART_TIMEFRAME';

/* ******************************************* Actions Creators ****************************************** */

function initCoinOverview(symbol) {
  return {
    type: INIT_COIN_OVERVIEW,
    symbol
  };
}

function refreshCoinOverview() {
  return {
    type: REFRESH_COIN_OVERVIEW
  };
}

function clearCoinOverview() {
  return {
    type: CLEAR_COIN_OVERVIEW
  };
}

function fetchCoinStats(symbol) {
  return {
    type: FETCH_COIN_STATS,
    symbol
  };
}

function fetchChartMarkets(symbol) {
  return {
    type: FETCH_CHART_MARKETS,
    symbol
  };
}

function fetchCoinChart(symbol, timeframe) {
  return {
    type: FETCH_COIN_CHART,
    symbol,
    timeframe
  };
}

function setCoinStats(name, symbol, tagline, overview, background, rank, circulatingSupply, marketCap, y2050, allTimeHigh, roi) {
  return {
    type: SET_COIN_STATS,
    name,
    symbol,
    tagline,
    overview,
    background,
    rank,
    circulatingSupply,
    marketCap,
    y2050,
    allTimeHigh,
    roi
  };
}

function setChartMarkets(markets) {
  return {
    type: SET_CHART_MARKETS,
    markets
  };
}

function setChartQuote(quote) {
  return {
    type: SET_CHART_QUOTE,
    quote
  };
}

function updateChartQuote(quote) {
  return {
    type: UPDATE_CHART_QUOTE,
    quote
  };
}

function setCoinChart(chart, chartTimeFrame, chartLoaded) {
  return {
    type: SET_COIN_CHART,
    chart,
    chartTimeFrame,
    chartLoaded
  };
}

function updateChartTimeFrame(symbol, timeframe) {
  return {
    type: UPDATE_CHART_TIMEFRAME,
    symbol,
    timeframe
  };
}

/* *********************************************** Reducers *********************************************** */

function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case SET_COIN_STATS:
      return {
        ...state,
        stats: {
          ...state.stats,
          name: action.name || initialState.stats.name,
          symbol: action.symbol || initialState.stats.symbol,
          tagline: action.tagline || initialState.stats.tagline,
          overview: action.overview || initialState.stats.overview,
          background: action.background || initialState.stats.background,
          rank: action.rank || initialState.stats.rank,
          circulatingSupply: action.circulatingSupply || initialState.stats.circulatingSupply,
          marketCap: action.marketCap || initialState.stats.marketCap,
          y2050: action.y2050 ? {
            marketCap: action.y2050.marketCap || initialState.stats.y2050.marketCap,
            percentSupplyIssued: action.y2050.percentSupplyIssued || initialState.stats.y2050.percentSupplyIssued,
            supply: action.y2050.supply || initialState.stats.y2050.supply
          } : {},
          allTimeHigh: action.allTimeHigh ? {
            date: action.allTimeHigh.date || initialState.stats.allTimeHigh.date,
            percentDown: action.allTimeHigh.percentDown || initialState.stats.allTimeHigh.percentDown,
            price: action.allTimeHigh.price || initialState.stats.allTimeHigh.price
          } : {},
          roi: action.roi ? {
            oneWeek: action.roi.oneWeek || initialState.stats.roi.oneWeek,
            oneMonth: action.roi.oneMonth || initialState.stats.roi.oneMonth,
            threeMonth: action.roi.threeMonth || initialState.stats.roi.threeMonth,
            oneYear: action.roi.oneYear || initialState.stats.roi.oneYear
          } : {}
        },
        statsLoaded: true
      };
    case SET_CHART_MARKETS:
      return {
        ...state,
        chartMarkets: action.markets
      };
    case SET_CHART_QUOTE:
      return {
        ...state,
        chartQuote: action.quote
      };
    case SET_COIN_CHART:
      return {
        ...state,
        chart: action.chart,
        chartTimeFrame: action.chartTimeFrame,
        chartLoaded: action.chartLoaded
      };
    case CLEAR_COIN_OVERVIEW:
      statsCache = null;
      return initialState;
    default:
      return state;
  }
}

/* ************************************************ Sagas ************************************************ */

function convertStatsToPrefCurrency(stats, prefCurrency, prices, forex) {
  const statsInPrefCurrency = JSON.parse(JSON.stringify(stats));

  if (stats.market_cap) {
    statsInPrefCurrency.market_cap = (convertGivenUSDRate(prefCurrency, stats.market_cap, prices, forex)).toString();
  }

  if (stats.y_2050 && stats.y_2050.marketCap) {
    statsInPrefCurrency.y_2050.marketCap = (convertGivenUSDRate(prefCurrency, stats.y_2050.marketCap, prices, forex));
  }

  if (stats.all_time_high && stats.all_time_high.price) {
    statsInPrefCurrency.all_time_high.price = (convertGivenUSDRate(prefCurrency, stats.all_time_high.price, prices, forex));
  }

  return statsInPrefCurrency;
}

function normalizeChartData(data) {
  return data.map(d => [parseInt(d[0], 10), parseFloat(d[1])]);
}

function* initCoinOverviewWorker(action) {
  const { symbol } = action;
  yield all([
    put(fetchCoinStats(symbol)),
    put(fetchChartMarkets(symbol)),
  ]);
}

function* initCoinOverviewWatcher() {
  yield takeLatest(INIT_COIN_OVERVIEW, initCoinOverviewWorker);
}

function* fetchCoinStatsWorker(action) {
  const state = yield select();
  const {
    user: { user: { preferences: { pref_currency: prefCurrency } } },
    prices: { prices },
    forex: { forex }
  } = state.global;
  const { symbol } = action;

  let stats;
  if (statsCache) {
    stats = statsCache;
  } else {
    stats = yield call(getCoinProfile, symbol);
    if (stats.error) {
      Logger.error(`Error getting stats for ${symbol}: ${stats.error}`);
      return;
    }
    statsCache = stats;
  }

  const statsInPrefCurrency = convertStatsToPrefCurrency(stats, prefCurrency, prices, forex);
  const {
    name, tagline, overview, background, rank, circulating_supply: circulatingSupply, market_cap: marketCap, y_2050: y2050, all_time_high: allTimeHigh, roi
  } = statsInPrefCurrency;
  yield put(setCoinStats(name, symbol, tagline, overview, background, rank, circulatingSupply, marketCap, y2050, allTimeHigh, roi));
}

function* fetchCoinStatsWatcher() {
  yield takeLatest(FETCH_COIN_STATS, fetchCoinStatsWorker);
}

function extractMarketsFromPrices(symbol, prices) {
  return Object.keys(prices)
    .filter(pair => pair.startsWith(`${symbol}/`))
    .map(pair => pair.split('/')[1]);
}

function* fetchChartMarketsWorker(action) {
  const { symbol } = action;
  const state = yield select();
  const {
    user: { user: { preferences: { pref_currency: prefCurrency } } }
  } = state.global;

  const prices = yield call(getPrices);
  if (prices.error) {
    Logger.error('error getting chart markets', prices.error);
    return;
  }
  const markets = extractMarketsFromPrices(symbol, prices);
  yield put(setChartMarkets(markets));
  if (markets.includes(prefCurrency)) {
    yield put(setChartQuote(prefCurrency));
  } else if (symbol === 'BTC') {
    yield put(setChartQuote('USD'));
  } else {
    yield put(setChartQuote('BTC'));
  }
  yield put(fetchCoinChart(symbol, CHART_TIMEFRAMES.DAY));
}

function* fetchChartMarketsWatcher() {
  yield takeLatest(FETCH_CHART_MARKETS, fetchChartMarketsWorker);
}

function* fetchCoinChartWorker(action) {
  const state = yield select();
  const {
    overview: { chartQuote }
  } = state.coins;
  const { symbol, timeframe } = action;

  const pair = `${symbol}/${chartQuote}`;
  const { interval, bars } = timeframe;

  const res = yield call(getAvgPriceHistory, pair, interval, bars);
  if (res.error) {
    Logger.error(`Error getting chart for ${pair}, ${interval}, ${bars}: ${res.error}`);
    return;
  }

  const chartData = res[pair];
  if (!chartData || !chartData.length) {
    yield put(setCoinChart([], timeframe, true));
    return;
  }

  const normalizedChartData = normalizeChartData(chartData);
  yield put(setCoinChart(normalizedChartData, timeframe, true));
}

function* fetchCoinChartWatcher() {
  yield takeLatest(FETCH_COIN_CHART, fetchCoinChartWorker);
}

function* updateChartQuoteWorker(action) {
  const { quote } = action;
  const state = yield select();
  const {
    overview: { stats: { symbol }, chartTimeFrame }
  } = state.coins;
  yield put(setChartQuote(quote));
  yield put(fetchCoinChart(symbol, chartTimeFrame));
}

function* updateChartQuoteWatcher() {
  yield takeLatest(UPDATE_CHART_QUOTE, updateChartQuoteWorker);
}

function* updateChartTimeFrameWorker(action) {
  const { symbol, timeframe } = action;
  yield put(setCoinChart([], timeframe, false));
  yield put(fetchCoinChart(symbol, timeframe));
}

function* updateChartTimeFrameWatcher() {
  yield takeLatest(UPDATE_CHART_TIMEFRAME, updateChartTimeFrameWorker);
}

function* refreshCoinOverviewWorker() {
  const state = yield select();
  const {
    overview: {
      stats: {
        symbol
      },
      statsLoaded
    }
  } = state.coins;

  if (!statsLoaded) {
    return;
  }

  yield put(fetchCoinStats(symbol));
}

function* refreshCoinOverviewWatcher() {
  yield takeLatest(REFRESH_COIN_OVERVIEW, refreshCoinOverviewWorker);
}

export { CHART_TIMEFRAMES };
export { initCoinOverview, refreshCoinOverview, clearCoinOverview, updateChartTimeFrame, updateChartQuote };
export const sagas = [
  initCoinOverviewWatcher,
  fetchCoinStatsWatcher,
  fetchChartMarketsWatcher,
  fetchCoinChartWatcher,
  updateChartQuoteWatcher,
  updateChartTimeFrameWatcher,
  refreshCoinOverviewWatcher
];

export default reducer;



// WEBPACK FOOTER //
// ./src/store/ducks/coins/overview.js