import api from '../../utils/api';

async function getExchangeInfo() {
  return api.get('/exchanges?status=ACTIVE');
}

export default getExchangeInfo;



// WEBPACK FOOTER //
// ./src/api/private/exchanges.js