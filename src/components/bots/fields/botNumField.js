import React, { Component } from 'react';
import Input from '@material-ui/core/Input';
import PropTypes from 'prop-types';
import { sentenceToCamelCase } from '../../../utils/strings';
import { sanitizeScientificNotation } from '../../../utils/numbers';

class BotNumField extends Component {
  constructor(props) {
    super(props);

    this.inputRef = React.createRef();
  }

  componentDidMount() {
    const { value } = this.props;
    this.validate(value);

    // prevent number from changing on scroll
    this.inputRef.current.addEventListener('wheel', this.preventDefault);
  }

  componentWillUnmount() {
    this.inputRef.current.removeEventListener('wheel', this.preventDefault);
  }

  preventDefault = e => e.preventDefault();

  validate = (value) => {
    const { validation, setError } = this.props;

    if (!validation) {
      return;
    }

    if (validation.isRequired && !value) {
      setError('Field is required');
      return;
    }
    if (validation.min !== null && parseFloat(value) < validation.min) {
      setError(`Min is ${sanitizeScientificNotation(validation.min)}`);
      return;
    }
    if (validation.max !== null && parseFloat(value) > validation.max) {
      setError(`Max is ${sanitizeScientificNotation(validation.max)}`);
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
        type="number"
        disabled={disabled}
        inputProps={{
          ref: this.inputRef
        }}
        fullWidth />
    );
  }
}

BotNumField.defaultProps = {
  value: '',
  name: '',
  validation: {},
};

BotNumField.propTypes = {
  name: PropTypes.string,
  value: PropTypes.string,
  validation: PropTypes.object,
  onChange: PropTypes.func.isRequired,
  setError: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired,
};

export default BotNumField;



// WEBPACK FOOTER //
// ./src/components/bots/fields/botNumField.js