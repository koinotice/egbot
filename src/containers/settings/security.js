import React, { Component, Fragment } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withStyles, withTheme } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { PulseLoader } from 'react-spinners';
import PropTypes from 'prop-types';
import TwoFAPrompt from '../../components/settings/twoFAPrompt';
import DownloadAppView from '../../components/settings/downloadAppView';
import QRView from '../../components/settings/qrView';
import ConfirmAuthentication from '../../components/settings/confirmAuthentication';
import Success from '../../components/settings/success';
import { setupMFA, enableMFA, disableMFA } from '../../api/users/mfa';
import { setMFAStatus } from '../../store/ducks/global/user';

const styles = theme => ({
  title: {
    marginBottom: '0.7142857142857143rem'
  },
  paper: {
    padding: '1.0714285714285714rem 2.142857142857143rem',
    minHeight: '18.214285714285715rem'
  },
  paperTitle: {
    fontWeight: '600',
    marginBottom: '1.7857142857142858rem'
  },
  buttonsRow: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  buttonsRowSingle: {
    display: 'flex',
    justifyContent: 'flex-end'
  },
  [theme.breakpoints.down('xs')]: {
    buttonsRow: {
      flexFlow: 'column-reverse'
    },
    backButton: {
      width: '100%',
    },
    nextButton: {
      width: '100%',
      marginBottom: '1.0714285714285714rem'
    }
  },
  progressContainer: {
    height: '100%',
  },
});

class Security extends Component {
  constructor() {
    super();

    this.state = {
      view: 'prompt',
      secret: null,
      qrCode: null,
      confirmationObj: {
        backupKey: '',
        loginPassword: '',
        mfaCode: ''
      },
      errors: {}
    };

    this.ENABLE_FLOW = {
      0: 'prompt',
      1: 'download',
      2: 'qr',
      3: 'confirm',
      4: 'success'
    };
    this.DISABLE_FLOW = {
      0: 'prompt',
      1: 'confirm',
      2: 'success'
    };

    this.DIRECTION_ENUM = {
      BACK: 'back',
      NEXT: 'next'
    };

    Object.freeze(this.ENABLE_FLOW);
    Object.freeze(this.DISABLE_FLOW);
    Object.freeze(this.DIRECTION_ENUM);

    this.nextButtonTextMap = new Map([
      ['prompt', { enable: 'Enable', disable: 'Disable' }],
      ['download', 'I Have the App'],
      ['qr', 'Next'],
      ['confirm', { enable: 'Enable 2FA', disable: 'Disable 2FA' }],
      ['success', 'Done']
    ]);
  }

  setView = (direction) => {
    const currentView = this.state.view;
    const { mfaEnabled } = this.props;

    const flowEnum = mfaEnabled ? this.DISABLE_FLOW : this.ENABLE_FLOW;
    const keys = Object.keys(flowEnum);
    const key = keys.find(num => flowEnum[num] === currentView);

    if (direction === this.DIRECTION_ENUM.BACK) {
      this.setState({
        view: flowEnum[key - 1]
      });
    } else if (direction === this.DIRECTION_ENUM.NEXT) {
      const nextKey = (parseInt(key, 10) + 1) % keys.length;
      this.setState({
        view: flowEnum[nextKey]
      });
    }
  }

  setBackButtonVisibility = () => {
    const { view } = this.state;

    return (view === 'download' || view === 'qr' || view === 'confirm') ? 'visible' : 'hidden';
  };

  setNextButtonText = () => {
    const { view } = this.state;
    const { mfaEnabled } = this.props;

    if (view === 'prompt' || view === 'confirm') {
      return mfaEnabled ? this.nextButtonTextMap.get(view).disable : this.nextButtonTextMap.get(view).enable;
    }

    return this.nextButtonTextMap.get(view);
  };

  updateField = (event, field) => {
    const { value } = event.target;

    this.setState((state) => {
      state.confirmationObj[field] = value;

      return state;
    });
  }

  validate = () => {
    const { confirmationObj: obj } = this.state;
    const { mfaEnabled } = this.props;
    const errors = {};
    const reMfaCode = /^[0-9]{6}$/;

    if (!mfaEnabled && !obj.backupKey) errors.backupKey = 'Required';
    if (!mfaEnabled && obj.backupKey && obj.backupKey.length < 26) errors.backupKey = 'Backup Key must be 26 characters long';
    if (!obj.loginPassword) errors.loginPassword = 'Required';
    if (!obj.mfaCode) errors.mfaCode = 'Required';
    if (obj.mfaCode && !reMfaCode.test(obj.mfaCode)) errors.mfaCode = 'Please enter a valid 2FA Code from Google Authenticator';

    this.setState({
      ...this.state,
      errors
    });

    return !(Object.keys(errors).length > 0);
  }

