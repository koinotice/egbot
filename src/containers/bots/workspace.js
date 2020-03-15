import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withRouter, Switch, Route, Redirect } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { PulseLoader } from 'react-spinners';
import debounce from 'lodash/debounce';
import BotActionStatusBar from '../../components/bots/botActionStatusBar';
import { Breadcrumbs, Breadcrumb } from '../../components/breadcrumbs';
import { NavTabs, NavTab } from '../../components/tabs';
import Parameters from '../../components/bots/parameters';
import Backtest from '../../components/bots/backtest';
import Live from '../../components/bots/live';
import BacktestSettingsModal from '../../components/bots/modals/backtestSettingsModal';
import LiveSettingsModal from '../../components/bots/modals/liveSettingsModal';
import MyConfiguration from '../../components/bots/myConfigurations';
import BotStrategyDescription from '../../components/bots/botStrategyDescription';
import { CANDLE_TO_DATA_FREQUENCY, MODES, STATUSES, BOT_INDICATOR_MAP } from '../../utils/botConstants';
import {
  runBacktest,
  runLive,
  updateConfig,
  stopBot,
  fetchConfigBacktestOutput,
  fetchConfigLiveOutput,
  fetchConfigLogs,
  setCurrentBotAndConfig,
  createNewConfig,
  deleteConfig,
  copyConfig,
  showParameterErrors,
  setCurrentConfigErrors,
} from '../../store/ducks/algos/bots';
import { initTicker, unsubscribeTicker } from '../../store/ducks/algos/ticker';
import { setBotTermsAgreed } from '../../store/ducks/global/user';
import { updateAccount, updatePair } from '../../store/ducks/trade/interactions';
import StopLiveConfirmationModal from '../../components/bots/modals/stopLiveConfirmationModal';
import { cancelOrder } from '../../store/ducks/global/orders';
import withPaywall from '../../components/hocs/paywall';


const styles = {
  root: {
    padding: '15px'
  },
  body: {
    padding: '15px'
  }
};

