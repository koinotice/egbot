import React, { Component } from 'react';
import { withStyles } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import ButtonBase from '@material-ui/core/ButtonBase';
import Icon from '@material-ui/core/Icon';
import Tooltip from '@material-ui/core/Tooltip';
import PropTypes from 'prop-types';
import { CopyToClipboard } from 'react-copy-to-clipboard';


const styles = {
  textField: {
    marginBottom: '1.4286rem'
  },
  input: {
    cursor: 'text'
  }
};

class ReadOnlyTextField extends Component {
  constructor(props) {
    super(props);

    this.state = {
      tooltipText: 'Copy'
    };
  }

  onClickCopy = () => {
    this.setState({
      tooltipText: 'Copied!'
    }, () => {
      setTimeout(() => {
        this.setState({ tooltipText: 'Copy' });
      }, 2000);
    });
  }

  renderCopyButton() {
    return (
      <CopyToClipboard text={this.props.value} onCopy={this.onClickCopy}>
        <ButtonBase>
          <Tooltip title={this.state.tooltipText}>
            <Icon>file_copy</Icon>
          </Tooltip>
        </ButtonBase>
      </CopyToClipboard>
    );
  }

  render() {
    const {
      classes, label, value, name
    } = this.props;

    return (
      <TextField
        name={name}
        label={label}
        value={value}
        InputProps={{
          classes: {
            input: classes.input
          },
          inputProps: {
            disabled: true
          },
          endAdornment: this.renderCopyButton()
        }}
        className={classes.textField}
        fullWidth />
    );
  }
}

ReadOnlyTextField.defaultProps = {
  name: ''
};

ReadOnlyTextField.propTypes = {
  classes: PropTypes.object.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  name: PropTypes.string,
};

export default withStyles(styles)(ReadOnlyTextField);



// WEBPACK FOOTER //
// ./src/components/common/readOnlyTextField.js