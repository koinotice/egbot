import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setTheme } from '../store/ducks/global/user';

const AppContext = React.createContext();

class Provider extends Component {
  toggleTheme = () => {
    const { actions, theme } = this.props;
    const newTheme = theme === 'DARK' ? 'LIGHT' : 'DARK';
    actions.setTheme(newTheme);
  };

  render() {
    const { theme } = this.props;
    return (
      <AppContext.Provider
        value={{
          themeType: theme.toLowerCase(),
          toggleTheme: this.toggleTheme
        }}>
        {this.props.children}
      </AppContext.Provider>
    );
  }
}

Provider.defaultProps = {
  theme: 'DARK',
};

Provider.propTypes = {
  theme: PropTypes.string,
  actions: PropTypes.objectOf(PropTypes.func).isRequired,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]).isRequired,
};

function mapStateToProps(state) {
  return {
    theme: state.global.user.user.preferences.theme,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      ...bindActionCreators({
        setTheme,
      }, dispatch)
    }
  };
}

const ProviderWithState = connect(mapStateToProps, mapDispatchToProps)(Provider);
export { ProviderWithState };
export const { Consumer } = AppContext;



// WEBPACK FOOTER //
// ./src/utils/appContext.js