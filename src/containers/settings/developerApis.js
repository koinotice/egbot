import React, { Component, Fragment } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import PropTypes from 'prop-types';
import { PulseLoader } from 'react-spinners';
import withPaywall from '../../components/hocs/paywall';
import { fetchUserApiCredentials, createUserApiCredentials, deleteUserApiCredentials } from '../../store/ducks/global/user';
import ApiCredentials from '../../components/settings/apiCredentials';
import { IS_PRIVATE_INSTANCE } from '../../config/globalConfig';

const styles = {
  title: {
    marginBottom: '0.7142857142857143rem'
  },
  paper: {
    padding: '1.0714285714285714rem 2.142857142857143rem',
    minHeight: '28.5714rem',
    display: 'flex',
    flexFlow: 'column',
    justifyContent: 'center',
  },
  centeredPaper: {
    padding: '1.0714285714285714rem 2.142857142857143rem',
    minHeight: '28.5714rem',
    display: 'flex',
    flexFlow: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center'
  },
  subHeading: {
    fontSize: '1.2857rem',
    marginBottom: '1.7857rem'
  },
  link: {
    fontSize: '1.2857rem',
    color: '#52B0B0',
    textDecoration: 'none'
  }
};

class DeveloperApis extends Component {
  componentDidMount() {
    const { actions } = this.props;
    actions.fetchUserApiCredentials();
  }

  renderWithRoot(component, centered = false) {
    const { classes } = this.props;

    return (
      <Fragment>
        <Typography variant="h5" className={classes.title}>Developer APIs</Typography>
        <Paper className={centered ? classes.centeredPaper : classes.paper}>
          {component}
        </Paper>
      </Fragment>
    );
  }

  renderLoader() {
    return this.renderWithRoot(
      (
        <PulseLoader color="#52B0B0" loading />
      ), true
    );
  }

  renderUpgradePrompt() {
    const { classes } = this.props;

    return this.renderWithRoot(
      (
        <Fragment>
          <Typography className={classes.subHeading}>Your current plan does not have access to <br />
            <a href="/api" className={classes.link} target="__blank">Quadency&apos;s Unified APIs</a>.
          </Typography>
          <Button onClick={() => { location.href = '/pricing'; }} variant="contained" color="primary">Upgrade</Button>
        </Fragment>
      ),
      true
    );
  }

  renderCreateKeysPrompt() {
    const { classes, actions } = this.props;

    return this.renderWithRoot(
      (
        <Fragment>
          <Typography className={classes.subHeading}>
            Click below to generate API keys required to access <a href={IS_PRIVATE_INSTANCE ? 'https://quadency.com/developer/#quadency-unified-api' : '/api'} className={classes.link} target="__blank">Quadency’s Unified APIs</a>.
          </Typography>
          <Button
            name="generateApiKey"
            onClick={actions.createUserApiCredentials}
            variant="contained"
            color="primary">
            Generate API Key
          </Button>
        </Fragment>
      ),
      true
    );
  }

  render() {
    const {
      paywallLoaded, userApiCredentialsLoading, isFeatureEnabled, userApiCredentials, actions
    } = this.props;

    if (!paywallLoaded || userApiCredentialsLoading) {
      return this.renderLoader();
    }

    if (!isFeatureEnabled.DEVELOPER_APIS) {
      return this.renderUpgradePrompt();
    }

    if (!Object.keys(userApiCredentials).length) {
      return this.renderCreateKeysPrompt();
    }

    return this.renderWithRoot((
      <ApiCredentials
        userApiCredentials={userApiCredentials}
        onClickDeleteKeys={actions.deleteUserApiCredentials} />
    ));
  }
}

DeveloperApis.defaultProps = {
  userApiCredentials: {}
};

DeveloperApis.propTypes = {
  classes: PropTypes.object.isRequired,
  isFeatureEnabled: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  paywallLoaded: PropTypes.bool.isRequired,
  userApiCredentials: PropTypes.object,
  userApiCredentialsLoading: PropTypes.bool.isRequired,
};

function mapStateToProps(state) {
  return {
    userApiCredentials: state.global.user.userApiCredentials,
    userApiCredentialsLoading: state.global.user.userApiCredentialsLoading,
    paywallLoaded: state.global.paywall.paywallLoaded
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      ...bindActionCreators({
        fetchUserApiCredentials,
        createUserApiCredentials,
        deleteUserApiCredentials
      }, dispatch)
    }
  };
}

const base = withStyles(styles)(withPaywall('DEVELOPER_APIS')(DeveloperApis));
export default connect(mapStateToProps, mapDispatchToProps)(base);



// WEBPACK FOOTER //
// ./src/containers/settings/developerApis.js