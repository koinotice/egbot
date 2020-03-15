import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Switch, Route } from 'react-router-dom';
import PropTypes from 'prop-types';
import { initialize, reset } from '../../store/ducks/coins/coins';
import Coins from './coins';
import Profile from './profile';

class CoinsRouter extends Component {
  componentDidMount() {
    const { actions } = this.props;
    actions.initialize();
  }

  componentWillUnmount() {
    const { actions } = this.props;
    actions.reset();
  }

  render() {
    return (
      <Switch>
        <Route exact path="/market" component={Coins} />
        <Route exact path="/market/:symbol" component={Profile} />
      </Switch>
    );
  }
}

CoinsRouter.propTypes = {
  actions: PropTypes.object.isRequired,
};

function mapDispatchToProp(dispatcher) {
  return {
    actions: {
      ...bindActionCreators({
        initialize,
        reset
      }, dispatcher)
    }
  };
}

export default connect(null, mapDispatchToProp)(CoinsRouter);



// WEBPACK FOOTER //
// ./src/containers/coins/coinsRouter.js