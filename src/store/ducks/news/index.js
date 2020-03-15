import { combineReducers } from 'redux';
import news, { sagas as newsSagas } from './news';

const newsReducers = combineReducers({
  news
});

const sagas = [
  ...newsSagas
];

export default newsReducers;
export { sagas };



// WEBPACK FOOTER //
// ./src/store/ducks/news/index.js