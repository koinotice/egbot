import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Hidden from '@material-ui/core/Hidden';
import { withStyles } from '@material-ui/core/styles';
import Formatted from './formatted';
import { isoTimeFromNow } from '../../utils/time';

const styles = theme => ({
  container: {
    border: `1px solid ${theme.palette.type === 'dark' ? '#273142' : '#cecece'}`,
    padding: '0.3571rem'
  },
  col: {
    padding: '0.5714rem',
    display: 'flex',
    alignItems: 'center'
  },
  usageCol: {
    display: 'flex',
    justifyContent: 'space-around'
  },
  buttonCol: {
    display: 'flex',
    justifyContent: 'center'
  },
  colWithDivider: {
    borderRight: `1px solid ${theme.palette.type === 'dark' ? '#273142' : '#cecece'}`
  },
  planName: {
    color: '#53B0B0',
    fontWeight: 'bold'
  },
  flexVertical: {
    display: 'flex',
    flexFlow: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  label: {
    fontSize: '0.7143',
    color: theme.palette.text.secondary
  },
  value: {
    fontWeight: 'bold'
  },
  trialText: {
    color: theme.palette.text.secondary,
    fontSize: '0.8571rem'
  },
  [theme.breakpoints.down('sm')]: {
    col: {
      justifyContent: 'center'
    },
    planCol: {
      textAlign: 'center'
    },
    colWithDivider: {
      borderRight: 'none'
    },
    usageCol: {
      flexDirection: 'column'
    }
  }
});

const getTrialText = (product) => {
  if (product.metadata.accessType === 'TRIAL') {
    return `(TRIAL expires ${isoTimeFromNow(product.expiration)})`;
  }
  return '';
};

const showTradeUsage = (trade, classes) => {
  if (trade.tradeLimit) {
    return (
      <Typography className={classes.value}><Formatted asset="USD" amount={parseFloat(trade.tradeUsage)} /> / <Formatted asset="USD" amount={parseFloat(trade.tradeLimit)} /></Typography>
    );
  }
  return (<Typography className={classes.value}>Unlimited</Typography>);
};

const showBacktestUsage = (backtest, classes) => {
  if (backtest && backtest.backtestLimit) {
    return (
      <Typography className={classes.value}>{backtest.backtestUsage} / {backtest.backtestLimit}</Typography>
    );
  }
  return (<Typography className={classes.value}>0 / 0</Typography>);
};

const showLiveUsage = (live, classes) => {
  if (live && live.liveLimit) {
    return (
      <Typography className={classes.value}>{live.liveUsage} / {live.liveLimit}</Typography>
    );
  }
  return (<Typography className={classes.value}>0 / 0</Typography>);
};

const shouldHideUpgradeButton = (plan, product) => (plan === 'PRO' && product.metadata.accessType !== 'TRIAL');

const PlanUsageBar = ({
  classes, plan, product, trade, backtest, live
}) => {
  return (
    <Grid className={classes.container} container>
      <Grid xs={12} sm={2} className={`${classes.col} ${classes.planCol} ${classes.colWithDivider}`} item>
        <Typography>Current Plan: &nbsp;<span className={classes.planName}>{plan}</span><br /><span className={classes.trialText}>{getTrialText(product)}</span></Typography>
      </Grid>
      <Grid xs={12} sm={shouldHideUpgradeButton(plan, product) ? 10 : 8} className={`${classes.col} ${shouldHideUpgradeButton(plan, product) ? '' : classes.colWithDivider} ${classes.usageCol}`} item>
        <Hidden smDown>
          <Typography>Usage:</Typography>
        </Hidden>
        <div className={classes.flexVertical}>
          <Typography className={classes.label}>Trading Volume This Month</Typography>
          {showTradeUsage(trade, classes)}
        </div>
        <div className={classes.flexVertical}>
          <Typography className={classes.label}>Bot Backtests Today</Typography>
          {showBacktestUsage(backtest, classes)}
        </div>
        <div className={classes.flexVertical}>
          <Typography className={classes.label}>Concurrent Live Bots</Typography>
          {showLiveUsage(live, classes)}
        </div>
      </Grid>
      <Grid xs={12} sm={2} className={`${classes.col} ${classes.buttonCol}`} style={{ display: shouldHideUpgradeButton(plan, product) ? 'none' : 'inherit' }} item>
        <Typography>
          <Button variant="outlined" color="primary" component="a" href="/pricing" target="__blank" name="upgrade">Upgrade</Button>
        </Typography>
      </Grid>
    </Grid>
  );
};

PlanUsageBar.propTypes = {
  classes: PropTypes.object.isRequired,
  plan: PropTypes.string.isRequired,
  product: PropTypes.object.isRequired,
  trade: PropTypes.object.isRequired,
  backtest: PropTypes.object.isRequired,
  live: PropTypes.object.isRequired
};

export default withStyles(styles, { withTheme: true })(PlanUsageBar);



// WEBPACK FOOTER //
// ./src/components/common/planUsageBar.js