class Workspace extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentRoute: this.props.location.pathname.split('/')[4],
      showBackTestSettings: false,
      showLiveSettings: false,
      showStopLiveConfirmation: false,
      liveConfigIdToStop: null,
    };

    this.debouncedUpdateConfig = debounce(this.props.actions.updateConfig, 500);
  }

  componentDidMount() {
    const { currentBotId, currentBotAndConfigChanging, history } = this.props;
    if (!currentBotId && !currentBotAndConfigChanging) {
      history.replace('/bots/my-bots');
    } else {
      window.scrollTo(0, 0);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.currentBotId && !nextProps.currentBotAndConfigChanging) {
      this.props.history.replace('/bots/my-bots');
    }

    if (this.props.currentBotId !== nextProps.currentBotId || this.props.currentConfigId !== nextProps.currentConfigId) {
      this.props.actions.showParameterErrors(false);
    }

    const { currentRoute } = this.state;
    const nextRoute = nextProps.location.pathname.split('/')[4];

    if (currentRoute !== nextRoute) {
      this.setState({
        currentRoute: nextRoute
      });
    }
  }

  componentWillUnmount() {
    this.props.actions.showParameterErrors(false);
  }

  onNavTabClick = (route) => {
    const { history } = this.props;
    history.replace(`/bots/my-bots/workspace/${route}`);
  }

  getOutputFlags = (currentBotConfig) => {
    if (!currentBotConfig) {
      return {};
    }

    const { config: { output: outputFlags } } = currentBotConfig;
    return {
      showSummary: outputFlags && outputFlags.showSummary !== undefined ? outputFlags.showSummary : true,
      showPerformanceChart: outputFlags && outputFlags.showPerformanceChart !== undefined ? outputFlags.showPerformanceChart : true,
      showMarketChart: outputFlags && outputFlags.showMarketChart !== undefined ? outputFlags.showMarketChart : true,
      showBotActivity: outputFlags && outputFlags.showBotActivity !== undefined ? outputFlags.showBotActivity : true,
      showLogs: outputFlags && outputFlags.showLogs !== undefined ? outputFlags.showLogs : true
    };
  };

  getChartIndicator(botName, botConfig) {
    const indicator = BOT_INDICATOR_MAP[botName];
    if (indicator) {
      const inputs = indicator.keys.map((key) => {
        if (key.includes('-')) {
          return key.split('-')[1];
        }
        return botConfig[key];
      });
      return {
        name: indicator.name,
        inputs,
      };
    }
    return null;
  }

  openBotBacktestSettings = () => {
    const { currentRoute } = this.state;
    const { history, actions, currentConfigValid } = this.props;
    if (currentRoute !== 'parameters') {
      history.replace('/bots/my-bots/workspace/parameters');
      return;
    }
    if (!currentConfigValid) {
      actions.showParameterErrors(true);
    } else {
      this.setState({ showBackTestSettings: true });
    }
  }

  closeBotBacktestSettings = () => {
    this.setState({
      showBackTestSettings: false,
    });
  }

  openBotLiveSettings = () => {
    const { currentRoute } = this.state;
    const { history, actions, currentConfigValid } = this.props;
    if (currentRoute !== 'parameters') {
      history.replace('/bots/my-bots/workspace/parameters');
      return;
    }
    if (!currentConfigValid) {
      actions.showParameterErrors(true);
    } else {
      this.setState({ showLiveSettings: true });
    }
  }

  closeBotLiveSettings=() => {
    this.setState({
      showLiveSettings: false,
    });
  }

  runBotBacktest = (startDate, endDate, dataFrequency) => {
    this.closeBotBacktestSettings();
    const {
      currentConfigId,
      actions,
      history,
      isFeatureEnabled,
      showPaywallModal,
      isWithinFeatureLimit,
      userFeatures,
    } = this.props;

    if (!isFeatureEnabled.BACKTEST) {
      showPaywallModal();
      return;
    }

    const backtestFeature = Object.keys(userFeatures).find(feature => feature.startsWith('BACKTEST'));
    const backtestsRanCount = backtestFeature && userFeatures[backtestFeature].completed_back_tests
      ? userFeatures[backtestFeature].completed_back_tests
      : 0;
    if (!isWithinFeatureLimit('BACKTEST', backtestsRanCount)) {
      showPaywallModal(`You've reached the max number of ${backtestsRanCount} backtests allowed in your plan`);
      return;
    }

    actions.runBacktest(currentConfigId, startDate, endDate, MODES.BACKTEST, dataFrequency);
    history.replace('/bots/my-bots/workspace/backtest');
  }

  runBotLive = (accountIdsArray) => {
    this.closeBotLiveSettings();
    const {
      currentConfigId,
      actions,
      history,
      botConfigs,
      isFeatureEnabled,
      showPaywallModal,
      isWithinFeatureLimit,
    } = this.props;

    if (!isFeatureEnabled.LIVE_BOTS) {
      showPaywallModal();
      return;
    }

    const runningBotsCount = Object.values(botConfigs).reduce((runningBots, config) => {
      if (config.status.toLowerCase() === STATUSES.RUNNING && config.mode.toLowerCase() === MODES.LIVE) {
        return runningBots + 1;
      }
      return runningBots;
    }, 0);

    if (!isWithinFeatureLimit('LIVE_BOTS', runningBotsCount)) {
      showPaywallModal(`You've reached the max number of ${runningBotsCount} ${runningBotsCount > 1 ? 'live bots' : 'live bot'} allowed in your plan`);
      return;
    }

    actions.runLive(currentConfigId, accountIdsArray);
    history.replace('/bots/my-bots/workspace/live');
  }

  openStopLiveConfirmation = (configIdToStop) => {
    const { botConfigs } = this.props;
    if (botConfigs && botConfigs[configIdToStop]) {
      if (botConfigs[configIdToStop].mode.toLowerCase() === MODES.LIVE) {
        this.setState({
          showStopLiveConfirmation: true,
          liveConfigIdToStop: configIdToStop,
        });
      } else {
        this.props.actions.stopBot(configIdToStop);
      }
    }
  }

  closeStopLiveConfirmation = () => {
    this.setState({
      showStopLiveConfirmation: false,
      liveConfigIdToStop: null,
    });
  }

  stopLiveBot = () => {
    this.props.actions.stopBot(this.state.liveConfigIdToStop);
    this.closeStopLiveConfirmation();
  }

  renderLoader = () => (
    <Grid container alignItems="center" justify="center">
      <PulseLoader color="#52B0B0" size={6} loading />
    </Grid>
  )

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
      currentRoute,
      showBackTestSettings,
      showLiveSettings,
      showStopLiveConfirmation,
    } = this.state;
    const {
      user,
      actions,
      bots,
      botConfigs,
      classes,
      currentBotId,
      currentConfigId,
      currentBotAndConfigChanging,
      configBacktestOutputs,
      configBacktestOutputsLoaded,
      configLiveOutputs,
      configLiveOutputsLoaded,
      displayParameterErrors,
      accounts,
      botConfigLogsLoaded,
      botConfigLogs,
      openOrdersData,
      prefCurrency,
      holdingsByAccount,
      ticker,
      currentConfigErrors,
    } = this.props;

    if (!currentBotId || currentBotAndConfigChanging) {
      return this.renderLoader();
    }

    const candleTimeframe = (botConfigs && botConfigs[currentConfigId]) ? botConfigs[currentConfigId].config.candleTimeframe : null;
    const pair = (botConfigs && botConfigs[currentConfigId]) ? botConfigs[currentConfigId].config.pair : null;
    const exchange = (botConfigs && botConfigs[currentConfigId]) ? botConfigs[currentConfigId].config.exchange : null;
    const indicator = (botConfigs && botConfigs[currentConfigId]) ? this.getChartIndicator(bots[currentBotId].name, botConfigs[currentConfigId].config) : null;

    return this.renderWithRoot((
      <Grid spacing={16} container>
        <Grid item xs={12} style={{ paddingBottom: '20px' }}>
          <Breadcrumbs delimiter="/">
            <Breadcrumb
              text="Bots"
              link="/bots/select" />
            <Breadcrumb
              text="My Bots"
              link="/bots/my-bots" />
            <Breadcrumb
              text={bots[currentBotId].label} />
          </Breadcrumbs>
        </Grid>
        <Grid item xs={12} md={12}>
          <BotActionStatusBar
            currentBotConfig={botConfigs[currentConfigId]}
            currentBot={bots[currentBotId]}
            startLive={() => { this.openBotLiveSettings(); }}
            startBacktest={() => { this.openBotBacktestSettings(); }}
            stopBot={() => { this.openStopLiveConfirmation(currentConfigId); }} />
        </Grid>
        <Grid xs={12} md={3} item>
          <MyConfiguration
            copyConfig={actions.copyConfig}
            deleteConfig={actions.deleteConfig}
            createNewConfig={actions.createNewConfig}
            setCurrentBotAndConfig={actions.setCurrentBotAndConfig}
            currentConfigId={currentConfigId}
            currentBotId={currentBotId}
            bots={bots}
            botConfigs={botConfigs} />
          <BotStrategyDescription
            desc={bots[currentBotId].description}
            link={bots[currentBotId].readmorelink} />
        </Grid>
        <Grid item xs={12} md={9}>
          <Paper elevation={0} className={classes.body} square>
            <NavTabs justify="flex-start" value={currentRoute} onChange={this.onNavTabClick}>
              <NavTab name="parameters" label="Parameters" value="parameters" />
              {currentBotId && bots[currentBotId].backtest_enabled && <NavTab name="backtest" label="Backtest" value="backtest" />}
              <NavTab name="liveMode" label="Live Mode" value="live" />
            </NavTabs>
            <Switch>
              <Route
                exact
                path="/bots/my-bots/workspace/parameters"
                render={() => (
                  <Parameters
                    key={currentConfigId}
                    configTemplate={bots[currentBotId].configtemplate}
                    botConfig={botConfigs[currentConfigId]}
                    updateConfig={this.debouncedUpdateConfig}
                    errors={currentConfigErrors}
                    setErrors={actions.setCurrentConfigErrors}
                    showErrors={displayParameterErrors}
                    indicator={indicator} />
                )} />
              <Route
                exact
                path="/bots/my-bots/workspace/backtest"
                render={() => (
                  <Backtest
                    enabled={bots[currentBotId].backtest_enabled}
                    botConfigLogsLoaded={botConfigLogsLoaded}
                    botConfigLogs={
                      botConfigLogs[currentConfigId] && botConfigLogs[currentConfigId].backtest
                        ? botConfigLogs[currentConfigId].backtest
                        : []}
                    startBacktest={() => { this.openBotBacktestSettings(); }}
                    configBacktestOutputs={configBacktestOutputs[currentConfigId]}
                    configBacktestOutputsLoaded={configBacktestOutputsLoaded}
                    fetchOutput={() => { actions.fetchConfigBacktestOutput(currentConfigId); }}
                    fetchConfigLogs={() => { actions.fetchConfigLogs(currentConfigId, MODES.BACKTEST); }}
                    stopBot={() => { actions.stopBot(currentConfigId); }}
                    currentBotConfig={botConfigs[currentConfigId]}
                    indicator={indicator}
                    outputFlags={this.getOutputFlags(botConfigs[currentConfigId])} />
                )} />
              <Route
                exact
                path="/bots/my-bots/workspace/live"
                render={() => (
                  <Live
                    startLive={() => { this.openBotLiveSettings(); }}
                    currentBotConfig={botConfigs[currentConfigId]}
                    configLiveOutputs={configLiveOutputs[currentConfigId]}
                    configLiveOutputsLoaded={configLiveOutputsLoaded}
                    fetchOutput={() => { actions.fetchConfigLiveOutput(currentConfigId); }}
                    fetchConfigLogs={() => { actions.fetchConfigLogs(currentConfigId, MODES.LIVE); }}
                    openOrders={openOrdersData}
                    accounts={accounts}
                    botConfigLogsLoaded={botConfigLogsLoaded}
                    botConfigLogs={botConfigLogs[currentConfigId] && botConfigLogs[currentConfigId].live
                      ? botConfigLogs[currentConfigId].live
                      : []}
                    cancelOrder={actions.cancelOrder}
                    prefCurrency={prefCurrency}
                    indicator={indicator}
                    outputFlags={this.getOutputFlags(botConfigs[currentConfigId])}
                    updateAccount={actions.updateAccount}
                    updatePair={actions.updatePair}
                    candleTimeframe={candleTimeframe}
                    ticker={ticker}
                    initTicker={actions.initTicker}
                    unsubscribeTicker={actions.unsubscribeTicker} />
                )} />
              <Route render={() => <Redirect to="/bots/my-bots/workspace/parameters" />} />
            </Switch>
          </Paper>
        </Grid>
        {showBackTestSettings &&
        <BacktestSettingsModal
          dataFrequency={CANDLE_TO_DATA_FREQUENCY[candleTimeframe]}
          exchange={exchange}
          pair={pair}
          isVisible={showBackTestSettings}
          hide={() => { this.closeBotBacktestSettings(); }}
          submit={this.runBotBacktest} />
        }
        {showLiveSettings &&
        <LiveSettingsModal
          bots={bots}
          submitBotTermsAgreed={actions.setBotTermsAgreed}
          botTerms={user.botsTermsAgreed}
          accounts={accounts}
          currentBotConfig={botConfigs[currentConfigId]}
          holdingsByAccount={holdingsByAccount}
          isVisible={showLiveSettings}
          hide={() => { this.closeBotLiveSettings(); }}
          submit={this.runBotLive} />
        }
        <StopLiveConfirmationModal
          isVisible={showStopLiveConfirmation}
          hide={this.closeStopLiveConfirmation}
          submit={this.stopLiveBot} />
      </Grid>
    ));
  }
}

