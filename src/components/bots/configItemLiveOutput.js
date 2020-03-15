import React, { Fragment } from 'react';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core';
import PropTypes from 'prop-types';
import { formatAmount, formatChangePct } from '../../utils/helpers';
import { epochMsToDateTime } from '../../utils/time';
import { STATUSES } from '../../utils/botConstants';

const styles = theme => ({
  flexRowSpaceAround: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: '15px'
  },
  flexRowSpaceBetween: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: '2px 0'
  },
  flexCol: {
    display: 'flex',
    flexFlow: 'column'
  },
  textCenter: {
    textAlign: 'center'
  },
  label: {
    fontSize: '11px',
    lineHeight: '18px',
    color: theme.palette.text.secondary
  },
  value: {
    fontSize: '12px',
    fontWeight: 600,
    lineHeight: '18px'
  }
});

const ConfigItemLiveOutput = ({
  classes,
  theme,
  returnOnInvestment,
  openOrders,
  numTrades,
  exchange,
  market,
  started,
  stopped,
  profitAndLoss,
  quoteCurrency,
  status,
  capitalBase,
}) => (
  <Fragment>
    <div className={classes.flexRowSpaceBetween} style={{ marginBottom: '15px' }}>
      {capitalBase > 0 &&
      (
        <div className={`${classes.flexCol} ${classes.textCenter}`}>
          <Typography className={classes.label}>Live Return</Typography>
          <Typography
            className={classes.value}
            style={{
              fontSize: '16px',
              color: returnOnInvestment >= 0 ? theme.palette.icons.green : theme.palette.icons.red
            }}>
            {formatChangePct(null, returnOnInvestment)}
          </Typography>
        </div>
      )}
      <div className={`${classes.flexCol} ${classes.textCenter}`}>
        <Typography className={classes.label}>Open Orders</Typography>
        <Typography className={classes.value}>
          {openOrders}
        </Typography>
      </div>
      <div className={`${classes.flexCol} ${classes.textCenter}`}>
        <Typography className={classes.label}>Trades</Typography>
        <Typography className={classes.value}>
          {numTrades}
        </Typography>
      </div>
    </div>
    <div className={classes.flexRowSpaceBetween}>
      <div className={classes.flexCol}>
        <Typography className={classes.label}>Exchange</Typography>
      </div>
      <div className={classes.flexCol}>
        <Typography className={classes.value}>{exchange.toUpperCase()}</Typography>
      </div>
    </div>
    <div className={classes.flexRowSpaceBetween}>
      <div className={classes.flexCol}>
        <Typography className={classes.label}>Market</Typography>
      </div>
      <div className={classes.flexCol}>
        <Typography className={classes.value}>{market}</Typography>
      </div>
    </div>
    {capitalBase > 0 &&
    (
      <div className={classes.flexRowSpaceBetween}>
        <div className={classes.flexCol}>
          <Typography className={classes.label}>PnL</Typography>
        </div>
        <div className={classes.flexCol}>
          <Typography
            className={classes.value}>{`${formatAmount(quoteCurrency, profitAndLoss)} ${quoteCurrency}`}
          </Typography>
        </div>
      </div>
    )}
    <div className={classes.flexRowSpaceBetween}>
      <div className={classes.flexCol}>
        <Typography className={classes.label}>
          {status === STATUSES.RUNNING.toUpperCase() ? 'Started' : 'Stopped'}
        </Typography>
      </div>
      <div className={classes.flexCol}>
        <Typography
          className={classes.value}
          style={{ color: theme.palette.text.secondary, fontWeight: 'initial' }}>
          {epochMsToDateTime(status === STATUSES.RUNNING.toUpperCase() ? started : stopped)}
        </Typography>
      </div>
    </div>
  </Fragment>
);

ConfigItemLiveOutput.defaultProps = {
  returnOnInvestment: '',
  openOrders: 0,
  numTrades: 0,
  profitAndLoss: 0,
  exchange: '',
  market: '',
  started: '',
  stopped: '',
  quoteCurrency: '',
  capitalBase: 0,
};

ConfigItemLiveOutput.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  returnOnInvestment: PropTypes.string,
  openOrders: PropTypes.number,
  numTrades: PropTypes.number,
  exchange: PropTypes.string,
  market: PropTypes.string,
  started: PropTypes.number,
  stopped: PropTypes.number,
  profitAndLoss: PropTypes.number,
  status: PropTypes.string.isRequired,
  quoteCurrency: PropTypes.string,
  capitalBase: PropTypes.number,
};

export default withStyles(styles, { withTheme: true })(ConfigItemLiveOutput);



// WEBPACK FOOTER //
// ./src/components/bots/configItemLiveOutput.js