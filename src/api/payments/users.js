import axios from 'axios';
import { PAYMENTS_API_ROOT } from '../../config/apiConfig';

async function getUserProducts() {
  return axios.get(`${PAYMENTS_API_ROOT}/users/products`, {
    params: {
      status: 'ACTIVE'
    }
  });
}

async function getUserFeatures() {
  return axios.get(`${PAYMENTS_API_ROOT}/users/features`);
}

export { getUserProducts, getUserFeatures };



// WEBPACK FOOTER //
// ./src/api/payments/users.js