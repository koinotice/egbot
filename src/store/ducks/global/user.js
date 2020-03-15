import { put, takeLatest, takeEvery, select, all, call } from 'redux-saga/effects';
import {
  getUserInfo,
  getUserPreferences,
  getUserApiCredentials,
  createUserApiCredentials as createApiKeys,
  deleteUserApiCredentials as deleteApiKeys,
  updateUserPreferences,
  getActivityLogs,
  setUserBotTerms
} from '../../../api/users/users';
import { fetchAccounts } from './accounts';
import { getSessionToken } from '../../../utils/token';
import logger from '../../../utils/logger';
import { refreshHoldings } from '../holdings/holdings';
import { refreshCoins } from '../coins/coins';
import { refreshGlobalSummary, refreshProfileSummary } from '../coins/summary';
import { refreshCoinOverview } from '../coins/overview';
import { refreshMarketsForCoin } from '../coins/markets';
import { setLocale } from '../../../utils/helpers';

const DEFAULT_TRADE_LAYOUT = [
  {
    i: 'orderForm', x: 0, y: 0, w: 7, h: 32, minW: 6, minH: 4
  },
  {
    i: 'chart', x: 7, y: 0, w: 18, h: 22, minW: 6, minH: 4
  },
  {
    i: 'accountActivity', x: 7, y: 21, w: 18, h: 10, minW: 6, minH: 4
  },
  {
    i: 'orderBook', x: 25, y: 0, w: 7, h: 22, minW: 6, minH: 4
  },
  {
    i: 'tradeHistory', x: 26, y: 20, w: 7, h: 10, minW: 4, minH: 4
  }];

const initialState = {
  user: {
    name: '',
    email: '',
    preferences: {
      mfa_enabled: null,
      theme: 'DARK',
      pref_currency: 'USD',
      other: {
        tradeLayout: DEFAULT_TRADE_LAYOUT,
        referrerPayoutAddress: '',
        weeklySummaryEmail: null,
        weeklySummaryEmailPortfolio: null,
        weeklySummaryEmailBots: null,
      }
    },
  },
  userActivity: {
    logs: [],
    lastLogin: {},
  },
  userApiCredentials: {},
  userLoaded: false,
  userActivityLoaded: false,
  userApiCredentialsLoading: false,
  showSaveLayoutPrompt: false,
};

/* *********************************************** Actions *********************************************** */
const FETCH_USER = 'global/FETCH_USER';
const FETCH_USER_ACTIVITY = 'global/FETCH_USER_ACTIVITY';
const FETCH_USER_API_CREDENTIALS = 'global/FETCH_USER_API_CREDENTIALS';
const CREATE_USER_API_CREDENTIALS = 'global/CREATE_USER_API_CREDENTIALS';
const DELETE_USER_API_CREDENTIALS = 'global/DELETE_USER_API_CREDENTIALS';
const SET_USER_INFO = 'global/SET_USER_INFO';
const SET_USER_ACTIVITY = 'global/SET_USER_ACTIVITY';
const SET_USER_API_CREDENTIALS = 'global/SET_USER_API_CREDENTIALS';
const SET_USER_API_CREDENTIALS_LOADING = 'global/SET_USER_API_CREDENTIALS_LOADING';
const SET_MFA_STATUS = 'global/SET_MFA_STATUS';
const SET_NAME = 'global/SET_NAME';
const SET_PREF_CURRENCY = 'global/SET_PREF_CURRENCY';
const SET_THEME = 'global/SET_THEME';
const SET_TRADE_LAYOUT = 'global/SET_TRADE_LAYOUT';
const SHOW_SAVE_LAYOUT_PROMPT = 'global/SHOW_SAVE_LAYOUT_PROMPT';
const SET_PAYOUT_ADDRESS = 'global/SET_PAYOUT_ADDRESS';
const SET_BOT_TERMS_AGREED = 'global/SET_BOT_TERMS_AGREED';
const SET_BOT_TERMS = 'global/SET_BOT_TERMS';
const SET_WEEKLY_SUMMARY_EMAIL = 'global/SET_WEEKLY_SUMMARY_EMAIL';
const SET_WEEKLY_SUMMARY_EMAIL_PORTFOLIO = 'global/SET_WEEKLY_SUMMARY_EMAIL_PORTFOLIO';
const SET_WEEKLY_SUMMARY_EMAIL_BOTS = 'global/SET_WEEKLY_SUMMARY_EMAIL_BOTS';
/* ******************************************* Actions Creators ****************************************** */

