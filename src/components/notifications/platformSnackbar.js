import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import IconButton from '@material-ui/core/IconButton';
import Icon from '@material-ui/core/Icon';
import { hideNotification } from '../../store/ducks/global/notifications';

const styles = () => ({
  snackbar: {
    paddingTop: '2.857rem',
  },
  snackBarSuccess: {
    backgroundColor: '#52B0B0',
    color: '#FFF',
  },
  snackBarFail: {
    backgroundColor: '#b93d2d',
    color: '#FFF',
  },
  snackBarMessage: {
    display: 'flex',
    alignItems: 'center',
  },
  snackBarIcon: {
    marginRight: '.3125rem',
  },
});

class PlatformSnackbars extends Component {
  constructor(props) {
    super(props);

    this.state = {
      open: false,
      message: {},
    };

    this.OPEN_DURATION = 4000;
  }

  componentDidUpdate(prevProps) {
    if (document.hasFocus() && JSON.stringify(this.props.notifications) !== JSON.stringify(prevProps.notifications)) {
      this.handleNewNotifications();
    }
  }

  handleNewNotifications = () => {
    if (this.props.notifications.length) {
      if (this.state.open) {
        this.setState({ open: false });
      } else {
        this.processQueue();
      }
    }
  }

  processQueue = () => {
    const { actions } = this.props;
    if (this.props.notifications.length) {
      this.setState({
        open: true,
        message: this.props.notifications[0],
      });
      actions.hideNotification();
    }
  };

  handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    this.setState({ open: false });
  };

  handleExited = () => {
    this.processQueue();
  };

  render() {
    const { classes } = this.props;
    const { message, open } = this.state;

    return (
      <Snackbar
        className={classes.snackbar}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={open}
        autoHideDuration={this.OPEN_DURATION}
        onClose={this.handleClose}
        onExited={this.handleExited}>
        <SnackbarContent
          className={message.error ? classes.snackBarFail : classes.snackBarSuccess}
          aria-describedby="client-snackbar"
          message={
            <span className={classes.snackBarMessage}>
              {message.error ?
                <Icon className={classes.snackBarIcon}>error</Icon> :
                <Icon className={classes.snackBarIcon}>check_circle</Icon>}
              {message.error ?
                message.error :
                message.data}
            </span>
          }
          action={[
            <IconButton
              key="close"
              aria-label="Close"
              color="inherit"
              className={classes.close}
              onClick={this.handleClose}>
              <Icon>close</Icon>
            </IconButton>,
          ]} />
      </Snackbar>
    );
  }
}

PlatformSnackbars.defaultProps = {
  notifications: [],
};

PlatformSnackbars.propTypes = {
  classes: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  notifications: PropTypes.array,
};

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      ...bindActionCreators({
        hideNotification
      }, dispatch)
    }
  };
}

const base = withStyles(styles)(PlatformSnackbars);
export default connect(null, mapDispatchToProps)(base);



// WEBPACK FOOTER //
// ./src/components/notifications/platformSnackbar.js