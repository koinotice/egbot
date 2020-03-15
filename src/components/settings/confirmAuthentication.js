import React, { Component } from 'react';
import { withStyles, withTheme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';
import SettingsForm from './settingsForm';

const styles = theme => ({
  text: {
    lineHeight: '1.2857142857142858rem',
    marginBottom: '1.7857142857142858rem'
  },
  wrapper: {
    marginBottom: '2.142857142857143rem'
  },
  error: {
    color: theme.palette.error.main
  }
});

class ConfirmAuthentication extends Component {
  confirmEnable = (keys, classes, errors) => (
    <div className={classes.wrapper}>
      <Typography className={classes.text}>Step 3) Confirm backup and enable Google Authenticator</Typography>
      <div className={classes.error} style={{ display: errors.apiError ? 'block' : 'none' }}>{errors.apiError}</div>
      <SettingsForm
        className={classes.form}
        rows={[
          { key: keys[0], label: 'Backup Key', errorText: errors.backupKey },
          {
            key: keys[1],
            label: 'Password',
            type: 'password',
            errorText: errors.loginPassword
          },
          {
            key: keys[2],
            label: '2FA Code',
            type: 'text',
            inputProps: {
              maxLength: 6
            },
            errorText: errors.mfaCode
          }
        ]}
        updateField={this.props.updateField} />
    </div>
  );

  confirmDisable = (keys, classes, errors) => (
    <div className={classes.wrapper}>
      <Typography className={classes.text}>To disable 2FA, please enter the following:</Typography>
      <div className={classes.error} style={{ display: errors.apiError ? 'block' : 'none' }}>{errors.apiError}</div>
      <SettingsForm
        className={classes.form}
        rows={[
          {
            key: keys[1],
            label: 'Password',
            type: 'password',
            errorText: errors.loginPassword
          },
          {
            key: keys[2],
            label: '2FA Code',
            type: 'text',
            inputProps: { maxLength: 6 },
            errorText: errors.mfaCode
          }
        ]}
        updateField={this.props.updateField} />
    </div>
  );

  render() {
    const {
      enabled,
      classes,
      keys,
      errors
    } = this.props;

    return enabled ? this.confirmDisable(keys, classes, errors) : this.confirmEnable(keys, classes, errors);
  }
}

ConfirmAuthentication.propTypes = {
  classes: PropTypes.object.isRequired,
  enabled: PropTypes.bool.isRequired,
  updateField: PropTypes.func.isRequired,
  keys: PropTypes.array.isRequired,
  errors: PropTypes.object.isRequired
};

export default withTheme()(withStyles(styles)(ConfirmAuthentication));



// WEBPACK FOOTER //
// ./src/components/settings/confirmAuthentication.js