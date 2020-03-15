import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import ButtonBase from '@material-ui/core/ButtonBase';
import classNames from 'classnames';
import PropTypes from 'prop-types';

const styles = theme => ({
  container: {
    backgroundColor: theme.palette.background.btnGroup,
    display: 'inline-block',
    width: '100%',
    height: '32px',
    borderRadius: '3px'
  },
  button: {
    width: '50%',
    height: '100%',
    fontSize: '0.8571rem',
    fontWeight: '600',
    lineHeight: '15px',
    backgroundColor: 'inherit',
    color: theme.palette.text.secondary,
  },
  active: {
    backgroundColor: theme.palette.background.paperDarker,
    color: '#FFF'
  }
});

class BtnToggle extends Component {
  render() {
    const {
      classes,
      className: classNameProp,
      buttonOne,
      buttonTwo,
      selectedValue,
      onChange
    } = this.props;

    return (
      <div className={classNames({ [classes.container]: true }, classNameProp)}>
        <ButtonBase
          className={classNames({ [classes.button]: true, [classes.active]: selectedValue === buttonOne.value })}
          style={{
            color: selectedValue === buttonOne.value ? buttonOne.activeFontColor : buttonOne.inactiveFontColor,
            fontSize: buttonOne.fontSize,
            backgroundColor: selectedValue === buttonOne.value ? buttonOne.activeColor : '',
            borderRadius: '3px 0 0 3px'
          }}
          onClick={() => { onChange(buttonOne.value); }}
          name={(buttonOne.label).toLowerCase()}>
          {buttonOne.label}
        </ButtonBase>
        <ButtonBase
          className={classNames({ [classes.button]: true, [classes.active]: selectedValue === buttonTwo.value })}
          style={{
            color: selectedValue === buttonTwo.value ? buttonTwo.activeFontColor : buttonTwo.inactiveFontColor,
            ontSize: buttonOne.fontSize,
            backgroundColor: selectedValue === buttonTwo.value ? buttonTwo.activeColor : '',
            borderRadius: '0 3px 3px 0'
          }}
          onClick={() => { onChange(buttonTwo.value); }}
          name={(buttonTwo.label).toLowerCase()}>
          {buttonTwo.label}
        </ButtonBase>
      </div>
    );
  }
}

BtnToggle.propTypes = {
  classes: PropTypes.object.isRequired,
  className: PropTypes.string,
  buttonOne: PropTypes.object.isRequired,
  buttonTwo: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  selectedValue: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]).isRequired
};

BtnToggle.defaultProps = {
  className: null
};

export default withStyles(styles)(BtnToggle);



// WEBPACK FOOTER //
// ./src/components/buttons/buttonToggle.js