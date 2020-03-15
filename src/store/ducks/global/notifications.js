/*
  sample notification payload
  * only data or error should appear on payload
  {
    data: 'enter message here'
    error: 'enter error here'
  }
*/

const initialState = {
  notifications: [],
};

const NOTIFICATIONS = [];

/* *********************************************** Actions *********************************************** */

const NOTIFICATION_SHOW = 'global/NOTIFICATION_SHOW';
const NOTIFICATION_HIDE = 'global/NOTIFICATION_HIDE';

/* ******************************************* Actions Creators ****************************************** */

function showNotification(notification) {
  return {
    type: NOTIFICATION_SHOW,
    notification,
  };
}

function hideNotification() {
  return {
    type: NOTIFICATION_HIDE,
  };
}

/* *********************************************** Reducers *********************************************** */

function addNotification(notification) {
  NOTIFICATIONS.push(notification);
  return JSON.parse(JSON.stringify(NOTIFICATIONS));
}

function removeNotification() {
  NOTIFICATIONS.shift();
  return JSON.parse(JSON.stringify(NOTIFICATIONS));
}


function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case NOTIFICATION_SHOW:
      return {
        ...state,
        notifications: addNotification(action.notification)
      };
    case NOTIFICATION_HIDE:
      return {
        ...state,
        notifications: removeNotification()
      };
    default:
      return state;
  }
}


/* ******************************************************************************************************* */

export { // action creators
  showNotification,
  hideNotification,
};

export default reducer;



// WEBPACK FOOTER //
// ./src/store/ducks/global/notifications.js