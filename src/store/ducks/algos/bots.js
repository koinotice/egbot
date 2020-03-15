import { takeLatest, all, call, put, takeEvery, take, select } from 'redux-saga/effects';
import { delay, eventChannel } from 'redux-saga';
import moment from 'moment';
import { getBots } from '../../../api/algos/bots';
import logger from '../../../utils/logger';
import { MESSAGE_TYPES, subscribeStream, unsubscribeStream } from '../../../api/algos/streams';
import generateRandomName from '../../../utils/randomNameGenerator';
import {
  getBotConfigs,
  createNewBotConfig,
  updateBotConfig,
  fetchConfigOutput as fetchConfigOutputApi,
  deleteConfig as deleteConfigApi,
  fetchConfigLogs as fetchConfigLogsApi,
  fetchConfigOutputSummaries as fetchConfigOutputSummariesApi,
} from '../../../api/algos/configs';
import {
  runBacktest as runBacktestApi,
  runBotLive as runBotLiveApi,
  stopBot as stopBotApi,
} from '../../../api/algos/run';
import { getPriceTimeFrame } from '../../../api/public/prices';
import { MODES, STATUSES, POSITION_TYPES } from '../../../utils/botConstants';
import { showNotification } from '../global/notifications';
import { fetchProductsAndFeatures } from '../global/paywall';


const initialState = {
  bots: {},
  botsLoaded: false,
  botConfigs: {},
  botConfigLogs: {},
  botConfigLogsLoaded: false,
  configBacktestOutputs: {},
  configBacktestOutputsLoaded: false,
  configLiveOutputs: {},
  configLiveOutputsLoaded: false,
  configOutputSummaries: {},
  configOutputSummariesLoaded: false,
  currentBotId: null,
  currentConfigId: null,
  currentConfigValid: null,
  currentConfigErrors: {},
  currentBotAndConfigChanging: false,
  displayParameterErrors: false,
  filterBotConfigType: 0,
  filterBotConfigStatus: 'all',
};

let streamConnected = false;
const INITIAL_RECONNECT_TIMEOUT = 1000; // first reconnect attempt in 1 sec, exponentially increasing thereafter
let reconnectTimeout = INITIAL_RECONNECT_TIMEOUT;

const NOTIFICATIONS = {
  RUNNING: (name, mode) => ({ data: `${name} ${mode} started` }),
  STOPPED: (name, mode) => ({ data: `${name} ${mode} stopped` }),
  COMPLETED: (name, mode) => ({ data: `${name} ${mode} completed` }),
  FAILED: (name, mode) => ({ error: `${name} ${mode} failed` })
};

/* *********************************************** Actions *********************************************** */

const INITIALIZE = 'algos/INITIALIZE';
const FETCH_BOTS = 'algos/FETCH_BOTS';
const FETCH_BOT_CONFIGS = 'algos/FETCH_BOT_CONFIGS';
const FETCH_BOT_CONFIG_BACKTEST_OUTPUTS = 'algos/FETCH_BOT_CONFIG_BACKTEST_OUTPUTS';
const FETCH_BOT_CONFIG_LIVE_OUTPUTS = 'algos/FETCH_BOT_CONFIG_LIVE_OUTPUTS';
const FETCH_CONFIG_OUTPUT_SUMMARIES = 'algos/FETCH_CONFIG_OUTPUT_SUMMARIES';
const FETCH_BOT_CONFIG_LOGS = 'algos/FETCH_BOT_CONFIG_LOGS';
const SET_BOTS = 'algos/SET_BOTS';
const SET_BOT_CONFIGS = 'algos/SET_BOT_CONFIGS';
const SET_BOT_CONFIG_BACKTEST_OUTPUTS = 'algos/SET_BOT_CONFIG_BACKTEST_OUTPUTS';
const SET_BOT_CONFIG_LIVE_OUTPUTS = 'algos/SET_BOT_CONFIG_LIVE_OUTPUTS';
const SET_CONFIG_OUTPUT_SUMMARIES = 'algos/SET_CONFIG_OUTPUT_SUMMARIES';
const SET_BOT_CONFIG_BACKTEST_OUTPUTS_LOADING = 'algos/SET_BOT_CONFIG_BACKTEST_OUTPUTS_LOADING';
const SET_BOT_CONFIG_LIVE_OUTPUTS_LOADING = 'algos/SET_BOT_CONFIG_LIVE_OUTPUTS_LOADING';
const SET_BOT_CONFIG_LOGS = 'algos/SET_BOT_CONFIG_LOGS';
const SET_BOT_CONFIG_LOGS_LOADING = 'algos/SET_BOT_CONFIG_LOGS_LOADING';
const SET_CURRENT_BOT_AND_CONFIG = 'algos/SET_CURRENT_BOT_AND CONFIG';
const SET_CURRENT_BOT = 'algos/SET_CURRENT_BOT';
const SET_CURRENT_CONFIG = 'algos/SET_CURRENT_CONFIG';
const SET_CURRENT_BOT_AND_CONFIG_CHANGING = 'algos/SET_CURRENT_BOT_AND_CONFIG_CHANGING';
const RESET_CURRENT_BOT_AND_CONFIG = 'algos/RESET_CURRENT_BOT_AND_CONFIG';
const CREATE_NEW_CONFIG = 'algos/CREATE_NEW_CONFIG';
const COPY_CONFIG = 'algos/COPY_CONFIG';
const UPDATE_CONFIG = 'algos/UPDATE_CONFIG';
const DELETE_CONFIG = 'algos/DELETE_CONFIG';
const RUN_BOT_BACKTEST = 'algos/RUN_BOT_BACKTEST';
const RUN_BOT_LIVE = 'algos/RUN_BOT_LIVE';
const STOP_BOT = 'algos/STOP_BOT';
const SUBSCRIBE_BOTS_STREAM = 'algos/SUBSCRIBE_BOTS_STREAM';
const UNSUBSCRIBE_BOTS_STREAM = 'algos/UNSUBSCRIBE_BOTS_STREAM';
const BOTS_STATE_UPDATE = 'algos/BOTS_STATE_UPDATE';
const BOTS_PROGRESS_UPDATE = 'algos/BOTS_PROGRESS_UPDATE';
const SET_CURRENT_CONFIG_VALID = 'algos/SET_CURRENT_CONFIG_VALID';
const SET_CURRENT_CONFIG_ERRORS = 'algos/SET_CURRENT_CONFIG_ERRORS';
const CLEAR_CURRENT_CONFIG_ERRORS = 'algos/CLEAR_CURRENT_CONFIG_ERRORS';
const SHOW_PARAMETER_ERRORS = 'algos/SHOW_PARAMETER_ERRORS';
const SHOW_BOT_NOTIFICATION = 'algos/SHOW_BOT_NOTIFICATION';
const REFRESH_POSITIONS = 'algos/REFRESH_POSITIONS';
const FILTER_BOT_CONFIG_TYPE = 'algos/FILTER_BOT_CONFIG_TYPE';
const FILTER_BOT_CONFIG_STATUS = 'algos/FILTER_BOT_CONFIG_STATUS';

