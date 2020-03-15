import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Hidden from '@material-ui/core/Hidden';
import { withStyles, withTheme } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { getChangeColor, formatCurrency, formatChangePct } from '../../utils/helpers';
import ChangeArrow from '../icons/changeArrow';

const styles = theme => ({
  outerGrid: {
    padding: '5px 20px',
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
});

class CoinsSummary extends Component {
  render() {
    const {
      classes,
      theme,
      totalMarketCap,
      change,
      percentChange,
      volume24h,
      btcDom,
      prefCurrency,
    } = this.props;

    return (
      <Grid container spacing={8} className={classes.outerGrid}>
        <Grid item xs={12} sm>
          <Typography className={classes.label}>Total Market Cap ({prefCurrency})</Typography>
          <Typography className={classes.value}>{
            formatCurrency(prefCurrency, totalMarketCap, true)
          }
          </Typography>
        </Grid>
        <Grid item xs={12} sm>
          <Typography className={classes.label}>24h Change</Typography>
          <Typography
            className={classes.value}
            style={{
              color: getChangeColor(change, theme)
            }} >
            {formatCurrency(prefCurrency, change, true)}
            <ChangeArrow change={parseFloat(change)} />
          </Typography>
        </Grid>
        <Grid item xs={12} sm>
          <Typography className={classes.label}>24h % Change</Typography>
          <Typography
            className={classes.value}
            style={{
              color: getChangeColor(percentChange, theme)
            }} >
            {formatChangePct(prefCurrency, percentChange)}
            <ChangeArrow change={parseFloat(percentChange)} />
          </Typography>
        </Grid>
        <Grid item xs={12} sm>
          <Typography className={classes.label}>24hr Volume</Typography>
          <Typography className={classes.value}>{formatCurrency(prefCurrency, volume24h, true)}</Typography>
        </Grid>
        <Grid item xs={12} sm>
          <Typography className={classes.label}>BTC Dominance</Typography>
          <Typography className={classes.value}>{`${(btcDom * 100).toFixed(2)}%`}</Typography>
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

CoinsSummary.defaultProps = {
  totalMarketCap: 0,
  change: 0,
  percentChange: 0,
  volume24h: 0,
  btcDom: 0,
};

CoinsSummary.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  totalMarketCap: PropTypes.number,
  change: PropTypes.number,
  percentChange: PropTypes.number,
  volume24h: PropTypes.number,
  btcDom: PropTypes.number,
  prefCurrency: PropTypes.string.isRequired
};

export default withStyles(styles)(withTheme()(CoinsSummary));



// WEBPACK FOOTER //
// ./src/components/coins/coinsSummary.js