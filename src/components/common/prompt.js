import React from 'react';
import Modal from '@material-ui/core/Modal';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';

const styles = {
  modal: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  paper: {
    minHeight: '28.357142857142858rem',
    width: '35.714285714285715rem',
    padding: '2.142857142857143rem',
    display: 'flex',
    flexFlow: 'column',
    justifyContent: 'space-around',
    alignItems: 'center',
    textAlign: 'center',
    '&:focus': {
      outline: 'none'
    }
  },
  button: {
    margin: 'auto 10px',
  },
  img: {
    width: '100px',
    height: '100px',
    marginBottom: '15px',
  }
};

const Prompt = ({
  classes,
  open,
  onClose,
  img,
  title,
  subheading,
  buttonOne,
  buttonTwo
}) => (
  <Modal open={open} onClose={onClose} className={classes.modal}>
    <Paper className={classes.paper}>
      <img className={classes.img} src={`/platform/static/images/${img}`} alt={img} />
      <Typography variant="h6">{title}</Typography>
      <Typography variant="subtitle1">{subheading}</Typography>
      <div>
        {buttonTwo &&
        <Button
          className={classes.button}
          color={buttonTwo.color}
          variant={buttonTwo.variant}
          onClick={buttonTwo.onClick}>
          {buttonTwo.text}
        </Button> }
        <Button
          className={classes.button}
          color={buttonOne.color}
          variant={buttonOne.variant}
          onClick={buttonOne.onClick}>
          {buttonOne.text}
        </Button>
      </div>
    </Paper>
  </Modal>
);

Prompt.defaultProps = {
  title: '',
  buttonTwo: null
};

Prompt.propTypes = {
  classes: PropTypes.object.isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  img: PropTypes.string.isRequired,
  title: PropTypes.string,
  subheading: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
  ]).isRequired,
  buttonOne: PropTypes.object.isRequired,
  buttonTwo: PropTypes.object
};

export default withStyles(styles)(Prompt);



// WEBPACK FOOTER //
// ./src/components/common/prompt.js