function fetchUser() {
  return {
    type: FETCH_USER
  };
}

function fetchUserActivity() {
  return {
    type: FETCH_USER_ACTIVITY
  };
}

function fetchUserApiCredentials() {
  return {
    type: FETCH_USER_API_CREDENTIALS
  };
}

function createUserApiCredentials() {
  return {
    type: CREATE_USER_API_CREDENTIALS
  };
}

function deleteUserApiCredentials() {
  return {
    type: DELETE_USER_API_CREDENTIALS
  };
}

function setUserInfo(
  name,
  email,
  mfaEnabled,
  theme,
  prefCurrency,
  other,
  botsTermsAgreed,
) {
  return {
    type: SET_USER_INFO,
    name,
    email,
    mfaEnabled,
    theme,
    prefCurrency,
    other,
    botsTermsAgreed,
  };
}

function setUserActivity(data) {
  return {
    type: SET_USER_ACTIVITY,
    data
  };
}

function setUserApiCredentials(credentials) {
  return {
    type: SET_USER_API_CREDENTIALS,
    credentials
  };
}

function setUserApiCredentialsLoading(loading) {
  return {
    type: SET_USER_API_CREDENTIALS_LOADING,
    loading
  };
}

function setMFAStatus(status) {
  return {
    type: SET_MFA_STATUS,
    status
  };
}

function setName(name) {
  return {
    type: SET_NAME,
    name
  };
}

function setPrefCurrency(symbol) {
  return {
    type: SET_PREF_CURRENCY,
    symbol
  };
}

function setTheme(theme) {
  return {
    type: SET_THEME,
    theme
  };
}

function setTradeLayout(resetToDefault = false) {
  return {
    type: SET_TRADE_LAYOUT,
    resetToDefault
  };
}

function showSaveLayoutPrompt(layout) {
  return {
    type: SHOW_SAVE_LAYOUT_PROMPT,
    layout
  };
}

function setPayoutAddress(address) {
  return {
    type: SET_PAYOUT_ADDRESS,
    address
  };
}

function setBotTermsAgreed() {
  return {
    type: SET_BOT_TERMS_AGREED,
  };
}

function setBotTerms() {
  return {
    type: SET_BOT_TERMS,
  };
}

function setWeeklySummaryEmail(weeklySummaryEmail) {
  return {
    type: SET_WEEKLY_SUMMARY_EMAIL,
    weeklySummaryEmail
  };
}

function setWeeklySummaryEmailPortfolio(weeklySummaryEmailPortfolio) {
  return {
    type: SET_WEEKLY_SUMMARY_EMAIL_PORTFOLIO,
    weeklySummaryEmailPortfolio
  };
}

function setWeeklySummaryEmailBots(weeklySummaryEmailBots) {
  return {
    type: SET_WEEKLY_SUMMARY_EMAIL_BOTS,
    weeklySummaryEmailBots
  };
}

