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

const PerformanceSummary = ({
  classes,
  theme,
  roi,
  startingCapital,
  endingCapital,
  profitLoss,
  marketReturn,
  excessReturn,
  numTrades,
  lastBacktestDate,
  startDate,
  endDate,
  quoteCurrency,
  baseAsset,
  totalBought,
  totalSold,
}) => {
  const tooltipsText = {
    roi: '(Ending Capital - Starting Capital) / Starting Capital',
    startingCapital: 'Beginning balance of funds allocated to bot for trading (quote currency)',
    endingCapital: 'Portfolio value at the end of the backtest period, including PnL from any open positions',
    profitLoss: 'Net profit/loss (Ending Capital - Starting Capital)',
    marketReturn: 'Benchmark return based on buy and hold from start to end of backtest period',
    excessReturn: 'Return the bot generated in excess of benchmark (buy and hold). It is computed as (ROI - Market Return)',
    backtestCompleted: 'Date/Time when this backtest run was completed',
    backtestWindowStart: 'The beginning date/time of the backtest period',
    backtestWindowEnd: 'The ending date/time of the backtest period'
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
            Backtest Completed
            <TooltipIcon title={tooltipsText.backtestCompleted} />
          </Typography>
          <Typography className={classes.value}>{lastBacktestDate}</Typography>
        </div>
        <div className={classes.row}>
          <Typography className={classes.label}>
            Backtest Window Start
            <TooltipIcon title={tooltipsText.backtestWindowStart} />
          </Typography>
          <Typography className={classes.value}>{startDate}</Typography>
        </div>
        <div className={classes.row}>
          <Typography className={classes.label}>
            Backtest Window End
            <TooltipIcon title={tooltipsText.backtestWindowEnd} />
          </Typography>
          <Typography className={classes.value}>{endDate}</Typography>
        </div>
      </Grid>
    </Grid>
  );
};

PerformanceSummary.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  roi: PropTypes.number.isRequired,
  startingCapital: PropTypes.number.isRequired,
  endingCapital: PropTypes.number.isRequired,
  profitLoss: PropTypes.number.isRequired,
  marketReturn: PropTypes.number.isRequired,
  excessReturn: PropTypes.number.isRequired,
  numTrades: PropTypes.number.isRequired,
  lastBacktestDate: PropTypes.string.isRequired,
  startDate: PropTypes.string.isRequired,
  endDate: PropTypes.string.isRequired,
  quoteCurrency: PropTypes.string.isRequired,
  baseAsset: PropTypes.string.isRequired,
  totalBought: PropTypes.number.isRequired,
  totalSold: PropTypes.number.isRequired,
};

export default withStyles(styles, { withTheme: true })(PerformanceSummary);



// WEBPACK FOOTER //
// ./src/components/bots/output/performanceSummary.js