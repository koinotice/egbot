import React, { Component } from 'react';
import { withStyles, withTheme } from '@material-ui/core/styles';
import PropTypes from 'prop-types';

const styles = theme => ({
  icon: {
    fontSize: 'inherit',
  },
  up: {
    color: theme.palette.icons.green,
  },
  down: {
    color: theme.palette.icons.red,
  },
  zero: {
    color: 'transparent',
  }
});

class ChangeArrow extends Component {
  render() {
    const { change, classes, } = this.props;

    if (change > 0) {
      return (<i className={`material-icons ${classes.icon} ${classes.up}`} >arrow_drop_up</i>);
    }
    if (change < 0) {
      return (<i className={`material-icons ${classes.icon} ${classes.down}`} >arrow_drop_down</i>);
    }
    return (<i className={`material-icons ${classes.icon} ${classes.zero}`} >remove</i>);
  }
}

ChangeArrow.defaultProps = {
  change: 0,
};

ChangeArrow.propTypes = {
  classes: PropTypes.object.isRequired,
  change: PropTypes.number,
};

const base = withTheme()(withStyles(styles)(ChangeArrow));
export default base;



// WEBPACK FOOTER //
// ./src/components/icons/changeArrow.js