Workspace.defaultProps = {
  currentBotId: null,
  currentConfigId: null,
  currentConfigValid: null,
  ticker: {}
};

Workspace.propTypes = {
  user: PropTypes.object.isRequired,
  actions: PropTypes.objectOf(PropTypes.func).isRequired,
  classes: PropTypes.object.isRequired,
  bots: PropTypes.object.isRequired,
  botConfigs: PropTypes.object.isRequired,
  currentBotId: PropTypes.string,
  currentConfigId: PropTypes.string,
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  currentBotAndConfigChanging: PropTypes.bool.isRequired,
  configBacktestOutputs: PropTypes.object.isRequired,
  configBacktestOutputsLoaded: PropTypes.bool.isRequired,
  configLiveOutputs: PropTypes.object.isRequired,
  configLiveOutputsLoaded: PropTypes.bool.isRequired,
  currentConfigValid: PropTypes.bool,
  displayParameterErrors: PropTypes.bool.isRequired,
  accounts: PropTypes.array.isRequired,
  botConfigLogs: PropTypes.object.isRequired,
  botConfigLogsLoaded: PropTypes.bool.isRequired,
  openOrdersData: PropTypes.array.isRequired,
  prefCurrency: PropTypes.string.isRequired,
  isFeatureEnabled: PropTypes.object.isRequired,
  showPaywallModal: PropTypes.func.isRequired,
  isWithinFeatureLimit: PropTypes.func.isRequired,
  userFeatures: PropTypes.object.isRequired,
  holdingsByAccount: PropTypes.array.isRequired,
  ticker: PropTypes.object,
  currentConfigErrors: PropTypes.object.isRequired,
};


