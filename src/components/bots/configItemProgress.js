import React from 'react';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import LinearProgress from '@material-ui/core/LinearProgress';
import PropTypes from 'prop-types';

const styles = {
  progress: {
    backgroundColor: '#000',
  },
  img: {
    width: '4.571rem',
    height: '4.571rem',
    marginBottom: '1.0714rem'
  },
  progressText: {
    marginTop: '0.8571rem',
    fontWeight: 600,
  },
  backtest: {
    textAlign: 'center',
    paddingTop: '0.7143rem',
  }
};

const ConfigItemProgress = ({
  classes,
  progress,
}) => {
  const getProgressText = () => (progress ? `Backtest in progress...(${progress}%)` : 'Initializing data...');
  return (
    <Grid className={classes.backtest} container spacing={0} justify="center" alignItems="center">
      <Grid item xs={1} />
      <Grid item xs={10}>
        <img className={classes.img} src="/platform/static/images/gears.svg" alt="gears" />
        <LinearProgress
          classes={{ colorPrimary: classes.progress }}
          variant="determinate"
          value={progress} />
        <Typography className={classes.progressText}>
          {getProgressText()}
        </Typography>
      </Grid>
      <Grid item xs={1} />
    </Grid>
  );
};

ConfigItemProgress.defaultProps = {
  progress: 0,
};


ConfigItemProgress.propTypes = {
  classes: PropTypes.object.isRequired,
  progress: PropTypes.number,
};

export default withStyles(styles, { withTheme: true })(ConfigItemProgress);



// WEBPACK FOOTER //
// ./src/components/bots/configItemProgress.js