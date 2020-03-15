import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import { GridLoader } from 'react-spinners';
import Summary from '../../components/common/summary';
import DashboardOverview from '../../components/dashboard/dashboardOverview';
import EmptyStateCover from '../../components/common/emptyStateCover';
import { fetchHoldings } from '../../store/ducks/holdings/holdings';
import { getSessionToken } from '../../utils/token';
import withPaywall from '../../components/hocs/paywall';
import AddAccount from '../../components/common/addAccount';

const styles = () => ({
  root: {
    flexGrow: 1,
    padding: '8px',
    marginTop: '60px',
  },
  ul: {
    padding: 0,
    textAlign: 'left',
    listStyleImage: 'url(/platform/static/images/bullet.svg)',
  }
});

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.sessionToken = getSessionToken();
  }
  componentDidMount() {
    const { actions, accounts } = this.props;
    if (this.sessionToken && accounts.length) {
      actions.fetchHoldings();
    }
  }
  renderWithRoot(component) {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        {component}
      </div>
    );
  }

  render() {
    const {
      classes, accountsLoaded, accounts, holdingsLoaded, isFeatureEnabled
    } = this.props;

    if (!this.sessionToken) {
      return (<EmptyStateCover
        background="dashboard"
        icon="dashboard"
        title="Digital Asset Portfolio Analytics"
        subheading={
          <ul className={classes.ul}>
            <li>Get real-time and historical performance breakdown</li>
            <li>View your asset allocations and PnL reports</li>
            <li>Deep insights to help you make better decisions</li>
          </ul>
        }
        cta="Create Your Free Account"
        ctaPath="/a/signup" />);
    }

    if (!accountsLoaded || (accountsLoaded && accounts.length && !holdingsLoaded)) {
      return this.renderWithRoot((
        <Grid container alignItems="center" justify="center">
          <GridLoader color="#52B0B0" size={6} loading />
        </Grid>
      ));
    }

    if (accountsLoaded && accounts.length === 0) {
      return (<EmptyStateCover
        background="dashboard"
        icon="dashboard"
        title="Digital Asset Portfolio Analytics"
        subheading={
          <ul className={classes.ul}>
            <li>Get real-time and historical performance breakdown</li>
            <li>View your asset allocations and PnL reports</li>
            <li>Deep insights to help you make better decisions</li>
          </ul>
        }
        ctaButtonOverride={<AddAccount accounts={accounts} addButtonVariant="contained" />}
        cta="Add Account"
        ctaPath="/a/onboarding/select-exchange" />);
    }

    if (!isFeatureEnabled.DASHBOARD) {
      return (<EmptyStateCover
        background="dashboard"
        icon="dashboard"
        title="Digital Asset Portfolio Analytics"
        subheading={
          <ul className={classes.ul}>
            <li>Get real-time and historical performance breakdown</li>
            <li>View your asset allocations and PnL reports</li>
            <li>Deep insights to help you make better decisions</li>
          </ul>
        }
        cta="Upgrade to Pro"
        ctaPath="/pricing" />);
    }

    return this.renderWithRoot((
      <Grid container justify="center" spacing={16}>
        <Grid item xs={12} lg={10}>
          <Summary />
        </Grid>
        <DashboardOverview />
      </Grid>));
  }
}

Dashboard.propTypes = {
  classes: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  accountsLoaded: PropTypes.bool.isRequired,
  accounts: PropTypes.array.isRequired,
  holdingsLoaded: PropTypes.bool.isRequired,
  isFeatureEnabled: PropTypes.object.isRequired
};

function mapStateToProps(state) {
  return {
    accounts: state.global.accounts.accounts,
    accountsLoaded: state.global.accounts.accountsLoaded,
    holdingsLoaded: state.holdings.holdings.holdingsLoaded,
  };
}

function mapDispatchToProps(dispatcher) {
  return {
    actions: {
      ...bindActionCreators({
        fetchHoldings,
      }, dispatcher)
    }
  };
}

const base = withStyles(styles)(withPaywall('DASHBOARD')(Dashboard));
export default connect(mapStateToProps, mapDispatchToProps)(base);



// WEBPACK FOOTER //
// ./src/containers/dashboard/dashboard.js