function mapStateToProps(state) {
  return {
    user: state.global.user.user,
    userLoaded: state.global.user.userLoaded,
    bots: state.algos.bots.bots,
    botConfigs: state.algos.bots.botConfigs,
    currentBotId: state.algos.bots.currentBotId,
    currentConfigId: state.algos.bots.currentConfigId,
    currentBotAndConfigChanging: state.algos.bots.currentBotAndConfigChanging,
    configBacktestOutputs: state.algos.bots.configBacktestOutputs,
    configBacktestOutputsLoaded: state.algos.bots.configBacktestOutputsLoaded,
    configLiveOutputs: state.algos.bots.configLiveOutputs,
    configLiveOutputsLoaded: state.algos.bots.configLiveOutputsLoaded,
    botConfigLogs: state.algos.bots.botConfigLogs,
    botConfigLogsLoaded: state.algos.bots.botConfigLogsLoaded,
    currentConfigValid: state.algos.bots.currentConfigValid,
    currentConfigErrors: state.algos.bots.currentConfigErrors,
    displayParameterErrors: state.algos.bots.displayParameterErrors,
    accounts: state.global.accounts.accounts,
    openOrdersData: state.global.orders.openOrdersData,
    prefCurrency: state.global.user.user.preferences.pref_currency,
    userFeatures: state.global.paywall.features,
    holdingsByAccount: state.holdings.holdings.byAccount,
    ticker: state.algos.ticker.ticker,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      ...bindActionCreators({
        runBacktest,
        runLive,
        stopBot,
        createNewConfig,
        copyConfig,
        deleteConfig,
        updateConfig,
        fetchConfigBacktestOutput,
        fetchConfigLiveOutput,
        fetchConfigLogs,
        setCurrentBotAndConfig,
        showParameterErrors,
        setCurrentConfigErrors,
        cancelOrder,
        setBotTermsAgreed,
        updateAccount,
        updatePair,
        initTicker,
        unsubscribeTicker
      }, dispatch)
    }
  };
}

const base = withRouter(withStyles(styles)((withPaywall(['BACKTEST', 'LIVE_BOTS'])(Workspace))));
export default connect(mapStateToProps, mapDispatchToProps)(base);



// WEBPACK FOOTER //
// ./src/containers/bots/workspace.js