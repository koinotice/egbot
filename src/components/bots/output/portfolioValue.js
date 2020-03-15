import React, { Component } from 'react';
import ReactEchartsCore from 'echarts-for-react/lib/core';
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/line';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/toolbox';
import reduce from 'lodash/reduce';
import PropTypes from 'prop-types';
import chartTheme from '../../../themes/quadChartTheme';
import { formatCurrency } from '../../../utils/helpers';
import { epochMsToDateTime } from '../../../utils/time';

echarts.registerTheme('chartTheme', chartTheme);

const TIMESTAMP = 0;
const PRICE = 1;

class PortfolioValue extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isHovering: false
    };
  }

  getOptions = (data, quoteCurrency) => {
    const sortedData = this.sortData(data);
    let max = reduce(sortedData, (memo, n) => {
      return memo > n[PRICE] ? memo : n[PRICE];
    });
    max *= 1.01;
    let min = reduce(sortedData, (memo, n) => {
      return memo < n[PRICE] ? memo : n[PRICE];
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
            opacity: 0.6
          },
          lineStyle: {
            width: 1
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
    const { data, quoteCurrency } = this.props;
    if (!data) {
      return null;
    }

    return (
      <div
        onMouseEnter={this.handleMouseHover}
        onMouseLeave={this.handleMouseLeave}>
        <ReactEchartsCore
          echarts={echarts}
          option={this.getOptions(data, quoteCurrency)}
          notMerge
          lazyUpdate
          theme="chartTheme" />
      </div>
    );
  }
}

PortfolioValue.propTypes = {
  data: PropTypes.array.isRequired,
  quoteCurrency: PropTypes.string.isRequired
};

export default PortfolioValue;




// WEBPACK FOOTER //
// ./src/components/bots/output/portfolioValue.js