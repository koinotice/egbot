import React, { Component } from 'react';
import { withStyles } from '@material-ui/core';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Icon from '@material-ui/core/Icon';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import ButtonBase from '@material-ui/core/ButtonBase';
import Tooltip from '@material-ui/core/Tooltip';
import TooltipIcon from '../common/tooltipIcon';
import { ellipsize } from '../../utils/helpers';
import DeleteConfigConfirmationModal from './modals/deleteConfigConfirmationModal';
import BotIcon from './botIcon';
import { STATUSES } from '../../utils/botConstants';


const styles = theme => ({
  paper: {
    minHeight: '30.29rem',
    paddingTop: '1.214rem',
    paddingBottom: '1.429rem',
    paddingLeft: '1.143rem',
    paddingRight: '1.143rem',
  },
  heading: {
    fontWeight: 600,
    fontSize: '0.8571rem',
    color: theme.palette.text.secondary,
  },
  configurationAdd: {
    color: theme.palette.primary.main,
  },
  configurations: {
    marginTop: '2.429rem',
  },
  selectedConfig: {
    backgroundColor: theme.palette.background.paperDarker,
    padding: '0.3571rem',
    '&:hover': {
      cursor: 'pointer',
    }
  },
  unselectedConfig: {
    padding: '0.3571rem',
    '&:hover': {
      cursor: 'pointer',
    }
  },
  botIcon: {
    width: '2.1429rem',
    height: '2.1429rem'
  },
  botName: {
    fontWeight: '600',
    lineHeight: '1.2'
  },
  configName: {
    color: theme.palette.text.secondary,
    fontSize: '0.8571rem',
    paddingLeft: '0.3571rem',
  },
  constIconGroup: {
    textAlign: 'right',
    paddingRight: '4px',
  },
  configIcon: {
    fontSize: '1.143rem',
    color: theme.palette.text.secondary,
    '&:hover': {
      color: `${theme.palette.primary.main} !important`,
    }
  },
  copyIcon: {
    '&:hover': {
      color: `${theme.palette.primary.main} !important`,
    }
  },
  deleteIcon: {
    '&:hover': {
      color: `${theme.palette.error.main} !important`,
    }
  },
  svg: {
    height: 8,
    width: 8
  },
  cellBotIcon: {
    padding: '0.5714rem',
    paddingRight: '0.7143rem',
    border: '0'
  },
  cellIndicator: {
    padding: '0',
    border: '0'
  },
  cellName: {
    width: '75%',
    padding: '0',
    border: '0',
    [theme.breakpoints.down('sm')]: {
      width: '90%'
    }
  },
  cellActionsIcons: {
    width: '17%',
    border: '0'
  },
  modalIcon: {
    fontSize: '5.143rem',
    color: theme.palette.error.main,
    marginBottom: '1.071rem'
  },
  modalText: {
    marginBottom: '1.071rem'
  },
  modalButtons: {
    marginTop: '2.071rem',
    display: 'flex',
    justifyContent: 'space-between'
  },
});

