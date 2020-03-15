import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import { showPaywallModal } from '../../store/ducks/global/paywall';

class Paywall extends Component {
  static propTypes = {
    WrappedComponent: PropTypes.func.isRequired,
    isPrivateInstance: PropTypes.bool.isRequired,
    componentFeatures: PropTypes.array.isRequired,
    features: PropTypes.object.isRequired,
    paywallActions: PropTypes.object.isRequired,
    paywallModalVisible: PropTypes.bool.isRequired
  };

  checkFeatureEnabled = () => {
    const {
      isPrivateInstance,
      componentFeatures,
      features: userFeatures
    } = this.props;

    return componentFeatures.reduce((acc, cur) => {
      acc[cur] = isPrivateInstance
          || !!(userFeatures[cur])
          || Object.keys(userFeatures).some(userFeature => userFeature.startsWith(cur));
      return acc;
    }, {});
  };

  isWithinFeatureLimit = (feature, currentLimit) => {
    const FEATURE_LIMIT_DELIMITER = '-';
    const {
      isPrivateInstance,
      features: userFeatures
    } = this.props;

    if (isPrivateInstance) {
      return true;
    }

    const featureForUser = Object.keys(userFeatures).find(userFeature => userFeature.startsWith(feature));
    if (!featureForUser) {
      return false;
    }

    if (!featureForUser.includes(FEATURE_LIMIT_DELIMITER)) {
      return true;
    }

    const [, featureLimit] = featureForUser.split(FEATURE_LIMIT_DELIMITER);
    return parseInt(currentLimit, 10) < parseInt(featureLimit, 10);
  }

  showModal = (title) => {
    const { paywallActions } = this.props;
    paywallActions.showPaywallModal(title);
  };

  render() {
    const {
      WrappedComponent,
      componentFeatures,
      features,
      isPrivateInstance,
      paywallModalVisible,
      paywallActions,
      ...rest
    } = this.props;

    return (
      <WrappedComponent
        isWithinFeatureLimit={this.isWithinFeatureLimit}
        isFeatureEnabled={this.checkFeatureEnabled()}
        showPaywallModal={this.showModal}
        { ...rest } />
    );
  }
}

const mapStateToProps = state => ({
  isPrivateInstance: state.global.paywall.isPrivateInstance,
  features: state.global.paywall.features,
  paywallModalVisible: state.global.paywall.paywallModalVisible
});

const mapDispatchToProps = dispatch => ({
  paywallActions: {
    ...bindActionCreators({
      showPaywallModal,
    }, dispatch)
  }
});

function withPaywall(features) {
  let featuresArray = [];
  if (typeof features === 'string') {
    featuresArray.push(features);
  } else {
    featuresArray = featuresArray.concat(features);
  }
  return (WrappedComponent) => {
    const ConnectedPaywall = connect(mapStateToProps, mapDispatchToProps)(Paywall);
    return props => <ConnectedPaywall componentFeatures={featuresArray} WrappedComponent={WrappedComponent} {...props} />;
  };
}

export default withPaywall;



// WEBPACK FOOTER //
// ./src/components/hocs/paywall.js