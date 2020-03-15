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
  subHeading: {
    fontWeight: 600,
    color: theme.palette.text.secondary
  },
  gridContainer: {
    marginBottom: '2.142857142857143rem'
  },
  secret: {
    fontWeight: '600'
  },
  [theme.breakpoints.down('xs')]: {
    qrItem: {
      textAlign: 'center',
      marginBottom: '1.0714285714285714rem'
    }
  }
});

class QRView extends Component {
  componentDidMount() {
    const { generateSecret } = this.props;

    generateSecret();
  }

  render() {
    const {
      secret,
      qrCode,
      classes
    } = this.props;

    return (
      <Fragment>
        <Typography className={classes.text}>Step 2) Use the Google Authenticator app to scan the barcode below</Typography>
        <Grid className={classes.gridContainer} container justify="space-around" alignItems="center">
          <Grid className={classes.qrItem} item md={2} sm={12} xs={12}>
            <img src={qrCode} alt={secret} />
          </Grid>
          <Grid item md={5} sm={12} xs={12}>
            <Typography className={classes.text}>Write down this backup key in a safe place in case you lose your device:</Typography>
            <Typography className={classes.subHeading} variant="subtitle1">Backup Key</Typography>
            <Typography className={classes.secret}>{secret}</Typography>
          </Grid>
        </Grid>
      </Fragment>
    );
  }
}

QRView.defaultProps = {
  secret: null,
  qrCode: null
};

QRView.propTypes = {
  generateSecret: PropTypes.func.isRequired,
  secret: PropTypes.string,
  qrCode: PropTypes.string,
  classes: PropTypes.object.isRequired
};

export default withTheme()(withStyles(styles)(QRView));



// WEBPACK FOOTER //
// ./src/components/settings/qrView.js