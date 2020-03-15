import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import PropTypes from 'prop-types';

const DEFAULT_ICON = 'quad_default_bot_icon';
const getIconPath = icon => (`/platform/static/images/${icon}.svg`);

const BotIcon = ({ className, icon }) => (
  <Avatar
    src={getIconPath(icon)}
    imgProps={{
      onError: (event) => {
        event.target.src = getIconPath(DEFAULT_ICON);
      }
    }}
    className={className} />
);

BotIcon.defaultProps = {
  className: ''
};

BotIcon.propTypes = {
  className: PropTypes.string,
  icon: PropTypes.string.isRequired,
};

export default BotIcon;



// WEBPACK FOOTER //
// ./src/components/bots/botIcon.js