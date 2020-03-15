import React, { Component, Fragment } from 'react';
import { withStyles, withTheme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';

const styles = theme => ({
  text: {
    marginBottom: '5.357142857142857rem'
  },
  [theme.breakpoints.down('xs')]: {
    text: {
      width: '100%'
    }
  }
});

class TwoFAPrompt extends Component {
  enable2FA = () => (
    <Fragment>
      <Typography className={this.props.classes.text}>
        We highly recommend using 2 factor authentication. This adds an
        extra layer of security to your account in addition to password.
      </Typography>
    </Fragment>
  );

  disable2FA = () => (
    <Fragment>
      <Typography className={this.props.classes.text}>
        Your account access is currently secured via Google Authenticator app.
        We do not recommend disabling 2FA, however if you need to do so for
        some reason, click &quot;Disable&quot;
      </Typography>
    </Fragment>
  );

  render() {
    const { enabled } = this.props;

    return enabled ? this.disable2FA() : this.enable2FA();
  }
}

TwoFAPrompt.defaultProps = {
  enabled: null
};

TwoFAPrompt.propTypes = {
  enabled: PropTypes.bool,
  classes: PropTypes.object.isRequired
};

export default withTheme()(withStyles(styles)(TwoFAPrompt));



// WEBPACK FOOTER //
// ./src/components/settings/twoFAPrompt.js