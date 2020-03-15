import axios from 'axios';
import { PUBLIC_API_ROOT } from '../../config/apiConfig';

async function getMarketsFor(exchange) {
  const options = {
    method: 'GET',
    headers: {
      'content-type': 'application/json',
    },
    params: {
      exchange
    },
    url: `${PUBLIC_API_ROOT}/exchanges/markets`
  };

  return axios(options);
}

export default getMarketsFor;



// WEBPACK FOOTER //
// ./src/api/public/exchanges.js