import React, { Component } from 'react';
import PropTypes from 'prop-types';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import { withStyles } from '@material-ui/core/styles';
import BotTextField from './botTextField';
import BotPairAutoComplete from './botPairAutoComplete';
import BotDropDown from './botDropDown';
import BotNumField from './botNumField';
import BotIDE from './botIDE';
import BotTimeframe from './botTimeframe';
import BotAccountSelection from './botAccountSelection';
import BotOrderAmount from './botOrderAmount';
import TooltipIcon from '../../common/tooltipIcon';


const styles = theme => ({
  formControl: {
    marginTop: '1.0714rem',
    marginBottom: '1.0714rem'
  },
  inputLabel: {
    transform: 'initial',
    fontSize: '0.8571rem'
  },
  errorText: {
    color: theme.palette.error.main
  }
});

class BotFieldComponent extends Component {
  constructor(props) {
    super(props);

    this.componentMap = new Map();
    this.componentMap.set('BotTextField', BotTextField);
    this.componentMap.set('BotPairAutoComplete', BotPairAutoComplete);
    this.componentMap.set('BotDropDown', BotDropDown);
    this.componentMap.set('BotNumField', BotNumField);
    this.componentMap.set('BotIDE', BotIDE);
    this.componentMap.set('BotTimeframe', BotTimeframe);
    this.componentMap.set('BotAccountSelection', BotAccountSelection);
    this.componentMap.set('BotOrderAmount', BotOrderAmount);
  }

  onValueChange = (value) => {
    const {
      onChange,
    } = this.props;

    onChange(value);
  }

  setError = (error) => {
    const { setErrors, name } = this.props;
    setErrors(name, error);
  }

  render() {
    const {
      component,
      label,
      value,
      fieldProps,
      validation,
      classes,
      error,
      showError,
      tooltip,
      tooltipURL,
      disabled
    } = this.props;
    const FieldComponent = this.componentMap.get(component);
    return (
      <FormControl className={classes.formControl} fullWidth>
        <InputLabel classes={{ formControl: classes.inputLabel }} disableAnimation>
          {label}
          {tooltip && <TooltipIcon title={tooltip} learnMoreLink={tooltipURL} />}
        </InputLabel>
        <FieldComponent
          name={label}
          value={value || undefined}
          onChange={this.onValueChange}
          validation={validation}
          setError={this.setError}
          disabled={disabled}
          {...fieldProps} />
        {(error && showError) && <FormHelperText className={classes.errorText}>{error}</FormHelperText>}
      </FormControl>
    );
  }
}

BotFieldComponent.defaultProps = {
  value: '',
  error: '',
  fieldProps: {},
  validation: null,
  tooltip: null,
  tooltipURL: null
};

BotFieldComponent.propTypes = {
  classes: PropTypes.object.isRequired,
  component: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.string,
  error: PropTypes.string,
  setErrors: PropTypes.func.isRequired,
  tooltip: PropTypes.string,
  tooltipURL: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  fieldProps: PropTypes.object,
  validation: PropTypes.object,
  showError: PropTypes.bool.isRequired,
  disabled: PropTypes.bool.isRequired
};

export default withStyles(styles, { withTheme: true })(BotFieldComponent);



// WEBPACK FOOTER //
// ./src/components/bots/fields/botFieldComponent.js