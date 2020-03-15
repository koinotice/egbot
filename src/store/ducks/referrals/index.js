import { combineReducers } from 'redux';
import referrals, { sagas as referralsSagas } from './referrals';

const referralsReducers = combineReducers({
  referrals
});

const sagas = [
  ...referralsSagas
];

export default referralsReducers;
export { sagas };



// WEBPACK FOOTER //
// ./src/store/ducks/referrals/index.js