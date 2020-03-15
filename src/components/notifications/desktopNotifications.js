import { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Logger from '../../utils/logger';
import { getSessionToken } from '../../utils/token';
import { hideNotification } from '../../store/ducks/global/notifications';

class DesktopNotifications extends Component {
  static PERMISSIONS = {
    default: 0,
    granted: 1,
    denied: 2,
  };

  constructor() {
    super();
    this.permission = DesktopNotifications.PERMISSIONS.default;
    this.OPEN_DURATION = 4000;
  }

  componentDidMount() {
    // Make sure notifications are supported by the browser
    if ('Notification' in window && getSessionToken()) {
      this.requestPermission();
    } else {
      Logger.info('Desktop Notifications not supported by this browser');
    }
  }

  componentDidUpdate(prevProps) {
    // if user is currently on the platform, do nothing notification is handled by platformSnackbar
    if (!document.hasFocus() &&
        this.permission === DesktopNotifications.PERMISSIONS.granted &&
        JSON.stringify(prevProps.notifications) !== JSON.stringify(this.props.notifications)) {
      this.handleNotification();
    }
  }

  requestPermission() {
    Notification.requestPermission((result) => {
      this.permission = DesktopNotifications.PERMISSIONS[result];
    });
  }

  handleNotification() {
    const { notifications, actions } = this.props;
    if (notifications.length) {
      const newNotification = notifications[0];
      const title = newNotification.error ? newNotification.error : newNotification.data;
      const options = {
        icon: '/platform/static/images/desktop-notification-icon.png'
      };
      const notificationObject = new Notification(title, options);
      notificationObject.onclick = (e) => {
        e.preventDefault();
        window.focus();
      };
      setTimeout(() => {
        notificationObject.close();
      }, this.OPEN_DURATION);
      actions.hideNotification();
    }
  }

  render() {
    return null;
  }
}

DesktopNotifications.defaultProps = {
  notifications: []
};

DesktopNotifications.propTypes = {
  notifications: PropTypes.array,
  actions: PropTypes.object.isRequired
};

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      ...bindActionCreators({
        hideNotification,
      }, dispatch)
    }
  };
}

export default connect(null, mapDispatchToProps)(DesktopNotifications);



// WEBPACK FOOTER //
// ./src/components/notifications/desktopNotifications.js