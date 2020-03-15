import React from 'react';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';

const styles = {
  root: {
    marginRight: '10px',
    padding: '5px',
    borderRadius: '3px',
    background: 'rgba(0, 0, 0, 0.3)',
  },
  mr10: {
    marginRight: '10px',
  },
  text: {
    fontSize: '12px',
    marginRight: '10px',
    marginLeft: '10px',
  },
  button: {
    padding: '3px',
    minHeight: '24px',
  },
};

const SavePrompt = ({
  classes,
  show,
  promptText,
  save,
  reset
}) => {
  if (show) {
    return (
      <span className={classes.root}>
        <span className={classes.text}>{promptText}</span>
        <Button size="small" color="primary" className={`${classes.button} ${classes.mr10}`} onClick={reset}>Reset</Button>
        <Button className={classes.button} size="small" variant="contained" color="primary" onClick={save}>Save</Button>
      </span>
    );
  }

  return null;
};

SavePrompt.propTypes = {
  classes: PropTypes.object.isRequired,
  show: PropTypes.bool.isRequired,
  promptText: PropTypes.string,
  save: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired
};

SavePrompt.defaultProps = {
  promptText: ''
};

export default withStyles(styles)(SavePrompt);



// WEBPACK FOOTER //
// ./src/components/common/savePrompt.js