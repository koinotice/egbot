import React, { Component, Fragment } from 'react';
import { withStyles } from '@material-ui/core';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Divider from '@material-ui/core/Divider';
import Icon from '@material-ui/core/Icon';
import { PulseLoader, ClockLoader } from 'react-spinners';
import { MODES, STATUSES } from '../../utils/botConstants';
import ConfigItemStateCover from './configItemStateCover';
import Logs from './output/logs';
import LivePerformanceSummary from './output/livePerformanceSummary';
import { epochMsToDateTime } from '../../utils/time';
import PortfolioValue from './output/portfolioValue';
import MarketChart from './output/marketChart';
import BotAccountActivity from './botAccountActivity';


const styles = theme => ({
  root: {
    minHeight: '35.71rem'
  },
  centered: {
    textAlign: 'center'
  },
  emptyStateContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: '60px'
  },
  link: {
    textDecoration: 'none'
  },
  emptyStateText: {
    color: theme.palette.text.secondary,
  },
  emptyStateButton: {
    marginTop: '1.643rem',
  },
  sectionTitle: {
    margin: '1.0714rem 0'
  },
  stopwatch: {
    width: '100px',
    height: '100px',
    marginBottom: '15px',
  },
  learnMoreLink: {
    color: theme.palette.primary.main,
    textDecoration: 'none',
  },
  clockLoader: {
    width: '100%',
    margin: '30px 0',
    display: 'flex',
    justifyContent: 'center'
  }
});

class Live extends Component {
  componentDidMount() {
    this.props.fetchOutput();
    this.props.fetchConfigLogs();
  }

  componentDidUpdate(prevProps) {
    const { currentBotConfig, configLiveOutputs } = this.props;
    if (currentBotConfig && currentBotConfig.id !== prevProps.currentBotConfig.id) {
      if (!configLiveOutputs) {
        this.props.fetchOutput();
      }
      this.props.fetchConfigLogs();
    }
  }

  getPrecision = (floatNum) => {
    return floatNum.toString().includes('.')
      ? floatNum.toString().substring(floatNum.toString().indexOf('.'), floatNum.toString().length).length - 1
      : 0;
  }

  // orders don't have run id when coming from stream so filter by orderIds in output
  filterOrders = (openOrders, currentBotConfig, configLiveOutputs) => {
    const hasNoRunIds = openOrders.some(order => !order.runId);
    if (currentBotConfig.status === STATUSES.RUNNING.toUpperCase() || hasNoRunIds) {
      const { open_orders: outputOpenOrders } = configLiveOutputs;
      const outputOpenOrdersSet = new Set(outputOpenOrders);
      return openOrders.filter(order => outputOpenOrdersSet.has(order.e_orderId));
    }
    return openOrders.filter(order => order.runId === configLiveOutputs.runId);
  }