/* ******************************************* Actions Creators ****************************************** */

function initialize() {
  return {
    type: INITIALIZE
  };
}

function fetchBots() {
  return {
    type: FETCH_BOTS
  };
}

function fetchBotConfigs() {
  return {
    type: FETCH_BOT_CONFIGS
  };
}

function fetchConfigBacktestOutput(configId) {
  return {
    type: FETCH_BOT_CONFIG_BACKTEST_OUTPUTS,
    configId
  };
}

function fetchConfigLiveOutput(configId) {
  return {
    type: FETCH_BOT_CONFIG_LIVE_OUTPUTS,
    configId
  };
}

function fetchConfigOutputSummaries() {
  return {
    type: FETCH_CONFIG_OUTPUT_SUMMARIES
  };
}

function fetchConfigLogs(configId, mode) {
  return {
    type: FETCH_BOT_CONFIG_LOGS,
    configId,
    mode
  };
}

function setBots(bots) {
  return {
    type: SET_BOTS,
    bots
  };
}

function setBotConfigs(botConfigs) {
  return {
    type: SET_BOT_CONFIGS,
    botConfigs
  };
}

function setBotConfigBacktestOutputLoading() {
  return {
    type: SET_BOT_CONFIG_BACKTEST_OUTPUTS_LOADING,
  };
}

function setBotConfigLiveOutputLoading() {
  return {
    type: SET_BOT_CONFIG_LIVE_OUTPUTS_LOADING,
  };
}

function setBotConfigsLogs(botConfigLogs) {
  return {
    type: SET_BOT_CONFIG_LOGS,
    botConfigLogs,
  };
}

function setBotConfigLogsLoading() {
  return {
    type: SET_BOT_CONFIG_LOGS_LOADING,
  };
}

function setBotConfigBacktestOutput(configBacktestOutputs) {
  return {
    type: SET_BOT_CONFIG_BACKTEST_OUTPUTS,
    configBacktestOutputs
  };
}

function setBotConfigLiveOutput(configLiveOutputs) {
  return {
    type: SET_BOT_CONFIG_LIVE_OUTPUTS,
    configLiveOutputs,
  };
}

function setConfigOutputSummaries(configOutputSummaries) {
  return {
    type: SET_CONFIG_OUTPUT_SUMMARIES,
    configOutputSummaries
  };
}

function setCurrentBotAndConfig(botId, configId = null) {
  return {
    type: SET_CURRENT_BOT_AND_CONFIG,
    botId,
    configId
  };
}

function setCurrentBot(botId) {
  return {
    type: SET_CURRENT_BOT,
    botId
  };
}

function setCurrentConfig(configId) {
  return {
    type: SET_CURRENT_CONFIG,
    configId
  };
}

function setCurrentBotAndConfigChanging(isChanging) {
  return {
    type: SET_CURRENT_BOT_AND_CONFIG_CHANGING,
    isChanging
  };
}

function resetCurrentBotAndConfig() {
  return {
    type: RESET_CURRENT_BOT_AND_CONFIG
  };
}

function createNewConfig(botId) {
  return {
    type: CREATE_NEW_CONFIG,
    botId
  };
}

function copyConfig(configId) {
  return {
    type: COPY_CONFIG,
    configId
  };
}

function deleteConfig(configId) {
  return {
    type: DELETE_CONFIG,
    configId
  };
}

function updateConfig(newConfig) {
  return {
    type: UPDATE_CONFIG,
    newConfig
  };
}

