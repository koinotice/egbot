import React, { Component, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { PulseLoader } from 'react-spinners';
import { withStyles } from '@material-ui/core/styles';
import withWidth, { isWidthUp } from '@material-ui/core/withWidth';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import PropTypes from 'prop-types';
import { setCurrentBotAndConfig, resetCurrentBotAndConfig, showParameterErrors, runLive, stopBot, deleteConfig, filterBotConfigByStatus, filterBotConfigByBotId } from '../../store/ducks/algos/bots';
import EmptyStateCover from '../../components/common/emptyStateCover';
import ConfigItem from '../../components/bots/configItem';
import { MODES, STATUSES } from '../../utils/botConstants';
import StopLiveConfirmationModal from '../../components/bots/modals/stopLiveConfirmationModal';
import { setBotTermsAgreed } from '../../store/ducks/global/user';

const STATUS_FILTER_MAP = {
  all: [STATUSES.RUNNING, STATUSES.STOPPED, STATUSES.COMPLETED, STATUSES.FAILED],
  running: [STATUSES.RUNNING],
  stopped: [STATUSES.STOPPED, STATUSES.COMPLETED, STATUSES.FAILED]
};

const styles = theme => ({
  root: {
    padding: '0.7143rem',
    paddingRight: '10%'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '1.0714rem'
  },
  heading: {
    marginBottom: '1.0714rem'
  },
  select: {
    marginBottom: '1.0714rem'
  },
  findBotButton: {
    padding: '0.4286rem, 2.2857rem',
    height: '2.4643rem'
  },
  emptyStateContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: '4.2857rem'
  },
  noBotsContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: '4.2857rem',
    height: '15.7143rem'
  },
  loaderContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: '4.2857rem',
    height: '35.7143rem'
  },
  formControl: {
    flexDirection: 'row'
  },
  label: {
    marginTop: '5px',
    marginRight: '16px',
    color: theme.palette.text.secondary
  },
  [theme.breakpoints.down('sm')]: {
    root: {
      paddingRight: '0.7143rem'
    }
  }
});

