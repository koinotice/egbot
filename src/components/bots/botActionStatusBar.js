import React, { Component, Fragment } from 'react';
import { withStyles } from '@material-ui/core';
import PropTypes from 'prop-types';
import Paper from '@material-ui/core/Paper';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Hidden from '@material-ui/core/Hidden';
import Icon from '@material-ui/core/Icon';
import { PulseLoader } from 'react-spinners';
import { sentenceCase } from '../../utils/strings';
import { MODES, STATUSES } from '../../utils/botConstants';
import BotIcon from './botIcon';
import TooltipIcon from '../common/tooltipIcon';


const styles = theme => ({
  avatar: {
    width: 90,
    height: 90,
    marginLeft: '0.786rem',
    marginRight: '0.786rem',
  },
  buttons: {
    margin: 'auto'
  },
  buttonRight: {
    marginRight: '1.429rem',
    marginLeft: '1.429rem',
  },
  botLabel: {
    fontWeight: 600
  },
  botStatus: {
    marginTop: '0.5857rem',
  },
  botRunStatus: {
    display: 'inline',
    color: theme.palette.text.primary,
    fontWeight: 600,
  },
  svg: {
    height: 20,
    width: 25,
    [theme.breakpoints.down(600)]: {
      width: 20,
    }
  },
});

class BotActionStatusBar extends Component {
  constructor(props) {
    super(props);

    this.ledIndicatorColors = {
      [STATUSES.RUNNING]: props.theme.palette.icons.green,
      [STATUSES.STOPPED]: props.theme.palette.text.secondary,
      [STATUSES.COMPLETED]: props.theme.palette.text.secondary,
      [STATUSES.FAILED]: props.theme.palette.icons.red
    };
  }

  getIndicatorStatus = (currentBotConfig) => {
    if (currentBotConfig.status === STATUSES.RUNNING.toUpperCase()) {
      return `Running (${sentenceCase(currentBotConfig.mode)})`;
    }
    if (currentBotConfig.status === STATUSES.FAILED.toUpperCase()) {
      return 'Error';
    }
    return 'Stopped';
  }

  render() {
    const {
      classes, startBacktest, startLive, stopBot, currentBot, currentBotConfig, theme
    } = this.props;

    if (!currentBotConfig) {
      return (
        <PulseLoader color="#52B0B0" size={6} loading />
      );
    }

    return (
      <Paper elevation={0} square>
        <ListItem alignItems="flex-start">
          <Hidden smDown>
            <ListItemAvatar>
              <BotIcon className={classes.avatar} icon={currentBot.name} />
            </ListItemAvatar>
          </Hidden>
          <ListItemText>
            <Typography className={classes.botLabel} variant="h6">
              {currentBot ? currentBot.label : ''}
              <TooltipIcon
                style={{ position: 'relative', top: '-2px' }}
                title={currentBot ? currentBot.description : ''}
                learnMoreLink={currentBot ? currentBot.readmorelink : ''} />
            </Typography>
            <Typography color="textSecondary" variant="subtitle2">{currentBotConfig ? currentBotConfig.name : ''}</Typography>
            <div className={classes.botStatus}>
              Bot Status:
              <svg className={classes.svg} >
                <circle
                  cx="14"
                  cy="16"
                  r="4"
                  fill={this.ledIndicatorColors[currentBotConfig.status.toLowerCase()]} />
              </svg>
              <Typography
                className={classes.botRunStatus}
                color="textSecondary"
                variant="subtitle2">
                {this.getIndicatorStatus(currentBotConfig)}
              </Typography>
            </div>
          </ListItemText>
          {currentBot && currentBot.backtest_enabled &&
            <Button
              className={classes.buttons}
              name="openBacktest"
              color="primary"
              variant="contained"
              disabled={
                currentBotConfig.isStartingOrStopping ||
                (currentBotConfig.status === 'RUNNING' && currentBotConfig.mode.toUpperCase() === MODES.LIVE.toUpperCase())}
              style={{
                backgroundColor: currentBotConfig.status === 'RUNNING' && currentBotConfig.mode.toUpperCase() === MODES.BACKTEST.toUpperCase()
                  ? theme.palette.buttons.red
                  : theme.palette.buttons.primary
              }}
              onClick={currentBotConfig.status === 'RUNNING' ? stopBot : startBacktest}>
              {currentBotConfig.status === 'RUNNING' && currentBotConfig.mode.toLowerCase() === MODES.BACKTEST
                ? (<Fragment><Icon>stop</Icon>STOP BACKTEST</Fragment>)
                : (<Fragment><Icon>skip_previous</Icon>BACKTEST</Fragment>)}
            </Button>
          }
          <Button
            className={[classes.buttons, classes.buttonRight].join(' ')}
            style={{
              backgroundColor: currentBotConfig.status === 'RUNNING' && currentBotConfig.mode.toUpperCase() === MODES.LIVE.toUpperCase()
                ? theme.palette.buttons.red
                : theme.palette.buttons.primary
            }}
            name="startLive"
            color="primary"
            variant="contained"
            disabled={
              currentBotConfig.isStartingOrStopping ||
              (currentBotConfig.status === 'RUNNING' && currentBotConfig.mode.toUpperCase() === MODES.BACKTEST.toUpperCase())}
            onClick={currentBotConfig.status === 'RUNNING' ? stopBot : startLive}>
            {currentBotConfig.status === 'RUNNING' && currentBotConfig.mode.toUpperCase() === MODES.LIVE.toUpperCase()
              ? (<Fragment><Icon>stop</Icon>STOP LIVE</Fragment>)
              : (<Fragment><Icon>play_arrow</Icon>START LIVE</Fragment>)}
          </Button>
        </ListItem>
      </Paper>
    );
  }
}

BotActionStatusBar.defaultProps = {
  currentBotConfig: null,
};

BotActionStatusBar.propTypes = {
  theme: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  startBacktest: PropTypes.func.isRequired,
  startLive: PropTypes.func.isRequired,
  stopBot: PropTypes.func.isRequired,
  currentBot: PropTypes.object.isRequired,
  currentBotConfig: PropTypes.object,
};

export default withStyles(styles, { withTheme: true })(BotActionStatusBar);




// WEBPACK FOOTER //
// ./src/components/bots/botActionStatusBar.js