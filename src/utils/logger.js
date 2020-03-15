
const LOG_LEVEL = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const CURRENT_LOG_LEVEL = 'error';

function timeStamp() {
  const dt = new Date();
  return dt.toUTCString();
}


class Logger {
  static error(message, ...args) {
    if (LOG_LEVEL.error <= LOG_LEVEL[CURRENT_LOG_LEVEL]) {
      console.error(`[${timeStamp()}] - ${message} ${args}`);
    }
  }

  static warn(message, ...args) {
    if (LOG_LEVEL.warn <= LOG_LEVEL[CURRENT_LOG_LEVEL]) {
      console.log(`[${timeStamp()}] - ${message} ${args}`);
    }
  }

  static info(message, ...args) {
    if (LOG_LEVEL.info <= LOG_LEVEL[CURRENT_LOG_LEVEL]) {
      console.log(`[${timeStamp()}] - ${message} ${args}`);
    }
  }

  static debug(message, ...args) {
    if (LOG_LEVEL.debug <= LOG_LEVEL[CURRENT_LOG_LEVEL]) {
      console.log(`[${timeStamp()}] - ${message} ${args}`);
    }
  }
}

export default Logger;




// WEBPACK FOOTER //
// ./src/utils/logger.js