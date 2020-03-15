import React from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';

const styles = theme => ({
  backtest: {
    textAlign: 'center'
  },
  textPrimary: {
    lineHeight: 'initial'
  },
  textSecondary: {
    lineHeight: 'initial',
    color: theme.palette.text.secondary
  }
});

const ICON_SIZES = {
  small: {
    width: '5.357rem',
    height: '5.357rem'
  },
  large: {
    width: '6.571rem',
    height: '6.571rem'
  }
};

const ConfigItemStateCover = ({
  classes, iconSize, primaryText, secondaryText, iconSpaced
}) => (
  <Grid className={classes.backtest} spacing={0} justify="center" alignItems="center" container>
    <Grid xs={1} item />
    <Grid xs={10} item>
      <img
        style={{ margin: iconSpaced ? '2.1429rem' : 'initial', ...ICON_SIZES[iconSize] }}
        src="/platform/static/images/sad-bot.svg"
        alt="sad bot" />
      <Typography className={classes.textPrimary} variant="subtitle1">{primaryText}</Typography>
      <Typography className={classes.textSecondary} variant="subtitle2">{secondaryText}</Typography>
    </Grid>
    <Grid xs={1} item />
  </Grid>
);

ConfigItemStateCover.defaultProps = {
  iconSize: 'small',
  primaryText: '',
  secondaryText: '',
  iconSpaced: false
};

ConfigItemStateCover.propTypes = {
  classes: PropTypes.object.isRequired,
  iconSize: PropTypes.string,
  primaryText: PropTypes.string,
  secondaryText: PropTypes.string,
  iconSpaced: PropTypes.bool
};

export default withStyles(styles, { withTheme: true })(ConfigItemStateCover);



// WEBPACK FOOTER //
// ./src/components/bots/configItemStateCover.js