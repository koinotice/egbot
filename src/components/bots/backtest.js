import React, { Component, Fragment } from 'react';
import { withStyles } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';
import LinearProgress from '@material-ui/core/LinearProgress';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import Icon from '@material-ui/core/Icon';
import { PulseLoader } from 'react-spinners';
import { MODES, STATUSES } from '../../utils/botConstants';
import PerformanceSummary from './output/performanceSummary';
import PortfolioValue from './output/portfolioValue';
import MarketChart from './output/marketChart';
import Trades from './output/trades';
import Logs from './output/logs';
import ConfigItemStateCover from './configItemStateCover';
import { epochMsToDateTime } from '../../utils/time';

const styles = theme => ({
  root: {
    minHeight: '35.71rem'
  },
  centered: {
    textAlign: 'center'
  },
  progressText: {
    marginTop: '0.8571rem',
    fontWeight: 600,
  },
  progress: {
    backgroundColor: '#000',
  },
  stop: {
    color: theme.palette.icons.red,
    textTransform: 'none',
    fontWeight: 600,
  },
  placeholderButton: {
    marginTop: '1.643rem',
  },
  placeholderText: {
    color: theme.palette.text.secondary,
  },
  img: {
    width: '8.571rem',
    height: '8.571rem',
    marginBottom: '1rem',
  },
  sectionTitle: {
    margin: '1.0714rem 0'
  }
});

class Backtest extends Component {
  componentDidMount() {
    this.props.fetchOutput();
    this.props.fetchConfigLogs();
  }

  componentDidUpdate(prevProps) {
    const { currentBotConfig, configBacktestOutputs } = this.props;
    if (currentBotConfig && currentBotConfig.id !== prevProps.currentBotConfig.id) {
      if (!configBacktestOutputs) {
        this.props.fetchOutput();
      }
      this.props.fetchConfigLogs();
    }
  }

  getProgressText = progress => (progress ? `Backtest in progress...(${progress}%)` : 'Initializing data...')

  getPrecision = (floatNum) => {
    return floatNum.toString().includes('.')
      ? floatNum.toString().substring(floatNum.toString().indexOf('.'), floatNum.toString().length).length - 1
      : 0;
  }

