import { PRIVATE_WS_ROOT } from '../../config/apiConfig';
import logger from '../../utils/logger';
import { getSessionToken } from '../../utils/token';

const subscriptions = {
  tradeStream: null,
  orderStream: null,
  balanceStream: null,
};

const handlers = {
  tradeStream: null,
  orderStream: null,
  balanceStream: null,
};


let SOCKET;


function unsubscribePrivateStream(subscriptionType) {
  if (SOCKET) {
    const unsubscribePayload = JSON.parse(JSON.stringify(subscriptions[subscriptionType]));
    if (unsubscribePayload) {
      unsubscribePayload.eventType = 'unsubscribe';

      if (SOCKET.readyState === SOCKET.OPEN) {
        SOCKET.send(JSON.stringify(unsubscribePayload));
      }
    }
  }
  subscriptions[subscriptionType] = null;
}

function setSubscription(subscriptionPayload) {
  const { subscriptionType } = subscriptionPayload;

  if (Object.prototype.hasOwnProperty.call(subscriptions, subscriptionType)) {
    subscriptions[subscriptionType] = subscriptionPayload;
  }
}

function setHandler(subscriptionPayload, handler) {
  const { subscriptionType } = subscriptionPayload;

  if (!handler) {
    return;
  }

  if (Object.prototype.hasOwnProperty.call(handlers, subscriptionType)) {
    handlers[subscriptionType] = handler;
  }
}

function cleanUpSubscription(subscriptionPayload) {
  const { subscriptionType, exchange } = subscriptionPayload;
  if (subscriptions[subscriptionType]) {
    if (subscriptions[subscriptionType].exchange !== exchange) {
      unsubscribePrivateStream({
        subscriptionType,
      });
    }
  }
}

function subscribePrivateStream(subscriptionPayload, handler) {
  cleanUpSubscription(subscriptionPayload);
  setSubscription(subscriptionPayload);
  setHandler(subscriptionPayload, handler);

  function attemptReconnect() {
    SOCKET = null;
    Object.keys(handlers).forEach((key) => {
      if (handlers[key]) {
        handlers[key]({ subscriptionType: 'RECONNECT' });
      }
    });
  }

  if (!SOCKET) {
    SOCKET = new WebSocket(`${PRIVATE_WS_ROOT}/ws`, getSessionToken());

    SOCKET.onopen = () => {
      logger.info('SOCKET open private stream');

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
      logger.info('private stream closed');
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

function getSocket() {
  return SOCKET;
}

export { subscribePrivateStream, unsubscribePrivateStream, getSocket };



// WEBPACK FOOTER //
// ./src/api/private/privateStreams.js