  submit = () => {
    const { confirmationObj: obj } = this.state;
    const { mfaEnabled } = this.props;

    const isValid = this.validate();
    if (!isValid) return;

    if (mfaEnabled) {
      disableMFA(obj.loginPassword, obj.mfaCode).then((res) => {
        if (res.error) {
          this.setState({
            ...this.state,
            errors: {
              apiError: res.error
            }
          });
        } else {
          this.props.actions.setMFAStatus(false);
          this.setView('next');
        }
      });
    } else {
      enableMFA(obj.backupKey, obj.loginPassword, obj.mfaCode).then((res) => {
        if (res.error) {
          this.setState({
            ...this.state,
            errors: {
              apiError: res.error
            }
          });
        } else {
          this.props.actions.setMFAStatus(true);
          this.setView('next');
        }
      });
    }
  }

  generateSecret = async () => {
    const res = await setupMFA();

    this.setState({
      secret: res.secretBase32,
      qrCode: res.qrCode
    });
  }

  renderViews() {
    const { classes, mfaEnabled } = this.props;
    const {
      view,
      confirmationObj,
      errors,
      ...restProps
    } = this.state;

    const confirmDisabled =
      mfaEnabled ?
        !(confirmationObj.loginPassword && confirmationObj.mfaCode) :
        !((confirmationObj.backupKey) && confirmationObj.loginPassword && confirmationObj.mfaCode);

    return (
      <Fragment>
        { view === 'prompt' && <TwoFAPrompt enabled={mfaEnabled} setView={this.setView} /> }
        { view === 'download' && <DownloadAppView setView={this.setView} /> }
        { view === 'qr' && <QRView setView={this.setView} generateSecret={this.generateSecret} {...restProps} /> }
        {view === 'confirm' &&
          <ConfirmAuthentication
            enabled={mfaEnabled}
            keys={Object.keys(confirmationObj)}
            errors={errors}
            updateField={this.updateField} />}
        { view === 'success' && <Success setView={this.setView} enabled={mfaEnabled} /> }
        <div className={(view === 'prompt' || view === 'success') ? classes.buttonsRowSingle : classes.buttonsRow}>
          <Button
            onClick={() => this.setView('back')}
            style={{ visibility: this.setBackButtonVisibility() }}
            color="secondary"
            className={classes.backButton}>
            Back
          </Button>
          <Button
            onClick={view === 'confirm' ? this.submit : () => { this.setView('next'); }}
            color="primary"
            variant="outlined"
            disabled={view === 'confirm' && confirmDisabled}
            className={classes.nextButton}>
            {this.setNextButtonText()}
          </Button>
        </div>
      </Fragment>
    );
  }

  renderLoader() {
    const { classes } = this.props;

    return (
      <Grid container alignItems="center" justify="center" className={classes.progressContainer}>
        <PulseLoader size={6} color="#52B0B0" loading />
      </Grid>
    );
  }

  render() {
    const { classes, isLoaded } = this.props;

    return (
      <Fragment>
        <Typography variant="h5" className={classes.title}>Account Security</Typography>
        <Paper className={classes.paper}>
          <Typography variant="subtitle1" className={classes.paperTitle}>2 Factor Authentication</Typography>
          { isLoaded ? this.renderViews() : this.renderLoader() }
        </Paper>
      </Fragment>
    );
  }
}

Security.defaultProps = {
  mfaEnabled: null
};

Security.propTypes = {
  classes: PropTypes.object.isRequired,
  isLoaded: PropTypes.bool.isRequired,
  mfaEnabled: PropTypes.bool,
  actions: PropTypes.object.isRequired
};

function mapStateToProps(state) {
  return {
    isLoaded: state.global.user.userLoaded,
    mfaEnabled: state.global.user.user.preferences.mfa_enabled
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: { ...bindActionCreators({ setMFAStatus }, dispatch) }
  };
}

const base = withTheme()(withStyles(styles)(Security));
export default connect(mapStateToProps, mapDispatchToProps)(base);



// WEBPACK FOOTER //
// ./src/containers/settings/security.js