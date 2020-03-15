const FIATS = ['USD', 'EUR', 'GBP', 'AUD', 'JPY', 'CNY', 'KRW', 'CHF', 'CAD', 'SGD', 'HKD', 'NZD', 'ZAR'];
export { FIATS };

const hoffman = process.env.REACT_APP_HOFMANN || (window.ENV ? window.ENV.REACT_APP_HOFMANN : 'false');
const IS_PRIVATE_INSTANCE = hoffman !== 'false';

export {IS_PRIVATE_INSTANCE}

// WEBPACK FOOTER //
// ./src/config/globalConfig.js