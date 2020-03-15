import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

const styles = theme => ({
  heading: {
    marginLeft: '1.1429rem',
    marginBottom: '1.875rem',
    fontWeight: '600'
  },
  faqLinkWrapper: {
    marginBottom: '0.625rem',
    marginLeft: '1.1429rem'
  },
  faqTypography: {
    color: theme.palette.text.secondary
  },
  faqTypographyLink: {
    color: '#52B0B0',
    fontWeight: '600'
  },
  link: {
    textDecoration: 'none',
  },
});

const BotsFaq = ({ classes }) => (
  <Fragment>
    <Typography variant="subtitle1" className={classes.heading}>FAQs</Typography>
    <div>
      <div className={classes.faqLinkWrapper}>
        <a
          className={classes.link}
          href="https://support.quadency.com/en/articles/3105689-what-are-bots"
          rel="noopener noreferrer"
          target="_blank">
          <Typography className={classes.faqTypography}>What are bots?</Typography>
        </a>
      </div>
      <div className={classes.faqLinkWrapper}>
        <a
          className={classes.link}
          href="https://support.quadency.com/en/articles/3240621-quadency-bots-quickstart-guide"
          rel="noopener noreferrer"
          target="_blank">
          <Typography className={classes.faqTypography}>How do I get started?</Typography>
        </a>
      </div>
      <div className={classes.faqLinkWrapper}>
        <a
          className={classes.link}
          href="https://support.quadency.com/en/articles/3108246-can-i-run-multiple-bots-simultaneously"
          rel="noopener noreferrer"
          target="_blank">
          <Typography className={classes.faqTypography}>Can I run multiple bots?</Typography>
        </a>
      </div>
      <div className={classes.faqLinkWrapper}>
        <a
          className={classes.link}
          href="https://support.quadency.com/en/articles/3108236-what-is-a-backtest"
          rel="noopener noreferrer"
          target="_blank">
          <Typography className={classes.faqTypography}>What is a backtest?</Typography>
        </a>
      </div>
      <div className={classes.faqLinkWrapper}>
        <a
          className={classes.link}
          href="https://support.quadency.com/en/collections/1814576-automated-trading-bots#getting-started-with-bots"
          rel="noopener noreferrer"
          target="_blank">
          <Typography className={classes.faqTypographyLink}>Visit Support Center</Typography>
        </a>
      </div>
    </div>
  </Fragment>
);

BotsFaq.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(BotsFaq);



// WEBPACK FOOTER //
// ./src/components/bots/botsFaq.js