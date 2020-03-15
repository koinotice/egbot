import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { formatCurrency, formatAmount, getPriceInPrefCurrency } from '../../utils/helpers';

class Formatted extends Component {
  render() {
    const {
      asset,
      forex,
      prices,
      price24h,
      amount,
      convertTo,
      convertToPref,
      prefCurrency,
      abbreviate,
    } = this.props;

    if (!Object.keys(prices).length || !Object.keys(forex).length) return '';

    if (convertTo) { // convert to a specific currency
      return (
        <span>{formatCurrency(convertTo, amount * getPriceInPrefCurrency(asset, convertTo, prices, forex, price24h), abbreviate)}</span>
      );
    }

    if (convertToPref) { // convert to user's preferred currency
      return (
        <span>{formatCurrency(prefCurrency, amount * getPriceInPrefCurrency(asset, prefCurrency, prices, forex, price24h), abbreviate)}</span>
      );
    }
    const assetToFormat = asset || prefCurrency;
    // don't convert, just format
    return (
      <span>{formatAmount(assetToFormat, amount, abbreviate)}</span>
    );
  }
}

Formatted.defaultProps = {
  asset: null,
  amount: 1,
  convertTo: null,
  convertToPref: false,
  price24h: false,
  abbreviate: false,
};

Formatted.propTypes = {
  asset: PropTypes.string, // symbol of asset to convert or format
  amount: PropTypes.number, // amount to convert or format
  convertTo: PropTypes.string, // ie BTC ( symbol currency to convert to)
  convertToPref: PropTypes.bool, // whether to convert to user's preferred currency
  price24h: PropTypes.bool, // whether to use price from 24h ago
  abbreviate: PropTypes.bool, // whether to abbreviate value (m for millions etc)
  prefCurrency: PropTypes.string.isRequired,
  forex: PropTypes.object.isRequired,
  prices: PropTypes.object.isRequired,
};

function mapStateToProps(state) {
  return {
    prefCurrency: state.global.user.user.preferences.pref_currency,
    prices: state.global.prices.prices,
    forex: state.global.forex.forex,
  };
}

export default connect(mapStateToProps)(Formatted);



// WEBPACK FOOTER //
// ./src/components/common/formatted.js