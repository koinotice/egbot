import axios from 'axios';
import { ALGOS_API_ROOT } from '../../config/apiConfig';
import { MODES } from '../../utils/botConstants';

async function getBotConfigs() {
  const options = {
    method: 'GET',
    headers: {
      'content-type': 'application/json'
    },
    url: `${ALGOS_API_ROOT}/configs`
  };
  return axios(options);
}

async function createNewBotConfig(botId, name, config) {
  const options = {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    data: {
      botId,
      name,
      config
    },
    url: `${ALGOS_API_ROOT}/configs`
  };
  return axios(options);
}

async function updateBotConfig(configId, newConfig) {
  const options = {
    method: 'PUT',
    headers: {
      'content-type': 'application/json'
    },
    data: newConfig,
    url: `${ALGOS_API_ROOT}/configs/${configId}`
  };
  return axios(options);
}

async function fetchConfigOutput(configId, mode) {
  const options = {
    method: 'GET',
    headers: {
      'content-type': 'application/json'
    },
    url: `${ALGOS_API_ROOT}/configs/${configId}/outputs`
  };
  if (mode === MODES.LIVE) {
    options.params = {
      mode
    };
  }

  return axios(options);
}


async function fetchConfigOutputSummaries() {
  const options = {
    method: 'GET',
    headers: {
      'content-type': 'application/json'
    },
    url: `${ALGOS_API_ROOT}/configs/summary`
  };
  return axios(options);
}

async function fetchConfigLogs(configId, mode) {
  const options = {
    method: 'GET',
    headers: {
      'content-type': 'application/json'
    },
    params: {
      mode
    },
    url: `${ALGOS_API_ROOT}/configs/${configId}/logs`
  };
  return axios(options);
}

async function deleteConfig(configId) {
  const options = {
    method: 'DELETE',
    headers: {
      'content-type': 'application/json'
    },
    url: `${ALGOS_API_ROOT}/configs/${configId}`
  };
  return axios(options);
}

export {
  getBotConfigs,
  createNewBotConfig,
  updateBotConfig,
  fetchConfigOutput,
  fetchConfigOutputSummaries,
  deleteConfig,
  fetchConfigLogs,
};



// WEBPACK FOOTER //
// ./src/api/algos/configs.js