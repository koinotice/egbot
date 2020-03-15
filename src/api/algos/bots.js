import axios from 'axios';
import { ALGOS_API_ROOT } from '../../config/apiConfig';

async function getBots() {
  const options = {
    method: 'GET',
    headers: {
      'content-type': 'application/json'
    },
    url: `${ALGOS_API_ROOT}/bots`
  };
  return axios(options);
}

export { getBots };



// WEBPACK FOOTER //
// ./src/api/algos/bots.js