class MyConfigurations extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showConfirmDelete: false,
      configToDelete: '',
    };

    this.ledIndicatorColors = {
      [STATUSES.RUNNING]: props.theme.palette.icons.green,
      [STATUSES.STOPPED]: props.theme.palette.text.secondary,
      [STATUSES.COMPLETED]: props.theme.palette.text.secondary,
      [STATUSES.FAILED]: props.theme.palette.icons.red
    };
  }

  getBotName(configId) {
    const { bots, botConfigs } = this.props;
    const { botId } = botConfigs[configId];
    return bots[botId].name;
  }

  getBotLabel(configId) {
    const { bots, botConfigs } = this.props;
    const { botId } = botConfigs[configId];
    return bots[botId].label;
  }

  closeModal = () => {
    this.setState({
      showConfirmDelete: false,
      configToDelete: '',
    });
  }

  renderConfigurations = () => {
    const {
      classes,
      botConfigs,
      setCurrentBotAndConfig,
      currentConfigId,
      currentBotId,
      copyConfig,
    } = this.props;

    return (
      <Table className={classes.table} name="myConfigurations">
        <TableBody>
          {
            Object.keys(botConfigs)
              .filter(configId => botConfigs[configId].botId === currentBotId)
              .sort((a, b) => { return parseInt(a, 10) - parseInt(b, 10); })
              .map(configId => (
                <TableRow
                  hover
                  name={botConfigs[configId].name}
                  key={botConfigs[configId].id}
                  onClick={() => { setCurrentBotAndConfig(botConfigs[configId].botId, botConfigs[configId].id); }}
                  className={configId === currentConfigId ? classes.selectedConfig : classes.unselectedConfig}>
                  <TableCell className={classes.cellBotIcon}>
                    <BotIcon
                      className={classes.botIcon}
                      icon={this.getBotName(configId)} />
                  </TableCell>
                  <TableCell className={classes.cellName}>
                    <Typography className={classes.botName}>
                      {ellipsize(this.getBotLabel(configId), 20)}
                    </Typography>
                    <Typography>
                      <svg className={classes.svg}>
                        <circle
                          cx="4"
                          cy="4"
                          r="4"
                          fill={this.ledIndicatorColors[botConfigs[configId].status.toLowerCase()]} />
                      </svg>
                      <span className={classes.configName}>
                        {ellipsize(botConfigs[configId].name, 20)}
                      </span>
                    </Typography>
                  </TableCell>
                  <TableCell className={classes.cellActionsIcons} style={{ padding: '0' }}>
                    <span className={classes.secondaryText}>
                      <Tooltip enterDelay={1000} title="Make a copy of this configuration">
                        <ButtonBase onClick={
                          (event) => {
                            event.stopPropagation();
                            copyConfig(configId);
                          }
                        }>
                          <Icon className={[classes.configIcon, classes.copyIcon].join(' ')}>file_copy</Icon>
                        </ButtonBase>
                      </Tooltip>
                      <Tooltip enterDelay={1000} title="Permanently delete this configuration">
                        <ButtonBase onClick={
                          (event) => {
                            event.stopPropagation();
                            this.setState({
                              showConfirmDelete: true,
                              configToDelete: configId,
                            });
                          }
                        }>
                          <Icon className={[classes.configIcon, classes.deleteIcon].join(' ')}>delete</Icon>
                        </ButtonBase>
                      </Tooltip>
                    </span>
                  </TableCell>
                </TableRow>
              ))
          }
        </TableBody>
      </Table>
    );
  }


  render() {
    const {
      classes, botConfigs, deleteConfig, createNewConfig, currentBotId
    } = this.props;
    const { configToDelete } = this.state;

    return (
      <Paper className={classes.paper} elevation={0} square >
        <Grid container alignItems="center" justify="center">
          <Grid xs={11} item>
            <Typography>My Configurations</Typography>
          </Grid>
          <Grid xs={1} item>
            <ButtonBase
              name="addConfiguration"
              className={classes.configurationAdd}
              onClick={() => createNewConfig(currentBotId)}>
              <TooltipIcon
                title="Create a new blank configuration"
                Icon={<Icon>add_circle_outline</Icon>} />
            </ButtonBase>
          </Grid>
          <Grid className={classes.configurations} xs={12} item>
            {this.renderConfigurations()}
          </Grid>
        </Grid>
        <DeleteConfigConfirmationModal
          isVisible={this.state.showConfirmDelete}
          close={this.closeModal}
          configId={configToDelete}
          configName={configToDelete ? botConfigs[configToDelete].name : ''}
          configStatus={configToDelete ? botConfigs[configToDelete].status : ''}
          deleteConfig={deleteConfig} />
      </Paper>
    );
  }
}

MyConfigurations.defaultProps = {
};

MyConfigurations.propTypes = {
  theme: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  currentConfigId: PropTypes.string.isRequired,
  currentBotId: PropTypes.string.isRequired,
  botConfigs: PropTypes.object.isRequired,
  bots: PropTypes.object.isRequired,
  setCurrentBotAndConfig: PropTypes.func.isRequired,
  deleteConfig: PropTypes.func.isRequired,
  copyConfig: PropTypes.func.isRequired,
  createNewConfig: PropTypes.func.isRequired,
};

export default withStyles(styles, { withTheme: true })(MyConfigurations);



// WEBPACK FOOTER //
// ./src/components/bots/myConfigurations.js