import createSagaMiddleware from 'redux-saga';
import { createLogger } from 'redux-logger';

const ALL_MIDDLEWARE = {
  sagaMiddleware: createSagaMiddleware()
};

if (process.env.REDUX_LOG === 'on') {
  ALL_MIDDLEWARE.loggerMiddleware = createLogger();
}


export default ALL_MIDDLEWARE;



// WEBPACK FOOTER //
// ./src/store/middleware/middleware.js