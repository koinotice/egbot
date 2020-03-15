import React, { Component, Fragment } from 'react';
import { withStyles, withTheme } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import PropTypes from 'prop-types';

const styles = theme => ({
  error: {
    color: theme.palette.error.main,
    marginBottom: '1.0714285714285714rem'
  }
});

class SettingsForm extends Component {
  render() {
    const {
      rows,
      updateField,
      classes,
    } = this.props;

    return (
      <Fragment>
        {rows.map(row => (
          <FormControl key={row.key} margin="dense" fullWidth>
            <TextField
              error={Boolean(row.errorText)}
              className={classes.input}
              type={row.type || 'text'}
              label={row.label || '' }
              placeholder={row.placeholder}
              defaultValue={row.defaultValue}
              value={row.value}
              onChange={(event) => { updateField(event, row.key); }}
              disabled={row.disabled}
              required={row.required}
              inputProps={row.inputProps}
              InputLabelProps={row.InputLabelProps}
              name={row.name}
              variant={row.variant || 'standard' } />
            <FormHelperText error={Boolean(row.errorText)}>{row.errorText}</FormHelperText>
          </FormControl>
        ))}
      </Fragment>
    );
  }
}

SettingsForm.defaultProps = {
  updateField: null,
};

SettingsForm.propTypes = {
  classes: PropTypes.object.isRequired,
  rows: PropTypes.array.isRequired,
  updateField: PropTypes.func,
};

export default withTheme()(withStyles(styles)(SettingsForm));



// WEBPACK FOOTER //
// ./src/components/settings/settingsForm.js