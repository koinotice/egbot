import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ButtonBase from '@material-ui/core/ButtonBase';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import CounterBadge from '../../components/notifications/counterBadge';

const styles = theme => ({
  button: {
    padding: '0.7143rem',
    fontSize: '0.7571rem',
    fontWeight: '600',
    lineHeight: '1.271rem',
    textAlign: 'center',
    color: theme.palette.text.secondary,
    marginRight: '2px'
  },
  buttonLarge: {
    padding: '0.7143rem 2.1429rem'
  },
  active: {
    color: theme.palette.text.primary,
    borderBottom: `0.1429rem solid ${theme.palette.primary.main}`
  },
  activeNoUnderline: {
    color: theme.palette.text.primary
  }
});

class NavTab extends Component {
  handleClick = () => {
    this.props.handleChange(this.props.value);
  };

  render() {
    const {
      classes, label, badgeValue, name, disableUnderline
    } = this.props;

    const activeClasses = disableUnderline ? classes.activeNoUnderline : classes.active;

    const buttonClass = classNames({
      [classes.button]: true,
      [classes.buttonLarge]: this.props.large,
      [activeClasses]: this.props.value === this.props.activeVal
    });
    return (
      <ButtonBase
        name={name}
        className={buttonClass}
        onClick={this.handleClick}>
        {label}
        {badgeValue ? <CounterBadge badgeContent={badgeValue} name="badgeValue" /> : null}
      </ButtonBase>
    );
  }
}

NavTab.defaultProps = {
  badgeValue: 0,
  name: '',
};

NavTab.propTypes = {
  classes: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  activeVal: PropTypes.string.isRequired,
  badgeValue: PropTypes.number,
  name: PropTypes.string,
  large: PropTypes.bool.isRequired,
  disableUnderline: PropTypes.bool.isRequired
};


export default withStyles(styles)(NavTab);



// WEBPACK FOOTER //
// ./src/components/tabs/navTab.js