import { combineReducers } from 'redux';
import portfolioGrowth, { sagas as portfoloGrowthSagas } from './portfolioGrowth';
import portfolioStats, { sagas as portfolioStatsSagas } from './portfolioStats';

const dashboardReducers = combineReducers({
  portfolioGrowth,
  portfolioStats
});

const sagas = [
  ...portfoloGrowthSagas,
  ...portfolioStatsSagas
];

export default dashboardReducers;
export { sagas };



// WEBPACK FOOTER //
// ./src/store/ducks/dashboard/index.js