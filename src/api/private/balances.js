import api from '../../utils/api';

async function getBalances(withCostBasis = false) {
  return api.get('/balances', {
    params: {
      withCostBasis
    }
  });
}

async function getBalanceByAccountId(id) {
  return api.get(`/balances/accounts/${id}`);
}
export { getBalances, getBalanceByAccountId };




// WEBPACK FOOTER //
// ./src/api/private/balances.js