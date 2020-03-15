import axios from 'axios';
import { PRIVATE_API_ROOT } from '../../config/apiConfig';

async function userPing(currentRoute) {
  const options = {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    data: {
      currentPage: currentRoute
    },
    url: `${PRIVATE_API_ROOT}/users/ping`,
  };
  return axios(options);
}

export default userPing;



// WEBPACK FOOTER //
// ./src/api/private/users.js