import axios from 'axios';
import { PRIVATE_API_ROOT } from '../config/apiConfig';
import { getSessionToken, removeSessionToken } from '../utils/token';

axios.defaults.baseURL = PRIVATE_API_ROOT;

axios.interceptors.request.use((config) => {
  config.headers.huxley = getSessionToken();
  config.headers.ahpee = 'ahpee';
  return config;
});

axios.interceptors.response.use((response) => {
  return response.data;
}, (error) => {
  const { status } = error.response;

  if (status === 401) {
    removeSessionToken();
    window.location.replace('/login');
  }

  if (status >= 500 && status <= 599) {
    return {
      error: 'Failed to process request, please try again later'
    };
  }

  if (error.response.data.error) {
    return {
      ...error.response.data,
      status
    };
  }

  return {
    error: 'request error',
    status
  };
});

export default axios;



// WEBPACK FOOTER //
// ./src/utils/api.js