import React, { Component, Fragment } from 'react';
import { withStyles, withTheme } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import { PulseLoader } from 'react-spinners';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import PropTypes from 'prop-types';
import SettingsForm from './settingsForm';
import ActivityLog from './activityLog';

const styles = theme => ({
  title: {
    marginBottom: '0.7142857142857143rem'
  },
  paper: {
    padding: '1.0714285714285714rem 2.142857142857143rem',
    marginBottom: '2.142857142857143rem'
  },
  paperTitle: {
    marginBottom: '1.7857142857142858rem'
  },
  grid: {
    height: '100%'
  },
  loader: {
    margin: theme.spacing.unit * 1
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '0.35714285714285715rem',
    marginBottom: '0.35714285714285715rem'
  },
  label: {
    display: 'inline-block',
    color: theme.palette.text.secondary
  },
  input: {
    width: '75%'
  },
  lastRow: {
    justifyContent: 'flex-end',
    marginTop: '1.4285714285714286rem'
  },
  [theme.breakpoints.down('xs')]: {
    row: {
      flexFlow: 'column-reverse'
    },
    button: {
      width: '100%'
    }
  },
  progressContainer: {
    height: '17.714285714285715rem'
  },
});

class UserProfile extends Component {
  constructor() {
    super();

    this.state = {
      name: '',
      isValid: false,
      errors: {}
    };
  }

  updateField = (event, field) => {
    const { value } = event.target;

    this.setState((state) => {
      state[field] = value;
      return state;
    }, this.validate);
  }

  validate = () => {
    const { name } = this.state;
    const { user: { name: currentName } } = this.props;

    if (!name || name === currentName) {
      this.setState({
        isValid: false
      });
      return;
    }

    this.setState({
      isValid: true
    });
  }

  submit = () => {
    const { name } = this.state;
    const { changeName, setName } = this.props;

    changeName(name).then((res) => {
      if (res.error) {
        this.setState({
          ...this.state,
          errors: {
            apiError: res.error
          }
        });
      }

      setName(name);
      this.setState({
        name: '',
        isValid: false,
        errors: {}
      });
    });
  }

  renderLoader() {
    const { classes } = this.props;
    return (
      <Grid container alignItems="center" justify="center" className={classes.progressContainer}>
        <PulseLoader size={6} color="#52B0B0" loading />
      </Grid>
    );
  }

  renderAccountForm() {
    const { classes, user: { name: currentName, email } } = this.props;
    const { name, isValid, errors } = this.state;

    return (
      <Fragment>
        <Typography variant="subtitle1" className={classes.paperTitle}>Account</Typography>
        <SettingsForm
          rows={[
            {
              key: 'name',
              label: 'Name',
              placeholder: currentName,
              value: name,
              InputLabelProps: {
                shrink: true
              },
              name: 'name',
            },
            {
              key: 'email',
              label: 'Email',
              defaultValue: email,
              disabled: true,
            }
          ]}
          updateField={this.updateField} />
        <div className={classes.row}>
          <div className={classes.error} style={{ visibility: errors.apiError ? 'visible' : 'hidden' }}>{errors.apiError}</div>
          <Button
            className={classes.button}
            color="primary"
            variant="outlined"
            disabled={!isValid}
            onClick={this.submit}
            name="saveChanges" >Save Changes
          </Button>
        </div>
      </Fragment>
    );
  }

  render() {
    const {
      classes, userLoaded, userActivity, userActivityLoaded
    } = this.props;
    const {
      logs
    } = userActivity;

    if (!userLoaded || !userActivityLoaded) {
      return (
        <Paper className={classes.paper}>
          {this.renderLoader()}
        </Paper>
      );
    }

    return (
      <Fragment>
        <Typography variant="h5" className={classes.title}>User Settings</Typography>
        <Paper className={classes.paper}>
          { this.renderAccountForm()}
        </Paper>
        <Paper className={classes.paper}>
          <Typography variant="subtitle1" className={classes.paperTitle}>Activity Log</Typography>
          <ActivityLog logs={logs} />
        </Paper>
      </Fragment>
    );
  }
}

UserProfile.propTypes = {
  classes: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  userActivity: PropTypes.object.isRequired,
  userLoaded: PropTypes.bool.isRequired,
  userActivityLoaded: PropTypes.bool.isRequired,
  changeName: PropTypes.func.isRequired,
  setName: PropTypes.func.isRequired
};

export default withTheme()(withStyles(styles)(UserProfile));



// WEBPACK FOOTER //
// ./src/components/settings/userProfile.js