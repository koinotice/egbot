/* eslint-disable react/prop-types */
import React from 'react';
import { MuiThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import generateTheme from '../../themes/quadTheme';
import { ProviderWithState, Consumer } from '../../utils/appContext';

function ThemeWithToggle(props) {
  return (
    <Consumer>
      {(value) => {
        const { themeType } = value;
        return (
          <MuiThemeProvider theme={generateTheme(themeType)}>
            {props.children}
          </MuiThemeProvider>
        );
      }}
    </Consumer>
  );
}

function withRoot(Component) {
  function WithRoot(props) {
    return (
      <ProviderWithState>
        <ThemeWithToggle>
          <CssBaseline />
          <Component {...props} />
        </ThemeWithToggle>
      </ProviderWithState>
    );
  }

  return WithRoot;
}

export default withRoot;



// WEBPACK FOOTER //
// ./src/components/hocs/withRoot.js