import React, { Component } from 'react';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import PropTypes from 'prop-types';
import { sentenceToCamelCase } from '../../../utils/strings';

class BotDropDown extends Component {
  componentDidMount() {
    const { value } = this.props;
    this.validate(value);
  }

  validate = (value) => {
    const { validation, setError } = this.props;

    if (!validation) {
      return;
    }

    if (validation.isRequired && (!value || value === '')) {
      setError('Field is required');
      return;
    }

    setError('');
  }

  updateValue(value) {
    const { onChange } = this.props;
    this.validate(value);
    onChange(value);
  }

  render() {
    const {
      value, options, disabled, name
    } = this.props;

    return (
      <Select
        value={value}
        onChange={e => this.updateValue(e.target.value)}
        style={{ width: '100%' }}
        inputProps={{ name: sentenceToCamelCase(name), disabled }}
        disabled={disabled}>
        {options.map((option) => {
          const [optionValue, optionLabel] = Object.entries(option)[0];
          return (
            <MenuItem value={optionValue} key={optionValue}>{optionLabel}</MenuItem>
          );
        })}
      </Select>
    );
  }
}


BotDropDown.defaultProps = {
  value: '',
  options: [],
  name: '',
  validation: {},
};

BotDropDown.propTypes = {
  name: PropTypes.string,
  value: PropTypes.string,
  options: PropTypes.array,
  onChange: PropTypes.func.isRequired,
  setError: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired,
  validation: PropTypes.object,
};

export default BotDropDown;



// WEBPACK FOOTER //
// ./src/components/bots/fields/botDropDown.js