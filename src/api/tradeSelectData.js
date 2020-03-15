import getExchangeInfo from './private/exchanges';
import getAccounts from './private/accounts';
import { getBalanceByAccountId } from './private/balances';

const getTradeSelect = async () => {
  const response = {};
  response.accounts = await getAccounts();
  response.exchanges = await getExchangeInfo();

  return response;
};

const getRawBalancesForAccount = async (accountId) => {
  try {
    const balanceForAccountId = await getBalanceByAccountId(accountId);

    if (balanceForAccountId.error) {
      // return object with error so caller can handler error;
      return balanceForAccountId;
    }
    return balanceForAccountId;
  } catch (err) {
    return { error: err };
  }
};


export default getTradeSelect;
export { getRawBalancesForAccount };



// WEBPACK FOOTER //
// ./src/api/tradeSelectData.js