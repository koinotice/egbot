import React, { Component } from 'react';
import connect from 'react-redux/es/connect/connect';
import { bindActionCreators } from 'redux';
import { withStyles, withTheme } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Hidden from '@material-ui/core/Hidden';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import SettingsMenu from '../../components/settings/settingsMenu';
import SideContent from '../../components/settings/sideContent';
import UserProfile from '../../components/settings/userProfile';
import ChangePassword from '../../components/settings/changePassword';
import LinkedAccounts from '../../components/settings/linkedAccounts';
import Security from './security';
import DeveloperApis from './developerApis';
import Referrals from '../../components/settings/referrals';
import Preferences from '../../components/settings/preferences';
import { changeName, changePassword } from '../../api/users/users';
import { updateWalletAddress } from '../../api/payments/referrals';
import { fetchAccounts, deleteAccount, updateAccountLabel } from '../../store/ducks/global/accounts';
import { updateAccount } from '../../store/ducks/trade/interactions';
import { fetchUserActivity, setName, setPayoutAddress, setWeeklySummaryEmail, setWeeklySummaryEmailPortfolio, setWeeklySummaryEmailBots, setTheme, setPrefCurrency } from '../../store/ducks/global/user';
import { makeReferrer, fetchReferrerInfo } from '../../store/ducks/referrals/referrals';
import { showNotification } from '../../store/ducks/global/notifications';


const styles = ({
  root: {
    flexGrow: 1,
    padding: '8px',
    marginTop: '60px',
  },
  gridItemRight: {
    margin: '4.5rem 0 !important'
  }
});

class Settings extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentRoute: this.props.location.pathname.split('/')[2]
    };
  }

  componentDidMount() {
    const { actions } = this.props;
    actions.fetchUserActivity();
  }

  componentWillReceiveProps(nextProps) {
    const { currentRoute } = this.state;
    const nextRoute = nextProps.location.pathname.split('/')[2];

    if (currentRoute !== nextRoute) {
      this.setState({
        currentRoute: nextRoute
      });
    }
  }

  renderView = () => {
    const { currentRoute } = this.state;
    const {
      actions,
      user,
      userLoaded,
      userActivity,
      userActivityLoaded,
      accounts,
      accountsLoaded,
      referrals,
      walletAddress,
      weeklySummaryEmail,
      weeklySummaryEmailPortfolio,
      weeklySummaryEmailBots,
      theme,
      prefCurrency
    } = this.props;

    switch (currentRoute) {
      case 'user':
        return (<UserProfile
          user={user}
          userLoaded={userLoaded}
          userActivity={userActivity}
          userActivityLoaded={userActivityLoaded}
          changeName={changeName}
          setName={actions.setName} />);
      case 'password':
        return <ChangePassword showNotification={actions.showNotification} changePassword={changePassword} />;
      case 'accounts':
        return (<LinkedAccounts
          accounts={accounts}
          accountsLoaded={accountsLoaded}
          fetchAccounts={actions.fetchAccounts}
          updateAccount={actions.updateAccount}
          updateAccountLabel={actions.updateAccountLabel}
          deleteAccount={actions.deleteAccount} />);
      case 'security':
        return <Security />;
      case 'api':
        return <DeveloperApis />;
      case 'referrals':
        return (<Referrals
          referrals={referrals}
          walletAddress={walletAddress}
          makeReferrer={actions.makeReferrer}
          fetchReferrerInfo={actions.fetchReferrerInfo}
          updateWalletAddress={updateWalletAddress}
          setPayoutAddress={actions.setPayoutAddress} />);
      case 'preferences':
        return (<Preferences
          weeklySummaryEmail={weeklySummaryEmail}
          setWeeklySummaryEmail={actions.setWeeklySummaryEmail}
          weeklySummaryEmailPortfolio={weeklySummaryEmailPortfolio}
          setWeeklySummaryEmailPortfolio={actions.setWeeklySummaryEmailPortfolio}
          weeklySummaryEmailBots={weeklySummaryEmailBots}
          setWeeklySummaryEmailBots={actions.setWeeklySummaryEmailBots}
          theme={theme}
          setTheme={actions.setTheme}
          prefCurrency={prefCurrency}
          setPrefCurrency={actions.setPrefCurrency} />);
      default:
        return null;
    }
  }

  render() {
    const { classes } = this.props;
    const { currentRoute } = this.state;

    return (
      <div className={classes.root}>
        <Grid container justify="center" spacing={24}>
          <Grid item xs={12} sm={3} md={2} className={classes.gridItem}>
            <SettingsMenu active={currentRoute} />
          </Grid>
          <Grid item xs={12} sm={9} md={7} className={classes.gridItem}>
            {this.renderView()}
          </Grid>
          <Hidden smDown>
            <Grid item md={3} className={classes.gridItemRight}>
              <SideContent />
            </Grid>
          </Hidden>
        </Grid>
      </div>
    );
  }
}

Settings.defaultProps = {
  actions: {},
  walletAddress: '',
  weeklySummaryEmail: null,
  weeklySummaryEmailPortfolio: null,
  weeklySummaryEmailBots: null,
  theme: '',
  prefCurrency: ''
};

Settings.propTypes = {
  classes: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  actions: PropTypes.objectOf(PropTypes.func),
  user: PropTypes.object.isRequired,
  userActivity: PropTypes.object.isRequired,
  userActivityLoaded: PropTypes.bool.isRequired,
  userLoaded: PropTypes.bool.isRequired,
  accounts: PropTypes.array.isRequired,
  accountsLoaded: PropTypes.bool.isRequired,
  referrals: PropTypes.object.isRequired,
  walletAddress: PropTypes.string,
  weeklySummaryEmail: PropTypes.bool,
  weeklySummaryEmailPortfolio: PropTypes.bool,
  weeklySummaryEmailBots: PropTypes.bool,
  theme: PropTypes.string,
  prefCurrency: PropTypes.string
};

function mapStateToProps(state) {
  return {
    user: state.global.user.user,
    userLoaded: state.global.user.userLoaded,
    userActivity: state.global.user.userActivity,
    userActivityLoaded: state.global.user.userActivityLoaded,
    accounts: state.global.accounts.accounts,
    accountsLoaded: state.global.accounts.accountsLoaded,
    referrals: state.referrals.referrals,
    walletAddress: state.global.user.user.preferences.other.referrerPayoutAddress,
    weeklySummaryEmail: state.global.user.user.preferences.other.weeklySummaryEmail,
    weeklySummaryEmailPortfolio: state.global.user.user.preferences.other.weeklySummaryEmailPortfolio,
    weeklySummaryEmailBots: state.global.user.user.preferences.other.weeklySummaryEmailBots,
    theme: state.global.user.user.preferences.theme,
    prefCurrency: state.global.user.user.preferences.pref_currency
  };
}

function mapDispatchToProps(dispatcher) {
  return {
    actions: {
      ...bindActionCreators({
        fetchAccounts,
        deleteAccount,
        updateAccountLabel,
        fetchUserActivity,
        updateAccount,
        setName,
        setPayoutAddress,
        showNotification,
        makeReferrer,
        fetchReferrerInfo,
        setWeeklySummaryEmail,
        setWeeklySummaryEmailPortfolio,
        setWeeklySummaryEmailBots,
        setTheme,
        setPrefCurrency
      }, dispatcher)
    }
  };
}

const base = withRouter(withTheme()(withStyles(styles)(Settings)));
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(base));



// WEBPACK FOOTER //
// ./src/containers/settings/settings.js