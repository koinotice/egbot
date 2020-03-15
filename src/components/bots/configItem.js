import React, { Component } from 'react';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import ButtonBase from '@material-ui/core/ButtonBase';
import Icon from '@material-ui/core/Icon';
import Tooltip from '@material-ui/core/Tooltip';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { MODES, STATUSES } from '../../utils/botConstants';
import { sentenceCase } from '../../utils/strings';
import BotIcon from './botIcon';
import ConfigItemOutput from './configItemOutput';
import ConfigItemProgress from './configItemProgress';
import ConfigItemStateCover from './configItemStateCover';
import TooltipIcon from '../common/tooltipIcon';
import DeleteConfigConfirmationModal from './modals/deleteConfigConfirmationModal';

const styles = theme => ({
  paper: {
    padding: '15px 8px',
    '&:hover': {
      cursor: 'pointer',
    }
  },
  paperDarker: {
    marginTop: '15px',
    marginBottom: '13px',
    padding: '15px',
    backgroundColor: theme.palette.background.paperDarker,
    minHeight: '162px',
  },
  flexRowStart: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start'
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
  botIcon: {
    margin: '0 18px 0 10px',
    width: 30,
    height: 30
  },
  botLabel: {
    fontSize: '14px',
    fontWeight: 600,
    lineHeight: '18px'
  },
  configName: {
    fontSize: '13px',
    lineHeight: '17px',
    color: theme.palette.text.secondary
  },
  label: {
    fontSize: '14px',
    lineHeight: '18px',
    color: theme.palette.text.secondary
  },
  svg: {
    height: 20,
    width: 140,
    [theme.breakpoints.down(600)]: {
      width: 20,
    }
  },
  statusText: {
    fill: theme.palette.text.primary,
  },
  button: {
    marginLeft: '10px'
  },
  buttonLabel: {
    height: '12px'
  },
  deleteButton: {
    marginRight: '10px'
  },
  deleteIcon: {
    color: theme.palette.text.secondary,
    '&:hover': {
      color: theme.palette.icons.red
    }
  }
});

