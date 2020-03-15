import React, { Component } from 'react';
import jstz from 'jstimezonedetect';
import PropTypes from 'prop-types';
import { BarLoader } from 'react-spinners';
import { withStyles, withTheme } from '@material-ui/core/styles';
import { PUBLIC_API_ROOT } from '../../config/apiConfig';
import logger from '../../utils/logger';
import QuadencyUdfDatafeed from '../../utils/chart/quadencyUdfDatafeed';
import QuadencyChartSaveAdapter from '../../utils/chart/quadencyChartSaveAdapter';
import ChartOpenOrdersHandler from '../../utils/chart/chartOpenOrdersHandler';
import ChartOrderHistoryHandler from '../../utils/chart/chartTradeHistoryHandler';
import { getPricePrecisionFrom } from '../../utils/helpers';
import { getSessionToken } from '../../utils/token';
import withPaywall from '../hocs/paywall';
import * as indicatorStyleOverrides from '../../utils/chart/indicatorStyleOverrides.json';

const styles = () => ({
  container: {
    height: 'calc(100% - 50px)',
  },
  innerContainer: {
    width: '100%',
    height: '100%',
    position: 'relative'
  },
  chartContainer: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  progressContainer: {
    position: 'absolute',
    top: '50%',
    left: 'calc(50% - 50px)',
    zIndex: '5000'
  },
  hide: {
    visibility: 'hidden'
  }
});

class TVChart extends Component {
  constructor(props) {
    super(props);
    this.CHART_STATES = {
      NOT_LOADED: 0,
      LOADING: 1,
      LOADED: 2,
    };
    Object.freeze(this.CHART_STATES);

    this.chartIsReady = this.CHART_STATES.NOT_LOADED;
    this.widget = null;
    this.state = {
      isLoaded: false,
    };

    this.datafeed = null;
    this.chartSaveAdapter = null;
    this.chartOpenOrdersHandler = null;
    this.chartTradeHistoryHandler = null;

    this.crossHairPrice = null;

    this.chartToLoad = null;
  }

  componentDidUpdate(prevProps) {
    const {
      pair, exchange, account, ticker, theme, openOrdersData, isFeatureEnabled
    } = this.props;

    if (pair && exchange) {
      if (this.chartIsReady === this.CHART_STATES.NOT_LOADED ||
          prevProps.theme.palette.type !== theme.palette.type ||
          prevProps.isFeatureEnabled.CHARTS !== isFeatureEnabled.CHARTS) {
        this.chartIsReady = this.CHART_STATES.LOADING;
        this.datafeed = new QuadencyUdfDatafeed(`${PUBLIC_API_ROOT}/charts/exchange/${exchange}`, exchange, pair);
        this.chartSaveAdapter = new QuadencyChartSaveAdapter(exchange, this.updateExchangeAndPair);
        this.chartOpenOrdersHandler = null;
        this.chartTradeHistoryHandler = null;
        this.initTVChart(exchange, account, pair, openOrdersData, theme, isFeatureEnabled.CHARTS);
        return;
      }

      if (this.chartIsReady === this.CHART_STATES.LOADED) {
        this.datafeed.setExchange(exchange);
        this.datafeed.setPair(pair);

        if (prevProps.exchange !== exchange) {
          if (this.chartIsReady === this.CHART_STATES.LOADED && this.widget) {
            this.chartSaveAdapter.updateExchange(exchange);
            this.datafeed.updateDatafeedURL(`${PUBLIC_API_ROOT}/charts/exchange/${exchange}`);
            this.widget.activeChart().resetData();
          }

          // Reset feed only when switch exchanges but have same pair otherwise chart wont fetch new data because it detect
          // as the same pair.  For all other scenarios we don't need to reset chart
          if (prevProps.pair === pair) {
            this.datafeed.resetFeed();
          }
          return;
        }

        this.widget.activeChart().setSymbol(`${exchange}:${pair}`, () => {
          logger.debug('symbol switched to', pair);
        });

        if (this.chartToLoad) {
          this.widget.loadChartFromServer(this.chartToLoad);
          this.chartToLoad = null;
        }

        if (this.datafeed && ticker && ticker.bySymbol && ticker.bySymbol[pair] && ticker.bySymbol[pair][exchange]) {
          this.datafeed.updateCurrentCandle(ticker.bySymbol[pair][exchange]);
        }

        if (this.chartOpenOrdersHandler && this.widget.chart().dataReady()) {
          this.chartOpenOrdersHandler.updateOpenOrders(exchange, account, pair, openOrdersData);
        }

        if (this.chartTradeHistoryHandler && this.widget.chart().dataReady()) {
          this.chartTradeHistoryHandler.showTradesOnChart(exchange, account, pair);
        }
      }
    }
  }

  componentWillUnmount() {
    if (this.chartIsReady === this.CHART_STATES.LOADED && this.widget) {
      this.widget.unsubscribe('chart_loaded', this.clickListener.reregister);
      this.widget.remove();
      this.clickListener.unregister();
    }
    this.datafeed = null;
    this.chartSaveAdapter = null;
    this.chartOpenOrdersHandler = null;
    this.chartTradeHistoryHandler = null;
  }

  onChartClick() {
    const {
      setPrice,
      precisions,
    } = this.props;


    const precisionPrice = getPricePrecisionFrom(this.crossHairPrice, precisions);
    setPrice(precisionPrice);
  }

