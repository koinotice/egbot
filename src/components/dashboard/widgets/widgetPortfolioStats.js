import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';
import { GridLoader } from 'react-spinners';
import ReactEchartsCore from 'echarts-for-react/lib/core';
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/bar';
import 'echarts/lib/component/tooltip';
import chartTheme from '../../../themes/quadChartTheme';
import Formatted from '../../common/formatted';
import { fetchPortfolioStats } from '../../../store/ducks/dashboard/portfolioStats';
import { epochMsToDate } from '../../../utils/time';
import TooltipIcon from '../../common/tooltipIcon';

echarts.registerTheme('chartTheme', chartTheme);

const TIMESTAMP = 0;
const TRADE_COUNT = 1;

const styles = theme => ({
  statRow: {
    marginTop: '10px',
  },
  statRowLabel: {
    fontSize: '12px',
    color: theme.palette.text.secondary,
  },
  statRowValue: {
    fontWeight: 'bold',
    color: theme.palette.text.primary,
    float: 'right'
  },
  loader: {
    width: '100%',
    height: '348px !important',
    [theme.breakpoints.down(600)]: {
      height: '348px !important',
    },
  },
  chart: {
    width: '100%',
    height: '203px !important',
    [theme.breakpoints.down(600)]: {
      height: '203px !important',
    },
  }
});

class WidgetPortfolioStats extends Component {
  componentDidMount() {
    const { actions } = this.props;
    actions.fetchPortfolioStats();
  }

  componentWillReceiveProps(nextProps) {
    const { actions, currentAccountId } = this.props;
    if (currentAccountId !== nextProps.currentAccountId) {
      actions.fetchPortfolioStats();
    }
  }

  getStats = (prefCurrency, holdingsByAccount, currentAccountId) => {
    return holdingsByAccount
      .filter((account) => {
        return currentAccountId ? account.id === currentAccountId : true;
      })
      .reduce((acc, account) => {
        account.assets.forEach((asset) => {
          acc.push(asset);
        });
        return acc;
      }, [])
      .reduce((acc, asset) => {
        if (asset.name === prefCurrency) {
          acc.available += asset.value;
        } else {
          acc.invested += asset.value;
        }
        return acc;
      }, {
        invested: 0,
        available: 0
      });
  };

  getChartOptions(data) {
    return {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(27,36,49,0.9)',
        textStyle: {
          fontSize: '1rem'
        },
        formatter: (params) => {
          return `${ epochMsToDate(params[0].value[TIMESTAMP])} <br/> Trades: ${params[0].value[TRADE_COUNT]}`;
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: 20,
        containLabel: true
      },
      xAxis: [
        {
          type: 'time',
          axisTick: {
            alignWithLabel: true
          },
          splitLine: {
            show: false
          },
          axisLabel: {
            color: '#7F8FA4',
            fontSize: 12,
            fontFamily: 'Source Sans Pro'
          },
        }
      ],
      yAxis: [
        {
          type: 'value',
          position: 'right',
          splitLine: {
            show: false
          },
          axisLabel: {
            color: '#7F8FA4',
            fontSize: 12,
            fontFamily: 'Source Sans Pro'
          },
        }
      ],
      series: [
        {
          name: 'Trades',
          data,
          type: 'bar',
          barWidth: 2,
        }
      ]
    };
  }

  render() {
    const {
      user, holdingsByAccount, holdingsLoaded, portfolioStats, statsLoaded, currentAccountId, classes
    } = this.props;

    if (!holdingsLoaded || !statsLoaded) {
      return (
        <Grid className={classes.loader} container alignItems="center" justify="center">
          <GridLoader color="#52B0B0" size={6} loading />
        </Grid>
      );
    }
    const { pref_currency: prefCurrency } = user.preferences;
    const chartOptions = this.getChartOptions(portfolioStats.ordersByDate);
    const stats = this.getStats(prefCurrency, holdingsByAccount, currentAccountId);
    return (
      <div style={{ marginTop: '15px', padding: '0 5px' }}>
        <div className={classes.statRow}>
          <span className={classes.statRowLabel}>In Positions (non-{prefCurrency})
            <TooltipIcon
              className={classes.tooltipIcon}
              title="Total value of currently held assets (excluding fiat or selected preferred currency)" />
          </span>
          <span className={classes.statRowValue}><Formatted asset={prefCurrency} amount={stats.invested} /></span>
        </div>
        <div className={classes.statRow}>
          <span className={classes.statRowLabel}>Available ({prefCurrency})
            <TooltipIcon className={classes.tooltipIcon} title="Total fiat or preferred currency available to be invested" />
          </span>
          <span className={classes.statRowValue}><Formatted asset={prefCurrency} amount={stats.available} /></span>
        </div>
        <div className={classes.statRow}>
          <span className={classes.statRowLabel}>Total Trades</span>
          <span className={classes.statRowValue}>{portfolioStats.totalOrders}</span>
        </div>
        <div className={classes.statRow}>
          <span className={classes.statRowLabel}>Most Traded Pair</span>
          <span className={classes.statRowValue}>{ portfolioStats.mostTradedPair }</span>
        </div>
        <div className={classes.statRow}>
          <span className={classes.statRowLabel}>Latest Trading Activity</span>
        </div>
        <ReactEchartsCore
          className={classes.chart}
          echarts={echarts}
          option={chartOptions}
          opts={{ renderer: 'svg' }}
          notMerge
          theme="chartTheme" />
      </div>
    );
  }
}

WidgetPortfolioStats.propTypes = {
  actions: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  holdingsByAccount: PropTypes.array.isRequired,
  holdingsLoaded: PropTypes.bool.isRequired,
  portfolioStats: PropTypes.object.isRequired,
  statsLoaded: PropTypes.bool.isRequired,
  currentAccountId: PropTypes.string.isRequired,
};

function mapStateToProps(state) {
  return {
    user: state.global.user.user,
    holdingsByAccount: state.holdings.holdings.byAccount,
    holdingsLoaded: state.holdings.holdings.holdingsLoaded,
    portfolioStats: state.dashboard.portfolioStats,
    statsLoaded: state.dashboard.portfolioStats.statsLoaded,
    currentAccountId: state.trade.interactions.currentAccountId,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      ...bindActionCreators({
        fetchPortfolioStats,
      }, dispatch)
    }
  };
}

const base = withStyles(styles)(WidgetPortfolioStats);
export default connect(mapStateToProps, mapDispatchToProps)(base);



// WEBPACK FOOTER //
// ./src/components/dashboard/widgets/widgetPortfolioStats.js