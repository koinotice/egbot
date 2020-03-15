import { combineReducers } from 'redux';
import holdings, { sagas as holdingsSagas } from './holdings';

const holdingsReducers = combineReducers({
  holdings
});

const sagas = [
  ...holdingsSagas
];

export default holdingsReducers;
export { sagas };



// WEBPACK FOOTER //
// ./src/store/ducks/holdings/index.js