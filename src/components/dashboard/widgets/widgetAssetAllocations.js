import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import { withStyles, withTheme } from '@material-ui/core/styles';
import { GridLoader } from 'react-spinners';
import ReactEchartsCore from 'echarts-for-react/lib/core';
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/pie';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/toolbox';
import sortBy from 'lodash/sortBy';
import chartTheme from '../../../themes/quadChartTheme';
import { formatCurrency, formatAmount } from '../../../utils/helpers';

echarts.registerTheme('chartTheme', chartTheme);

const styles = theme => ({
  chart: {
    width: '100%',
    height: '350px !important',
    [theme.breakpoints.down(600)]: {
      height: '300px !important',
    },
  }
});

class WidgetAssetAllocations extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isHovering: false,
    };
  }
  getOptions(holdingsByAsset, holdingsByAccount, currentAccountId, prefCurrency) {
    let data;

    if (currentAccountId) {
      const accountHoldings = holdingsByAccount.find(account => account.id === currentAccountId);
      data = accountHoldings ? accountHoldings.assets : [];
    } else {
      data = holdingsByAsset;
    }


    data = sortBy(data, 'value').reverse();
    data = this.tweakLabels(data);
    return {
      animation: false,
      grid: {
        containLabel: true
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
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(27,36,49,0.9)',
        textStyle: {
          color: '#c7d0dc',
          fontSize: 12,
          fontWeight: 'normal',
        },
        formatter: (params) => {
          if (params.data.fullName === 'Other') {
            return `<strong>${params.data.name} (${params.percent}%)</strong> <br/>
          Value: <strong>${ formatCurrency(prefCurrency, params.data.value)}</strong> <br/>
          Assets: <strong>${ params.data.count }</strong>`;
          }

          return `<strong>${params.data.fullName} - ${params.data.name} (${params.percent}%)</strong> <br/>
          Current Value: <strong>${ formatCurrency(prefCurrency, params.data.value)}</strong> <br/>
          Current Price: <strong>${ formatCurrency(prefCurrency, params.data.currentPrice)}</strong> <br/>
          Total Amount: <strong>${ formatAmount(prefCurrency, params.data.rawTotal)}</strong>`;
          // https://ecomfe.github.io/echarts-doc/public/en/option.html#series-pie.tooltip.formatter
        }
      },
      series: [
        {
          name: 'Balance',
          type: 'pie',
          radius: ['15%', '30%'],
          center: ['50%', '50%'],
          minAngle: 5,
          startAngle: 85,
          data,
          labelLine: {
            smooth: true,
            length: 25,
            length2: 15,
          },
          itemStyle: {
            emphasis: {
              shadowBlur: 10,
              shadowOffsetX: 10,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    };
  }

  tweakLabels(data) {
    const other = {
      name: 'Other',
      fullName: 'Other',
      value: 0,
      count: 0,
    };

    let assetCount = 0;
    const assets = data.filter((asset) => {
      assetCount++;
      if (assetCount <= 16) return true;
      other.value += asset.value;
      other.count += 1;
      return false;
    });
    other.name = `${other.count} Other`;
    if (assetCount > 16) assets.push(other);

    return assets;
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
      user, holdingsByAsset, holdingsByAccount, currentAccountId, holdingsLoaded, classes
    } = this.props;

    if (!holdingsLoaded) {
      return (
        <Grid className={classes.chart} container alignItems="center" justify="center">
          <GridLoader color="#52B0B0" size={6} loading />
        </Grid>
      );
    }
    const { pref_currency: prefCurrency } = user.preferences;
    const options = this.getOptions(holdingsByAsset, holdingsByAccount, currentAccountId, prefCurrency);
    return (
      <div onMouseEnter={this.handleMouseHover}
        onMouseLeave={this.handleMouseLeave}>
        <ReactEchartsCore
          className={classes.chart}
          echarts={echarts}
          option={options}
          opts={{ renderer: 'svg' }}
          notMerge
          theme="chartTheme" />
      </div>
    );
  }
}

WidgetAssetAllocations.propTypes = {
  classes: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  currentAccountId: PropTypes.string.isRequired,
  holdingsByAsset: PropTypes.array.isRequired,
  holdingsByAccount: PropTypes.array.isRequired,
  holdingsLoaded: PropTypes.bool.isRequired
};

function mapStateToProps(state) {
  return {
    user: state.global.user.user,
    currentAccountId: state.trade.interactions.currentAccountId,
    holdingsByAsset: state.holdings.holdings.byAsset,
    holdingsByAccount: state.holdings.holdings.byAccount,
    holdingsLoaded: state.holdings.holdings.holdingsLoaded
  };
}

const base = (withTheme()(withStyles(styles)(WidgetAssetAllocations)));
export default connect(mapStateToProps)(base);



// WEBPACK FOOTER //
// ./src/components/dashboard/widgets/widgetAssetAllocations.js