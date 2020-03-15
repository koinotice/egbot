import React from 'react';
import PropTypes from 'prop-types';
import Prompt from './prompt';

const PaywallModal = ({ title, visible, hide }) => (
  <Prompt
    open={visible}
    onClose={hide}
    img="flat-rocket.svg"
    title={title}
    subheading={
      <p> Upgrade now to get:
        <ul style={{ padding: 0, textAlign: 'left', listStyleImage: 'url(/platform/static/images/bullet.svg)' }}>
          <li>Higher trading limits on all integrated exchanges</li>
          <li>Advanced automated trading and backtesting features</li>
          <li>Access to Unified APIs and custom algo builder</li>
        </ul>
      </p>
    }
    buttonOne={{
      color: 'primary',
      variant: 'contained',
      text: 'Upgrade',
      onClick: () => { location.href = '/pricing'; }
    }}
    buttonTwo={{
      color: 'secondary',
      variant: 'outlined',
      text: 'Close',
      onClick: hide
    }} />
);

PaywallModal.defaultProps = {
  title: 'This feature is not available in your current plan',
};

PaywallModal.propTypes = {
  title: PropTypes.string,
  visible: PropTypes.bool.isRequired,
  hide: PropTypes.func.isRequired,
};

export default PaywallModal;




// WEBPACK FOOTER //
// ./src/components/common/paywallModal.js