import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import { withStyles, withTheme } from '@material-ui/core/styles';
import { GridLoader } from 'react-spinners';
import ReactEchartsCore from 'echarts-for-react/lib/core';
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/pie';
import 'echarts/lib/chart/bar';
import 'echarts/lib/component/tooltip';
import chartTheme from '../../../themes/quadChartTheme';
import { formatCurrency } from '../../../utils/helpers';
import { updateAccount } from '../../../store/ducks/trade/interactions';

echarts.registerTheme('chartTheme', chartTheme);

const styles = theme => ({
  chart: {
    width: '100%',
    height: '400px !important',
    [theme.breakpoints.down(600)]: {
      height: '350px !important',
    },
  }
});

class WidgetBalancesByAccount extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isHovering: false,
    };
  }
  getOptions(data, prefCurrency, theme) {
    return {
      animation: false,
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(27,36,49,0.9)',
        textStyle: {
          color: '#c7d0dc',
          fontSize: 12,
          fontWeight: 'normal',
        },
        formatter: (params) => {
          return `
          <strong>${params.data.label} (${params.data.exchangeLabel})</strong> <br/>
          Portfolio Percentage: <strong>${params.percent}%</strong> </br>
          Current Value: <strong>${ formatCurrency(prefCurrency, params.data.value)}</strong> </br>
          Assets: <strong>${params.data.assets.length}</strong> </br>`;
          // https://ecomfe.github.io/echarts-doc/public/en/option.html#series-pie.tooltip.formatter
        }
      },
      toolbox: {
        show: this.state.isHovering,
        feature: {
          dataView: {
            title: 'View Data',
            readOnly: true,
            lang: ['Chart Data', 'Close', 'Refresh']
          },
          saveAsImage: {
            title: 'Save Image',
          },
        }
      },
      xAxis: [{
        type: 'category',
        data: data.map(d => d.label),
        splitLine: {
          show: false
        },
        axisLabel: {
          color: '#7F8FA4',
          fontSize: 12,
          fontFamily: 'Source Sans Pro'
        },
      }],
      yAxis: [{
        type: 'value',
        data: data.map(d => d.value),
        axisLabel: {
          formatter(value) {
            return formatCurrency(prefCurrency, value, false);
          },
          color: '#7F8FA4',
          fontSize: 12,
          fontFamily: 'Source Sans Pro'
        },
        splitLine: {
          show: false
        }
      }],
      grid: {
        top: '60%',
        // width: '100%',
        bottom: 10,
        left: 10,
        right: 10,
        containLabel: true
      },
      series: [
        {
          name: 'Balance',
          type: 'bar',
          barWidth: '20%',
          data
        },
        {
          name: 'Balance',
          type: 'pie',
          radius: ['15%', '30%'],
          center: ['50%', '30%'],
          minAngle: 5,
          startAngle: 85,
          data,
          labelLine: {
            smooth: true,
            length: 15,
            length2: 10,
          },
          itemStyle: {
            emphasis: {
              shadowBlur: 10,
              shadowOffsetX: 10,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          label: {
            formatter: (params) => {
              return `${params.data.label}`;
            },
            padding: 10,
            color: theme.palette.text.primary,
            fontSize: 12,
            fontWeight: 'normal',
          },
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

  bindChartEvents = () => {
    const { actions } = this.props;
    return {
      click(e) {
        actions.updateAccount(e.data.id);
      },
    };
  };

  render() {
    const {
      user, holdingsByAccount, holdingsLoaded, classes, theme
    } = this.props;

    if (!holdingsLoaded) {
      return (
        <Grid className={classes.chart} container alignItems="center" justify="center">
          <GridLoader color="#52B0B0" size={6} loading />
        </Grid>
      );
    }
    const { pref_currency: prefCurrency } = user.preferences;
    const options = this.getOptions(holdingsByAccount, prefCurrency, theme);
    return (
      <div onMouseEnter={this.handleMouseHover}
        onMouseLeave={this.handleMouseLeave}>
        <ReactEchartsCore
          className={classes.chart}
          echarts={echarts}
          option={options}
          notMerge
          onEvents={this.bindChartEvents()}
          theme="chartTheme" />
      </div>
    );
  }
}

WidgetBalancesByAccount.propTypes = {
  classes: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  holdingsByAccount: PropTypes.array.isRequired,
  holdingsLoaded: PropTypes.bool.isRequired
};

function mapStateToProps(state) {
  return {
    user: state.global.user.user,
    holdingsByAccount: state.holdings.holdings.byAccount,
    holdingsLoaded: state.holdings.holdings.holdingsLoaded
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      ...bindActionCreators({
        updateAccount
      }, dispatch)
    }
  };
}

const base = (withTheme()(withStyles(styles)(WidgetBalancesByAccount)));
export default connect(mapStateToProps, mapDispatchToProps)(base);



// WEBPACK FOOTER //
// ./src/components/dashboard/widgets/widgetBalancesByAccount.js