import React, { Component, Fragment } from 'react';
import { withStyles, withTheme } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';
import SettingsForm from './settingsForm';

const styles = theme => ({
  title: {
    marginBottom: '0.7142857142857143rem'
  },
  paperTitle: {
    marginBottom: '1.0714285714285714rem'
  },
  paper: {
    padding: '1.0714285714285714rem 2.142857142857143rem'
  },
  bottomRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '3.2142857142857144rem',
  },
  error: {
    color: theme.palette.error.main
  },
  [theme.breakpoints.down('xs')]: {
    bottomRow: {
      flexFlow: 'column-reverse'
    },
    submit: {
      width: '100%',
      marginBottom: '1.0714285714285714rem'
    }
  }
});

class ChangePassword extends Component {
  constructor() {
    super();

    this.state = {
      passwordObj: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      errors: {},
      notifications: []
    };
  }

  updateField = (event, field) => {
    const { value } = event.target;

    this.setState((state) => {
      state.passwordObj[field] = value;

      return state;
    });
  }

  validate = () => {
    const errors = {};

    const { passwordObj: { currentPassword, newPassword, confirmPassword } } = this.state;
    const rePassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{8,}/;
    const isValidPassword = rePassword.test(newPassword);

    if (!currentPassword) errors.currentPassword = 'Required';
    if (!newPassword) errors.newPassword = 'Required';
    if (!confirmPassword) errors.confirmPassword = 'Required';
    if (!isValidPassword && newPassword.length > 0) {
      errors.newPassword = 'New password must be at least 8 characters long, with at least ' +
      'one uppercase letter, atleast one number, and at least one special character';
    }

    if (confirmPassword !== newPassword && confirmPassword.length > 0) errors.confirmPassword = 'Passwords don\'t match';

    this.setState({
      ...this.state,
      errors
    });

    return !(Object.keys(errors).length > 0);
  };

  submit = () => {
    const { passwordObj, errors } = this.state;
    const { changePassword, showNotification } = this.props;

    const isValid = this.validate();
    if (!isValid) return;

    changePassword(passwordObj.currentPassword, passwordObj.newPassword).then((res) => {
      if (res.error) {
        this.setState({
          ...this.state,
          errors: {
            apiError: res.error
          }
        });
        return;
      }

      if (showNotification) {
        showNotification({ data: 'Password Changed!' });
      }

      this.setState((state) => {
        passwordObj.currentPassword = '';
        passwordObj.newPassword = '';
        passwordObj.confirmPassword = '';

        errors.apiError = '';
        return state;
      });
    });
  }

  render() {
    const { classes } = this.props;
    const { passwordObj, errors } = this.state;
    const keys = Object.keys(passwordObj);
    const disabled = !(passwordObj.currentPassword && passwordObj.newPassword && passwordObj.confirmPassword);
    return (
      <Fragment>
        <Typography variant="h5" className={classes.title}>Password</Typography>
        <Paper className={classes.paper}>
          <Typography variant="subtitle1" className={classes.paperTitle}>Change Password</Typography>
          <SettingsForm
            validate={this.validate}
            rows={[
              {
                key: keys[0],
                label: 'Current Password',
                type: 'password',
                value: passwordObj.currentPassword,
                errorText: errors.currentPassword,
                name: 'currentPassword',
              },
              {
                key: keys[1],
                label: 'New Password',
                type: 'password',
                value: passwordObj.newPassword,
                errorText: errors.newPassword,
                name: 'newPassword',
              },
              {
                key: keys[2],
                label: 'Confirm Password',
                type: 'password',
                value: passwordObj.confirmPassword,
                errorText: errors.confirmPassword,
                name: 'confirmPassword',
              }
            ]}
            updateField={this.updateField} />
          <div className={classes.bottomRow}>
            <div className={classes.error} style={{ visibility: errors.apiError ? 'visible' : 'hidden' }}>{errors.apiError}</div>
            <Button color="primary" variant="outlined" disabled={ disabled } onClick={this.submit} className={classes.submit}>Save Changes</Button>
          </div>
        </Paper>
      </Fragment>
    );
  }
}

ChangePassword.defaultProps = {
  showNotification: null,
};

ChangePassword.propTypes = {
  classes: PropTypes.object.isRequired,
  changePassword: PropTypes.func.isRequired,
  showNotification: PropTypes.func,
};

export default withTheme()(withStyles(styles)(ChangePassword));



// WEBPACK FOOTER //
// ./src/components/settings/changePassword.js