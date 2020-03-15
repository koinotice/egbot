const DATA_FREQUENCY = {
  MINUTE: 'minute',
  DAILY: 'daily',
};

const CANDLE_TO_DATA_FREQUENCY = {
  '1T': DATA_FREQUENCY.MINUTE,
  '5T': DATA_FREQUENCY.MINUTE,
  '15T': DATA_FREQUENCY.MINUTE,
  '30T': DATA_FREQUENCY.MINUTE,
  '60T': DATA_FREQUENCY.MINUTE,
  '1D': DATA_FREQUENCY.DAILY,
};

const MODES = {
  BACKTEST: 'backtest',
  LIVE: 'live',
};

const STATUSES = {
  RUNNING: 'running',
  STOPPED: 'stopped',
  FAILED: 'failed',
  COMPLETED: 'completed',
};

const BOT_INDICATOR_MAP = {
  quad_multi_level_rsi: {
    name: 'Relative Strength Index',
    keys: ['rsiPeriod']
  },
  quad_mean_reversion: {
    name: 'Relative Strength Index',
    keys: ['rsiPeriod']
  },
  quad_macd: {
    name: 'MACD',
    keys: ['macdFastPeriod', 'macdSlowPeriod', 'default-close', 'macdSignalPeriod']
  },
  quad_bollinger_bands: {
    name: 'Bollinger Bands',
    keys: ['bbPeriod', 'bbUpperDev']
  }
};

const POSITION_TYPES = {
  LONG: 'LONG',
  SHORT: 'SHORT'
};


export { CANDLE_TO_DATA_FREQUENCY, DATA_FREQUENCY, MODES, STATUSES, BOT_INDICATOR_MAP, POSITION_TYPES };



// WEBPACK FOOTER //
// ./src/utils/botConstants.js