  renderWithRoot = (component) => {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        {component}
      </div>
    );
  }

  renderWithCenteredRoot = (component) => {
    const { classes } = this.props;

    return (
      <Grid className={`${classes.root} ${classes.centered}`} spacing={0} justify="center" alignContent="center" container>
        <Grid xs={3} item />
        <Grid xs={6} item>{component}</Grid>
        <Grid xs={3} item />
      </Grid>
    );
  }

  renderLoader = () => {
    return this.renderWithCenteredRoot((
      <PulseLoader size={6} color="#52B0B0" loading />
    ));
  }

  renderPlaceholder = (text, disableButton) => {
    const { classes, startBacktest } = this.props;
    return this.renderWithCenteredRoot((
      <Fragment>
        <Typography className={classes.placeholderText}>
          {text}
        </Typography>
        <Button
          disabled={disableButton}
          className={classes.placeholderButton}
          name="runBacktest"
          color="primary"
          variant="contained"
          onClick={startBacktest}>
          <Icon>skip_previous</Icon>&nbsp;
          RUN BACKTEST
        </Button>
      </Fragment>
    ));
  };

  renderDisabledState = () => {
    const text = 'This bot cannot be backtested';
    const disableButton = true;
    return this.renderPlaceholder(text, disableButton);
  };

  renderEmptyState = () => {
    const {
      currentBotConfig: { mode, status, isStartingOrStopping }
    } = this.props;

    const text = 'No backtests found for this configuration';
    const disableButton = isStartingOrStopping || (status && status.toLowerCase() === STATUSES.RUNNING && mode && mode.toLowerCase() === MODES.LIVE);
    return this.renderPlaceholder(text, disableButton);
  };

  renderError() {
    const { classes, botConfigLogs, botConfigLogsLoaded } = this.props;
    return (
      <div style={{ marginTop: '2.1429rem' }}>
        <ConfigItemStateCover
          iconSize="large"
          iconSpaced
          primaryText="Backtest failed due to an error, see logs below for more information" />
        <Typography className={classes.sectionTitle} variant="subtitle1">Logs</Typography>
        <Logs botConfigLogs={botConfigLogs} botConfigLogsLoaded={botConfigLogsLoaded} />
      </div>
    );
  }

  renderOutput = () => {
    const {
      configBacktestOutputs, currentBotConfig, classes, botConfigLogs, botConfigLogsLoaded, indicator, outputFlags
    } = this.props;

    if (currentBotConfig
      && currentBotConfig.backtestStatus
      && currentBotConfig.backtestStatus.toLowerCase() === STATUSES.FAILED) {
      return this.renderError();
    }
    if (!configBacktestOutputs || (configBacktestOutputs && !Object.keys(configBacktestOutputs).length)) {
      return this.renderEmptyState();
    }

    const {
      benchmark_period_return: benchmarkPeriodReturn,
      capital_base: capitalBase,
      portfolio_value: portfolioValue,
      trades,
      tradeNumber,
      backtest_completed: backtestCompleted,
      period_start: periodStart,
      period_end: periodEnd,
      quote_currency: quoteCurrency,
      market,
      portfolio_value_series: portfolioValueSeries,
      exchange_name: exchangeName,
      candle_timeframe: candleTimeframe
    } = configBacktestOutputs;

    const [base] = market.split('/');
    const algorithmPeriodReturn = capitalBase === 0 ? 0 : (portfolioValue - capitalBase) / capitalBase;

    const totalBoughtSold = trades.reduce((result, current) => {
      const totalPrecision = this.getPrecision(result[current.side]);
      const currentPrecision = this.getPrecision(current.amount);
      const fixed = currentPrecision > totalPrecision ? currentPrecision : totalPrecision;
      result[current.side] = parseFloat((result[current.side] + current.amount).toFixed(fixed));
      return result;
    }, { SELL: 0, BUY: 0 });

    return this.renderWithRoot((
      <Fragment>
        {outputFlags.showSummary && (
          <Fragment>
            <Typography className={classes.sectionTitle} variant="subtitle1">Backtest Summary</Typography>
            <PerformanceSummary
              roi={algorithmPeriodReturn}
              startingCapital={capitalBase}
              endingCapital={portfolioValue}
              profitLoss={portfolioValue - capitalBase}
              marketReturn={benchmarkPeriodReturn}
              excessReturn={algorithmPeriodReturn - benchmarkPeriodReturn}
              numTrades={tradeNumber}
              lastBacktestDate={epochMsToDateTime(backtestCompleted)}
              startDate={epochMsToDateTime(periodStart)}
              endDate={epochMsToDateTime(periodEnd)}
              quoteCurrency={quoteCurrency}
              baseAsset={base}
              totalBought={totalBoughtSold.BUY}
              totalSold={totalBoughtSold.SELL} />
            <Divider />
          </Fragment>
        )}
        {outputFlags.showPerformanceChart && capitalBase > 0 &&
        (
          <Fragment>
            <Typography className={classes.sectionTitle} variant="subtitle1">Performance</Typography>
            <PortfolioValue
              data={portfolioValueSeries}
              quoteCurrency={quoteCurrency} />
            <Divider />
          </Fragment>
        )}
        {outputFlags.showMarketChart && (
          <Fragment>
            <Typography className={classes.sectionTitle}>Market Chart {market}</Typography>
            <MarketChart
              key={currentBotConfig.id}
              exchange={exchangeName}
              candleTimeframe={candleTimeframe}
              pair={market}
              from={periodStart}
              to={periodEnd}
              trades={trades}
              indicator={indicator} />
            <Divider />
          </Fragment>
        )}
        {outputFlags.showBotActivity && (
          <Fragment>
            <Typography className={classes.sectionTitle} variant="subtitle1">Trades</Typography>
            <Trades data={trades} />
            <Divider />
          </Fragment>
        )}
        {outputFlags.showLogs && (
          <Fragment>
            <Typography className={classes.sectionTitle} variant="subtitle1">Logs</Typography>
            <Logs botConfigLogs={botConfigLogs} botConfigLogsLoaded={botConfigLogsLoaded} />
          </Fragment>
        )}
      </Fragment>
    ));
  }

  renderProgress = () => {
    const { currentBotConfig, classes, stopBot } = this.props;
    const { progress } = currentBotConfig;

    return this.renderWithCenteredRoot((
      <Fragment>
        <img className={classes.img} src="/platform/static/images/gears.svg" alt="gears" />
        <LinearProgress
          classes={{ colorPrimary: classes.progress }}
          variant="determinate"
          value={progress} />
        <Typography className={classes.progressText}>
          {this.getProgressText(progress)}
        </Typography>
        <Button
          onClick={stopBot}
          color="secondary"
          className={classes.stop}>
          Stop
        </Button>
      </Fragment>
    ));
  }


  render() {
    const {
      currentBotConfig, configBacktestOutputsLoaded, enabled
    } = this.props;

    if (!enabled) {
      return this.renderDisabledState();
    }

    if (!currentBotConfig || !configBacktestOutputsLoaded) {
      return this.renderLoader();
    }

    const { backtestStatus, mode } = currentBotConfig;
    return backtestStatus && backtestStatus.toLowerCase() === STATUSES.RUNNING && mode && mode.toLowerCase() === MODES.BACKTEST ?
      this.renderProgress() :
      this.renderOutput();
  }
}

Backtest.defaultProps = {
  configBacktestOutputs: null,
  botConfigLogs: [],
  indicator: null,
};

Backtest.propTypes = {
  classes: PropTypes.object.isRequired,
  enabled: PropTypes.bool.isRequired,
  currentBotConfig: PropTypes.object.isRequired,
  stopBot: PropTypes.func.isRequired,
  configBacktestOutputsLoaded: PropTypes.bool.isRequired,
  configBacktestOutputs: PropTypes.object,
  botConfigLogs: PropTypes.array,
  botConfigLogsLoaded: PropTypes.bool.isRequired,
  fetchOutput: PropTypes.func.isRequired,
  fetchConfigLogs: PropTypes.func.isRequired,
  startBacktest: PropTypes.func.isRequired,
  indicator: PropTypes.object,
  outputFlags: PropTypes.object.isRequired
};

export default withStyles(styles, { withTheme: true })(Backtest);



// WEBPACK FOOTER //
// ./src/components/bots/backtest.js