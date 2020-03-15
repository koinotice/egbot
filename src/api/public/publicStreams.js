import { PUBLIC_WS_ROOT } from '../../config/apiConfig';
import logger from '../../utils/logger';

const subscriptions = {
  tradeStream: null,
  orderStream: null,
  priceStream: null,
  aggregatePriceStream: null,
};

const handlers = {
  tradeStream: null,
  orderStream: null,
  priceStream: null,
  aggregatePriceStream: null,
};

let SOCKET;

function unsubscribePublicStream(subscriptionType) {
  if (SOCKET) {
    const unsubscribePayload = JSON.parse(JSON.stringify(subscriptions[subscriptionType]));
    if (unsubscribePayload) {
      unsubscribePayload.eventType = 'unsubscribe';

      if (SOCKET.readyState === SOCKET.OPEN) {
        SOCKET.send(JSON.stringify({ ...unsubscribePayload, ...{ ahpee: 'ahpee' } }));
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
  const { subscriptionType } = subscriptionPayload;
  if (!subscriptions[subscriptionType]) {
    return;
  }

  if (subscriptionType === 'priceStream') {
    const { exchanges } = subscriptionPayload;
    if (exchanges.length !== subscriptions.priceStream.exchanges.length ||
      exchanges.some(exchange => !subscriptions.priceStream.exchanges.includes(exchange))) {
      unsubscribePublicStream(subscriptionType);
    }
  } else {
    const { exchange } = subscriptionPayload;
    if (subscriptions[subscriptionType].exchange !== exchange) {
      unsubscribePublicStream(subscriptionType);
    }
  }
}

function subscribePublicStream(subscriptionPayload, handler) {
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
    SOCKET = new WebSocket(`${PUBLIC_WS_ROOT}/ws`);
    SOCKET.onopen = () => {
      logger.info('SOCKET open public stream');

      Object.keys(subscriptions).forEach((key) => {
        if (subscriptions[key]) {
          SOCKET.send(JSON.stringify({ ...subscriptions[key], ...{ ahpee: 'ahpee' } }));
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
      logger.info('public stream closed');
      SOCKET = null;
      attemptReconnect();
    };

    SOCKET.onerror = (error) => {
      logger.error('websocket error', error);
      SOCKET = null;
    };
  } else if (SOCKET.readyState === SOCKET.OPEN) {
    SOCKET.send(JSON.stringify({ ...subscriptionPayload, ...{ ahpee: 'ahpee' } }));
  }
}

function getSocket() {
  return SOCKET;
}

export { subscribePublicStream, unsubscribePublicStream, getSocket };



// WEBPACK FOOTER //
// ./src/api/public/publicStreams.js