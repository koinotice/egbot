import React, { Fragment } from 'react';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core';
import PropTypes from 'prop-types';
import { formatChangePct } from '../../utils/helpers';
import { epochMsToDate, epochMsToDateTime } from '../../utils/time';

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

const ConfigItemBacktestOutput = ({
  classes,
  theme,
  returnOnInvestment,
  marketReturn,
  numTrades,
  exchange,
  market,
  periodStart,
  periodEnd,
  completed,
  capitalBase,
}) => (
  <Fragment>
    <div className={classes.flexRowSpaceBetween} style={{ marginBottom: '15px' }}>
      {capitalBase > 0 &&
      (
        <div className={`${classes.flexCol} ${classes.textCenter}`}>
          <Typography className={classes.label}>Backtest Return</Typography>
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
        <Typography className={classes.label}>Market Return</Typography>
        <Typography className={classes.value}>
          {formatChangePct(null, marketReturn)}
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
    <div className={classes.flexRowSpaceBetween}>
      <div className={classes.flexCol}>
        <Typography className={classes.label}>Time Range</Typography>
      </div>
      <div className={classes.flexCol}>
        <Typography className={classes.value}>{`${epochMsToDate(periodStart)} - ${epochMsToDate(periodEnd)}`}</Typography>
      </div>
    </div>
    <div className={classes.flexRowSpaceBetween}>
      <div className={classes.flexCol}>
        <Typography className={classes.label}>Completed</Typography>
      </div>
      <div className={classes.flexCol}>
        <Typography
          className={classes.value}
          style={{ color: theme.palette.text.secondary, fontWeight: 'initial' }}>
          {epochMsToDateTime(completed)}
        </Typography>
      </div>
    </div>
  </Fragment>
);

ConfigItemBacktestOutput.defaultProps = {
  returnOnInvestment: '',
  marketReturn: '',
  numTrades: 0,
  exchange: '',
  market: '',
  periodStart: '',
  periodEnd: '',
  completed: '',
  capitalBase: 0,
};

ConfigItemBacktestOutput.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  returnOnInvestment: PropTypes.string,
  marketReturn: PropTypes.string,
  numTrades: PropTypes.number,
  exchange: PropTypes.string,
  market: PropTypes.string,
  periodStart: PropTypes.string,
  periodEnd: PropTypes.string,
  completed: PropTypes.string,
  capitalBase: PropTypes.number,
};

export default withStyles(styles, { withTheme: true })(ConfigItemBacktestOutput);



// WEBPACK FOOTER //
// ./src/components/bots/configItemBacktestOutput.js