function subscribeBotsStream() {
  return {
    type: SUBSCRIBE_BOTS_STREAM,
  };
}

function unsubscribeBotsStream() {
  return {
    type: UNSUBSCRIBE_BOTS_STREAM,
  };
}

function runBacktest(configId, startDate, endDate, mode, dataFrequency) {
  return {
    type: RUN_BOT_BACKTEST,
    configId,
    startDate,
    endDate,
    mode,
    dataFrequency,
  };
}

function runLive(configId, accountIds) {
  return {
    type: RUN_BOT_LIVE,
    configId,
    accountIds,
  };
}

function stopBot(configId) {
  return {
    type: STOP_BOT,
    configId
  };
}

function setCurrentConfigValid(isValid) {
  return {
    type: SET_CURRENT_CONFIG_VALID,
    isValid
  };
}

function setCurrentConfigErrors(field, error) {
  return {
    type: SET_CURRENT_CONFIG_ERRORS,
    field,
    error
  };
}

function clearCurrentConfigErrors() {
  return {
    type: CLEAR_CURRENT_CONFIG_ERRORS
  };
}

function showParameterErrors(show) {
  return {
    type: SHOW_PARAMETER_ERRORS,
    show
  };
}

function showBotNotification(configId, status, mode) {
  return {
    type: SHOW_BOT_NOTIFICATION,
    configId,
    status,
    mode
  };
}

function refreshPositions() {
  return {
    type: REFRESH_POSITIONS
  };
}

function filterBotConfigByBotId(botId) {
  return {
    type: FILTER_BOT_CONFIG_TYPE,
    botId
  };
}

function filterBotConfigByStatus(status) {
  return {
    type: FILTER_BOT_CONFIG_STATUS,
    status
  };
}

/* *********************************************** Reducers *********************************************** */

function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case SET_BOTS:
      return {
        ...state,
        bots: action.bots,
        botsLoaded: true
      };
    case SET_BOT_CONFIGS:
      return {
        ...state,
        botConfigs: action.botConfigs
      };
    case SET_BOT_CONFIG_BACKTEST_OUTPUTS:
      return {
        ...state,
        configBacktestOutputs: action.configBacktestOutputs,
        configBacktestOutputsLoaded: true,
      };
    case SET_BOT_CONFIG_BACKTEST_OUTPUTS_LOADING:
      return {
        ...state,
        configBacktestOutputsLoaded: false,
      };
    case SET_BOT_CONFIG_LIVE_OUTPUTS:
      return {
        ...state,
        configLiveOutputs: action.configLiveOutputs,
        configLiveOutputsLoaded: true,
      };
    case SET_BOT_CONFIG_LIVE_OUTPUTS_LOADING:
      return {
        ...state,
        configLiveOutputsLoaded: false,
      };
    case SET_CONFIG_OUTPUT_SUMMARIES:
      return {
        ...state,
        configOutputSummaries: action.configOutputSummaries,
        configOutputSummariesLoaded: true
      };
    case SET_BOT_CONFIG_LOGS:
      return {
        ...state,
        botConfigLogs: action.botConfigLogs,
        botConfigLogsLoaded: true,
      };
    case SET_BOT_CONFIG_LOGS_LOADING:
      return {
        ...state,
        botConfigLogsLoaded: false,
      };
    case SET_CURRENT_BOT:
      return {
        ...state,
        currentBotId: action.botId
      };
    case SET_CURRENT_CONFIG:
      return {
        ...state,
        currentConfigId: action.configId
      };
    case SET_CURRENT_BOT_AND_CONFIG_CHANGING:
      return {
        ...state,
        currentBotAndConfigChanging: action.isChanging
      };
    case RESET_CURRENT_BOT_AND_CONFIG:
      return {
        ...state,
        currentBotId: null,
        currentConfigId: null,
        currentConfigValid: null
      };
    case BOTS_STATE_UPDATE:
      return {
        ...state,
        botStateUpdates: action.botId,
      };
    case BOTS_PROGRESS_UPDATE:
      return {
        ...state,
        botProgressUpdates: action.botId,
      };
    case SET_CURRENT_CONFIG_VALID:
      return {
        ...state,
        currentConfigValid: action.isValid
      };
    case SET_CURRENT_CONFIG_ERRORS:
      return {
        ...state,
        currentConfigErrors: {
          ...state.currentConfigErrors,
          [action.field]: action.error
        }
      };
    case CLEAR_CURRENT_CONFIG_ERRORS:
      return {
        ...state,
        currentConfigErrors: {},
        currentConfigValid: null
      };
    case SHOW_PARAMETER_ERRORS:
      return {
        ...state,
        displayParameterErrors: action.show
      };
    case FILTER_BOT_CONFIG_TYPE:
      return {
        ...state,
        filterBotConfigType: action.botId,
      };
    case FILTER_BOT_CONFIG_STATUS:
      return {
        ...state,
        filterBotConfigStatus: action.status
      };
    default:
      return state;
  }
}

/* ************************************************ Sagas ************************************************ */