/* *********************************************** Reducers *********************************************** */
function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case SET_USER_INFO:
      return {
        ...state,
        user: {
          ...state.user,
          name: action.name,
          email: action.email,
          botsTermsAgreed: action.botsTermsAgreed,
          preferences: {
            ...state.user.preferences,
            mfa_enabled: action.mfaEnabled,
            theme: action.theme,
            pref_currency: action.prefCurrency,
            other: action.other,
          },
        },
        userLoaded: true
      };
    case SET_USER_ACTIVITY:
      return {
        ...state,
        userActivity: {
          logs: action.data.logs,
          lastLogin: action.data.lastLogin,
        },
        userActivityLoaded: true
      };
    case SET_USER_API_CREDENTIALS:
      return {
        ...state,
        userApiCredentials: action.credentials
      };
    case SET_USER_API_CREDENTIALS_LOADING:
      return {
        ...state,
        userApiCredentialsLoading: action.loading
      };
    case SET_MFA_STATUS:
      return {
        ...state,
        user: {
          ...state.user,
          preferences: {
            ...state.user.preferences,
            mfa_enabled: action.status
          }
        }
      };
    case SET_NAME:
      return {
        ...state,
        user: {
          ...state.user,
          name: action.name
        }
      };
    case SET_BOT_TERMS:
      return {
        ...state,
        user: {
          ...state.user,
          botsTermsAgreed: true
        }
      };
    case SET_PREF_CURRENCY:
      return {
        ...state,
        user: {
          ...state.user,
          preferences: {
            ...state.user.preferences,
            pref_currency: action.symbol
          }
        }
      };
    case SET_THEME:
      return {
        ...state,
        user: {
          ...state.user,
          preferences: {
            ...state.user.preferences,
            theme: action.theme
          }
        }
      };
    case SET_TRADE_LAYOUT:
      return {
        ...state,
        user: {
          ...state.user,
          preferences: {
            ...state.user.preferences,
            other: {
              ...state.user.preferences.other,
              tradeLayout: action.resetToDefault ? DEFAULT_TRADE_LAYOUT : state.user.preferences.other.tradeLayout
            }
          }
        },
        showSaveLayoutPrompt: false
      };
    case SHOW_SAVE_LAYOUT_PROMPT:
      return {
        ...state,
        user: {
          ...state.user,
          preferences: {
            ...state.user.preferences,
            other: {
              ...state.user.preferences.other,
              tradeLayout: action.layout
            }
          }
        },
        showSaveLayoutPrompt: true,
      };
    case SET_PAYOUT_ADDRESS:
      return {
        ...state,
        user: {
          ...state.user,
          preferences: {
            ...state.user.preferences,
            other: {
              ...state.user.preferences.other,
              referrerPayoutAddress: action.address
            }
          }
        }
      };
    case SET_WEEKLY_SUMMARY_EMAIL:
      return {
        ...state,
        user: {
          ...state.user,
          preferences: {
            ...state.user.preferences,
            other: {
              ...state.user.preferences.other,
              weeklySummaryEmail: action.weeklySummaryEmail,
              weeklySummaryEmailPortfolio: false,
              weeklySummaryEmailBots: false
            }
          }
        }
      };
    case SET_WEEKLY_SUMMARY_EMAIL_PORTFOLIO:
      return {
        ...state,
        user: {
          ...state.user,
          preferences: {
            ...state.user.preferences,
            other: {
              ...state.user.preferences.other,
              weeklySummaryEmailPortfolio: action.weeklySummaryEmailPortfolio
            }
          }
        }
      };
    case SET_WEEKLY_SUMMARY_EMAIL_BOTS:
      return {
        ...state,
        user: {
          ...state.user,
          preferences: {
            ...state.user.preferences,
            other: {
              ...state.user.preferences.other,
              weeklySummaryEmailBots: action.weeklySummaryEmailBots
            }
          }
        }
      };
    default:
      return state;
  }
}

/* ************************************************ Sagas ************************************************ */

function* fetchUserWorker() {
  const [userInfo, userPrefs] = yield all([
    call(getUserInfo),
    call(getUserPreferences)
  ]);

  const state = yield select();
  const { preferences } = state.global.user.user;

  yield put(setUserInfo(
    userInfo.name,
    userInfo.email,
    userPrefs.mfa_enabled,
    userPrefs.theme,
    userPrefs.pref_currency,
    userPrefs.other ? Object.assign(preferences.other, userPrefs.other) : preferences.other,
    userInfo.bot_terms_agreed,
  ));
  setLocale(userPrefs.pref_currency);
  yield put(fetchAccounts());
}

function* fetchUserActivityWorker() {
  const userActivity = yield call(getActivityLogs);

  yield put(setUserActivity({
    logs: userActivity.obj.logs,
    lastLogin: userActivity.obj.lastLogin,
  }));
}

function* fetchUserApiCredentialsWorker() {
  yield put(setUserApiCredentialsLoading(true));
  const response = yield call(getUserApiCredentials);
  if (response.error) {
    logger.error(`error getting api credentials: ${response.error}`);
  } else if (response.apiKey) {
    yield put(setUserApiCredentials(response));
  }
  yield put(setUserApiCredentialsLoading(false));
}

function* createUserApiCredentialsWorker() {
  yield put(setUserApiCredentialsLoading(true));
  const response = yield call(createApiKeys);
  if (response.error) {
    logger.error(`error creating api keys: ${response.error}`);
  } else {
    yield put(setUserApiCredentials(response));
  }
  yield put(setUserApiCredentialsLoading(false));
}

function* deleteUserApiCredentialsWorker() {
  const response = yield call(deleteApiKeys);
  if (response.error) {
    logger.error(`error deleting api keys, ${response.error}`);
  }
  yield put(setUserApiCredentials({}));
}