  renderLoader = () => {
    return this.renderWithCenteredRoot((
      <PulseLoader size={6} color="#52B0B0" loading />
    ));
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

  renderEmptyState = () => {
    const { classes, startLive, currentBotConfig: { mode, status, isStartingOrStopping } } = this.props;

    return this.renderWithCenteredRoot((
      <Fragment>
        <Typography className={classes.emptyStateText}>
          Click below to start this bot in Live Mode
        </Typography>
        <Button
          disabled={
            isStartingOrStopping ||
            (status && status.toLowerCase() === STATUSES.RUNNING && mode && mode.toLowerCase() === MODES.BACKTEST) }
          className={classes.emptyStateButton}
          name="runLive"
          color="primary"
          variant="contained"
          onClick={startLive}>
          <Icon>play_arrow</Icon>&nbsp;
          RUN LIVE
        </Button>
      </Fragment>
    ));
  }

  renderRunningEmptyState = () => {
    const { classes, } = this.props;

    return this.renderWithCenteredRoot((
      <Fragment>
        <div className={classes.clockLoader}>
          <ClockLoader size={100} margin={16} color="#52B0B0" loading />
        </div>
        <Typography className={classes.emptyStateText}>
          Bot has been started in live mode. Performance output will be shown here when there is some activity
        </Typography>
      </Fragment>
    ));
  }

  renderError = () => {
    const { currentBotConfig } = this.props;

    if (currentBotConfig && currentBotConfig.liveStatus && currentBotConfig.liveStatus.toLowerCase() === STATUSES.FAILED) {
      return (
        <div style={{ marginTop: '2.1429rem' }}>
          <ConfigItemStateCover
            iconSize="large"
            iconSpaced
            primaryText="Live bot stopped due to an error, see logs below for more information" />
        </div>
      );
    }
    return null;
  };

  renderOutput = () => {
    const {
      classes,
      configLiveOutputs,
      currentBotConfig,
      openOrders,
      accounts,
      cancelOrder,
      prefCurrency,
      indicator,
      outputFlags,
      updateAccount,
      updatePair,
      candleTimeframe,
      initTicker,
      unsubscribeTicker,
      ticker
    } = this.props;

    if (configLiveOutputs && Object.keys(configLiveOutputs).length) {
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
        exchange_name: exchangeName,
        portfolio_value_series: portfolioValueSeries,
        positions,
      } = configLiveOutputs;

      const [base] = configLiveOutputs.market.split('/');

      const totalBoughtSold = trades.reduce((result, current) => {
        const totalPrecision = this.getPrecision(result[current.side]);
        const currentPrecision = this.getPrecision(current.amount);
        const fixed = currentPrecision > totalPrecision ? currentPrecision : totalPrecision;
        result[current.side] = parseFloat((result[current.side] + current.amount).toFixed(fixed));
        return result;
      }, { SELL: 0, BUY: 0 });

      const algorithmPeriodReturn = capitalBase === 0 ? 0 : (portfolioValue - capitalBase) / capitalBase;
      const openOrdersForBotAccount = this.filterOrders(openOrders, currentBotConfig, configLiveOutputs);

      return (
        <Fragment>
          {outputFlags.showSummary && (
            <Fragment>
              <Typography className={classes.sectionTitle} variant="subtitle1">Live Summary</Typography>
              <LivePerformanceSummary
                roi={algorithmPeriodReturn}
                startingCapital={capitalBase}
                endingCapital={portfolioValue}
                profitLoss={portfolioValue - capitalBase}
                marketReturn={benchmarkPeriodReturn}
                excessReturn={algorithmPeriodReturn - benchmarkPeriodReturn}
                numTrades={tradeNumber}
                openOrderNumber={openOrdersForBotAccount.length}
                lastBacktestDate={epochMsToDateTime(backtestCompleted)}
                startDate={epochMsToDateTime(periodStart)}
                endDate={epochMsToDateTime(periodEnd)}
                quoteCurrency={quoteCurrency}
                running={currentBotConfig.liveStatus && currentBotConfig.liveStatus.toLowerCase() === STATUSES.RUNNING}
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
                trades={trades}
                indicator={indicator}
                initTicker={initTicker}
                unsubscribeTicker={unsubscribeTicker}
                ticker={ticker}
                openOrders={openOrdersForBotAccount} />
              <Divider />
            </Fragment>
          )}
          {outputFlags.showBotActivity && (
            <Fragment>
              <BotAccountActivity
                openOrders={openOrdersForBotAccount}
                trades={trades}
                positions={positions}
                accounts={accounts}
                cancelOrder={cancelOrder}
                botStatus={currentBotConfig.liveStatus}
                prefCurrency={prefCurrency}
                updateAccount={updateAccount}
                updatePair={updatePair}
                ticker={ticker} />
              <Divider />
            </Fragment>
          )}
        </Fragment>
      );
    }

    return null;
  };

  renderLogs = () => {
    const {
      botConfigLogs, botConfigLogsLoaded, classes, outputFlags
    } = this.props;
    return (
      <Fragment>
        {outputFlags.showLogs && (
          <Fragment>
            <Typography className={classes.sectionTitle} variant="subtitle1">Logs</Typography>
            <Logs botConfigLogs={botConfigLogs} botConfigLogsLoaded={botConfigLogsLoaded} />
          </Fragment>
        )}
      </Fragment>
    );
  };

  render() {
    const { currentBotConfig, configLiveOutputsLoaded, } = this.props;

    if (!currentBotConfig || !configLiveOutputsLoaded) {
      return this.renderLoader();
    }

    if (currentBotConfig.liveStatus && currentBotConfig.liveStatus.toLowerCase() === STATUSES.RUNNING && !currentBotConfig.hasShownOutput) {
      return this.renderRunningEmptyState();
    }

    if (!currentBotConfig.liveRunId) {
      return this.renderEmptyState();
    }

    return (
      <Fragment>
        {this.renderError()}
        {this.renderOutput()}
        {this.renderLogs()}
      </Fragment>
    );
  }
}

Live.defaultProps = {
  configLiveOutputs: null,
  botConfigLogs: [],
  indicator: null,
  candleTimeframe: null,
  ticker: {}
};

Live.propTypes = {
  classes: PropTypes.object.isRequired,
  startLive: PropTypes.func.isRequired,
  currentBotConfig: PropTypes.object.isRequired,
  configLiveOutputs: PropTypes.object,
  configLiveOutputsLoaded: PropTypes.bool.isRequired,
  fetchOutput: PropTypes.func.isRequired,
  fetchConfigLogs: PropTypes.func.isRequired,
  botConfigLogs: PropTypes.array,
  botConfigLogsLoaded: PropTypes.bool.isRequired,
  openOrders: PropTypes.array.isRequired,
  accounts: PropTypes.array.isRequired,
  cancelOrder: PropTypes.func.isRequired,
  prefCurrency: PropTypes.string.isRequired,
  indicator: PropTypes.object,
  outputFlags: PropTypes.object.isRequired,
  updateAccount: PropTypes.func.isRequired,
  updatePair: PropTypes.func.isRequired,
  candleTimeframe: PropTypes.string,
  initTicker: PropTypes.func.isRequired,
  unsubscribeTicker: PropTypes.func.isRequired,
  ticker: PropTypes.object
};

export default withStyles(styles)(Live);



// WEBPACK FOOTER //
// ./src/components/bots/live.js