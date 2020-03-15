import React, { Component, Fragment } from 'react';
import Input from '@material-ui/core/Input';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Grid from '@material-ui/core/Grid';
import FormControl from '@material-ui/core/FormControl';
import PropTypes from 'prop-types';


class BotTimeframe extends Component {
  constructor(props) {
    super(props);

    const { value, unit } = this.getValueUnit(props.value);
    this.state = {
      timeframeValue: value,
      unit,
    };
  }

  componentDidMount() {
    const { value } = this.props;
    this.validate(value);
  }

  getValueUnit = (seconds) => {
    const valueToUnit = {
      1: 'second',
      60: 'minute',
      3600: 'hour',
      86400: 'day',
      604800: 'week',
    };

    const matchingUnit = Object.keys(valueToUnit).reverse().find(key => seconds % parseFloat(key) === 0);
    if (matchingUnit) {
      return { value: seconds / parseFloat(matchingUnit), unit: matchingUnit };
    }
    return { value: seconds, unit: 1 };
  };

  updateUnits = (event) => {
    const { validation } = this.props;

    this.setState({
      unit: event.target.value,
    });
    if (this.state.timeframeValue) {
      const totalTime = parseFloat(this.state.timeframeValue) * parseFloat(event.target.value);
      this.validate(totalTime.toString());
      this.props.onChange(totalTime.toString(), validation);
    }
  };

  validate = (value) => {
    const { validation, setError } = this.props;

    if (!validation) {
      return;
    }

    if (validation.isRequired && !value) {
      setError('Field is required');
    }

    const getValueUnit = (seconds) => {
      const valueToUnit = {
        1: 'second',
        60: 'minute',
        3600: 'hour',
        86400: 'day',
        604800: 'week',
      };

      const matchingUnit = Object.keys(valueToUnit).reverse().find(key => seconds % parseFloat(key) === 0);
      if (matchingUnit) {
        return { validationValue: seconds / parseFloat(matchingUnit), unit: valueToUnit[matchingUnit] };
      }
      return { validationValue: seconds, unit: 'second' };
    };

    if (validation.min !== null && parseFloat(value) < validation.min) {
      const min = parseFloat(validation.min);
      const { validationValue, unit } = getValueUnit(min);
      setError(`Must be at least ${validationValue} ${unit}${validationValue > 1 ? 's' : ''}`);
    }

    if (validation.max !== null && parseFloat(value) > validation.max) {
      const max = parseFloat(validation.max);
      const { validationValue, unit } = getValueUnit(max);
      setError(`Must be under ${validationValue} ${unit}${validationValue > 1 ? 's' : ''}`);
    }

    setError('');
  }

  updateValue = (event) => {
    this.setState({
      timeframeValue: event.target.value,
    });
    if (this.state.unit) {
      const totalTime = parseFloat(event.target.value) * parseFloat(this.state.unit);
      this.validate(totalTime.toString());
      this.props.onChange(totalTime.toString());
    }
  };

  render() {
    const {
      options, disabled, name,
    } = this.props;

    const { timeframeValue, unit } = this.state;

    return (
      <Fragment>
        <Grid style={{ marginTop: '12px' }} container spacing={8}>
          <Grid item xs={6}>
            <FormControl style={{ width: '100%' }}>
              <Input
                fullWidth
                name={`${name}Value`}
                value={`${timeframeValue }`}
                onChange={this.updateValue}
                disabled={disabled} />
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl style={{ width: '100%' }}>
              <Select
                style={{ width: '100%' }}
                onChange={this.updateUnits}
                value={unit}
                inputProps={{ name: `${name}Unit`, disabled }}>
                {options.map((option) => {
                  const [optionValue, optionLabel] = Object.entries(option)[0];
                  return (
                    <MenuItem value={optionValue} key={optionValue}>{optionLabel}</MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Fragment>
    );
  }
}

BotTimeframe.defaultProps = {
  name: '',
  options: [],
  value: '',
  validation: {},
};

BotTimeframe.propTypes = {
  name: PropTypes.string,
  value: PropTypes.string,
  options: PropTypes.array,
  disabled: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  validation: PropTypes.object,
  setError: PropTypes.func.isRequired
};

export default BotTimeframe;



// WEBPACK FOOTER //
// ./src/components/bots/fields/botTimeframe.js