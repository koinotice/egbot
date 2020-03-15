import axios from 'axios';
import { USERS_API_ROOT } from '../../config/apiConfig';

async function setupMFA() {
  const options = {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    url: `${USERS_API_ROOT}/mfa/setup`
  };

  return axios(options);
}

async function enableMFA(backupKey, password, mfaToken) {
  const options = {
    method: 'PUT',
    headers: {
      'content-type': 'application/json'
    },
    data: {
      backupKey,
      password,
      mfaToken
    },
    url: `${USERS_API_ROOT}/mfa/enable`
  };

  return axios(options);
}

async function disableMFA(password, mfaToken) {
  const options = {
    method: 'PUT',
    headers: {
      'content-type': 'application/json'
    },
    data: {
      password,
      mfaToken
    },
    url: `${USERS_API_ROOT}/mfa/disable`
  };

  return axios(options);
}

export { setupMFA, enableMFA, disableMFA };



// WEBPACK FOOTER //
// ./src/api/users/mfa.js