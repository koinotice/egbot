import React, { Fragment } from 'react';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { formatCurrency, formatAmount, formatChangePct } from '../../utils/helpers';
import TooltipIcon from '../common/tooltipIcon';

const styles = theme => ({
  flexRow: {
    display: 'flex',
    justifyContent: 'space-between',
    margin: '0.5714rem 0'
  },
  label: {
    color: theme.palette.text.secondary,
    fontSize: '0.8571rem'
  },
  value: {
    fontWeight: 'bold'
  },
  header: {
    fontWeight: 'bold',
    marginTop: '2.1429rem'
  }
});

const Stats = ({
  classes,
  rank,
  marketCap,
  circulatingSupply,
  y2050MarketCap,
  y2050Supply,
  y2050PercentSupplyIssued,
  athPrice,
  athDate,
  athPercentDown,
  roiOneWeek,
  roiOneMonth,
  roiThreeMonths,
  roiOneYear,
  prefCurrency
}) => (
  <Fragment>
    <div className={classes.flexRow}>
      <Typography className={classes.label}>Rank</Typography>
      <Typography className={classes.value}>
        { rank || 'No Data' }
      </Typography>
    </div>
    <div className={classes.flexRow}>
      <Typography className={classes.label}>
        Market Cap ({prefCurrency})
        <TooltipIcon title="The Market Capitalization of an asset is defined as the currently-available supply times the current price." />
      </Typography>
      <Typography className={classes.value}>
        { marketCap ? formatCurrency(prefCurrency, marketCap, true) : 'No Data' }
      </Typography>
    </div>
    <div className={classes.flexRow}>
      <Typography className={classes.label}>
        Market Cap Y2050 ({prefCurrency})
        <TooltipIcon title="The Y2050 Marketcap is the implied value of the total expected supply of an asset on Jan 1st 2050." />
      </Typography>
      <Typography className={classes.value}>
        { y2050MarketCap ? formatCurrency(prefCurrency, y2050MarketCap, true) : 'No Data' }
      </Typography>
    </div>
    <div className={classes.flexRow}>
      <Typography className={classes.label}>Circulating Supply</Typography>
      <Typography className={classes.value}>
        { circulatingSupply ? formatAmount(null, circulatingSupply, true) : 'No Data' }
      </Typography>
    </div>
    <div className={classes.flexRow}>
      <Typography className={classes.label}>
        Y2050 Supply
        <TooltipIcon title="The Y2050 Supply refers to the estimated supply of coins that will be available on January 1st 2050. This is roughly equivalent to the 'fully diluted shares' figure commonly used in equity finance " />
      </Typography>
      <Typography className={classes.value}>
        { y2050Supply ? formatAmount(null, y2050Supply, true) : 'No Data' }
      </Typography>
    </div>
    <div className={classes.flexRow}>
      <Typography className={classes.label}>
        % Y2050 Supply Issued
        <TooltipIcon title="This is the percent of the Y2050 supply that's currently available on the market today." />
      </Typography>
      <Typography className={classes.value}>
        { y2050PercentSupplyIssued ? `${y2050PercentSupplyIssued.toFixed(2)}%` : 'No Data' }
      </Typography>
    </div>
    <div className={classes.flexRow}>
      <Typography className={classes.label}>All Time High { athDate ? `(${athDate})` : null } ({prefCurrency})</Typography>
      <Typography className={classes.value}>
        { athPrice ? formatCurrency(prefCurrency, athPrice, true) : 'No Data' }
      </Typography>
    </div>
    <div className={classes.flexRow}>
      <Typography className={classes.label}>% Down from ATH</Typography>
      <Typography className={classes.value}>
        { athPercentDown ? `${athPercentDown.toFixed(2)}%` : 'No Data' }
      </Typography>
    </div>
    <Typography className={classes.header}>Historical ROI</Typography>
    <div className={classes.flexRow}>
      <Typography className={classes.label}>1 Week</Typography>
      <Typography className={classes.value}>
        { roiOneWeek ? formatChangePct(null, roiOneWeek / 100) : 'No Data' }
      </Typography>
    </div>
    <div className={classes.flexRow}>
      <Typography className={classes.label}>1 Month</Typography>
      <Typography className={classes.value}>
        { roiOneMonth ? formatChangePct(null, roiOneMonth / 100) : 'No Data' }
      </Typography>
    </div>
    <div className={classes.flexRow}>
      <Typography className={classes.label}>3 Months</Typography>
      <Typography className={classes.value}>
        { roiThreeMonths ? formatChangePct(null, roiThreeMonths / 100) : 'No Data' }
      </Typography>
    </div>
    <div className={classes.flexRow}>
      <Typography className={classes.label}>1 Year</Typography>
      <Typography className={classes.value}>
        { roiOneYear ? formatChangePct(null, roiOneYear / 100) : 'No Data' }
      </Typography>
    </div>
  </Fragment>
);

Stats.defaultProps = {
  marketCap: undefined,
  circulatingSupply: undefined,
  y2050MarketCap: undefined,
  y2050Supply: undefined,
  y2050PercentSupplyIssued: undefined,
  athPrice: undefined,
  athDate: undefined,
  athPercentDown: undefined,
  roiOneWeek: undefined,
  roiOneMonth: undefined,
  roiThreeMonths: undefined,
  roiOneYear: undefined,
  rank: undefined
};

Stats.propTypes = {
  classes: PropTypes.object.isRequired,
  marketCap: PropTypes.string,
  circulatingSupply: PropTypes.string,
  y2050MarketCap: PropTypes.number,
  y2050Supply: PropTypes.number,
  y2050PercentSupplyIssued: PropTypes.number,
  athPrice: PropTypes.number,
  athDate: PropTypes.string,
  athPercentDown: PropTypes.number,
  roiOneWeek: PropTypes.number,
  roiOneMonth: PropTypes.number,
  roiThreeMonths: PropTypes.number,
  roiOneYear: PropTypes.number,
  rank: PropTypes.string,
  prefCurrency: PropTypes.string.isRequired,
};

export default withStyles(styles, { withTheme: true })(Stats);



// WEBPACK FOOTER //
// ./src/components/coins/stats.js