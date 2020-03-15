import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';

export const styles = theme => ({
  root: {
    display: 'inline-block',
    margin: '0 5px',
    padding: '0 5px',
  },
  badge: {
    fontFamily: theme.typography.fontFamily,
    fontWeight: theme.typography.fontWeight,
    fontSize: '12px',
    borderRadius: '50%',
    backgroundColor: theme.palette.color,
    color: theme.palette.textColor,
    zIndex: 1, // Render the badge on top of potential ripples.
  },
  colorPrimary: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
});

function Badge(props) {
  const {
    badgeContent,
    classes,
    className: classNameProp,
  } = props;

  const badgeClassName = classNames(classes.badge, {
    [classes.colorPrimary]: true,
  });

  return (
    <span className={classNames(classes.root, classNameProp, badgeClassName)}>{badgeContent}</span>
  );
}

Badge.defaultProps = {
  className: '',
};

Badge.propTypes = {
  badgeContent: PropTypes.node.isRequired,
  classes: PropTypes.object.isRequired,
  className: PropTypes.string,
};


export default withStyles(styles, { name: 'MuiBadge' })(Badge);



// WEBPACK FOOTER //
// ./src/components/notifications/counterBadge.js