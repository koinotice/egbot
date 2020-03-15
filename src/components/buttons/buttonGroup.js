import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
  btnGroup: {
    display: 'inline',
    float: 'right',
    backgroundColor: 'inherit'
  },
  btn: {
    float: 'left',
    padding: '4px 15px',
    border: 'none',
    background: 'none',
    color: theme.palette.text.secondary,
    fontSize: '12px',
    fontWeight: '600',
    lineHeight: '15px',
    cursor: 'pointer',
    '&:focus': {
      outline: '0'
    }
  },
  active: {
    color: theme.palette.text.primary,
    borderBottom: `2px solid ${theme.palette.primary.main}`,
  }
});

class BtnGroup extends Component {
  render() {
    const {
      classes,
      className: classNameProp,
      onChange,
      selectedValue,
      buttons,
    } = this.props;

    return (
      <div className={classNames({ [classes.btnGroup]: true }, classNameProp)}>
        {
          buttons.map(btn => (
            <button
              type="button"
              name={btn.name}
              key={btn.value}
              className={classNames({ [classes.btn]: true, [classes.active]: btn.value === selectedValue })}
              onClick={ () => onChange(btn.value) }>
              {btn.label}
            </button>))
        }
      </div>
    );
  }
}

BtnGroup.propTypes = {
  classes: PropTypes.object.isRequired,
  className: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  selectedValue: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  buttons: PropTypes.array.isRequired // array of objects ie: [{label: 'Apple', value: 1}]
};

BtnGroup.defaultProps = {
  className: null,
};

export default withStyles(styles)(BtnGroup);



// WEBPACK FOOTER //
// ./src/components/buttons/buttonGroup.js