function* fetchBotsWorker() {
  const bots = yield call(getBots);
  if (bots.error) {
    logger.error('error fetching bots');
    return;
  }
  const botsObj = bots.reduce((acc, cur) => {
    cur = {
      ...cur,
      configtemplate: {
        ...cur.configtemplate,
        name: {
          group: 'General Settings',
          label: 'Configuration Name',
          groupIndex: 0,
          fieldIndex: -1, // ensure name appears first
          component: 'BotTextField',
          validation: { isRequired: true }
        }
      }
    };
    acc[cur.id] = cur;
    return acc;
  }, {});

  yield put(setBots(botsObj));
}

function* fetchBotConfigsWorker() {
  const botConfigs = yield call(getBotConfigs);
  if (botConfigs.error) {
    logger.error('error fetching bot configs');
    return;
  }

  const botConfigsObj = botConfigs.reduce((acc, cur) => {
    acc[cur.id] = cur;
    acc[cur.id].progress = 0;
    acc[cur.id].hasShownOutput = true;
    acc[cur.id].isStartingOrStopping = false;
    return acc;
  }, {});

  yield put(setBotConfigs(botConfigsObj));
}

function* initializeWorker() {
  yield all([
    put(fetchBots()),
    put(fetchBotConfigs()),
    put(fetchConfigOutputSummaries()),
    put(subscribeBotsStream()),
  ]);
}

function* fetchBotsWatcher() {
  yield takeLatest(FETCH_BOTS, fetchBotsWorker);
}

function* fetchBotConfigsWatcher() {
  yield takeLatest(FETCH_BOT_CONFIGS, fetchBotConfigsWorker);
}

function* initializeWatcher() {
  yield takeLatest(INITIALIZE, initializeWorker);
}

function* setCurrentBotAndConfigWorker(action) {
  yield put(setCurrentBotAndConfigChanging(true));
  if (!action.configId) {
    const state = yield select();
    const { algos: { bots: { botConfigs } } } = state;
    const configsForBot = Object.values(botConfigs).find(config => config.botId === action.botId);
    if (configsForBot) {
      action.configId = configsForBot.id;
    } else {
      yield put(createNewConfig(action.botId));
      return;
    }
  }

  yield all([
    put(setCurrentBot(action.botId)),
    put(setCurrentConfig(action.configId))
  ]);
  yield put(clearCurrentConfigErrors());
  yield put(setCurrentBotAndConfigChanging(false));
}

function* setCurrentBotAndConfigWatcher() {
  yield takeLatest(SET_CURRENT_BOT_AND_CONFIG, setCurrentBotAndConfigWorker);
}

function* createNewConfigWorker(action) {
  const { botId } = action;
  const name = generateRandomName();
  const state = yield select();
  const { algos: { bots: { bots, botConfigs: newBotConfigs } } } = state;
  const { configtemplate: configTemplate } = bots[botId];

  const config = Object.keys(configTemplate).reduce((acc, key) => {
    acc[key] = configTemplate[key].defaultValue || null;
    return acc;
  }, {});

  const res = yield call(createNewBotConfig, botId, name, config);
  if (res.error) {
    logger.error('error creating new config');
    return;
  }
  const { configId } = res;

  Object.assign(newBotConfigs, {
    [configId]: {
      id: configId,
      botId,
      name,
      config,
      status: 'STOPPED',
      mode: null,
    }
  });
  yield put(setBotConfigs(newBotConfigs));
  yield put(setCurrentBotAndConfig(botId, configId));
}

function* createNewConfigWatcher() {
  yield takeLatest(CREATE_NEW_CONFIG, createNewConfigWorker);
}

function initStream(subscriptionPayload) {
  return eventChannel((emit) => {
    subscribeStream(subscriptionPayload, emit);
    return () => {};
  });
}

function formatPositions(position, prices) {
  position.type = position.amount > 0 ? POSITION_TYPES.LONG : POSITION_TYPES.SHORT;
  position.currentPrice = prices[position.pair].price;
  position.averageCostBasis = position.cost_basis;
  position.marketValue = position.currentPrice * position.amount;
  position.costBasis = position.averageCostBasis * position.amount;
  return position;
}

