import React, { Component, Fragment } from 'react';
import { withStyles } from '@material-ui/core';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
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

class StopLiveConfirmationModal extends Component {
  rendStopConfirmation = () => {
    const {
      classes, submit, hide
    } = this.props;

    return (
      <Fragment>
        <Icon className={classes.modalIcon}>error_outline</Icon>
        <Typography variant="h6" className={classes.modalText}>
          {'Are you sure you want to stop this bot?'}
        </Typography>
        <Typography className={classes.modalText}>Any open orders or positions will need to be manually managed.</Typography>
        <div className={classes.modalButtons}>
          <Button onClick={hide}>Cancel</Button>
          <Button
            color="primary"
            variant="contained"
            onClick={() => {
              submit();
            }}>
            Stop Bot
          </Button>
        </div>
      </Fragment>
    );
  }

  render() {
    const {
      isVisible, hide
    } = this.props;

    return (
      <FormModal
        isVisible={isVisible}
        hide={hide}
        form={this.rendStopConfirmation()} />
    );
  }
}


StopLiveConfirmationModal.propTypes = {
  classes: PropTypes.object.isRequired,
  isVisible: PropTypes.bool.isRequired,
  hide: PropTypes.func.isRequired,
  submit: PropTypes.func.isRequired,
};

export default withStyles(styles, { withTheme: true })(StopLiveConfirmationModal);



// WEBPACK FOOTER //
// ./src/components/bots/modals/stopLiveConfirmationModal.js