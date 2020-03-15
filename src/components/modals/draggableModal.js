import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import Draggable from 'react-draggable';


const styles = theme => ({
  paperComponent: {
    padding: theme.spacing.unit * 4,
    paddingTop: '0px',
    textAlign: 'center',
    '&:focus': {
      outline: 'none'
    }
  }
});

const createPaperComponent = (classes, theme, width) => (
  props => (
    <Draggable cancel='[class*="MuiDialogContent-root"]'>
      <Paper className={classes.paperComponent} style={{ width: theme.spacing.unit * width }} {...props} />
    </Draggable>
  )
);

class DraggableModal extends Component {
  constructor(props) {
    super(props);

    this.paperComponent = createPaperComponent(this.props.classes, this.props.theme, this.props.width);
  }

  getDialogTitle = () => {
    const { classes, hide, header } = this.props;

    return (
      <Grid container justify="space-between">
        <Grid item xs={6}>{header}</Grid>
        <Grid style={{ textAlign: 'right' }} item xs={6}>
          <IconButton
            onClick={() => { hide(); }}
            name="close">
            <Icon className={classes.modalIcon}>clear</Icon>
          </IconButton>
        </Grid>
      </Grid>
    );
  };

  render() {
    const {
      isVisible, hide, form
    } = this.props;

    return (
      <Dialog
        open={isVisible}
        onClose={hide}
        onBackdropClick={() => { hide(); }}
        PaperComponent={this.paperComponent}
        maxWidth="md">
        <DialogTitle style={{ cursor: 'move' }}>{this.getDialogTitle()}</DialogTitle>
        <DialogContent>
          {form}
        </DialogContent>
      </Dialog>
    );
  }
}

DraggableModal.defaultProps = {
  header: ''
};

DraggableModal.propTypes = {
  classes: PropTypes.object.isRequired,
  header: PropTypes.string,
  isVisible: PropTypes.bool.isRequired,
  hide: PropTypes.func.isRequired,
  form: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]).isRequired,
  width: PropTypes.number.isRequired,
  theme: PropTypes.object.isRequired
};

export default withStyles(styles, { withTheme: true })(DraggableModal);



// WEBPACK FOOTER //
// ./src/components/modals/draggableModal.js