function* subscribeBotStreamWorker() {
  logger.debug('subscribing bot stream');
  const subscriptionPayload = {
    eventType: 'algo', command: 'subscribe'
  };
  if (!streamConnected) {
    const botStreamEventChannel = yield call(initStream, subscriptionPayload);
    reconnectTimeout = INITIAL_RECONNECT_TIMEOUT;

    while (true) {
      const data = yield take(botStreamEventChannel);

      if (data.messageType === MESSAGE_TYPES.RECONNECT) {
        logger.info('disconnected from bots stream, re-initializing');
        botStreamEventChannel.close();
        streamConnected = false;
        yield call(delay, reconnectTimeout);
        reconnectTimeout *= 2;
        yield put(subscribeBotsStream());
        break;
      }

      reconnectTimeout = INITIAL_RECONNECT_TIMEOUT;

      if (data.messageType === MESSAGE_TYPES.PROGRESS_UPDATES) {
        const {
          configId, progress
        } = data.message;

        const state = yield select();
        const { botConfigs } = state.algos.bots;
        const newBotConfigs = JSON.parse(JSON.stringify(botConfigs));
        newBotConfigs[configId].progress = progress;
        yield put(setBotConfigs(newBotConfigs));
      }

      if (data.messageType === MESSAGE_TYPES.STATE_UPDATE) {
        const state = yield select();
        const {
          runId, configId, status, output, mode
        } = data.message;

        const { botConfigs } = state.algos.bots;
        const newBotConfigs = JSON.parse(JSON.stringify(botConfigs));

        newBotConfigs[configId].mode = status.toLowerCase() === STATUSES.COMPLETED
        || status.toLowerCase() === STATUSES.STOPPED
        || status.toLowerCase() === STATUSES.FAILED
          ? botConfigs[configId].mode
          : mode;
        newBotConfigs[configId][`${newBotConfigs[configId].mode}Status`] = status.toUpperCase();
        newBotConfigs[configId].status = status.toUpperCase();
        newBotConfigs[configId].runId = runId || newBotConfigs[configId].runId;
        newBotConfigs[configId].progress = 0;

        if (status.toLowerCase() === STATUSES.FAILED) {
          const previousOutput = mode === MODES.LIVE
            ? state.algos.bots.configLiveOutputs
            : state.algos.bots.configBacktestOutputs;

          if (previousOutput[configId] && previousOutput[configId].runId !== runId) {
            const newOutput = previousOutput;
            delete newOutput[configId];
            if (mode === MODES.LIVE) {
              yield put(setBotConfigLiveOutput(newOutput));
            } else {
              yield put(setBotConfigBacktestOutput(newOutput));
            }
          }

          yield put(fetchConfigLogs(configId, newBotConfigs[configId].mode));
        }

        let shouldShowNotification = true;
        if (output) {
          output.tradeNumber = output.trades.length;
          output.runId = runId;
          output.period_end = (output.period_end < output.period_start) ? (output.period_end + 60000) : output.period_end;
          if (output.trades.length > 500) {
            output.trades.length = 500;
          }
          if (output.positions && output.positions.length) {
            const {
              prices: { prices }
            } = state.global;
            output.positions = output.positions
              .filter(position => parseFloat(position.amount.toFixed(12)) !== 0)
              .map(position => formatPositions(position, prices));
          }
          const { configOutputSummaries } = state.algos.bots;

          const previousOutput = mode === MODES.LIVE
            ? state.algos.bots.configLiveOutputs
            : state.algos.bots.configBacktestOutputs;

          const newConfigOutputs = Object.assign(previousOutput, { [configId]: output });
          const outputSummary = {
            runId,
            algorithmPeriodReturn: (output.portfolio_value - output.capital_base) / output.capital_base,
            backtestCompleted: output.backtest_completed,
            benchmarkPeriodReturn: output.benchmark_period_return,
            candleTimeframe: output.candle_timeframe,
            capitalBase: output.capital_base,
            configId: output.config_id,
            exchangeName: output.exchange_name,
            market: output.market,
            periodEnd: output.period_end,
            periodStart: output.period_start,
            portfolioValue: output.portfolio_value,
            quoteCurrency: output.quote_currency,
            numTrades: output.tradeNumber,
            openOrders: output.open_orders,
            hasShownOutput: true,
          };

          const newConfigOutputSummaries = Object.assign(configOutputSummaries, { [configId]: outputSummary });

          if (mode === MODES.LIVE) {
            yield put(setBotConfigLiveOutput(newConfigOutputs));
            newBotConfigs[configId].hasShownOutput = true;
            shouldShowNotification = false; // don't show notification for every update
          } else {
            yield put(setBotConfigBacktestOutput(newConfigOutputs));
            yield put(fetchProductsAndFeatures());
          }
          yield put(setConfigOutputSummaries(newConfigOutputSummaries));
          yield put(fetchConfigLogs(configId, newBotConfigs[configId].mode));
        }
        yield put(setBotConfigs(newBotConfigs));
        if (shouldShowNotification) {
          yield put(showBotNotification(configId, status, newBotConfigs[configId].mode));
        }
      }
    }
  } else {
    yield call(subscribeStream, subscriptionPayload);
  }
}


function* subscribeBotStreamWatcher() {
  yield takeEvery(SUBSCRIBE_BOTS_STREAM, subscribeBotStreamWorker);
}

function unsubscribeBotStreamWorker() {
  unsubscribeStream();
}

function* unsubscribeBotStreamWatcher() {
  yield takeEvery(UNSUBSCRIBE_BOTS_STREAM, unsubscribeBotStreamWorker);
}


