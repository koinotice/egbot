import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import { PulseLoader } from 'react-spinners';
import PropTypes from 'prop-types';
import { withStyles, withTheme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Hidden from '@material-ui/core/Hidden';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import AnimateOnChange from 'react-animate-on-change';
import { getChangeColor, formatChangePct } from '../../utils/helpers';
import ChangeArrow from '../icons/changeArrow';
import Formatted from './formatted';
import { updateAccount } from '../../store/ducks/trade/interactions';
import AddAccount from '../common/addAccount';


const animationClassGreen = 'animateChangeGreen';
const animationClassRed = 'animateChangeRed';

const styles = theme => ({
  outerGrid: {
    padding: '5px 20px',
  },
  label: {
    color: theme.palette.text.secondary,
    fontSize: '12px',
    lineHeight: '15px',
    textAlign: 'center',
    [theme.breakpoints.down(600)]: {
      display: 'inline-block',
      lineHeight: '21px',
    }
  },
  value: {
    fontSize: '20px',
    fontWeight: '600',
    lineHeight: '24px',
    textAlign: 'center',
    marginTop: '7px',
    color: theme.palette.text.primary,
    [theme.breakpoints.down(600)]: {
      display: 'inline-block',
      fontSize: '16px',
      lineHeight: '22px',
      float: 'right',
      marginTop: '0px',
    }
  },
  viewMenu: {
    fontWeight: '600',
    textAlign: 'center',
    padding: '0.2rem',
    color: theme.palette.text.primary,
    [theme.breakpoints.down(600)]: {
      padding: 0,
      display: 'inline-block',
      float: 'right',
      marginTop: '0px',
    }
  },
  small: {
    fontSize: '18px',
    lineHeight: '24px',
    color: theme.palette.text.secondary
  },
  link: {
    cursor: 'pointer',
    color: theme.palette.primary.main
  },
  [`${animationClassGreen}`]: {
    animation: 'colorGreen 2000ms linear both'
  },
  [`${animationClassRed}`]: {
    animation: 'colorRed 2000ms linear both'
  },
  '@keyframes colorGreen': {
    '0%': {
      color: theme.palette.icons.green,
    },
    '100%': {
      color: theme.palette.text.primary,
    },
  },
  '@keyframes colorRed': {
    '0%': {
      color: theme.palette.icons.red,
    },
    '100%': {
      color: theme.palette.text.primary,
    },
  },
  input: {
    paddingLeft: '1.071rem',
    fontSize: '1rem',
    // fix focus in firefox
    '&:focus': {
      color: `${theme.palette.text.primary} !important`,
      background: 'none'
    }
  },
  modal: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalPaper: {
    position: 'absolute',
    width: theme.spacing.unit * 75,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing.unit * 4,
    textAlign: 'center',
    '&:focus': {
      outline: 'none'
    }
  },
  modalIcon: {
    fontSize: '72px',
    color: '#FFF',
    marginBottom: '15px'
  },
});

class Summary extends Component {
  constructor(props) {
    super(props);
    this.oldPortfolioValue = 0;
  }
  getAccountMenuItems = (accounts) => {
    if (!accounts || accounts.error) {
      return null;
    }

    const userAccounts = accounts.sort().map((accountObj) => {
      return <MenuItem name={accountObj.label} key={accountObj.id} value={accountObj.id} >{accountObj.label}</MenuItem>;
    });

    userAccounts.unshift(<MenuItem key="aggregate" value="aggregate" >Portfolio Overview</MenuItem>);

    return userAccounts;
  };

  aggregateHoldings = (holdingsByAccount, holdingsByAsset, accountFilter) => {
    const summary = holdingsByAccount.filter((account) => {
      return accountFilter ? account.id === accountFilter : true;
    }).reduce((acc, account) => {
      acc.value += account.value;
      acc.change24h += account.change24h;
      acc.totalAssets += account.assets.length;
      return acc;
    }, {
      value: 0,
      change24h: 0,
      percentChange: 0,
      totalAssets: 0,
    });

    const change = summary.change24h / (summary.value - summary.change24h);

    summary.percentChange = isNaN(change) ? 0 : change;

    return summary;
  };

  switchView = (event) => {
    if (this.props.currentAccountId !== event.target.value) {
      const id = event.target.value !== 'aggregate' ? event.target.value : '';
      this.props.actions.updateAccount(id);
    }
  };

  render() {
    const {
      classes,
      holdingsLoaded,
      user,
      accounts,
      currentAccountId,
      holdingsByAccount,
      holdingsByAsset,
      theme,
      history,
    } = this.props;

    if (!holdingsLoaded) {
      return (
        <Grid style={{ minHeight: 59 }} container alignItems="center" justify="center">
          <PulseLoader color="#52B0B0" size={6} loading />
        </Grid>
      );
    }
    const { pref_currency: prefCurrency } = user.preferences;
    const data = this.aggregateHoldings(holdingsByAccount, holdingsByAsset, currentAccountId);
    let animate = false;
    let animationClass = animationClassGreen;
    if (data.value !== this.oldPortfolioValue) {
      animate = true;
      animationClass = (data.value > this.oldPortfolioValue) ? animationClassGreen : animationClassRed;
    }
    this.oldPortfolioValue = data.value;
    return (
      <Grid container spacing={8} className={classes.outerGrid}>
        <Grid item xs={12} sm>
          <Typography className={classes.label}>{ currentAccountId ? 'Account' : 'Portfolio'} Value ({prefCurrency})</Typography>
          <Typography className={classes.value} name="portfolioValue">
            <AnimateOnChange
              animationClassName={classes[animationClass]}
              animate={animate}>
              <Formatted amount={data.value} />
            </AnimateOnChange>
          </Typography>
        </Grid>
        <Grid item xs={12} sm>
          <Typography className={classes.label}>24h Change</Typography>
          <Typography className={classes.value} style={{ color: getChangeColor(data.change24h, theme) }} name="24HourChange">
            <Formatted amount={data.change24h} />
          </Typography>
        </Grid>
        <Grid item xs={12} sm>
          <Typography className={classes.label}>24h % Change</Typography>
          <Typography
            className={classes.value}
            style={{
              color: getChangeColor(data.percentChange, theme), display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
            {formatChangePct(prefCurrency, data.percentChange)}
            <ChangeArrow change={data.percentChange} />
          </Typography>
        </Grid>
        <Hidden smDown>
          <Grid item xs={12} sm>
            <Typography className={classes.label}>Total Assets</Typography>
            <Typography
              className={`${classes.value} ${classes.link}`}
              name="totalAssets"
              onClick={() => {
                history.push('/portfolio');
              }}>
              {data.totalAssets}
            </Typography>
          </Grid>
        </Hidden>
        <Grid item xs={12} sm>
          <Typography className={classes.label}>Switch View</Typography>
          <div className={classes.viewMenu} name="switchView">
            <Select
              value={currentAccountId || 'aggregate'}
              onChange={this.switchView}
              inputProps={{ name: 'account', className: classes.input }}
              disableUnderline>
              {this.getAccountMenuItems(accounts)}
            </Select>
          </div>
        </Grid>
        <Hidden smDown>
          <Grid item xs={12} sm style={{ textAlign: 'center' }}>
            <AddAccount accounts={accounts} buttonStyleOverride={{ marginTop: '0.4rem' }} />
          </Grid>
        </Hidden>
      </Grid>
    );
  }
}

Summary.propTypes = {
  classes: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  accounts: PropTypes.array.isRequired,
  currentAccountId: PropTypes.string.isRequired,
  holdingsByAccount: PropTypes.array.isRequired,
  holdingsByAsset: PropTypes.array.isRequired,
  holdingsLoaded: PropTypes.bool.isRequired,
};

function mapStateToProps(state) {
  return {
    user: state.global.user.user,
    holdingsByAccount: state.holdings.holdings.byAccount,
    holdingsByAsset: state.holdings.holdings.byAsset,
    holdingsLoaded: state.holdings.holdings.holdingsLoaded,
    accounts: state.global.accounts.accounts,
    currentAccountId: state.trade.interactions.currentAccountId,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      ...bindActionCreators({
        updateAccount,

      }, dispatch)
    }
  };
}

const base = withRouter(withTheme()(withStyles(styles)(Summary)));
export default connect(mapStateToProps, mapDispatchToProps)(base);



// WEBPACK FOOTER //
// ./src/components/common/summary.js