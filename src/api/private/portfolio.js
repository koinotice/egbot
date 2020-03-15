import api from '../../utils/api';

async function getPortfolioStats(accountId) {
  return api.get('/portfolio/stats', {
    params: {
      accountId
    }
  });
}

async function getPortfolioGrowth(timeFrame, accountId) {
  return api.get('/portfolio/growth', {
    params: {
      timeFrame,
      accountId
    }
  });
}

export { getPortfolioStats, getPortfolioGrowth };



// WEBPACK FOOTER //
// ./src/api/private/portfolio.js