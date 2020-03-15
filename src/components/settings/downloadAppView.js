import React, { Component, Fragment } from 'react';
import { withStyles, withTheme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import PropTypes from 'prop-types';

const styles = theme => ({
  text: {
    lineHeight: '1.2857142857142858rem',
    marginBottom: '2.857142857142857rem'
  },
  appleBadge: {
    margin: '6%',
    width: '80%'
  },
  badgesGrid: {
    marginBottom: '5rem'
  },
  [theme.breakpoints.down('sm')]: {
    appleBadge: {
      width: '88%'
    }
  }
});

class DownloadAppView extends Component {
  render() {
    const { classes } = this.props;

    return (
      <Fragment>
        <Typography className={classes.text}>Step 1) Download the Google Authenticator App</Typography>
        <Grid className={classes.badgesGrid} container justify="space-around">
          <Grid item md={5} xs={8}>
            <a
              href="https://itunes.apple.com/us/app/google-authenticator/id388497605?mt=8"
              rel="noopener noreferrer"
              target="_blank">
              <img className={classes.appleBadge} src="/platform/static/images/app-store-badge.svg" alt="App Store" />
            </a>
          </Grid>
          <Grid item md={5} xs={8}>
            <a
              href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2&hl=en_US"
              rel="noopener noreferrer"
              target="_blank">
              <img src="/platform/static/images/google-play-badge.svg" alt="Play Store" />
            </a>
          </Grid>
        </Grid>
      </Fragment>
    );
  }
}

DownloadAppView.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withTheme()(withStyles(styles)(DownloadAppView));



// WEBPACK FOOTER //
// ./src/components/settings/downloadAppView.js