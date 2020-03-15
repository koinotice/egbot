import axios from 'axios';
import { USERS_API_ROOT } from '../../config/apiConfig';

async function getCharts() {
  return axios.get(`${USERS_API_ROOT}/charts`);
}

async function getChartById(chartId) {
  return axios.get(`${USERS_API_ROOT}/charts/id/${chartId}`);
}

async function saveChart(chartData, exchange, pair) {
  const options = {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    data: {
      chartData,
      exchange,
      pair
    },
    url: `${USERS_API_ROOT}/charts/`,
  };

  const response = await axios(options);
  if (response.error) {
    throw new Error(response.error);
  }
  return response;
}

async function deleteChart(chartId) {
  const options = {
    method: 'DELETE',
    headers: {
      'content-type': 'application/json',
    },
    data: {
      chartId,
    },
    url: `${USERS_API_ROOT}/charts/`,
  };
  return axios(options);
}


export { getCharts, saveChart, deleteChart, getChartById };



// WEBPACK FOOTER //
// ./src/api/users/charts.js