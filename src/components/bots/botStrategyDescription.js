import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
  root: {
    padding: '1.0714rem'
  },
  heading: {
    marginTop: '1.875rem',
    marginBottom: '1.875rem',
    color: theme.palette.text.secondary,
    fontWeight: '600'
  },
  desc: {
    marginBottom: '1.875rem'
  },
  link: {
    textDecoration: 'none'
  },
  typographyLink: {
    color: '#52B0B0',
    fontWeight: '600'
  }
});

const BotStrategyDescription = ({ classes, desc, link }) => (
  <div className={classes.root}>
    <Typography variant="subtitle1" className={classes.heading}>How does it work?</Typography>
    <Typography className={classes.desc}>{desc}</Typography>
    <a className={classes.link} href={link} rel="noopener noreferrer" target="_blank">
      <Typography className={classes.typographyLink}>Learn More</Typography>
    </a>
  </div>
);

BotStrategyDescription.propTypes = {
  classes: PropTypes.object.isRequired,
  desc: PropTypes.string.isRequired,
  link: PropTypes.string.isRequired,
};

export default withStyles(styles, { withTheme: true })(BotStrategyDescription);



// WEBPACK FOOTER //
// ./src/components/bots/botStrategyDescription.js