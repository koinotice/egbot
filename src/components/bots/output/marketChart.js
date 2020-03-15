import React, { Component } from 'react';
import { withStyles } from '@material-ui/core';
import PropTypes from 'prop-types';
import { BarLoader } from 'react-spinners';
import jstz from 'jstimezonedetect';
import { PUBLIC_API_ROOT } from '../../../config/apiConfig';
import QuadencyUdfDatafeed from '../../../utils/chart/quadencyUdfDatafeed';
import { formatAmount, formatCurrency } from '../../../utils/helpers';
import * as indicatorStyleOverrides from '../../../utils/chart/indicatorStyleOverrides.json';

const styles = {
  container: {
    minHeight: '35.7143rem',
    marginBottom: '2.1429rem'
  },
  innerContainer: {
    width: '100%',
    height: '35.7143rem',
    position: 'relative'
  },
  progressContainer: {
    position: 'absolute',
    top: '50%',
    left: 'calc(50% - 50px)',
    zIndex: '5000'
  },
  chart: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  hide: {
    visibility: 'hidden'
  }
};

class MarketChart extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loaded: false
    };
    this.datafeed = null;
    this.openOrderLines = [];
    this.tradeIndicators = [];
  }

  componentDidMount() {
    this.initChart();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.theme.palette.type !== this.props.theme.palette.type) {
      this.widget = null;
      this.initChart();
      return;
    }

    if (this.datafeed && this.props.ticker && Object.keys(this.props.ticker).length) {
      this.datafeed.updateCurrentCandle(this.props.ticker);
    }

    if (this.props.trades.length !== prevProps.trades.length && this.state.loaded) {
      this.populateTrades(this.props.trades);
    }

    if (this.props.openOrders.length !== prevProps.openOrders.length) {
      this.populateOpenOrders(this.props.openOrders);
    }
  }

  componentWillUnmount() {
    if (this.props.unsubscribeTicker) {
      this.props.unsubscribeTicker();
    }
  }

  getWidgetOptions(exchange, candleTimeframe, pair, theme) {
    this.datafeed = new QuadencyUdfDatafeed(`${PUBLIC_API_ROOT}/charts/exchange/${exchange}`, exchange, pair);

    const widgetOptions = {
      symbol: pair,
      interval: this.formatCandleTimeframe(candleTimeframe),
      timezone: jstz.determine().name(),
      container_id: 'chartContainer',
      locale: 'en',
      datafeed: this.datafeed,
      autosize: true,
      library_path: '/platform/static/trading_view/charting_library/',
      client_id: 'platform-ui',
      user_id: 'public_user_id',
      // drawings_access: { type: 'black', tools: [{ name: 'Regression Trend' }] },
      disabled_features: [
        'use_localstorage_for_settings',
        'display_market_status',
        'header_symbol_search',
        'symbol_search_hot_key',
        'header_interval_dialog_button',
        'compare_symbol',
        'header_compare',
        'header_undo_redo',
        'header_screenshot',
        'header_saveload',
        'border_around_the_chart',
        'go_to_date',
        'hide_left_toolbar_by_default'
      ],
      enabled_features: ['side_toolbar_in_fullscreen_mode', 'keep_left_toolbar_visible_on_small_screens', 'left_toolbar'],
      side_toolbar_in_fullscreen_mode: true,
      overrides: {
        editorFontsList: ['Source Sans', 'Verdana', 'Courier New', 'Times New Roman', 'Arial'],
        'mainSeriesProperties.candleStyle.upColor': '#9FC950',
        'mainSeriesProperties.candleStyle.downColor': '#D35847',
        'mainSeriesProperties.candleStyle.drawBorder': false,
        'mainSeriesProperties.candleStyle.wickUpColor': 'rgba( 159, 201, 80, 1)',
        'mainSeriesProperties.candleStyle.wickDownColor': 'rgba( 211, 88, 77, 1)',
      },
      studies_overrides: indicatorStyleOverrides,
      theme: 'Light',
      // load_last_chart: true, // disabling because it breaks things
    };

    const darkThemeOptions = {
      toolbar_bg: '#273142',
      custom_css_url: 'custom.css',
      overrides: {
        editorFontsList: ['Source Sans', 'Verdana', 'Courier New', 'Times New Roman', 'Arial'],
        'paneProperties.background': '#1B2431',
        'paneProperties.vertGridProperties.color': '#222',
        'paneProperties.horzGridProperties.color': '#222',
        'scalesProperties.lineColor': '#000',
        'scalesProperties.textColor': '#7F8FA4',
        'mainSeriesProperties.candleStyle.upColor': '#9FC950',
        'mainSeriesProperties.candleStyle.downColor': '#D35847',
        'mainSeriesProperties.candleStyle.drawBorder': false,
        'mainSeriesProperties.candleStyle.wickUpColor': 'rgba( 159, 201, 80, 1)',
        'mainSeriesProperties.candleStyle.wickDownColor': 'rgba( 211, 88, 77, 1)',
      },
      theme: 'Dark'
    };

    if (theme.palette.type === 'dark') {
      Object.assign(widgetOptions, darkThemeOptions);
    }

    return widgetOptions;
  }

  setRange(from, to) {
    const fromInSeconds = from / 1000;
    const toInSeconds = to / 1000;
    const range = {
      from: fromInSeconds,
      to: toInSeconds
    };
    this.widget.chart().setVisibleRange(range);
  }

  initChart() {
    const {
      exchange, candleTimeframe, pair, from, to, trades, theme, indicator, initTicker, openOrders
    } = this.props;

    this.setState({ loaded: false });
    if (initTicker) {
      initTicker(exchange, pair);
    }
    const widgetOptions = this.getWidgetOptions(exchange, candleTimeframe, pair, theme);
    this.widget = new window.TradingView.widget(widgetOptions);
    this.widget.onChartReady(() => {
      const chart = this.widget.chart();
      if (from && to) {
        this.setRange(from, to);
      }
      if (indicator) {
        chart.createStudy(indicator.name, false, false, indicator.inputs);
      }
      // chart may have loaded, but candles not yet, so wait a little
      this.populateTrades(trades);
      chart.onIntervalChanged().subscribe(null, () => {
        this.populateTrades(trades);
      });
      this.populateOpenOrders(openOrders);
      this.setState({
        loaded: true
      });
    });
  }

  formatCandleTimeframe(candleTimeframe) {
    if (candleTimeframe) {
      if (candleTimeframe.includes('H')) {
        return (parseInt(candleTimeframe.replace('H', ''), 10) * 60).toString();
      }
      return candleTimeframe.replace('T', '');
    }
    return '60';
  }

  createSellIndicator = (chart, amount, price, timestamp) => {
    return chart.createExecutionShape()
      .setArrowColor('#F00')
      .setDirection('sell')
      .setPrice(amount)
      .setTime(timestamp)
      .setTooltip(`SELL ${amount} @ ${price}`);
  };

  createBuyIndicator = (chart, amount, price, timestamp) => {
    return chart.createExecutionShape()
      .setArrowColor('#0F0')
      .setDirection('buy')
      .setPrice(amount)
      .setTime(timestamp)
      .setTooltip(`BUY ${amount} @ ${price}`);
  };

  clearTrades() {
    this.tradeIndicators.forEach(indicator => indicator.remove());
    this.tradeIndicators = [];
  }

  populateTrades(trades) {
    if (!trades.length || !this.widget) return;
    this.clearTrades();
    const chart = this.widget.chart();
    trades.forEach((trade) => {
      const [base, quote] = trade.pair.split('/');
      const { side } = trade;
      const amount = formatAmount(base, trade.amount);
      const price = formatCurrency(quote, trade.price);
      const timestamp = trade.ts / 1000;

      let tradeIndicator;
      if (side === 'BUY') {
        tradeIndicator = this.createBuyIndicator(chart, amount, price, timestamp);
      } else {
        tradeIndicator = this.createSellIndicator(chart, amount, price, timestamp);
      }
      this.tradeIndicators.push(tradeIndicator);
    });
  }

  clearOpenOrders() {
    if (this.openOrderLines.length === 0) {
      return;
    }
    this.openOrderLines.forEach(order => order.remove());
    this.openOrderLines = [];
  }

  createBuyOrderLine = chart => (
    chart.createOrderLine()
      .setText('BUY')
      .setLineColor('#9FC950')
      .setBodyBorderColor('#9FC950')
      .setBodyBackgroundColor('rgba(159, 201, 80, 0.75)')
      .setBodyTextColor('#fff')
      .setBodyFont('bold 10pt Verdana')
      .setQuantityFont('bold 11pt Verdana')
      .setQuantityBorderColor('#9FC950')
      .setQuantityBackgroundColor('rgba(159, 201, 80, 0.75)')
      .setQuantityTextColor('#fff')
      .setCancelButtonBorderColor('#9FC950')
      .setCancelButtonBackgroundColor('rgba(159, 201, 80, 0.75)')
      .setCancelButtonIconColor('#fff')
  )

  createSellOrderLine = chart => (
    chart.createOrderLine()
      .setText('SELL')
      .setLineColor('#D35847')
      .setBodyBorderColor('#D35847')
      .setBodyBackgroundColor('rgba(211, 88, 71, 0.75)')
      .setBodyTextColor('#fff')
      .setBodyFont('bold 10pt Verdana')
      .setQuantityFont('bold 11pt Verdana')
      .setQuantityBorderColor('#D35847')
      .setQuantityBackgroundColor('rgba(211, 88, 71, 0.75)')
      .setQuantityTextColor('#fff')
      .setCancelButtonBorderColor('#D35847')
      .setCancelButtonBackgroundColor('rgba(211, 88, 71, 0.75)')
      .setCancelButtonIconColor('#fff')
  )

  populateOpenOrders(orders) {
    if (!orders.length || !this.widget) return;
    const chart = this.widget.chart();

    this.clearOpenOrders();
    orders.forEach((order) => {
      const base = order.pair.split('/')[0];
      const price = parseFloat(order.price);
      const amount = formatAmount(base, order.amount);
      const openOrderLine = order.side === 'BUY' ? this.createBuyOrderLine(chart) : this.createSellOrderLine(chart);
      openOrderLine
        .setPrice(price)
        .setQuantity(amount)
        .setText(order.side)
        .onMove(() => openOrderLine.setPrice(price));
      this.openOrderLines.push(openOrderLine);
    });
  }

  renderLoader() {
    const { classes } = this.props;

    return (
      <div className={classes.progressContainer}>
        <BarLoader size={30} color="#52B0B0" loading />
      </div>
    );
  }

  render() {
    const { classes } = this.props;
    const { loaded } = this.state;

    return (
      <div className={classes.container}>
        <div className={classes.innerContainer}>
          {!loaded && this.renderLoader()}
          <div className={`${classes.chart} ${!loaded ? classes.hide : ''}`} id="chartContainer" />
        </div>
      </div>
    );
  }
}

MarketChart.defaultProps = {
  from: null,
  to: null,
  trades: [],
  indicator: null,
  candleTimeframe: null,
  ticker: {},
  initTicker: null,
  unsubscribeTicker: null,
  openOrders: []
};

MarketChart.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  exchange: PropTypes.string.isRequired,
  candleTimeframe: PropTypes.string,
  pair: PropTypes.string.isRequired,
  from: PropTypes.number,
  to: PropTypes.number,
  trades: PropTypes.array,
  indicator: PropTypes.object,
  initTicker: PropTypes.func,
  unsubscribeTicker: PropTypes.func,
  ticker: PropTypes.object,
  openOrders: PropTypes.array
};

export default withStyles(styles, { withTheme: true })(MarketChart);



// WEBPACK FOOTER //
// ./src/components/bots/output/marketChart.js