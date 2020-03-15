import { call, spawn } from 'redux-saga/effects';
import global, { sagas as globalSagas } from './global';
import dashboard, { sagas as dashboardSagas } from './dashboard';
import holdings, { sagas as holdingsSagas } from './holdings';
import trade, { sagas as tradeSagas } from './trade';
import news, { sagas as newsSagas } from './news';
import coins, { sagas as coinsSagas } from './coins';
import referrals, { sagas as referralsSagas } from './referrals';
import algos, { sagas as algosSagas } from './algos';
import logger from '../../utils/logger';


const reducers = {
  global,
  dashboard,
  holdings,
  trade,
  news,
  coins,
  referrals,
  algos
};

function* initializeSaga(saga) {
  let initError = false;
  while (!initError) {
    initError = true;
    try {
      // eslint-disable-next-line no-loop-func
      setTimeout(() => { initError = false; });
      yield call(saga);
    } catch (error) {
      console.error(error);
      logger.debug(error);
      if (initError) {
        throw new Error(`${saga.name} :: terminated due to an exception initializing.`);
      }
    }
  }
}

function* rootSaga() {
  const sagas = [
    ...globalSagas,
    ...dashboardSagas,
    ...holdingsSagas,
    ...tradeSagas,
    ...newsSagas,
    ...coinsSagas,
    ...referralsSagas,
    ...algosSagas
  ];

  yield sagas.map(saga => spawn(initializeSaga, saga));
}

export default reducers;
export { rootSaga };



// WEBPACK FOOTER //
// ./src/store/ducks/index.js