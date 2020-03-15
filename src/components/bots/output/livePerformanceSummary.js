import React, { Fragment } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';
import Formatted from '../../common/formatted';
import TooltipIcon from '../../common/tooltipIcon';
import { formatChangePct } from '../../../utils/helpers';

const styles = theme => ({
  gridContainer: {
    margin: '1.0714rem 0'
  },
  label: {
    color: theme.palette.text.secondary,
    fontSize: '0.8571rem'
  },
  value: {
    fontWeight: 'bold'
  },
  flexCol: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexFlow: 'column'
  },
  roiValue: {
    fontWeight: 'bold',
    fontSize: '1.5714rem',
    margin: '1.0714rem 0'
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0 1.0714rem'
  }
});

const LivePerformanceSummary = ({
  classes,
  theme,
  roi,
  startingCapital,
  endingCapital,
  profitLoss,
  marketReturn,
  excessReturn,
  numTrades,
  openOrderNumber,
  startDate,
  endDate,
  quoteCurrency,
  running,
  baseAsset,
  totalBought,
  totalSold,
}) => {
  const tooltipsText = {
    roi: 'Total profit/loss since bot start, computed as (Ending Capital - Starting Capital) / Starting Capital',
    startingCapital: 'Beginning balance of funds allocated to bot for trading (quote currency)',
    endingCapital: 'Ending balance (including value of open positions) of quote currency',
    profitLoss: 'Net profit/loss (Ending Capital - Starting Capital)',
    marketReturn: 'Benchmark return based on buy and hold from start to end of live mode period',
    excessReturn: 'Return the bot generated in excess of benchmark (buy and hold). It is computed as (ROI - Market Return)',
    liveModeWindowStart: 'The beginning date/time of live mode period',
    liveModeWindowEnd: 'The ending date/time of the live mode period'
  };

  return (
    <Grid className={classes.gridContainer} container>
      {startingCapital > 0 &&
      (
        <Fragment>
          <Grid xs={12} md={2} className={classes.flexCol} item>
            <Typography className={classes.label}>
          Return
              <TooltipIcon title={tooltipsText.roi} />
            </Typography>
            <Typography
              className={classes.roiValue}
              style={{ color: roi >= 0 ? theme.palette.icons.green : theme.palette.icons.red }}
              variant="h6">
              {formatChangePct(null, roi)}
            </Typography>
          </Grid>
          <Grid xs={12} md={4} item>
            <div className={classes.row}>
              <Typography className={classes.label}>
            Starting Capital
                <TooltipIcon title={tooltipsText.startingCapital} />
              </Typography>
              <Typography className={classes.value}>
                <Formatted asset={quoteCurrency} amount={startingCapital} />&nbsp;
                {quoteCurrency}
              </Typography>
            </div>
            <div className={classes.row}>
              <Typography className={classes.label}>
            Ending Capital
                <TooltipIcon title={tooltipsText.endingCapital} />
              </Typography>
              <Typography className={classes.value}>
                <Formatted asset={quoteCurrency} amount={endingCapital} />&nbsp;
                {quoteCurrency}
              </Typography>
            </div>
            <div className={classes.row}>
              <Typography className={classes.label}>
            Profit/Loss
                <TooltipIcon title={tooltipsText.profitLoss} />
              </Typography>
              <Typography className={classes.value}>
                <Formatted asset={quoteCurrency} amount={profitLoss} />&nbsp;
                {quoteCurrency}
              </Typography>
            </div>
            <div className={classes.row}>
              <Typography className={classes.label}>
            Market Return
                <TooltipIcon title={tooltipsText.marketReturn} />
              </Typography>
              <Typography className={classes.value}>{formatChangePct(null, marketReturn)}</Typography>
            </div>
            <div className={classes.row}>
              <Typography className={classes.label}>
            Excess Return
                <TooltipIcon title={tooltipsText.excessReturn} />
              </Typography>
              <Typography className={classes.value}>{formatChangePct(null, excessReturn)}</Typography>
            </div>
          </Grid>
        </Fragment>
      )}
      <Grid xs={12} md={5} className={classes.item} item>
        <div className={classes.row}>
          <Typography className={classes.label}>Open Orders</Typography>
          <Typography className={classes.value}>{openOrderNumber}</Typography>
        </div>
        <div className={classes.row}>
          <Typography className={classes.label}>Trades</Typography>
          <Typography className={classes.value}>{numTrades}</Typography>
        </div>
        <div className={classes.row}>
          <Typography className={classes.label}>Total {baseAsset} Bought</Typography>
          <Typography className={classes.value}>{totalBought}</Typography>
        </div>
        <div className={classes.row}>
          <Typography className={classes.label}>Total {baseAsset} Sold</Typography>
          <Typography className={classes.value}>{totalSold}</Typography>
        </div>
        <div className={classes.row}>
          <Typography className={classes.label}>
            Live Mode Started
            <TooltipIcon title={tooltipsText.liveModeWindowStart} />
          </Typography>
          <Typography className={classes.value}>{startDate}</Typography>
        </div>
        { !running &&
          <div className={classes.row}>
            <Typography className={classes.label}>
              Live Mode Stopped
              <TooltipIcon title={tooltipsText.liveModeWindowEnd} />
            </Typography>
            <Typography className={classes.value}>{endDate}</Typography>
          </div>
        }
      </Grid>
    </Grid>
  );
};

LivePerformanceSummary.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  roi: PropTypes.number.isRequired,
  startingCapital: PropTypes.number.isRequired,
  endingCapital: PropTypes.number.isRequired,
  profitLoss: PropTypes.number.isRequired,
  marketReturn: PropTypes.number.isRequired,
  excessReturn: PropTypes.number.isRequired,
  numTrades: PropTypes.number.isRequired,
  openOrderNumber: PropTypes.number.isRequired,
  startDate: PropTypes.string.isRequired,
  endDate: PropTypes.string.isRequired,
  quoteCurrency: PropTypes.string.isRequired,
  running: PropTypes.bool.isRequired,
  baseAsset: PropTypes.string.isRequired,
  totalBought: PropTypes.number.isRequired,
  totalSold: PropTypes.number.isRequired,
};

export default withStyles(styles, { withTheme: true })(LivePerformanceSummary);



// WEBPACK FOOTER //
// ./src/components/bots/output/livePerformanceSummary.js