function* runBacktestWorker(data) {
  const {
    configId, startDate, endDate, mode, dataFrequency
  } = data;

  const state = yield select();
  const { botConfigs } = state.algos.bots;

  const { exchange, pair } = botConfigs[configId].config;

  const BotConfigsWithStartState = JSON.parse(JSON.stringify(botConfigs));
  BotConfigsWithStartState[configId].isStartingOrStopping = true;
  yield put(setBotConfigs(BotConfigsWithStartState));

  logger.info(`run backtest with configId=${configId} startDate=${startDate} endDate=${endDate} mode=${mode} dataFrequency=${dataFrequency} exchange=${exchange} pair=${pair}`);
  if (exchange) {
    const timeFrameResponse = yield call(getPriceTimeFrame, exchange, pair, dataFrequency);

    if (timeFrameResponse.error) {
      logger.error('Error fetching time frames:', timeFrameResponse.error);
      return;
    }

    const finalEndDate = () => {
      if (!timeFrameResponse) {
        return endDate;
      }
      const latestTimeForPair = timeFrameResponse.endDate;
      return moment(endDate).isAfter(latestTimeForPair, 'day')
        ? latestTimeForPair
        : endDate;
    };

    const finalStartDate = () => {
      if (!timeFrameResponse) {
        return startDate;
      }

      const difference = moment(finalEndDate()).diff(moment(endDate), 'day');
      const earliestTimeForPair = timeFrameResponse.startDate;
      const adjustedStartDate = moment(startDate).add(difference, 'day');
      const result = adjustedStartDate.isBefore(earliestTimeForPair, 'day')
        ? earliestTimeForPair
        : adjustedStartDate.format('YYYY-MM-DD');

      return result;
    };

    const runResponse = yield call(runBacktestApi, configId, finalStartDate(), finalEndDate(), mode, dataFrequency);
    if (runResponse.error) {
      logger.error('Error running back test:', runResponse.error);
      return;
    }
    const { runId, status } = runResponse;

    const newBotConfigs = JSON.parse(JSON.stringify(botConfigs));

    newBotConfigs[configId].backtestStatus = status.toUpperCase() === 'RUNNING' ? 'RUNNING' : 'STOPPED';
    newBotConfigs[configId].status = newBotConfigs[configId].backtestStatus;
    newBotConfigs[configId].runId = runId;
    newBotConfigs[configId].backtestRunId = runId;
    newBotConfigs[configId].mode = MODES.BACKTEST;
    newBotConfigs[configId].progress = 0;
    newBotConfigs[configId].isStartingOrStopping = false;
    yield put(setBotConfigs(newBotConfigs));
  }
}

function* runBacktestWatcher() {
  yield takeEvery(RUN_BOT_BACKTEST, runBacktestWorker);
}


function* stopBotWorker(data) {
  const {
    configId
  } = data;

  const state = yield select();
  const { botConfigs, configOutputSummaries } = state.algos.bots;
  const BotConfigsWithStopState = JSON.parse(JSON.stringify(botConfigs));
  BotConfigsWithStopState[configId].isStartingOrStopping = true;
  yield put(setBotConfigs(BotConfigsWithStopState));

  const stopResponse = yield call(stopBotApi, botConfigs[configId].runId);
  if (stopResponse.error) {
    logger.error('Error stopping bot:', stopResponse.error);
    return;
  }

  const mode = botConfigs[configId].runId === botConfigs[configId].liveRunId ? 'live' : 'backtest';

  const newBotConfigs = JSON.parse(JSON.stringify(botConfigs));
  newBotConfigs[configId].status = 'STOPPED';
  newBotConfigs[configId][`${mode}Status`] = 'STOPPED';
  newBotConfigs[configId].progress = 0;
  newBotConfigs[configId].hasShownOutput = true;
  newBotConfigs[configId].isStartingOrStopping = false;
  yield put(setBotConfigs(newBotConfigs));


  if (!configOutputSummaries[configId]) {
    configOutputSummaries[configId] = { hasShownOutput: true };
  } else {
    configOutputSummaries[configId].hasShownOutput = true;
  }
  yield put(setConfigOutputSummaries(JSON.parse(JSON.stringify(configOutputSummaries))));
}

function* stopBotWatcher() {
  yield takeEvery(STOP_BOT, stopBotWorker);
}


function* updateConfigWorker(data) {
  const { newConfig } = data;
  const state = yield select();
  const { algos: { bots: { bots, botConfigs, currentConfigId } } } = state;
  const currentBotConfig = botConfigs[currentConfigId];

  const configTemplate = bots[currentBotConfig.botId].configtemplate;
  newConfig.config = Object.keys(newConfig.config).reduce((config, attribute) => {
    if (configTemplate[attribute]) {
      config[attribute] = newConfig.config[attribute];
    }
    return config;
  }, {});

  const newBotConfig = {
    ...currentBotConfig,
    ...newConfig
  };
  const res = yield call(updateBotConfig, currentConfigId, newBotConfig);
  if (res.error) {
    logger.error('error updating config', res.error);
    return;
  }

  const newBotConfigs = {
    ...botConfigs,
    [currentConfigId]: newBotConfig
  };
  yield put(setBotConfigs(newBotConfigs));
}

function* updateConfigWatcher() {
  yield takeLatest(UPDATE_CONFIG, updateConfigWorker);
}

function* fetchBotConfigBacktestOutputWorker(data) {
  const state = yield select();
  const { configBacktestOutputs } = state.algos.bots;
  const { configId } = data;
  if (!configBacktestOutputs[configId]) {
    yield put(setBotConfigBacktestOutputLoading());
    const res = yield call(fetchConfigOutputApi, configId);
    if (res.error) {
      logger.error('error fetching config output', res.error);
      return;
    }

    if (res) {
      res.tradeNumber = res.trades.length;
      if (res.trades.length > 500) {
        res.trades.length = 500;
      }
    }
    const newConfigOutputs = Object.assign(configBacktestOutputs, { [configId]: res || {} });
    yield put(setBotConfigBacktestOutput(newConfigOutputs));
  }
}

function* fetchBotConfigBacktestOutputWatcher() {
  yield takeLatest(FETCH_BOT_CONFIG_BACKTEST_OUTPUTS, fetchBotConfigBacktestOutputWorker);
}

