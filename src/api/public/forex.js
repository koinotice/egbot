import axios from 'axios';
import { PUBLIC_API_ROOT } from '../../config/apiConfig';

async function getForex() {
  const options = {
    method: 'GET',
    headers: {
      'content-type': 'application/json',
    },
    url: `${PUBLIC_API_ROOT}/prices/forex`,
  };

  return axios(options);
}

export default getForex;



// WEBPACK FOOTER //
// ./src/api/public/forex.js