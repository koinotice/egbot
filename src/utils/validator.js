

function isAlphanumeric(string) {
  const regex = /^[\w\-\s]+$/;
  return regex.test(string);
}


export { isAlphanumeric };



// WEBPACK FOOTER //
// ./src/utils/validator.js