function* updateUserPreferencesWorker(action) {
  const token = getSessionToken();
  if (!token) {
    return;
  }

  const state = yield select();
  const { preferences } = state.global.user.user;
  const { type } = action;
  const prefsToSave = {};

  switch (type) {
    case SET_PREF_CURRENCY:
      yield all([
        put(refreshHoldings()),
        put(refreshCoins()),
        put(refreshGlobalSummary()),
        put(refreshProfileSummary()),
        put(refreshCoinOverview()),
        put(refreshMarketsForCoin())
      ]);
      prefsToSave.prefCurrency = preferences.pref_currency;
      break;
    case SET_THEME:
      prefsToSave.theme = preferences.theme;
      break;
    case SET_TRADE_LAYOUT:
      prefsToSave.other = preferences.other;
      break;
    case SET_PAYOUT_ADDRESS:
      prefsToSave.other = preferences.other;
      break;
    case SET_WEEKLY_SUMMARY_EMAIL:
      prefsToSave.other = preferences.other;
      break;
    case SET_WEEKLY_SUMMARY_EMAIL_PORTFOLIO:
      prefsToSave.other = preferences.other;
      break;
    case SET_WEEKLY_SUMMARY_EMAIL_BOTS:
      prefsToSave.other = preferences.other;
      break;
    default:
      break;
  }

  setLocale(prefsToSave.prefCurrency);
  yield call(updateUserPreferences, prefsToSave);
}

function* fetchUserWatcher() {
  yield takeLatest(FETCH_USER, fetchUserWorker);
}

function* fetchUserActivityWatcher() {
  yield takeLatest(FETCH_USER_ACTIVITY, fetchUserActivityWorker);
}

function* fetchUserApiCredentialsWatcher() {
  yield takeLatest(FETCH_USER_API_CREDENTIALS, fetchUserApiCredentialsWorker);
}

function* createUserApiCredentialsWatcher() {
  yield takeLatest(CREATE_USER_API_CREDENTIALS, createUserApiCredentialsWorker);
}

function* deleteUserApiCredentialsWatcher() {
  yield takeLatest(DELETE_USER_API_CREDENTIALS, deleteUserApiCredentialsWorker);
}

function* setPrefCurrencyWatcher() {
  yield takeLatest(SET_PREF_CURRENCY, updateUserPreferencesWorker);
}

function* setThemeWatcher() {
  yield takeLatest(SET_THEME, updateUserPreferencesWorker);
}

function* setTradeLayoutWatcher() {
  yield takeEvery(SET_TRADE_LAYOUT, updateUserPreferencesWorker);
}

function* setPayoutAddressWatcher() {
  yield takeLatest(SET_PAYOUT_ADDRESS, updateUserPreferencesWorker);
}

function* setWeeklySummaryEmailWatcher() {
  yield takeLatest(SET_WEEKLY_SUMMARY_EMAIL, updateUserPreferencesWorker);
}

function* setWeeklySummaryEmailPortfolioWatcher() {
  yield takeLatest(SET_WEEKLY_SUMMARY_EMAIL_PORTFOLIO, updateUserPreferencesWorker);
}

function* setWeeklySummaryEmailBotsWatcher() {
  yield takeLatest(SET_WEEKLY_SUMMARY_EMAIL_BOTS, updateUserPreferencesWorker);
}

function* setBotTermsAgreedWorker() {
  const response = yield call(setUserBotTerms);

  if (response.error) {
    logger.error('error agreeing bot terms');
    return;
  }
  yield put(setBotTerms());
}

function* setBotTermsAgreedWatcher() {
  yield takeLatest(SET_BOT_TERMS_AGREED, setBotTermsAgreedWorker);
}

export {
  fetchUser,
  fetchUserActivity,
  fetchUserApiCredentials,
  createUserApiCredentials,
  deleteUserApiCredentials,
  setMFAStatus,
  setName,
  setPrefCurrency,
  setTheme,
  setTradeLayout,
  showSaveLayoutPrompt,
  setPayoutAddress,
  setBotTermsAgreed,
  setWeeklySummaryEmail,
  setWeeklySummaryEmailPortfolio,
  setWeeklySummaryEmailBots,
};
export const sagas = [
  fetchUserWatcher,
  fetchUserActivityWatcher,
  fetchUserApiCredentialsWatcher,
  createUserApiCredentialsWatcher,
  deleteUserApiCredentialsWatcher,
  setPrefCurrencyWatcher,
  setThemeWatcher,
  setTradeLayoutWatcher,
  setPayoutAddressWatcher,
  setWeeklySummaryEmailWatcher,
  setWeeklySummaryEmailPortfolioWatcher,
  setWeeklySummaryEmailBotsWatcher,
  setBotTermsAgreedWatcher,
];

export default reducer;



// WEBPACK FOOTER //
// ./src/store/ducks/global/user.js