  cancelOpenOrder = (orderId, accountId) => {
    const { cancelOrder, isFeatureEnabled, showPaywallModal } = this.props;
    if (!isFeatureEnabled.TRADE) {
      showPaywallModal();
      return;
    }
    cancelOrder(orderId, accountId);
  }

  updateExchangeAndPair = (exchange, pair, chartId, callback) => {
    const {
      setExchange, setPair, pair: currentPair, exchange: currentExchange
    } = this.props;
    if (exchange !== currentExchange) {
      setExchange(exchange);
      this.chartToLoad = {
        id: chartId
      };
    }
    if (pair !== currentPair) {
      setPair(pair);
    }
    callback();
  }

  initTVChart = (exchange, account, pair, openOrdersData, theme, isChartsEnabled) => {
    const widgetOptions = {
      symbol: pair,
      interval: '60',
      timezone: jstz.determine().name(),
      container_id: 'tvChartContainer',
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
        'border_around_the_chart',
        'go_to_date',
        'hide_left_toolbar_by_default'
      ],
      enabled_features: ['side_toolbar_in_fullscreen_mode', 'keep_left_toolbar_visible_on_small_screens', 'left_toolbar'],
      side_toolbar_in_fullscreen_mode: true,
      save_load_adapter: this.chartSaveAdapter,
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

    if (theme.palette.type === 'dark') Object.assign(widgetOptions, darkThemeOptions);

    if (!getSessionToken() || !isChartsEnabled) {
      widgetOptions.disabled_features.push('header_saveload');
    }

    this.widget = new window.TradingView.widget(widgetOptions);
    this.widget.onChartReady(() => {
      const chart = this.widget.chart();
      chart.createStudy('volume', true);
      this.chartIsReady = this.CHART_STATES.LOADED;
      this.setState({
        isLoaded: true,
      });

      chart.dataReady(() => {
        this.chartOpenOrdersHandler = new ChartOpenOrdersHandler(exchange, account, pair, this.cancelOpenOrder, openOrdersData, chart);
        this.chartTradeHistoryHandler = new ChartOrderHistoryHandler(exchange, account, pair, chart);
      });

      this.clickListener.register();
      this.widget.subscribe('chart_loaded', () => {
        this.clickListener.reregister();
        this.chartOpenOrdersHandler = new ChartOpenOrdersHandler(exchange, account, pair, this.cancelOpenOrder, null, chart);
        this.chartTradeHistoryHandler = new ChartOrderHistoryHandler(exchange, account, pair, chart);
      });

      chart.crossHairMoved(({ price }) => {
        this.crossHairPrice = price;
      });
    });
  };

  clickListener = (() => {
    let chartArea = null;

    let drag = false;

    const _onMouseDown = () => {
      drag = false;
    };
    const _onMouseMove = () => {
      drag = true;
    };
    const _onMouseUp = () => {
      if (!drag) {
        this.onChartClick();
      }
    };

    const register = () => {
      /* eslint-disable-next-line */
      chartArea = document
        .getElementById('tvChartContainer')
        .firstChild
        .contentWindow
        .document
        .getElementsByClassName('chart-markup-table')[0];

      chartArea.addEventListener('mousedown', _onMouseDown);
      chartArea.addEventListener('mousemove', _onMouseMove);
      chartArea.addEventListener('mouseup', _onMouseUp);
    };

    const unregister = () => {
      chartArea.removeEventListener('mousedown', _onMouseDown);
      chartArea.removeEventListener('mousemove', _onMouseMove);
      chartArea.removeEventListener('mouseup', _onMouseUp);
      chartArea = null;
    };

    const reregister = () => {
      unregister();
      register();
    };

    return {
      register,
      unregister,
      reregister
    };
  })();

  render() {
    const { classes, layoutChanging } = this.props;
    const { isLoaded, } = this.state;

    return (
      <div className={classes.container}>
        <div className={classes.innerContainer}>
          { (!isLoaded || layoutChanging) &&
            <div className={classes.progressContainer}>
              <BarLoader size={30} color="#52B0B0" loading />
            </div>
          }
          <div className={ `${classes.chartContainer} ${(!isLoaded || layoutChanging) ? classes.hide : ''}`} id="tvChartContainer" />
        </div>
      </div>
    );
  }
}

TVChart.defaultProps = {
  pair: '',
  exchange: '',
  ticker: {},
  precisions: {},
  setPrice: null,
  openOrdersData: []
};

TVChart.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  pair: PropTypes.string,
  exchange: PropTypes.string,
  ticker: PropTypes.object,
  setPrice: PropTypes.func,
  precisions: PropTypes.object,
  setExchange: PropTypes.func.isRequired,
  setPair: PropTypes.func.isRequired,
  layoutChanging: PropTypes.bool.isRequired,
  isFeatureEnabled: PropTypes.object.isRequired,
  openOrdersData: PropTypes.array,
  account: PropTypes.string.isRequired,
  cancelOrder: PropTypes.func.isRequired,
  showPaywallModal: PropTypes.func.isRequired
};

export default withPaywall(['CHARTS', 'TRADE'])(withTheme()(withStyles(styles)(TVChart)));



// WEBPACK FOOTER //
// ./src/components/trade/tvChart.js