function* fetchBotConfigLiveOutputWorker(data) {
  const state = yield select();
  const { configLiveOutputs } = state.algos.bots;
  const { configId } = data;
  if (!configLiveOutputs[configId]) {
    yield put(setBotConfigLiveOutputLoading());
    const res = yield call(fetchConfigOutputApi, configId, MODES.LIVE);
    if (res.error) {
      logger.error('error fetching config output', res.error);
      return;
    }

    if (res) {
      res.period_end = (res.period_end < res.period_start) ? (res.period_end + 60000) : res.period_end;
      res.tradeNumber = res.trades.length;
      if (res.trades.length > 500) {
        res.trades.length = 500;
      }

      if (res.positions && res.positions.length) {
        const {
          prices: { prices }
        } = state.global;
        res.positions = res.positions
          .filter(position => parseFloat(position.amount.toFixed(12)) !== 0)
          .map(position => formatPositions(position, prices));
      }
    }

    const newConfigOutputs = Object.assign(configLiveOutputs, { [configId]: res || {} });
    yield put(setBotConfigLiveOutput(newConfigOutputs));
  }
}

function* fetchBotConfigLiveOutputWatcher() {
  yield takeLatest(FETCH_BOT_CONFIG_LIVE_OUTPUTS, fetchBotConfigLiveOutputWorker);
}

function* fetchConfigOutputSummariesWorker() {
  const configOutputSummaries = yield call(fetchConfigOutputSummariesApi);
  const configOutputSummariesObj = configOutputSummaries.reduce((acc, cur) => {
    acc[cur.configId] = cur;

    // catalyst algorithmPeriodReturn becomes incorrect intermittently, so we recalc ourselves
    acc[cur.configId].algorithmPeriodReturn = (acc[cur.configId].portfolioValue - acc[cur.configId].capitalBase) / acc[cur.configId].capitalBase;
    acc[cur.configId].hasShownOutput = true;
    return acc;
  }, {});

  yield put(setConfigOutputSummaries(configOutputSummariesObj));
}

function* fetchConfigOutputSummariesWatcher() {
  yield takeLatest(FETCH_CONFIG_OUTPUT_SUMMARIES, fetchConfigOutputSummariesWorker);
}

function* deleteBotConfigWorker(data) {
  const { configId } = data;
  const {
    algos: {
      bots: {
        botConfigs,
        currentConfigId,
        currentBotId,
      }
    }
  } = yield select();

  const res = yield call(deleteConfigApi, configId);
  const { configId: deletedConfigId } = res;
  const newBotConfigs = Object.keys(botConfigs).reduce((configs, id) => {
    if (id === deletedConfigId) {
      return configs;
    }
    configs[id] = botConfigs[id];
    return configs;
  }, {});
  yield put(setBotConfigs(newBotConfigs));

  const botConfigIdsForCurrentBotId = Object.keys(newBotConfigs).filter(id => newBotConfigs[id].botId === currentBotId);
  if (deletedConfigId === currentConfigId) {
    if (botConfigIdsForCurrentBotId.length) {
      const [selectedConfigId] = botConfigIdsForCurrentBotId;
      yield put(setCurrentBotAndConfig(currentBotId, selectedConfigId));
    } else {
      yield put(resetCurrentBotAndConfig());
    }
  }
}

function* deleteBotConfigWatcher() {
  yield takeEvery(DELETE_CONFIG, deleteBotConfigWorker);
}

function* copyConfigWorker(data) {
  const { configId: configIdToCopy } = data;

  const state = yield select();
  const { botConfigs } = state.algos.bots;

  const newConfig = JSON.parse(JSON.stringify(botConfigs[configIdToCopy]));
  newConfig.name = generateRandomName();

  const res = yield call(createNewBotConfig, newConfig.botId, newConfig.name, newConfig.config);
  if (res.error) {
    logger.error('error creating copy config');
    return;
  }
  const { configId } = res;

  const newBotConfigs = Object.assign(botConfigs, {
    [configId]: {
      id: configId,
      botId: newConfig.botId,
      name: newConfig.name,
      config: newConfig.config,
      status: 'STOPPED',
      mode: null,
    }
  });
  yield put(setBotConfigs(newBotConfigs));
  yield put(setCurrentBotAndConfig(newConfig.botId, configId));
}

function* copyConfigWatcher() {
  yield takeEvery(COPY_CONFIG, copyConfigWorker);
}

function* runBotLiveWorker(data) {
  const { configId, accountIds } = data;
  const state = yield select();
  const { botConfigs, configOutputSummaries } = state.algos.bots;

  const BotConfigsWithStartState = JSON.parse(JSON.stringify(botConfigs));
  BotConfigsWithStartState[configId].isStartingOrStopping = true;
  yield put(setBotConfigs(BotConfigsWithStartState));

  const res = yield call(runBotLiveApi, MODES.LIVE, accountIds, configId);
  if (res.error) {
    logger.error('error running bot love');
    return;
  }
  const { runId, status } = res;

  logger.info(`started bot live runId=${runId}, status=${status}`);

  const newBotConfigs = JSON.parse(JSON.stringify(botConfigs));
  newBotConfigs[configId].liveStatus = 'RUNNING';
  newBotConfigs[configId].status = 'RUNNING';
  newBotConfigs[configId].runId = runId;
  newBotConfigs[configId].liveRunId = runId;
  newBotConfigs[configId].mode = MODES.LIVE;
  newBotConfigs[configId].hasShownOutput = false;
  newBotConfigs[configId].isStartingOrStopping = false;
  yield put(setBotConfigs(newBotConfigs));

  if (!configOutputSummaries[configId]) {
    configOutputSummaries[configId] = { hasShownOutput: false };
  } else {
    configOutputSummaries[configId].hasShownOutput = false;
  }

  yield put(setConfigOutputSummaries(JSON.parse(JSON.stringify(configOutputSummaries))));
}

