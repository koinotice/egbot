import React, { Component } from 'react';
import { withTheme } from '@material-ui/core/styles';
import AceEditor from 'react-ace';
import PropTypes from 'prop-types';
import debounce from 'lodash/debounce';

import 'ace-builds/src-min-noconflict/mode-python';
import 'ace-builds/src-min-noconflict/theme-quad_dark';
import 'ace-builds/src-min-noconflict/theme-quad_light';
import 'ace-builds/src-min-noconflict/ext-language_tools';

class BotIDE extends Component {
  constructor(props) {
    super(props);

    this.state = {
      code: ''
    };
    this.themes = {
      dark: 'quad_dark',
      light: 'quad_light'
    };
    this.updateCodeOnServer = debounce(props.onChange, 1000);
  }

  componentDidMount() {
    this.setCodeFromProps();
  }

  setCodeFromProps() {
    const { value } = this.props;
    this.setState({
      code: value
    });
  }

  updateCode = (newCode) => {
    this.setState({
      code: newCode
    }, () => {
      this.updateCodeOnServer(newCode);
    });
  };

  render() {
    const { code } = this.state;
    const { theme } = this.props;
    const themeType = theme.palette.type;

    return (
      <AceEditor
        mode="python"
        theme={this.themes[themeType]}
        width="100%"
        style={{ top: '23px', backgroundColor: theme.palette.background.default }}
        value={code}
        onChange={this.updateCode}
        wrapEnabled
        enableBasicAutocompletion
        enableLiveAutocompletion />
    );
  }
}

BotIDE.defaultProps = {
  value: ''
};

BotIDE.propTypes = {
  theme: PropTypes.object.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired
};

export default withTheme()(BotIDE);



// WEBPACK FOOTER //
// ./src/components/bots/fields/botIDE.js