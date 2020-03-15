import { put, takeEvery, select } from 'redux-saga/effects';
import find from 'lodash/find';
import clone from 'lodash/clone';
import sortBy from 'lodash/sortBy';
import { getPriceInPrefCurrency, calcPercentChange } from '../../../utils/helpers';
import { fetchBalances } from '../global/balances';

const initialState = {
  byAccount: [],
  byAsset: [],
  holdingsLoaded: false
};

const DUST_FILTER = 0.00000260;

/* *********************************************** Actions *********************************************** */

const REFRESH_HOLDINGS = 'global/REFRESH_HOLDINGS';
const FETCH_HOLDINGS = 'global/FETCH_HOLDINGS';
const SET_HOLDINGS = 'global/SET_HOLDINGS';


/* ******************************************* Actions Creators ****************************************** */

function refreshHoldings() {
  return {
    type: REFRESH_HOLDINGS,
  };
}

function fetchHoldings() {
  return {
    type: FETCH_HOLDINGS,
  };
}

function setHoldings(data) {
  return {
    type: SET_HOLDINGS,
    data
  };
}

/* *********************************************** Reducers *********************************************** */

function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case SET_HOLDINGS:
      return {
        ...state,
        byAccount: action.data.byAccount,
        byAsset: action.data.byAsset,
        holdingsLoaded: true
      };
    default:
      return state;
  }
}

/* ************************************************ Sagas ************************************************ */

function formatHoldings(user, accounts, balances, forex, prices) {
  if (!user || !accounts || !balances || !prices || !forex) return;

  const { pref_currency: prefCurrency } = user.preferences;

  let byAsset = [];
  let byAccount = [];

  accounts.forEach(async (accountObj) => {
    const account = {
      id: accountObj.id,
      exchange: accountObj.name,
      label: accountObj.label,
      exchangeLabel: accountObj.exchange_label,
      value: parseFloat(0),
      value24h: parseFloat(0),
      change24h: parseFloat(0),
      percentChange: parseFloat(0),
      assets: []
    };
    byAccount.push(account);
  });

  balances.forEach((balanceObj) => {
    const currentPrice = getPriceInPrefCurrency(balanceObj.asset, prefCurrency, prices, forex);
    const currentPriceBTC = getPriceInPrefCurrency(balanceObj.asset, 'BTC', prices, forex);
    const price24h = getPriceInPrefCurrency(balanceObj.asset, prefCurrency, prices, forex, true);
    const value = balanceObj.total * currentPrice;
    const valueBTC = balanceObj.total * currentPriceBTC;
    const value24h = balanceObj.total * price24h;
    const avgUnitCost = balanceObj.costBasis.avgUnitCostUSD *
      getPriceInPrefCurrency('USD', prefCurrency, prices, forex, false, balanceObj.costBasis.btcUsdRefRate);
    const cost = balanceObj.costBasis.totalCostUSD *
      getPriceInPrefCurrency('USD', prefCurrency, prices, forex, false, balanceObj.costBasis.btcUsdRefRate);

    const asset = {
      name: balanceObj.asset,
      fullName: balanceObj.fullName,
      accountId: balanceObj.accountId,
      value,
      valueBTC,
      value24h,
      rawTotal: parseFloat(balanceObj.total),
      freeTotal: parseFloat(balanceObj.free),
      currentPrice,
      avgUnitCost,
      cost,
      return: value - cost,
      percentReturn: calcPercentChange(value, cost),
      change24h: value - value24h,
      percentChange: calcPercentChange(value, value24h),
    };

    const account = find(byAccount, { id: balanceObj.accountId });
    if (account && asset.valueBTC > DUST_FILTER) {
      account.assets.push(asset);
      account.value += value;
      account.value24h += value24h;
    }

    const existing = find(byAsset, { name: balanceObj.asset });
    if (existing) {
      existing.value += value;
      existing.valueBTC += valueBTC;
      existing.value24h += value24h;
      existing.rawTotal += parseFloat(asset.rawTotal);
      existing.freeTotal += parseFloat(asset.freeTotal);
      existing.change24h = existing.value - existing.value24h;
      existing.percentChange = calcPercentChange(existing.value, existing.value24h);
      // PnL calculations - only calculate aggregate return if all accounts have cost basis
      existing.avgUnitCost = (existing.cost === 0 || asset.cost === 0) ? 0 : (existing.cost + asset.cost) / existing.rawTotal;
      existing.cost = (existing.cost === 0 || asset.cost === 0) ? 0 : existing.avgUnitCost * existing.rawTotal;
      existing.return = (existing.cost === 0 || asset.cost === 0) ? 0 : existing.value - existing.cost;
      existing.percentReturn = (existing.cost === 0 || asset.cost === 0) ? 0 : calcPercentChange(existing.value, existing.cost);
    } else {
      byAsset.push(clone(asset));
    }
  });

  byAccount.forEach((account) => {
    account.change24h = account.value - account.value24h;
    account.percentChange = calcPercentChange(account.value, account.value24h);
  });

  byAccount = sortBy(byAccount, 'value').reverse();
  byAsset = byAsset.filter((asset) => { return asset.valueBTC > DUST_FILTER; });

  return {
    byAsset,
    byAccount,
  };
}

function* refreshHoldingsWorker() {
  const state = yield select();
  const {
    user: { userLoaded },
    accounts: { accountsLoaded },
    forex: { forexLoaded },
    prices: { pricesLoaded },
    balances: { balancesLoaded },
  } = state.global;
  const depsLoaded = (userLoaded && accountsLoaded && forexLoaded && pricesLoaded && balancesLoaded);

  if (!depsLoaded) return;

  const {
    user: { user },
    accounts: { accounts },
    forex: { forex },
    prices: { prices },
    balances: { balances },
  } = state.global;

  const holdingsObj = formatHoldings(user, accounts, balances, forex, prices);
  yield put(setHoldings(holdingsObj));
}

function* fetchHoldingsWorker() {
  yield put(fetchBalances());
}

function* refreshHoldingsWatcher() {
  yield takeEvery(REFRESH_HOLDINGS, refreshHoldingsWorker);
}

function* fetchHoldingsWatcher() {
  yield takeEvery(FETCH_HOLDINGS, fetchHoldingsWorker);
}

/* ******************************************************************************************************* */

export { // action creators
  refreshHoldings,
  fetchHoldings,
};
export const sagas = [
  refreshHoldingsWatcher,
  fetchHoldingsWatcher
];
export default reducer;



// WEBPACK FOOTER //
// ./src/store/ducks/holdings/holdings.js