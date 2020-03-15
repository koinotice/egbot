import React, { Component } from 'react';
import Input from '@material-ui/core/Input';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';

const styles = () => ({
  labelInput: {
    fontSize: '1 rem'
  }
});

class InlineEditable extends Component {
  constructor() {
    super();

    this.state = {
      fieldValue: ''
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value !== this.props.value) {
      this.clearFieldValue();
    }
  }

  updateFieldValue = (event) => {
    this.setState({
      fieldValue: event.target.value
    });
  };

  clearFieldValue = () => {
    this.setState({
      fieldValue: ''
    });
  };

  render() {
    const { value, onFocusOut, classes } = this.props;
    const { fieldValue } = this.state;

    return (
      <Input
        className={classes.labelInput}
        placeholder={value}
        value={fieldValue}
        onChange={this.updateFieldValue}
        onBlur={() => {
          onFocusOut(fieldValue, this.clearFieldValue);
        }} />
    );
  }
}

InlineEditable.defaultProps = {
  value: ''
};

InlineEditable.propTypes = {
  value: PropTypes.string,
  onFocusOut: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(InlineEditable);



// WEBPACK FOOTER //
// ./src/components/common/inlineEditable.js