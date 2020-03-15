import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';

const styles = () => ({
  link: {
    textDecoration: 'none'
  }
});

const Breadcrumb = ({
  classes, theme, text, link
}) => (
  <Link
    className={classes.link}
    style={{ color: (link !== '#') ? theme.palette.text.primary : theme.palette.text.secondary }}
    to={link}>
    {text}
  </Link>
);

Breadcrumb.defaultProps = {
  link: '#'
};

Breadcrumb.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  text: PropTypes.string.isRequired,
  link: PropTypes.string,
};

export default withStyles(styles, { withTheme: true })(Breadcrumb);



// WEBPACK FOOTER //
// ./src/components/breadcrumbs/breadcrumb.js