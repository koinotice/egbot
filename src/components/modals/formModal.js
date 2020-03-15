import React, { Component } from 'react';
import { withStyles } from '@material-ui/core';
import PropTypes from 'prop-types';
import Modal from '@material-ui/core/Modal';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';


const styles = theme => ({
  modal: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalPaper: {
    position: 'absolute',
    width: theme.spacing.unit * 60,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    textAlign: 'right',
    '&:focus': {
      outline: 'none'
    },
  },
  modalContent: {
    padding: theme.spacing.unit * 4,
    paddingTop: '0px',
    textAlign: 'center',
    '&:focus': {
      outline: 'none'
    }
  },
  modalIcon: {
    color: theme.palette.text.primary,
    fontSize: '14px',
  },
  modalHeader: {
    fontWeight: '600',
    lineHeight: '1.714rem',
    fontSize: '1.143rem',
  }

});

class FormModal extends Component {
  render() {
    const {
      classes, isVisible, hide, form, header
    } = this.props;

    return (
      <Modal
        open={isVisible}
        onBackdropClick={() => { hide(); }}
        className={classes.modal}>
        <Paper className={classes.modalPaper}>
          <IconButton
            onClick={() => { hide(); }}
            name="close">
            <Icon className={classes.modalIcon}>clear</Icon>
          </IconButton>
          <div className={classes.modalContent}>
            {header &&
            <Typography variant="h6" className={classes.modalHeader} >
              {header}
            </Typography>
            }
            {form}
          </div>
        </Paper>
      </Modal>
    );
  }
}

FormModal.defaultProps = {
  header: '',
};

FormModal.propTypes = {
  classes: PropTypes.object.isRequired,
  header: PropTypes.string,
  isVisible: PropTypes.bool.isRequired,
  hide: PropTypes.func.isRequired,
  form: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]).isRequired,
};

export default withStyles(styles, { withTheme: true })(FormModal);



// WEBPACK FOOTER //
// ./src/components/modals/formModal.js