function* runBotLiveWatcher() {
  yield takeEvery(RUN_BOT_LIVE, runBotLiveWorker);
}

function* fetchBotConfigLogsWorker(data) {
  const state = yield select();
  const { botConfigs, botConfigLogs } = state.algos.bots;

  const { configId, mode } = data;

  if (!botConfigs[configId].hasShownOutput || mode.toLowerCase() === MODES.BACKTEST) {
    yield put(setBotConfigLogsLoading());
  }

  const response = yield call(fetchConfigLogsApi, configId, mode);
  if (response.error) {
    logger.error('error fetching bot config logs');
    return;
  }
  const newBotConfigLogs = botConfigLogs;
  if (newBotConfigLogs[configId]) {
    newBotConfigLogs[configId][mode] = response;
  } else {
    newBotConfigLogs[configId] = {
      [mode]: response,
    };
  }
  yield put(setBotConfigsLogs(newBotConfigLogs));
}

function* fetchBotConfigLogsWatcher() {
  yield takeEvery(FETCH_BOT_CONFIG_LOGS, fetchBotConfigLogsWorker);
}

function* checkConfigValidWorker() {
  const state = yield select();
  const { currentConfigErrors } = state.algos.bots;
  const numberOfErrors = Object.keys(currentConfigErrors)
    .reduce((errorTotal, field) => {
      if (currentConfigErrors[field]) {
        return errorTotal + 1;
      }
      return errorTotal;
    }, 0);
  yield put(setCurrentConfigValid(!numberOfErrors));
}

function* checkConfigValidWatcher() {
  yield takeEvery(SET_CURRENT_CONFIG_ERRORS, checkConfigValidWorker);
}

function* showBotNotificationWorker(action) {
  const { configId, status, mode } = action;
  const { algos: { bots: { botConfigs } } } = yield select();
  const { name } = botConfigs[configId];

  const notification = NOTIFICATIONS[status.toUpperCase()](name, mode);
  if (notification) {
    yield put(showNotification(notification));
  }
}

function* showBotNotificationWatcher() {
  yield takeEvery(SHOW_BOT_NOTIFICATION, showBotNotificationWorker);
}


function* refreshPositionsWorker() {
  const state = yield select();
  const { configLiveOutputs } = state.algos.bots;

  if (!configLiveOutputs || !Object.keys(configLiveOutputs).length) {
    return;
  }

  const {
    prices: { prices }
  } = state.global;

  const newConfigLiveOutputs = Object.keys(configLiveOutputs).reduce((newOutput, configId) => {
    if (!configLiveOutputs[configId].positions || !configLiveOutputs[configId].positions.length) {
      newOutput[configId] = configLiveOutputs[configId];
      return newOutput;
    }
    configLiveOutputs[configId].positions = configLiveOutputs[configId].positions
      .filter(position => parseFloat(position.amount.toFixed(12)) !== 0)
      .map(position => formatPositions(position, prices));
    newOutput[configId] = configLiveOutputs[configId];
    return newOutput;
  }, {});
  yield put(setBotConfigLiveOutput(newConfigLiveOutputs));
}

function* refreshPositionsWatcher() {
  yield takeEvery(REFRESH_POSITIONS, refreshPositionsWorker);
}


/* ******************************************************************************************************* */

export {
  initialize,
  setCurrentBotAndConfigChanging,
  setCurrentBotAndConfig,
  resetCurrentBotAndConfig,
  unsubscribeBotsStream,
  runBacktest,
  runLive,
  stopBot,
  updateConfig,
  fetchConfigBacktestOutput,
  fetchConfigLiveOutput,
  createNewConfig,
  deleteConfig,
  copyConfig,
  setCurrentConfigValid,
  setCurrentConfigErrors,
  showParameterErrors,
  fetchConfigLogs,
  refreshPositions,
  filterBotConfigByBotId,
  filterBotConfigByStatus,
};

export const sagas = [
  fetchBotsWatcher,
  fetchBotConfigsWatcher,
  fetchConfigOutputSummariesWatcher,
  initializeWatcher,
  setCurrentBotAndConfigWatcher,
  createNewConfigWatcher,
  deleteBotConfigWatcher,
  subscribeBotStreamWatcher,
  unsubscribeBotStreamWatcher,
  runBacktestWatcher,
  runBotLiveWatcher,
  stopBotWatcher,
  updateConfigWatcher,
  fetchBotConfigBacktestOutputWatcher,
  fetchBotConfigLiveOutputWatcher,
  copyConfigWatcher,
  fetchBotConfigLogsWatcher,
  showBotNotificationWatcher,
  refreshPositionsWatcher,
  checkConfigValidWatcher
];

export default reducer;



// WEBPACK FOOTER //
// ./src/store/ducks/algos/bots.js