import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles, withTheme } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import { GridLoader } from 'react-spinners';
import ReactEchartsCore from 'echarts-for-react/lib/core';
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/line';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/toolbox';
import chartTheme from '../../../themes/quadChartTheme';
import { epochMsToDateTime } from '../../../utils/time';

echarts.registerTheme('chartTheme', chartTheme);

const TIMESTAMP = 0;
const VALUE = 1;

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
    [theme.breakpoints.down(600)]: {

    },
  },
  tab: {
    minWidth: '35px',
    height: '35px',
    textTransform: 'none',
    fontSize: '1rem',
  },

  chart: {
    width: '100%',
    height: '350px !important',
    [theme.breakpoints.down(600)]: {
      height: '200px !important',
    },
  }
});

class WidgetHistoricalAllocations extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isHovering: false,
    };
  }
  getSeries = (data) => {
    return data.map((d) => {
      return {
        name: d[0].name,
        data: d,
        type: 'line',
        stack: 'A',
        showSymbol: false,
        hoverAnimation: false,
        areaStyle: {
          opacity: 0.6
        },
        lineStyle: {
          width: 0
        },
        yAxisIndex: 0,
      };
    });
  };

  getOptions(data) {
    if (!data || !data.length) {
      return;
    }

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
        confine: true,
        backgroundColor: 'rgba(27,36,49,0.9)',
        textStyle: {
          fontSize: 10
        },
        formatter: (params) => {
          const colorSpan = color => `<span 
               style="display:inline-block;
               margin-right:5px;
               border-radius:10px;
               width:9px;
               height:9px;
               background-color:${ color }"></span>`;
          // remove tooltip item for insignificant assets if num assets at this bar is > 20
          const nonZeroParams = params.filter(p => p.value[VALUE] > 0.5).reverse();
          let label = `${ epochMsToDateTime(params[0].value[TIMESTAMP])} <br/>`;
          nonZeroParams.forEach((p) => {
            label += `${colorSpan(p.color)} ${p.name}: &nbsp; ${p.data.total} - ${p.value[VALUE].toFixed(4)}%<br/>`;
          });
          return label;
        }
      },
      series: this.getSeries(data),
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
          position: 'right',
          min: 0,
          max: 100,
          axisLabel: {
            formatter(value) {
              return `${value}%`;
            },
            color: '#7F8FA4',
            fontSize: 12,
            fontFamily: 'Source Sans Pro'
          },
          splitLine: {
            show: false
          }
        },
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
      portfolioGrowthLoaded,
      historicalAllocations,
    } = this.props;

    const options = this.getOptions(historicalAllocations);

    return (
      <div onMouseEnter={this.handleMouseHover}
        onMouseLeave={this.handleMouseLeave}>
        <div className={classes.chartContainer}>
          { (!portfolioGrowthLoaded) &&
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

WidgetHistoricalAllocations.propTypes = {
  classes: PropTypes.object.isRequired,
  historicalAllocations: PropTypes.array.isRequired,
  portfolioGrowthLoaded: PropTypes.bool.isRequired,
};

function mapStateToProps(state) {
  return {
    historicalAllocations: state.dashboard.portfolioGrowth.historicalAllocations,
    portfolioGrowthLoaded: state.dashboard.portfolioGrowth.portfolioGrowthLoaded,
  };
}

const base = (withTheme()(withStyles(styles)(WidgetHistoricalAllocations)));
export default connect(mapStateToProps)(base);



// WEBPACK FOOTER //
// ./src/components/dashboard/widgets/widgetHistoricalAllocations.js