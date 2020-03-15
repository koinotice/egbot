import axios from 'axios';
import { PAYMENTS_API_ROOT } from '../../config/apiConfig';

async function createReferrer() {
  return axios.post(`${PAYMENTS_API_ROOT}/referrals/referrers`);
}

async function getReferrerInfo() {
  return axios.get(`${PAYMENTS_API_ROOT}/referrals/referrers`);
}

async function getRewards() {
  return axios.get(`${PAYMENTS_API_ROOT}/referrals/rewards`);
}

async function updateWalletAddress(address) {
  const options = {
    method: 'PUT',
    headers: {
      'content-type': 'application/json'
    },
    url: `${PAYMENTS_API_ROOT}/referrals/referrers`,
    data: {
      walletAddress: address
    }
  };
  return axios(options);
}

export { createReferrer, getReferrerInfo, getRewards, updateWalletAddress };



// WEBPACK FOOTER //
// ./src/api/payments/referrals.js