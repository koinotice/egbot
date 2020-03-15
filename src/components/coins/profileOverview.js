import React from 'react';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import PropTypes from 'prop-types';
import Stats from './stats';
import Chart from './chart';
import { CHART_TIMEFRAMES } from '../../store/ducks/coins/overview';


const styles = theme => ({
  mt30: {
    marginTop: '2.1429rem'
  },
  mt60: {
    marginTop: '4.2857rem'
  },
  header: {
    fontWeight: 'bold',
    marginBottom: '1.0714rem'
  },
  chartControlBar: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  formLabel: {
    display: 'flex',
    alignItems: 'center',
    marginRight: '0.5714rem'
  },
  formGroup: {
    margin: '0.5714rem 0 0 2.2857rem'
  },
  select: {
    top: '0.0714rem'
  },
  tabs: {
    display: 'inline-block',
    position: 'relative',
    [theme.breakpoints.down(600)]: {

    },
  },
  tab: {
    minWidth: '25px',
    height: '25px',
    textTransform: 'none',
    fontSize: '1rem',
    color: theme.palette.text.primary
  },
  textCenter: {
    textAlign: 'center'
  },
  button: {
    textTransform: 'initial',
    margin: '1.0714rem 0'
  },
  statsGrid: {
    marginTop: '0.5rem'
  }
});

const ProfileOverview = ({
  classes, name, rank, marketCap, circulatingSupply, y2050, allTimeHigh, roi, chart, chartTimeFrame, updateChartTimeFrame, updateChartQuote, chartLoaded, background, prefCurrency, symbol, chartMarkets, chartQuote
}) => {
  const renderChartMarketMenuItems = () => {
    return chartMarkets.map(market => (
      <MenuItem key={market} value={market}>{market}</MenuItem>
    ));
  };

  return (
    <Grid container spacing={16}>
      <Grid className={classes.statsGrid} item xs={12} md={4}>
        <Stats
          rank={rank}
          marketCap={marketCap}
          circulatingSupply={circulatingSupply}
          y2050MarketCap={y2050.marketCap}
          y2050Supply={y2050.supply}
          y2050PercentSupplyIssued={y2050.percentSupplyIssued}
          athPrice={allTimeHigh.price}
          athDate={allTimeHigh.date}
          athPercentDown={allTimeHigh.percentDown}
          roiOneWeek={roi.oneWeek}
          roiOneMonth={roi.oneMonth}
          roiThreeMonths={roi.threeMonth}
          roiOneYear={roi.oneYear}
          prefCurrency={prefCurrency} />
      </Grid>
      <Grid item xs={12} md={8}>
        <div className={classes.chartControlBar}>
          <FormControl className={classes.formGroup}>
            <Select
              value={chartQuote}
              onChange={updateChartQuote}
              className={classes.select}
              disableUnderline>
              {renderChartMarketMenuItems()}
            </Select>
          </FormControl>
          <Tabs className={classes.tabs} indicatorColor="primary" value={chartTimeFrame} onChange={updateChartTimeFrame}>
            <Tab className={classes.tab} label="1D" value={CHART_TIMEFRAMES.DAY} />
            <Tab className={classes.tab} label="1W" value={CHART_TIMEFRAMES.WEEK} />
            <Tab className={classes.tab} label="1M" value={CHART_TIMEFRAMES.MONTH} />
            <Tab className={classes.tab} label="3M" value={CHART_TIMEFRAMES.THREE_MONTHS} />
            <Tab className={classes.tab} label="6M" value={CHART_TIMEFRAMES.SIX_MONTHS} />
            <Tab className={classes.tab} label="1Y" value={CHART_TIMEFRAMES.ONE_YEAR} />
            <Tab className={classes.tab} label="ALL" value={CHART_TIMEFRAMES.ALL} />
          </Tabs>
        </div>
        <Chart
          data={chart}
          dataLoaded={chartLoaded}
          chartQuote={chartQuote} />
      </Grid>
      <Grid className={classes.mt30} item xs={12}>
        <Typography className={classes.header}>Project Background</Typography>
        <Typography>{background}</Typography>
      </Grid>
      <Grid className={`${classes.mt60} ${classes.textCenter}`} item xs={12}>
        <Button
          variant="outlined"
          color="primary"
          className={classes.button}
          component="a"
          href={`https://messari.io/asset/${symbol.toLowerCase()}`}
          target="__blank">View complete {name} profile
          and metrics on Messari.io
        </Button>
        <Typography>Messari curates daily insights, market data, and research for crypto professionals</Typography>
      </Grid>
    </Grid>
  );
};

ProfileOverview.defaultProps = {
  marketCap: undefined,
  circulatingSupply: undefined,
  background: 'No Background',
  name: ''
};

ProfileOverview.propTypes = {
  classes: PropTypes.object.isRequired,
  marketCap: PropTypes.string,
  circulatingSupply: PropTypes.string,
  y2050: PropTypes.object.isRequired,
  allTimeHigh: PropTypes.object.isRequired,
  roi: PropTypes.object.isRequired,
  chart: PropTypes.array.isRequired,
  chartMarkets: PropTypes.array.isRequired,
  chartQuote: PropTypes.string.isRequired,
  chartTimeFrame: PropTypes.object.isRequired,
  updateChartTimeFrame: PropTypes.func.isRequired,
  updateChartQuote: PropTypes.func.isRequired,
  chartLoaded: PropTypes.bool.isRequired,
  background: PropTypes.string,
  prefCurrency: PropTypes.string.isRequired,
  symbol: PropTypes.string.isRequired,
  name: PropTypes.string,
  rank: PropTypes.string.isRequired
};

export default withStyles(styles, { withTheme: true })(ProfileOverview);



// WEBPACK FOOTER //
// ./src/components/coins/profileOverview.js