import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Icon from '@material-ui/core/Icon';
import ButtonBase from '@material-ui/core/ButtonBase';
import Hidden from '@material-ui/core/Hidden';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import AnimateOnChange from 'react-animate-on-change';
import { getChangeColor, formatCurrency, formatChangePct } from '../../utils/helpers';
import ChangeArrow from '../icons/changeArrow';

const animationClassGreen = 'animateChangeGreen';
const animationClassRed = 'animateChangeRed';

const styles = theme => ({
  outerGrid: {
    padding: '5px 20px',
  },
  backButton: {
    color: theme.palette.text.secondary,
    fontSize: '16px'
  },
  label: {
    color: theme.palette.text.secondary,
    fontSize: '12px',
    lineHeight: '15px',
    textAlign: 'center',
    [theme.breakpoints.down(600)]: {
      display: 'inline-block',
      lineHeight: '21px',
    }
  },
  value: {
    fontSize: '20px',
    fontWeight: '600',
    lineHeight: '24px',
    textAlign: 'center',
    marginTop: '7px',
    color: theme.palette.text.primary,
    [theme.breakpoints.down(600)]: {
      display: 'inline-block',
      fontSize: '16px',
      lineHeight: '22px',
      float: 'right',
      marginTop: '0px',
    }
  },
  [`${animationClassGreen}`]: {
    animation: 'colorGreen 2000ms linear both'
  },
  [`${animationClassRed}`]: {
    animation: 'colorRed 2000ms linear both'
  },
  '@keyframes colorGreen': {
    '0%': {
      color: theme.palette.icons.green,
    },
    '100%': {
      color: theme.palette.text.primary,
    },
  },
  '@keyframes colorRed': {
    '0%': {
      color: theme.palette.icons.red,
    },
    '100%': {
      color: theme.palette.text.primary,
    },
  }
});

class ProfileSummary extends Component {
  constructor() {
    super();

    this.oldAvgPrice = 0;
  }

  render() {
    const {
      classes, prefCurrency, theme, avgPrice, change24h, percentChange, volume24h
    } = this.props;

    let animate = false;
    let animationClass = animationClassGreen;

    if (avgPrice !== this.oldAvgPrice) {
      animate = true;
      animationClass = (avgPrice > this.oldAvgPrice) ? animationClassGreen : animationClassRed;
    }

    this.oldAvgPrice = avgPrice;
    return (
      <Grid container spacing={8} className={classes.outerGrid}>
        <Grid item xs={12} md={1} style={{ display: 'flex', alignContent: 'center' }} sm>
          <ButtonBase className={classes.backButton} component={Link} to="/market"><Icon>arrow_back</Icon> Back</ButtonBase>
        </Grid>
        <Grid item xs={12} sm>
          <Typography className={classes.label}>Global Avg Price ({prefCurrency})</Typography>
          <Typography className={classes.value}>
            <AnimateOnChange
              animationClassName={classes[animationClass]}
              animate={animate}>
              {formatCurrency(prefCurrency, avgPrice)}
            </AnimateOnChange>
          </Typography>
        </Grid>
        <Grid item xs={12} sm>
          <Typography className={classes.label}>24h Change</Typography>
          <Typography
            className={classes.value}
            style={{
              color: getChangeColor(change24h, theme)
            }}>
            {formatCurrency(prefCurrency, change24h)}
            <ChangeArrow change={parseFloat(change24h)} />
          </Typography>
        </Grid>
        <Grid item xs={12} sm>
          <Typography className={classes.label}>24h % Change</Typography>
          <Typography
            className={classes.value}
            style={{
              color: getChangeColor(percentChange, theme)
            }}>
            {formatChangePct(prefCurrency, percentChange)}
            <ChangeArrow change={parseFloat(percentChange)} />
          </Typography>
        </Grid>
        <Grid item xs={12} sm>
          <Typography className={classes.label}>24h Volume</Typography>
          <Typography className={classes.value}>{formatCurrency(prefCurrency, volume24h, true)}</Typography>
        </Grid>
        <Hidden xsDown>
          <Grid item xs={12} sm>
            <a href="https://messari.io" target="__blank">
              <img src="/platform/static/images/sponsored-by-messari.svg" alt="Sponsored by Messari" />
            </a>
          </Grid>
        </Hidden>
      </Grid>
    );
  }
}

ProfileSummary.defaultProps = {
  avgPrice: 0,
  change24h: 0,
  percentChange: 0,
  volume24h: 0,
};

ProfileSummary.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  prefCurrency: PropTypes.string.isRequired,
  avgPrice: PropTypes.number,
  change24h: PropTypes.number,
  percentChange: PropTypes.number,
  volume24h: PropTypes.number
};

export default withStyles(styles, { withTheme: true })(ProfileSummary);



// WEBPACK FOOTER //
// ./src/components/coins/profileSummary.js