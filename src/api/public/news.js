import axios from 'axios';
import { PUBLIC_API_ROOT } from '../../config/apiConfig';

async function getNews() {
  const options = {
    method: 'GET',
    url: `${PUBLIC_API_ROOT}/news`,
  };

  return axios(options);
}

async function getNewsForSymbol(symbol) {
  const options = {
    method: 'GET',
    url: `${PUBLIC_API_ROOT}/news/${symbol}`
  };

  return axios(options);
}

export { getNews, getNewsForSymbol };



// WEBPACK FOOTER //
// ./src/api/public/news.js