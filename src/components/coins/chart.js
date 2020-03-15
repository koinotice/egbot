import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { PulseLoader } from 'react-spinners';
import ReactEchartsCore from 'echarts-for-react/lib/core';
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/line';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/toolbox';
import PropTypes from 'prop-types';
import chartTheme from '../../themes/quadChartTheme';
import { formatCurrency } from '../../utils/helpers';
import { epochMsToDateTime } from '../../utils/time';

echarts.registerTheme('chartTheme', chartTheme);

const TIMESTAMP = 0;
const PRICE = 1;

const styles = theme => ({
  chart: {
    height: '42.8571rem'
  },
  center: {
    height: '28.5714rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  textSecondary: {
    color: theme.palette.text.secondary
  }
});

class Chart extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isHovering: false
    };
  }

  getOptions = (data, quoteCurrency) => {
    const sortedData = this.sortData(data);
    let max = sortedData.reduce((memo, n) => {
      return memo > n[PRICE] ? memo : n[PRICE];
    }, 0);
    max *= 1.01;
    let min = sortedData.reduce((memo, n) => {
      return memo < n[PRICE] ? memo : n[PRICE];
    }, max);
    min *= 0.99;

    // override color to red if ending price is lower than starting price
    const color = sortedData[0][PRICE] < sortedData[sortedData.length - 1][PRICE] ? null : 'rgb(169,71,63)';

    const options = {
      animation: true,
      toolbox: {
        show: this.state.isHovering,
        feature: {
          dataZoom: {
            title: {
              zoom: 'Area Zoom',
              back: 'Restore Area Zoom,'
            },
            yAxisIndex: 'none',
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
            title: 'Restore'
          },
          saveAsImage: {
            title: 'Save Image'
          }
        }
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(27,36,49,0.9)',
        textStyle: {
          fontSize: '1rem'
        },
        axisPointer: {
          lineStyle: {
            color
          }
        },
        formatter(params) {
          return `${ epochMsToDateTime(params[0].value[TIMESTAMP])}<br/>${formatCurrency(quoteCurrency, params[0].value[PRICE])}`;
        }
      },
      series: [
        {
          name: 'Performance',
          data: sortedData,
          type: 'line',
          showSymbol: false,
          hoverAnimation: false,
          areaStyle: {
            opacity: 0.4,
            color
          },
          lineStyle: {
            width: 1,
            opacity: 1,
            color
          },
          itemStyle: {
            color
          },
          yAxisIndex: 0
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
          }
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
              return formatCurrency(quoteCurrency, value);
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

    return options;
  };

  sortData = data => data.sort((a, b) => (a[0] - b[0]));

  handleMouseHover = () => {
    this.setState({
      isHovering: true
    });
  }

  handleMouseLeave = () => {
    this.setState({
      isHovering: false
    });
  }

  render() {
    const {
      classes, data, dataLoaded, chartQuote
    } = this.props;

    if (!dataLoaded) {
      return (
        <div className={classes.center}>
          <PulseLoader size={6} color="#52B0B0" loading />
        </div>
      );
    }

    if (!data || !data.length) {
      return (
        <div className={classes.center}>
          <Typography className={classes.textSecondary}>No Chart Available</Typography>
        </div>
      );
    }

    return (
      <div
        onMouseEnter={this.handleMouseHover}
        onMouseLeave={this.handleMouseLeave}>
        <ReactEchartsCore
          echarts={echarts}
          option={this.getOptions(data, chartQuote)}
          notMerge
          lazyUpdate
          theme="chartTheme"
          className={classes.chart}
          style={{ height: '400px' }} />
      </div>
    );
  }
}

Chart.propTypes = {
  classes: PropTypes.object.isRequired,
  data: PropTypes.array.isRequired,
  dataLoaded: PropTypes.bool.isRequired,
  chartQuote: PropTypes.string.isRequired
};

export default withStyles(styles, { withTheme: true })(Chart);



// WEBPACK FOOTER //
// ./src/components/coins/chart.js