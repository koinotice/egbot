import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { withStyles, withTheme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Divider from '@material-ui/core/Divider';
import { PulseLoader } from 'react-spinners';
import PropTypes from 'prop-types';
import { isoToDateTime } from '../../utils/time';

const styles = theme => ({
  progressContainer: {
    height: '100%',
  },
  lastLogin: {
    marginBottom: '1.875rem'
  },
  heading: {
    marginBottom: '1.875rem',
    fontWeight: '600'
  },
  row: {
    fontWeight: '300',
    display: 'flex'
  },
  label: {
    width: '5.0625rem',
    display: 'inline',
    marginRight: '0.625rem',
    color: theme.palette.text.secondary
  },
  value: {
    display: 'inline',
    fontWeight: '600'
  },
  faqLinkWrapper: {
    marginBottom: '0.625rem',
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
  [theme.breakpoints.down('md')]: {
    row: {
      display: 'initial'
    },
    label: {
      display: 'block'
    },
    value: {
      display: 'block'
    }
  },
});

class SideContent extends Component {
  formatLocation = (city, country) => {
    if (!city || !country) return 'Unknown';
    return `${city}, ${country}`;
  }

  renderLoader() {
    const { classes } = this.props;

    return (
      <Grid container alignItems="center" justify="center" className={classes.progressContainer}>
        <PulseLoader size={6} color="#52B0B0" loading />
      </Grid>
    );
  }

  renderLastLogin() {
    const { classes, lastLogin } = this.props;

    if (lastLogin && Object.keys(lastLogin).length) {
      return (
        <div className={classes.lastLogin}>
          <Typography variant="subtitle1" className={classes.heading}>Last Login</Typography>
          <div className={classes.row}>
            <Typography className={classes.label}>Date/Time:</Typography>
            <Typography className={classes.value}>{isoToDateTime(lastLogin.created_timestamp)}</Typography>
          </div>
          <div className={classes.row}>
            <Typography className={classes.label}>IP Address:</Typography>
            <Typography className={classes.value}>{lastLogin.ip_address}</Typography>
          </div>
          <div className={classes.row}>
            <Typography className={classes.label}>Location:</Typography>
            <Typography className={classes.value}>{this.formatLocation(lastLogin.city, lastLogin.country)}</Typography>
          </div>
        </div>
      );
    }
  }

  render() {
    const { classes, isLoaded } = this.props;

    return (
      <Fragment>
        { isLoaded ? this.renderLastLogin() : this.renderLoader() }

        <Divider />
        <br />
        <br />
        <Typography variant="subtitle1" className={classes.heading}>FAQs</Typography>
        <div>
          <div className={classes.faqLinkWrapper}>
            <a
              className={classes.link}
              href="https://support.quadency.com/account-and-security/what-is-2fa"
              rel="noopener noreferrer"
              target="_blank">
              <Typography className={classes.faqTypography}>What is 2FA?</Typography>
            </a>
          </div>
          <div className={classes.faqLinkWrapper}>
            <a
              className={classes.link}
              href="https://support.quadency.com/platform-setup-and-exchange-linking/how-do-i-link-an-exchange"
              rel="noopener noreferrer"
              target="_blank">
              <Typography className={classes.faqTypography}>How do I link an exchange?</Typography>
            </a>
          </div>
          <div className={classes.faqLinkWrapper}>
            <a
              className={classes.link}
              href="https://support.quadency.com/platform-setup-and-exchange-linking/what-are-exchange-apis"
              rel="noopener noreferrer"
              target="_blank">
              <Typography className={classes.faqTypography}>What are exchange APIs?</Typography>
            </a>
          </div>
          <div className={classes.faqLinkWrapper}>
            <a
              className={classes.link}
              href="https://support.quadency.com/"
              rel="noopener noreferrer"
              target="_blank">
              <Typography className={classes.faqTypographyLink}>Visit Support Center</Typography>
            </a>
          </div>
        </div>
      </Fragment>
    );
  }
}

SideContent.defaultProps = {
  lastLogin: {},
};

SideContent.propTypes = {
  classes: PropTypes.object.isRequired,
  lastLogin: PropTypes.object,
  isLoaded: PropTypes.bool.isRequired
};

function mapStateToProps(state) {
  return {
    lastLogin: state.global.user.userActivity.lastLogin,
    isLoaded: state.global.user.userActivityLoaded
  };
}

const base = withTheme()(withStyles(styles)(SideContent));
export default connect(mapStateToProps)(base);



// WEBPACK FOOTER //
// ./src/components/settings/sideContent.js