import React from 'react';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import { ClockLoader } from 'react-spinners';
import PropTypes from 'prop-types';

const styles = {
  progress: {
    backgroundColor: '#000',
  },
  img: {
    width: '4.571rem',
    height: '4.571rem',
    marginBottom: '0.7714rem'
  },
  clockLoader: {
    margin: '15px 0',
    width: '100%',
    display: 'flex',
    justifyContent: 'center'
  },
  text: {
    fontWeight: 600,
  },
  live: {
    textAlign: 'center',
    paddingTop: '0.7143rem',
  }
};

const ConfigItemLiveStarted = ({
  classes,
}) => {
  return (
    <Grid className={classes.live} container spacing={0} justify="center" alignItems="center">
      <Grid item xs={1} />
      <Grid item xs={10}>
        <div className={classes.clockLoader}>
          <ClockLoader size={50} margin={8} color="#52B0B0" />
        </div>
        <Typography className={classes.text}>
          Bot has been started in live mode.
        </Typography>
      </Grid>
      <Grid item xs={1} />
    </Grid>
  );
};

ConfigItemLiveStarted.defaultProps = {
};


ConfigItemLiveStarted.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(ConfigItemLiveStarted);



// WEBPACK FOOTER //
// ./src/components/bots/configItemLiveStarted.js