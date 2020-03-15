import axios from 'axios';
import { USERS_API_ROOT } from '../../config/apiConfig';

async function getUserInfo() {
  const options = {
    method: 'GET',
    headers: {
      'content-type': 'application/json'
    },
    url: `${USERS_API_ROOT}/`
  };

  return axios(options);
}

async function getUserPreferences() {
  const options = {
    method: 'GET',
    headers: {
      'content-type': 'application/json'
    },
    url: `${USERS_API_ROOT}/preferences`
  };

  return axios(options);
}

async function getUserApiCredentials() {
  const options = {
    method: 'GET',
    headers: {
      'content-type': 'application/json'
    },
    url: `${USERS_API_ROOT}/developer`
  };

  return axios(options);
}

async function createUserApiCredentials() {
  const options = {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    url: `${USERS_API_ROOT}/developer`
  };

  return axios(options);
}

async function deleteUserApiCredentials() {
  const options = {
    method: 'DELETE',
    headers: {
      'content-type': 'application/json'
    },
    url: `${USERS_API_ROOT}/developer`
  };

  return axios(options);
}

async function updateUserPreferences(preferences) {
  const options = {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    url: `${USERS_API_ROOT}/preferences`,
    data: {
      preferences
    }
  };

  return axios(options);
}

async function setUserBotTerms() {
  const options = {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    url: `${USERS_API_ROOT}/botterms`,
  };

  return axios(options);
}

async function changePassword(oldPassword, newPassword) {
  const options = {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    url: `${USERS_API_ROOT}/password`,
    data: {
      oldPassword,
      newPassword
    }
  };

  return axios(options);
}

async function changeName(name) {
  const options = {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    url: `${USERS_API_ROOT}/`,
    data: {
      name
    }
  };

  return axios(options);
}

async function getActivityLogs() {
  const options = {
    method: 'GET',
    headers: {
      'content-type': 'application/json'
    },
    url: `${USERS_API_ROOT}/logs`
  };

  return axios(options);
}

async function logoutUser() {
  const options = {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    url: `${USERS_API_ROOT}/logout`
  };

  return axios(options);
}

export {
  getUserInfo,
  getUserPreferences,
  getUserApiCredentials,
  createUserApiCredentials,
  deleteUserApiCredentials,
  updateUserPreferences,
  changePassword,
  changeName,
  getActivityLogs,
  logoutUser,
  setUserBotTerms,
};



// WEBPACK FOOTER //
// ./src/api/users/users.js