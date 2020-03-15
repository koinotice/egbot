function getSessionToken() {
  return localStorage.getItem('HUXLEY');
}

function removeSessionToken() {
  localStorage.clear();
  sessionStorage.clear();
}

export { getSessionToken, removeSessionToken };



// WEBPACK FOOTER //
// ./src/utils/token.js