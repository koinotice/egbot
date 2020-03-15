import { ALGOS_WS_ROOT } from '../../config/apiConfig';
import logger from '../../utils/logger';
import { getSessionToken } from '../../utils/token';


const MESSAGE_TYPES = {
  STATE_UPDATE: 'stateUpdate',
  PROGRESS_UPDATES: 'progressUpdate',
  RECONNECT: 'reconnect'
};

const subscriptions = {
  algo: null,
};

const handlers = {
  algo: null,
};


let SOCKET;

function setHandler(subscriptionPayload, handler) {
  const { eventType } = subscriptionPayload;

  if (!handler) {
    return;
  }

  if (Object.prototype.hasOwnProperty.call(handlers, eventType)) {
    handlers[eventType] = handler;
  }
}

function setSubscription(subscriptionPayload) {
  const { eventType } = subscriptionPayload;

  if (Object.prototype.hasOwnProperty.call(subscriptions, eventType)) {
    subscriptions[eventType] = subscriptionPayload;
  }
}

function subscribeStream(subscriptionPayload, handler) {
  setSubscription(subscriptionPayload);
  setHandler(subscriptionPayload, handler);

  function attemptReconnect() {
    SOCKET = null;
    Object.keys(handlers).forEach((key) => {
      if (handlers[key]) {
        handlers[key]({ messageType: MESSAGE_TYPES.RECONNECT });
      }
    });
  }

  if (!SOCKET) {
    SOCKET = new WebSocket(`${ALGOS_WS_ROOT}/ws`, getSessionToken());

    SOCKET.onopen = () => {
      logger.info('SOCKET open bot stream');

      Object.keys(subscriptions).forEach((key) => {
        if (subscriptions[key]) {
          SOCKET.send(JSON.stringify(subscriptions[key]));
        }
      });
    };

    SOCKET.onmessage = (message) => {
      const messageData = message.data;
      const messageObject = JSON.parse(messageData);

      Object.keys(handlers).forEach((key) => {
        if (handlers[key]) {
          handlers[key](messageObject);
        }
      });
    };

    SOCKET.onclose = () => {
      logger.info('bot stream closed');
      SOCKET = null;
      attemptReconnect();
    };

    SOCKET.onerror = (error) => {
      logger.error('websocket error', error);
      SOCKET = null;
    };
  } else if (SOCKET.readyState === SOCKET.OPEN) {
    SOCKET.send(JSON.stringify(subscriptionPayload));
  }
}


function unsubscribeStream() {
  if (SOCKET) {
    const unsubscribePayload = JSON.parse(JSON.stringify(subscriptions.algo));
    if (unsubscribePayload) {
      unsubscribePayload.command = 'unsubscribe';

      if (SOCKET.readyState === SOCKET.OPEN) {
        SOCKET.send(JSON.stringify(unsubscribePayload));
      }
    }
  }
  subscriptions.algo = null;
}


export { subscribeStream, unsubscribeStream, MESSAGE_TYPES };



// WEBPACK FOOTER //
// ./src/api/algos/streams.js