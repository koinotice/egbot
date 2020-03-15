import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles, withTheme } from '@material-ui/core/styles';
import { getSocket as getPrivateSocket } from '../../api/private/privateStreams';
import { getSocket as getPublicSocket } from '../../api/public/publicStreams';
import { getSessionToken } from '../../utils/token';

const CHECK_INTERVAL = 1000;

const styles = theme => ({
  container: {
    borderRadius: '3px',
    marginRight: '1rem',
    paddingTop: '2px'
  },
  svg: {
    height: 20,
    width: 72,
    [theme.breakpoints.down(600)]: {
      width: 20,
    }
  },
  text: {
    fontSize: '10px',
    fill: theme.palette.text.secondary,
    [theme.breakpoints.down(600)]: {
      display: 'none'
    }
  }
});

class ConnectionStatus extends Component {
  constructor(props) {
    super(props);

    this.state = {
      status: false
    };
  }
  componentDidMount() {
    this.startTimer();
  }
  startTimer() {
    setInterval(() => {
      const { checkPrivateStatus } = this.props;
      const privateSocket = getPrivateSocket();
      const publicSocket = getPublicSocket();
      const session = getSessionToken();
      const privateStatus = privateSocket && privateSocket.readyState === privateSocket.OPEN;
      const publicStatus = publicSocket && publicSocket.readyState === publicSocket.OPEN;
      this.setState({
        status: session && checkPrivateStatus ? privateStatus && publicStatus : publicStatus
      });
    }, CHECK_INTERVAL);
  }
  render() {
    const { status } = this.state;
    const { classes, theme } = this.props;
    return (
      <span className={classes.container}>
        <svg className={classes.svg}>
          <circle cx="14" cy="11" r="4" fill={status ? theme.palette.icons.green : theme.palette.icons.red} />
          <text x="24" y="14" className={classes.text} >{status ? 'Connected' : 'Connecting...'}</text>
        </svg>
      </span>
    );
  }
}

ConnectionStatus.defaultProps = {
  checkPrivateStatus: false,
};

ConnectionStatus.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  checkPrivateStatus: PropTypes.bool,
};

export default withTheme()(withStyles(styles)((ConnectionStatus)));



// WEBPACK FOOTER //
// ./src/components/common/connectionStatus.js