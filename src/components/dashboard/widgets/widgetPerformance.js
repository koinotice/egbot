import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withStyles, withTheme } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import debounce from 'lodash/debounce';
import { GridLoader } from 'react-spinners';
import ReactEchartsCore from 'echarts-for-react/lib/core';
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/line';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/toolbox';
import reduce from 'lodash/reduce';
import chartTheme from '../../../themes/quadChartTheme';
import { formatCurrency } from '../../../utils/helpers';
import { epochMsToDateTime } from '../../../utils/time';
import { fetchPortfolioGrowth, setPortfolioGrowthTimeFrame } from '../../../store/ducks/dashboard/portfolioGrowth';

echarts.registerTheme('chartTheme', chartTheme);

const TIMESTAMP = 0;
const PRICE = 1;

const styles = theme => ({
  chartContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    overflow: 'hidden',
    minHeight: '350px',
    [theme.breakpoints.down(600)]: {
      alignItems: 'center',
      minHeight: '200px !important',
    },
  },
  tabs: {
    display: 'inline-block',
    position: 'relative',
    top: '-18px',
    [theme.breakpoints.down(600)]: {

    },
  },
  tab: {
    minWidth: '25px',
    height: '25px',
    textTransform: 'none',
    fontSize: '1rem',
  },

  chart: {
    width: '100%',
    height: '300px !important',
    [theme.breakpoints.down(600)]: {
      height: '200px !important',
    },
  }
});

class WidgetPerformance extends Component {
  constructor(props) {
    super(props);
    this.state = {
      windowWidth: window.innerWidth,
      isHovering: false,
    };
  }

  componentDidMount() {
    const { actions } = this.props;
    actions.fetchPortfolioGrowth();
    this.debouncedSetWindowWidth = debounce(this.setWindowWidth, 500);
    window.addEventListener('resize', this.debouncedSetWindowWidth);
  }

  componentWillReceiveProps(nextProps) {
    const {
      actions, forexLoaded, pricesLoaded, user, portfolioGrowthTimeFrame, currentAccountId
    } = this.props;
    const { pref_currency: prefCurrency } = user.preferences;
    const { pref_currency: nextPrefCurrency } = nextProps.user.preferences;
    if (nextProps.forexLoaded !== forexLoaded || nextProps.pricesLoaded !== pricesLoaded ||
      nextPrefCurrency !== prefCurrency || currentAccountId !== nextProps.currentAccountId) {
      actions.setPortfolioGrowthTimeFrame(portfolioGrowthTimeFrame);
      actions.fetchPortfolioGrowth();
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.debouncedSetWindowWidth);
  }

  setWindowWidth = () => {
    this.setState({
      windowWidth: window.innerWidth,
    });
  };

  setTimeFrame = (obj, timeFrame) => {
    const { actions } = this.props;
    actions.setPortfolioGrowthTimeFrame(+timeFrame);
    actions.fetchPortfolioGrowth();
  };

