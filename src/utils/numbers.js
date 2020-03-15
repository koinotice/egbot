
function getPrecision(num) {
  if (!isFinite(num)) return 0;
  let e = 1;
  let p = 0;
  while (Math.round(num * e) / e !== num) { e *= 10; p++; }
  return p;
}

function sanitizeScientificNotation(num) {
  if (Math.abs(num) < 1.0) {
    const e = parseInt(num.toString().split('e-')[1], 10);
    if (e) {
      num *= 10 ** (e - 1);
      num = `0.${ (new Array(e)).join('0') }${num.toString().substring(2)}`;
    }
  } else {
    let e = parseInt(num.toString().split('+')[1], 10);
    if (e > 20) {
      e -= 20;
      num /= 10 ** e;
      num += (new Array(e + 1)).join('0');
    }
  }
  return num;
}


export default getPrecision;
export { sanitizeScientificNotation };



// WEBPACK FOOTER //
// ./src/utils/numbers.js