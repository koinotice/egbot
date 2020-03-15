import React, { Component } from 'react';
import Input from '@material-ui/core/Input';
import PropTypes from 'prop-types';
import { sentenceToCamelCase } from '../../../utils/strings';

class BotTextField extends Component {
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
    const { value, disabled, name } = this.props;
    return (
      <Input
        name={sentenceToCamelCase(name)}
        value={value || ''}
        onChange={e => this.updateValue(e.target.value)}
        disabled={disabled}
        fullWidth />
    );
  }
}

BotTextField.defaultProps = {
  value: '',
  name: '',
  validation: {},
};

BotTextField.propTypes = {
  name: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  setError: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired,
  validation: PropTypes.object,
};

export default BotTextField;



// WEBPACK FOOTER //
// ./src/components/bots/fields/botTextField.js