  getOptions(data, prefCurrency) {
    if (!data || !data.length) {
      return;
    }

    const { windowWidth } = this.state;
    let max = reduce(data, (memo, n) => {
      return memo > n.value[PRICE] ? memo : n.value[PRICE];
    });
    max *= 1.01;
    let min = reduce(data, (memo, n) => {
      return memo < n.value[PRICE] ? memo : n.value[PRICE];
    });
    min *= 0.99;

    return {
      animation: true,
      toolbox: {
        show: this.state.isHovering,
        feature: {
          dataZoom: {
            title: {
              zoom: 'Area Zoom',
              back: 'Restore Area Zoom',
            },
            yAxisIndex: 'none'
          },
          dataView: {
            title: 'View Data',
            readOnly: true,
            lang: ['Chart Data', 'Close', 'Refresh']
          },
          magicType: {
            title: {
              line: 'Line',
              bar: 'Bar'
            },
            type: ['line', 'bar']
          },
          restore: {
            title: 'Restore',
          },
          saveAsImage: {
            title: 'Save Image',
          },
        }
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(27,36,49,0.9)',
        textStyle: {
          fontSize: '1rem'
        },
        formatter: (params) => {
          return `${ epochMsToDateTime(params[0].value[TIMESTAMP])} <br/>${formatCurrency(prefCurrency, params[0].value[PRICE])}`;
        }
      },
      series: [
        {
          name: 'Performance',
          data,
          type: 'line',
          showSymbol: false,
          hoverAnimation: false,
          areaStyle: {
            opacity: 0.6
          },
          lineStyle: {
            width: 1
          },
          yAxisIndex: 0,
        }
      ],
      grid: {
        top: 60,
        bottom: 20,
        left: 40,
        right: 20,
        containLabel: true
      },
      xAxis: [
        {
          type: 'time',
          axisTick: {
            show: true,
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
          min,
          max,
          position: 'right',
          axisLabel: {
            formatter(value) {
              return formatCurrency(prefCurrency, value, windowWidth < 600);
            },
            color: '#7F8FA4',
            fontSize: 12,
            fontFamily: 'Source Sans Pro'
          },
          splitLine: {
            show: false
          }
        }
      ]
    };
  }

  handleMouseHover = () => {
    this.setState({
      isHovering: true,
    });
  };

  handleMouseLeave = () => {
    this.setState({
      isHovering: false,
    });
  };

  render() {
    const {
      classes,
      user,
      portfolioGrowthLoaded,
      portfolioGrowth,
      portfolioGrowthTimeFrame,
      pricesLoaded,
      forexLoaded,
    } = this.props;

    const { pref_currency: prefCurrency } = user.preferences;
    const options = this.getOptions(portfolioGrowth, prefCurrency);

    return (
      <div onMouseEnter={this.handleMouseHover}
        onMouseLeave={this.handleMouseLeave}>
        <div className={classes.chartContainer}>
          <Tabs className={classes.tabs} indicatorColor="primary" value={portfolioGrowthTimeFrame} onChange={this.setTimeFrame}>
            <Tab className={classes.tab} label="Day" value={1} />
            <Tab className={classes.tab} label="Week" value={7} />
            <Tab className={classes.tab} label="Month" value={30} />
            <Tab className={classes.tab} label="Year" value={365} />
            <Tab className={classes.tab} label="2 Years" value={730} />
          </Tabs>
          { (!portfolioGrowthLoaded || !pricesLoaded || !forexLoaded) &&
          <Grid className={classes.chart} container alignItems="center" justify="center">
            <GridLoader color="#52B0B0" size={6} loading />
          </Grid>
          }
          { portfolioGrowthLoaded &&
          <ReactEchartsCore
            className={classes.chart}
            echarts={echarts}
            option={options}
            notMerge
            lazyUpdate
            theme="chartTheme" />
          }
        </div>
      </div>
    );
  }
}

WidgetPerformance.propTypes = {
  classes: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  portfolioGrowth: PropTypes.array.isRequired,
  portfolioGrowthTimeFrame: PropTypes.number.isRequired,
  portfolioGrowthLoaded: PropTypes.bool.isRequired,
  pricesLoaded: PropTypes.bool.isRequired,
  forexLoaded: PropTypes.bool.isRequired,
  currentAccountId: PropTypes.string.isRequired,
};

function mapStateToProps(state) {
  return {
    user: state.global.user.user,
    pricesLoaded: state.global.prices.pricesLoaded,
    forexLoaded: state.global.forex.forexLoaded,
    portfolioGrowth: state.dashboard.portfolioGrowth.portfolioGrowth,
    portfolioGrowthTimeFrame: state.dashboard.portfolioGrowth.portfolioGrowthTimeFrame,
    portfolioGrowthLoaded: state.dashboard.portfolioGrowth.portfolioGrowthLoaded,
    holdingsLoaded: state.holdings.holdings.holdingsLoaded,
    currentAccountId: state.trade.interactions.currentAccountId
  };
}

function mapDispatchToProps(dispatcher) {
  return {
    actions: {
      ...bindActionCreators({
        fetchPortfolioGrowth,
        setPortfolioGrowthTimeFrame
      }, dispatcher)
    }
  };
}

const base = (withTheme()(withStyles(styles)(WidgetPerformance)));
export default connect(mapStateToProps, mapDispatchToProps)(base);



// WEBPACK FOOTER //
// ./src/components/dashboard/widgets/widgetPerformance.js