import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import { GridLoader } from 'react-spinners';
import Summary from '../../components/common/summary';
import AccountHoldings from '../../components/portfolio/accountHoldings';
import EmptyStateCover from '../../components/common/emptyStateCover';
import { fetchHoldings } from '../../store/ducks/holdings/holdings';
import { getSessionToken } from '../../utils/token';
import { ACCOUNT_TYPES } from '../../utils/types';
import AddAccount from '../../components/common/addAccount';

const styles = theme => ({
  root: {
    flexGrow: 1,
    padding: '8px',
    marginTop: '60px',
  },
  topBar: {
    width: '100%',
    marginTop: '48px',
    marginBottom: '10px',
    paddingLeft: '65px',
    backgroundColor: theme.palette.background.paperDarker
  },
  tabs: {
    minHeight: '40px',
  },
  tab: {
    height: '40px',
    minWidth: '120px',
    color: theme.palette.tabButtons,
    padding: '0',
    textTransform: 'capitalize',
    fontSize: '12px',
    fontWeight: '600',
    lineHeight: '15px'
  },
  tabIndicator: {
    display: 'none'
  },
  ul: {
    padding: 0,
    textAlign: 'left',
    listStyleImage: 'url(/platform/static/images/bullet.svg)',
  }
});

class Portfolio extends Component {
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
      classes, accountsLoaded, accounts, balancesLoaded, balances
    } = this.props;

    if (!this.sessionToken) {
      return (<EmptyStateCover
        background="portfolio"
        icon="bitcoin"
        title="Professional Monitoring & Management"
        subheading={
          <ul className={classes.ul}>
            <li>Track your assets from exchanges or wallets</li>
            <li>View overall PnL, or by account</li>
            <li>Trade your exchange accounts from one place!</li>
          </ul>
        }
        cta="Create Your Free Account"
        ctaPath="/a/signup" />);
    }

    if (!accountsLoaded) {
      return this.renderWithRoot((
        <Grid container alignItems="center" justify="center">
          <GridLoader color="#52B0B0" size={6} loading />
        </Grid>
      ));
    }

    if (accountsLoaded && accounts.length === 0) {
      return (<EmptyStateCover
        background="portfolio"
        icon="bitcoin"
        title="Professional Monitoring & Management"
        subheading={
          <ul className={classes.ul}>
            <li>Track your assets from exchanges or wallets</li>
            <li>View overall PnL, or by account</li>
            <li>Trade your exchange accounts from one place!</li>
          </ul>
        }
        ctaButtonOverride={<AddAccount accounts={accounts} addButtonVariant="contained" />}
        cta="Add Account"
        ctaPath="/a/onboarding/select-exchange" />);
    }

    if (balancesLoaded && balances.length === 0 && accounts.every(acc => acc.type.toUpperCase() === ACCOUNT_TYPES.EXCHANGE)) {
      return (<EmptyStateCover
        background="portfolio"
        icon="bitcoin"
        title="No Assets"
        subheading="It appears that there are no assets in your linked account.
        Make a deposit at your connected exchange to see a consolidated view of your holdings"
        cta="Goto Trade"
        ctaPath="/platform/trade" />);
    }

    return this.renderWithRoot((
      <Grid container justify="center" spacing={16}>
        <Grid item xs={12} md={10}>
          <Summary />
        </Grid>
        <Grid item xs={12} md={10}>
          <AccountHoldings />
        </Grid>
      </Grid>));
  }
}

Portfolio.propTypes = {
  classes: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  accountsLoaded: PropTypes.bool.isRequired,
  accounts: PropTypes.array.isRequired,
  balancesLoaded: PropTypes.bool.isRequired,
  balances: PropTypes.array.isRequired
};

function mapStateToProps(state) {
  return {
    accounts: state.global.accounts.accounts,
    accountsLoaded: state.global.accounts.accountsLoaded,
    balances: state.global.balances.balances,
    balancesLoaded: state.global.balances.balancesLoaded,
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

const base = (withStyles(styles, { withTheme: true })(Portfolio));
export default connect(mapStateToProps, mapDispatchToProps)(base);



// WEBPACK FOOTER //
// ./src/containers/portfolio/portfolio.js