class BotConfigs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showStopLiveConfirmation: false,
      liveConfigIdToStop: null,
    };
  }

  componentDidMount() {
    this.props.actions.resetCurrentBotAndConfig();
  }

  onClickStartLive = (configId) => {
    const { botConfigs, actions, history } = this.props;
    const { botId } = botConfigs[configId];
    actions.setCurrentBotAndConfig(botId, configId);
    history.push('/bots/my-bots/workspace/parameters');
  }

  getGridListCols() {
    const { width } = this.props;
    if (isWidthUp('md', width)) {
      return 3;
    }
    return 1;
  }

  getBotName(botId) {
    const { bots } = this.props;
    return bots[botId].name;
  }

  getBotLabel(botId) {
    const { bots } = this.props;
    return bots[botId].label;
  }

  getBotDescription(botId) {
    const { bots } = this.props;
    return bots[botId].description;
  }

  getBotReadMoreLink(botId) {
    const { bots } = this.props;
    return bots[botId].readmorelink;
  }

  setFilterBot = (event) => {
    const { actions } = this.props;
    actions.filterBotConfigByBotId(parseFloat(event.target.value));
  }

  setFilterStatus = (event) => {
    const { actions } = this.props;
    actions.filterBotConfigByStatus(event.target.value);
  }

  filterConfigsByBot = (configId) => {
    const { botConfigs, filterBotConfigType } = this.props;

    if (filterBotConfigType === 0) {
      return true;
    }

    return parseFloat(botConfigs[configId].botId) === filterBotConfigType;
  }

  filterConfigsByStatus = (configId) => {
    const { botConfigs, filterBotConfigStatus } = this.props;

    const filterStatusArray = STATUS_FILTER_MAP[filterBotConfigStatus];
    return filterStatusArray.includes(STATUSES[botConfigs[configId].status]);
  }

  viewConfig = (botId, configId) => {
    const {
      botConfigs, configOutputSummaries, actions, history
    } = this.props;
    const { mode, status } = botConfigs[configId];
    const configHasOutputSummary = !!(configOutputSummaries[configId]);

    const route = (configHasOutputSummary || status.toLowerCase() === STATUSES.FAILED) ? MODES[mode.toUpperCase()] : 'parameters';
    actions.setCurrentBotAndConfig(botId, configId);
    history.push(`/bots/my-bots/workspace/${route}`);
  }

  viewParameters = (botId, configId) => {
    const { actions, history } = this.props;
    actions.setCurrentBotAndConfig(botId, configId);
    history.push('/bots/my-bots/workspace/parameters');
  }

  openStopLiveConfirmation = (configIdToStop) => {
    this.setState({
      showStopLiveConfirmation: true,
      liveConfigIdToStop: configIdToStop,
    });
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

  stopBacktest = (configIdToStop) => {
    this.props.actions.stopBot(configIdToStop);
  }

  renderWithRoot(component) {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        {component}
      </div>
    );
  }

  renderLoader() {
    const { classes } = this.props;

    return (
      <div className={classes.loaderContainer}>
        <PulseLoader color="#52B0B0" loading />
      </div>
    );
  }

  renderEmptyState() {
    const { classes } = this.props;
    return (
      <div className={classes.emptyStateContainer}>
        <EmptyStateCover
          icon="robot"
          title={<Fragment>You do not currently have any bot configurations.<br /> Start by selecting a bot to run.</Fragment>}
          subheading=""
          ctaButtonOverride={
            <Button color="primary" variant="contained" component={Link} to="/bots/select">
              Select a Bot
            </Button>
          } />
      </div>
    );
  }

  renderBotConfigs() {
    const {
      botConfigs, configOutputSummaries, openOrdersData, actions, classes
    } = this.props;

    const filteredAndSortedBotConfigs = Object.keys(botConfigs)
      .sort((a, b) => { return parseInt(a, 10) - parseInt(b, 10); })
      .filter(this.filterConfigsByBot)
      .filter(this.filterConfigsByStatus);

    if (!filteredAndSortedBotConfigs.length) {
      return (
        <div className={classes.noBotsContainer}>
          <Typography variant="headline" color="textSecondary">No Bots</Typography>
        </div>
      );
    }

    return (
      <GridList cellHeight={300} spacing={32} cols={this.getGridListCols()}>
        {filteredAndSortedBotConfigs.map((key) => {
          return (
            <GridListTile key={botConfigs[key].id}>
              <ConfigItem
                isStartingOrStopping={botConfigs[key].isStartingOrStopping}
                key={botConfigs[key].id}
                botId={botConfigs[key].botId}
                configId={botConfigs[key].id}
                botName={this.getBotName(botConfigs[key].botId)}
                botLabel={this.getBotLabel(botConfigs[key].botId)}
                botDescription={this.getBotDescription(botConfigs[key].botId)}
                botReadMoreLink={this.getBotReadMoreLink(botConfigs[key].botId)}
                configName={botConfigs[key].name}
                mode={botConfigs[key].mode}
                status={botConfigs[key].status}
                progress={botConfigs[key].progress}
                outputSummary={configOutputSummaries[key]}
                openOrders={openOrdersData}
                configComplete={!!(configOutputSummaries[key])}
                deleteConfig={actions.deleteConfig}
                onClickConfigItem={this.viewConfig}
                onClickConfigure={this.viewParameters}
                onClickStartLive={this.onClickStartLive}
                onClickStopLive={(configId) => {
                  this.openStopLiveConfirmation(configId);
                }}
                onClickStopBacktest={(configId) => {
                  this.stopBacktest(configId);
                }} />
            </GridListTile>
          );
        })}
      </GridList>
    );
  }

  renderBody() {
    const { configOutputSummariesLoaded, botConfigs } = this.props;

    if (!configOutputSummariesLoaded) {
      return this.renderLoader();
    }

    return (
      <Fragment>
        {Object.values(botConfigs).length === 0 && this.renderEmptyState()}
        {Object.values(botConfigs).length !== 0 && this.renderBotConfigs()}
      </Fragment>
    );
  }

  render() {
    const {
      classes, botConfigs, bots, filterBotConfigType, filterBotConfigStatus
    } = this.props;
    const {
      showStopLiveConfirmation
    } = this.state;

    return this.renderWithRoot((
      <Fragment>
        <div className={classes.header}>
          <Typography variant="h6" className={classes.heading}>My Bots</Typography>
          {Object.keys(botConfigs).length > 0 &&
            <Fragment>
              <FormControl className={classes.formControl}>
                <Typography className={classes.label}>Type</Typography>
                <Select value={filterBotConfigType} onChange={this.setFilterBot} className={classes.select}>
                  <MenuItem value={0} key={0}>All</MenuItem>
                  {Object.keys(bots).map(id => <MenuItem value={id} key={id}>{bots[id].label}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl className={classes.formControl}>
                <Typography className={classes.label}>Status</Typography>
                <Select value={filterBotConfigStatus} onChange={this.setFilterStatus} className={classes.select}>
                  <MenuItem value="all" key="all">All</MenuItem>
                  <MenuItem value="running" key="running">Running</MenuItem>
                  <MenuItem value="stopped" key="stopped">Stopped</MenuItem>
                </Select>
              </FormControl>
            </Fragment>
          }
          <Button color="primary" variant="contained" component={Link} to="/bots/select" className={classes.findBotButton}>Find a Bot</Button>
        </div>
        {this.renderBody()}
        <StopLiveConfirmationModal
          isVisible={showStopLiveConfirmation}
          hide={this.closeStopLiveConfirmation}
          submit={this.stopLiveBot} />
      </Fragment>
    ));
  }
}

BotConfigs.defaultProps = {
  bots: {},
  botConfigs: {},
  configOutputSummaries: {},
  filterBotConfigType: 0,
  filterBotConfigStatus: 'all',
};

BotConfigs.propTypes = {
  classes: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  bots: PropTypes.object,
  botConfigs: PropTypes.object,
  configOutputSummaries: PropTypes.object,
  configOutputSummariesLoaded: PropTypes.bool.isRequired,
  width: PropTypes.string.isRequired,
  openOrdersData: PropTypes.array.isRequired,
  filterBotConfigType: PropTypes.number,
  filterBotConfigStatus: PropTypes.string,
};

function mapStateToProps(state) {
  return {
    bots: state.algos.bots.bots,
    botConfigs: state.algos.bots.botConfigs,
    configOutputSummaries: state.algos.bots.configOutputSummaries,
    configOutputSummariesLoaded: state.algos.bots.configOutputSummariesLoaded,
    openOrdersData: state.global.orders.openOrdersData,
    holdingsByAccount: state.holdings.holdings.byAccount,
    filterBotConfigType: state.algos.bots.filterBotConfigType,
    filterBotConfigStatus: state.algos.bots.filterBotConfigStatus,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      ...bindActionCreators({
        setCurrentBotAndConfig,
        resetCurrentBotAndConfig,
        showParameterErrors,
        stopBot,
        runLive,
        setBotTermsAgreed,
        deleteConfig,
        filterBotConfigByStatus,
        filterBotConfigByBotId,
      }, dispatch)
    }
  };
}

const base = withStyles(styles, { withTheme: true })(withWidth()(BotConfigs));
export default connect(mapStateToProps, mapDispatchToProps)(base);



// WEBPACK FOOTER //
// ./src/containers/bots/botConfigs.js