import axios from 'axios';
import { PUBLIC_API_ROOT } from '../../config/apiConfig';

async function getTradeHistoryFor(exchange, pair) {
  const options = {
    method: 'GET',
    headers: {
      'content-type': 'application/json',
    },
    params: {
      pair: pair || null,
    },
    url: `${PUBLIC_API_ROOT}/trades/exchange/${exchange.toUpperCase()}`,
  };

  return axios(options);
}

export default getTradeHistoryFor;



// WEBPACK FOOTER //
// ./src/api/public/trades.js