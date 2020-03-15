import React, { Component } from 'react';
import PropTypes from 'prop-types';
import '../../assets/icons/cryptocurrency-icons-svg-color.css';

class CoinIcon extends Component {
  render() {
    const { coin, className } = this.props;
    return (
      <span className={`crypto-icon-32 crypto-icon-svg-color crypto-icon-svg-color-${coin} ${className}`}
        style={{ background: `url('data:image/svg+xml;utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><style>.text {font-family: sans-serif; font-size: 10px; fill:%23FFF;}</style><circle class="cls-1" cx="16" cy="16" r="16" fill="%231d5baa"/><text x="50%" y="63%" text-anchor="middle" class="text">${coin.toUpperCase()}</text></svg>')` }} />
    );
  }
}

CoinIcon.defaultProps = {
  className: ''
};

CoinIcon.propTypes = {
  coin: PropTypes.string.isRequired,
  className: PropTypes.string
};

export default CoinIcon;



// WEBPACK FOOTER //
// ./src/components/icons/coinIcon.js