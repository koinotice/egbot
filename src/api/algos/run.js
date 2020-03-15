import axios from 'axios';
import { ALGOS_API_ROOT } from '../../config/apiConfig';

async function runBacktest(configId, startDate, endDate, mode, dataFrequency) {
  const options = {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    data: {
      configId,
      startDate,
      endDate,
      mode,
      dataFrequency
    },
    url: `${ALGOS_API_ROOT}/run`
  };
  return axios(options);
}

async function runBotLive(mode, accountIds, configId) {
  const options = {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    data: {
      mode,
      accountIds,
      configId,
    },
    url: `${ALGOS_API_ROOT}/run`
  };
  return axios(options);
}

async function stopBot(runId) {
  const options = {
    method: 'DELETE',
    url: `${ALGOS_API_ROOT}/run/${runId}`
  };
  return axios(options);
}

async function getTimeFrames(exchange) {
  const options = {
    method: 'GET',
    url: `${ALGOS_API_ROOT}/run/timeframes/${exchange}`
  };
  return axios(options);
}

export { runBacktest, runBotLive, stopBot, getTimeFrames };



// WEBPACK FOOTER //
// ./src/api/algos/run.js