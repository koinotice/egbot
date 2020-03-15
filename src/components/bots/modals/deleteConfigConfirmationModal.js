import React, { Component, Fragment } from 'react';
import { withStyles } from '@material-ui/core';
import Icon from '@material-ui/core/Icon';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import PropTypes from 'prop-types';
import FormModal from '../../modals/formModal';


const styles = theme => ({
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

class DeleteConfigConfirmationModal extends Component {
  showConfigName() {
    const { configName } = this.props;
    return configName ? `(${configName})` : '';
  }

  renderDeleteConfirmation() {
    const {
      classes, configId, configStatus, deleteConfig, close
    } = this.props;

    if (configStatus === 'RUNNING') {
      return (
        <Fragment>
          <Icon className={classes.modalIcon}>error_outline</Icon>
          <Typography variant="h6" className={classes.modalText}>
            Bot must be stopped before deleting
          </Typography>
        </Fragment>
      );
    }

    return (
      <Fragment>
        <Icon className={classes.modalIcon}>error_outline</Icon>
        <Typography variant="h6" className={classes.modalText}>
          {`Are you sure you want to delete this bot ${this.showConfigName()}?`}
        </Typography>
        <div className={classes.modalButtons}>
          <Button onClick={close}>Cancel</Button>
          <Button
            color="primary"
            variant="contained"
            onClick={() => {
              deleteConfig(configId);
              close();
            }}>
            Confirm Delete
          </Button>
        </div>
      </Fragment>
    );
  }

  render() {
    const { isVisible, close } = this.props;
    return (
      <FormModal
        isVisible={isVisible}
        hide={close}
        form={this.renderDeleteConfirmation()} />
    );
  }
}

DeleteConfigConfirmationModal.defaultProps = {
  configId: '',
  configName: '',
  configStatus: '',
};

DeleteConfigConfirmationModal.propTypes = {
  classes: PropTypes.object.isRequired,
  isVisible: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
  configId: PropTypes.string,
  configName: PropTypes.string,
  configStatus: PropTypes.string,
  deleteConfig: PropTypes.func.isRequired
};

export default withStyles(styles)(DeleteConfigConfirmationModal);



// WEBPACK FOOTER //
// ./src/components/bots/modals/deleteConfigConfirmationModal.js