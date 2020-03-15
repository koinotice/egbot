import { IS_PRIVATE_INSTANCE } from './globalConfig';

let apiHost;
let wsHost;
const apiVersion = 'v1';
const hostname = window && window.location && window.location.hostname;
const { protocol } = window.location;

if (protocol === 'https:') {
  apiHost = `https://${hostname}`;
  wsHost = `wss://${hostname}`;
} else {
  apiHost = `http://${hostname}`;
  wsHost = `ws://${hostname}`;
}

export const ROOT_URL = `${protocol}//${hostname}`;
export const PRIVATE_API_ROOT = `${apiHost}/api/${apiVersion}/private`;
export const PRIVATE_WS_ROOT = `${wsHost}/api/${apiVersion}/private`;

export const PUBLIC_API_ROOT = IS_PRIVATE_INSTANCE ? `https://quadency.com/api/${apiVersion}/public` : `${apiHost}/api/${apiVersion}/public`;
export const PUBLIC_WS_ROOT = IS_PRIVATE_INSTANCE ? `wss://quadency.com/api/${apiVersion}/public` : `${wsHost}/api/${apiVersion}/public`;

export const ALGOS_API_ROOT = `${apiHost}/api/${apiVersion}/algo`;
export const ALGOS_WS_ROOT = `${wsHost}/api/${apiVersion}/algo`;

export const USERS_API_ROOT = `${apiHost}/api/${apiVersion}/users`;
export const PAYMENTS_API_ROOT = `${apiHost}/api/${apiVersion}/payments`;



// WEBPACK FOOTER //
// ./src/config/apiConfig.js