class ConfigItem extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showDeleteButton: false,
      showDeleteConfirmationModal: false
    };

    this.buttonStateColors = {
      RUNNING: props.theme.palette.icons.red,
      STOPPED: props.theme.palette.buttons.primary,
      COMPLETED: props.theme.palette.buttons.primary
    };

    this.ledIndicatorColors = {
      RUNNING: props.theme.palette.icons.green,
      STOPPED: props.theme.palette.text.secondary,
      COMPLETED: props.theme.palette.text.secondary,
      FAILED: props.theme.palette.icons.red
    };
  }

  onClickButton(event) {
    const {
      status,
      mode,
      onClickConfigure,
      onClickStartLive,
      onClickStopLive,
      onClickStopBacktest,
      configId,
      botId
    } = this.props;

    event.stopPropagation();

    switch (status.toLowerCase()) {
      case STATUSES.RUNNING:
        if (mode.toLowerCase() === MODES.BACKTEST) {
          onClickStopBacktest(configId);
        } else if (mode.toLowerCase() === MODES.LIVE) {
          onClickStopLive(configId);
        }
        break;
      case STATUSES.STOPPED:
        onClickConfigure(botId, configId);
        break;
      case STATUSES.COMPLETED:
        onClickStartLive(configId);
        break;
      case STATUSES.FAILED:
        onClickConfigure(botId, configId);
        break;
      default:
        break;
    }
  }

  onClickDelete(event) {
    event.stopPropagation();
    this.showDeleteConfirmation();
  }

  getStatusText() {
    const { status, mode } = this.props;
    if (status.toLowerCase() === STATUSES.STOPPED || status.toLowerCase() === STATUSES.COMPLETED) {
      return 'Stopped';
    }
    if (status.toLowerCase() === STATUSES.FAILED) {
      return 'Bot Error (See logs)';
    }
    return mode ? `Running (${sentenceCase(mode)})` : 'Running';
  }

  getButtonText() {
    const { status, mode } = this.props;

    switch (status.toLowerCase()) {
      case STATUSES.RUNNING:
        return mode && mode.toLowerCase() === MODES.LIVE ? 'Stop Bot' : 'Stop Backtest';
      case STATUSES.STOPPED:
        return 'Configure';
      case STATUSES.COMPLETED:
        return 'Configure';
      case STATUSES.FAILED:
        return 'View Logs';
      default:
        break;
    }
    return '';
  }

  getButtonColor() {
    const { theme, status } = this.props;
    return this.buttonStateColors[status] || theme.palette.buttons.primary;
  }

  showDeleteButton = () => {
    this.setState({
      showDeleteButton: true
    });
  };

  hideDeleteButton = () => {
    this.setState({
      showDeleteButton: false
    });
  };

  showDeleteConfirmation = () => {
    this.setState({
      showDeleteConfirmationModal: true
    });
  };

  hideDeleteConfirmation = () => {
    this.setState({
      showDeleteConfirmationModal: false
    });
  };

  renderCenterSection() {
    const {
      status,
      mode,
      progress,
      configComplete,
      outputSummary,
      openOrders,
    } = this.props;

    if (status.toLowerCase() === STATUSES.RUNNING && mode && mode.toLowerCase() === MODES.BACKTEST) {
      return <ConfigItemProgress progress={progress} />;
    }

    if (status.toLowerCase() === STATUSES.FAILED) {
      return (
        <ConfigItemStateCover
          primaryText="Bot Stopped"
          secondaryText="Click here to view logs for more info" />
      );
    }

    return configComplete
      ? <ConfigItemOutput
        openOrders={openOrders}
        mode={mode}
        status={status}
        outputSummary={outputSummary} />
      : <ConfigItemStateCover
        primaryText="Setup Incomplete"
        secondaryText="Click here to configure this bot" />;
  }

  render() {
    const {
      classes,
      theme,
      onClickConfigItem,
      botId,
      configId,
      botName,
      botLabel,
      botDescription,
      botReadMoreLink,
      configName,
      status,
      isStartingOrStopping,
      deleteConfig,
    } = this.props;

    const { showDeleteButton, showDeleteConfirmationModal } = this.state;

    return (
      <div onMouseEnter={this.showDeleteButton} onMouseLeave={this.hideDeleteButton} style={{ borderTop: status.toLowerCase() === STATUSES.RUNNING ? `2px solid ${theme.palette.icons.green}` : 'initial' }}>
        <Paper onClick={() => onClickConfigItem(botId, configId)} elevation={0} className={classes.paper} square>
          <div className={classes.flexRowSpaceBetween}>
            <div className={classes.flexCol}>
              <div className={classes.flexRowStart}>
                <BotIcon icon={botName} className={classes.botIcon} />
                <div className={classes.flexCol}>
                  <Typography variant="subtitle1" className={classes.botLabel}>
                    {botLabel}
                    <TooltipIcon
                      style={{ position: 'relative', top: '-2px' }}
                      title={botDescription}
                      learnMoreLink={botReadMoreLink} />
                  </Typography>
                  <Typography variant="subtitle2" className={classes.configName}>{configName}</Typography>
                </div>
              </div>
            </div>
            {}
            <div className={classes.flexCol}>
              {showDeleteButton &&
                <Tooltip
                  title="Permanently delete this bot">
                  <ButtonBase onClick={event => this.onClickDelete(event)} className={classes.deleteButton}>
                    <Icon className={classes.deleteIcon}>clear</Icon>
                  </ButtonBase>
                </Tooltip>
              }
            </div>
          </div>
          <Paper elevation={0} className={classes.paperDarker}>
            {this.renderCenterSection()}
          </Paper>
          <div className={classes.flexRowSpaceBetween} style={{ paddingLeft: '5px', paddingRight: '15px' }}>
            <svg className={classes.svg}>
              <circle cx="14" cy="11" r="4" fill={this.ledIndicatorColors[status]} />
              <text x="24" y="15" className={classes.statusText}>{this.getStatusText()}</text>
            </svg>
            <div>
              <Button
                disabled={isStartingOrStopping}
                color="primary"
                size="small"
                variant="text"
                className={classes.button}
                classes={{ label: classes.buttonLabel }}
                style={{
                  color: this.getButtonColor()
                }}
                name="powerButton"
                onClick={event => this.onClickButton(event)}>
                {this.getButtonText()}
              </Button>
            </div>
          </div>
        </Paper>
        <DeleteConfigConfirmationModal
          isVisible={showDeleteConfirmationModal}
          close={this.hideDeleteConfirmation}
          configId={configId}
          configName={configName}
          configStatus={status}
          deleteConfig={deleteConfig} />
      </div>
    );
  }
}


ConfigItem.defaultProps = {
  mode: null,
  progress: 0,
  outputSummary: {},
  botReadMoreLink: '',
};

ConfigItem.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  botId: PropTypes.string.isRequired,
  configId: PropTypes.string.isRequired,
  botName: PropTypes.string.isRequired,
  botLabel: PropTypes.string.isRequired,
  botDescription: PropTypes.string.isRequired,
  botReadMoreLink: PropTypes.string,
  configName: PropTypes.string.isRequired,
  mode: PropTypes.string,
  status: PropTypes.string.isRequired,
  onClickConfigItem: PropTypes.func.isRequired,
  onClickConfigure: PropTypes.func.isRequired,
  onClickStartLive: PropTypes.func.isRequired,
  onClickStopLive: PropTypes.func.isRequired,
  onClickStopBacktest: PropTypes.func.isRequired,
  progress: PropTypes.number,
  configComplete: PropTypes.bool.isRequired,
  isStartingOrStopping: PropTypes.bool.isRequired,
  outputSummary: PropTypes.object,
  openOrders: PropTypes.array.isRequired,
  deleteConfig: PropTypes.func.isRequired,
};

export default withStyles(styles, { withTheme: true })(ConfigItem);



// WEBPACK FOOTER //
// ./src/components/bots/configItem.js