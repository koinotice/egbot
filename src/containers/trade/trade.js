import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import debounce from 'lodash/debounce';
import Paper from '@material-ui/core/Paper';
import PropTypes from 'prop-types';
import { withStyles, withTheme } from '@material-ui/core/styles';
import { Responsive, WidthProvider } from 'react-grid-layout';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import Icon from '@material-ui/core/Icon';
import { Helmet } from 'react-helmet';
import TVChart from '../../components/trade/tvChart';
import OrderBook from '../../components/trade/orderBook';
import TradingHistory from '../../components/trade/tradeHistory';
import OrderForm from '../../components/trade/orderForm';
import LeftSideBar from './leftSideBar';
import TickerBar from './topBar';
import AccountActivity from '../../components/trade/accountActivity';
import { initTradeScreen, unsubscribeAllStreams, updatePair, updateMarket, updateExchange } from '../../store/ducks/trade/interactions';
import { showSaveLayoutPrompt } from '../../store/ducks/global/user';
import { formatCurrency } from '../../utils/helpers';
import { ORDER_TYPES, ORDER_SIDE, updateOrderAmount, updateOrderSide, updateOrderType, updateOrderPrice, updateStopPrice } from '../../store/ducks/trade/orderForm';
import { cancelOrder } from '../../store/ducks/global/orders';
import '../../../node_modules/react-grid-layout/css/styles.css';
import '../../../node_modules/react-resizable/css/styles.css';
import { getSessionToken } from '../../utils/token';
import EmptyStateCover from '../../components/common/emptyStateCover';

const ResponsiveGridLayout = WidthProvider(Responsive);

const styles = theme => ({
  root: {
    flex: 1,
    paddingTop: '46px',
    [theme.breakpoints.down('600')]: {
      paddingBottom: '56px',
    }
  },
  paper: {
    overflow: 'auto',
    transitionProperty: 'none',
  },
  leftBarWrapper: {
    padding: '1rem',
  },
  grid: {
    padding: '0 !important',
    width: '20rem'
  },
  balance: {
    marginBottom: '1.071rem',
  },
  linkAccount: {
    color: theme.palette.text.secondary,
    fontStyle: 'italic',
    margin: '1.5rem 0',
  },
  mobileMenu: {
    position: 'fixed',
    width: '100%',
    bottom: 0,
    zIndex: 1000
  },
  hidden: {
    visibility: 'hidden'
  }
});

class Trade extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isMobile: false,
      mobileView: 0,
      rowHeight: 144,
      layoutChanging: false,
    };
    this.sessionToken = getSessionToken();
    this.layoutChanged = false;
  }

  componentDidMount() {
    const { actions } = this.props;
    actions.initTradeScreen();
    this.updateScreenSize();
    this.debouncedUpdateScreenSize = debounce(this.updateScreenSize, 500);
    window.addEventListener('resize', this.debouncedUpdateScreenSize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.debouncedUpdateScreenSize);
    this.props.actions.unsubscribeAllStreams();
  }

  getCurrentPairPrice = () => {
    const tradeData = this.props.ticker.bySymbol;
    if (tradeData
      && tradeData[this.props.currentPair]
      && tradeData[this.props.currentPair][this.props.currentExchange]) {
      return parseFloat(tradeData[this.props.currentPair][this.props.currentExchange].price);
    }
    return 0;
  }

  getExchangeLabel = () => {
    const { exchanges, currentExchange } = this.props;
    return exchanges && exchanges[currentExchange] ? exchanges[currentExchange].exchange_label : '';
  };

  setPairFromHoldingsTable = (pair) => {
    const { actions } = this.props;
    const market = pair.split('/')[1];

    actions.updatePair(pair);
    actions.updateMarket(market);
  };

  getTitle = () => {
    // to be displayed in browser tab
    const { currentPair } = this.props;
    const currentPrice = this.getCurrentPairPrice();
    const exchangeLabel = this.getExchangeLabel();
    const template = 'Trade | Quadency';
    const baseCurrency = currentPair.split('/')[1];
    if (currentPrice !== 0) {
      return `${formatCurrency(baseCurrency, currentPrice)} - ${currentPair} @ ${exchangeLabel} | ${template}`;
    }
    return template;
  };

  getTradeLimitUsage() {
    const { features } = this.props;
    const tradeFeature = Object.keys(features).find(feature => feature.startsWith('TRADE'));
    if (tradeFeature && features[tradeFeature].trade_limit) {
      return features[tradeFeature].trade_limit;
    }
    return 0;
  }

  setOrderPriceFromChart = (price) => {
    const {
      actions, ticker, currentExchange, currentPair, orderType
    } = this.props;

    if (!currentExchange || !currentPair || !ticker) {
      return;
    }

    const tickerPrice = ticker.bySymbol[currentPair][currentExchange].price;
    let orderSide;
    if (orderType === ORDER_TYPES.MARKET || orderType === ORDER_TYPES.LIMIT) {
      if (orderType === ORDER_TYPES.MARKET) {
        actions.updateOrderType(ORDER_TYPES.LIMIT);
      }
      orderSide = price <= tickerPrice ? ORDER_SIDE.BUY : ORDER_SIDE.SELL;
    } else {
      orderSide = price <= tickerPrice ? ORDER_SIDE.SELL : ORDER_SIDE.BUY;
      actions.updateStopPrice(price);
    }

    actions.updateOrderSide(orderSide);
    actions.updateOrderPrice(price);
  }

  updateScreenSize = () => {
    const rowHeight = (window.innerHeight - 80) / 32;
    this.setState({
      rowHeight,
      isMobile: window.innerWidth < 768
    });
  };

  handleMobileViewChange = (event, value) => {
    this.setState({ mobileView: value });
  };

  handleLayoutChange = (layout) => {
    if (this.layoutChanged) {
      const { actions } = this.props;
      actions.showSaveLayoutPrompt(layout);
      this.layoutChanged = false;
    }
  };

  handleDragResizeStart = () => {
    this.setState({
      layoutChanging: true
    });
  };

  handleDragResizeStop = () => {
    this.setState({
      layoutChanging: false
    });
    this.layoutChanged = true;
  };

  renderOrderForm = (classes, currentAccountId, currentExchange, exchangeLabel, tradeSelectBalance, isLoading) => {
    if (!this.sessionToken) {
      return (
        <div className={classes.leftBarWrapper}>
          <LeftSideBar />
          <EmptyStateCover
            title="Sign Up to Trade"
            subheading={`Experience a smarter way to trade cryptocurrency on all major exchanges, including ${exchangeLabel}.`}
            cta="Get Started"
            ctaPath="/a/signup" />
        </div>);
    }

    if (currentExchange && !currentAccountId) {
      return (
        <div className={classes.leftBarWrapper}>
          <LeftSideBar />
          <EmptyStateCover
            iconSmall
            icon="disconnected"
            title="No Account"
            subheading={`Connect your ${ currentExchange ? exchangeLabel : ''} account to start trading`}
            cta="Add Account"
            ctaPath="/a/onboarding/select-exchange" />
        </div>
      );
    }
    return (
      <div className={classes.leftBarWrapper}>
        <LeftSideBar />
        <div>
          <OrderForm
            className={classes.balance}
            tradeSelectBalance={tradeSelectBalance}
            isLoading={isLoading}
            precisions={this.props.exchangeMarketsData[this.props.currentPair]
              ? this.props.exchangeMarketsData[this.props.currentPair]
              : {}}
            updateOrderSide={this.props.actions.updateOrderSide}
            updateOrderAmount={this.props.actions.updateOrderAmount}
            tradeUsage={this.getTradeLimitUsage()} />
        </div>
      </div>
    );
  };

  render() {
    const {
      classes,
      tradeLayout,
      tradeSelectBalance,
      isLoading,
      ticker,
      currentAccountId,
      currentPair,
      currentExchange,
      actions,
      exchangeMarketsData,
      openOrdersData,
    } = this.props;

    const {
      rowHeight,
      isMobile,
      mobileView,
      layoutChanging,
    } = this.state;

    const exchangeLabel = this.getExchangeLabel();
    return (
      <div className={classes.root}>

        <Helmet>
          <title>{this.getTitle()}</title>
        </Helmet>
        { !isMobile &&
          <ResponsiveGridLayout className="layout animated"
            layouts={{
              lg: tradeLayout,
            }}
            rowHeight={rowHeight}
            margin={[1, 1]}
            draggableHandle=".dragHandle"
            onLayoutChange={this.handleLayoutChange}
            onDragStart={this.handleDragResizeStart}
            onResizeStart={this.handleDragResizeStart}
            onDragStop={this.handleDragResizeStop}
            onResizeStop={this.handleDragResizeStop}
            isDraggable
            breakpoints={{
              lg: 1200, md: 996,
            }}
            cols={{
              lg: 32, md: 32,
            }}>
            <Paper square key="orderForm" className={classes.paper}>
              {this.renderOrderForm(
                classes,
                currentAccountId,
                currentExchange,
                exchangeLabel,
                tradeSelectBalance,
                isLoading,
              )}
            </Paper>
            <Paper square key="chart" className={classes.paper}>
              <TickerBar />
              <TVChart
                setExchange={actions.updateExchange}
                setPair={actions.updatePair}
                pair={currentPair}
                exchange={currentExchange}
                account={currentAccountId}
                ticker={ticker}
                setPrice={this.setOrderPriceFromChart}
                cancelOrder={actions.cancelOrder}
                openOrdersData={openOrdersData}
                precisions={this.props.exchangeMarketsData[this.props.currentPair]
                  ? this.props.exchangeMarketsData[this.props.currentPair].precision
                  : {}}
                layoutChanging={layoutChanging} />
            </Paper>
            <Paper key="accountActivity" square className={classes.paper} style={{ overflow: 'hidden' }}>
              <AccountActivity />
            </Paper>
            <Paper square key="orderBook" className={classes.paper}>
              <OrderBook
                precisions={this.props.exchangeMarketsData[this.props.currentPair]
                  ? this.props.exchangeMarketsData[this.props.currentPair].precision
                  : {}} />
            </Paper>
            <Paper square key="tradeHistory" className={classes.paper}>
              <TradingHistory
                precisions={exchangeMarketsData[currentPair] ? exchangeMarketsData[currentPair].precision : {}} />
            </Paper>
          </ResponsiveGridLayout>
        }
        { isMobile &&
          <div>
            <BottomNavigation
              className={classes.mobileMenu}
              value={mobileView}
              onChange={this.handleMobileViewChange}
              showLabels>
              <BottomNavigationAction icon={<Icon>import_export</Icon>} />
              <BottomNavigationAction icon={<Icon>show_chart</Icon>} />
              <BottomNavigationAction icon={<Icon>tab</Icon>} />
              <BottomNavigationAction icon={<Icon>view_stream</Icon>} />
              <BottomNavigationAction icon={<Icon>reorder</Icon>} />
            </BottomNavigation>
            <ResponsiveGridLayout className="layout animated"
              layouts={{
                sm: [
                  {
                    i: 'mobile', x: 0, y: 0, w: 32, h: 32,
                  }],
              }}
              rowHeight={rowHeight}
              margin={[1, 1]}
              isDraggable={false}
              isResizable={false}
              breakpoints={{
                sm: 768,
              }}
              cols={{
                sm: 32,
              }}>
              <Paper square key="mobile" className={classes.paper}>
                <TickerBar />
                {(mobileView === 0) &&
                this.renderOrderForm(
                  classes,
                  currentAccountId,
                  currentExchange,
                  exchangeLabel,
                  tradeSelectBalance,
                  isLoading,
                )}
                {(mobileView === 1) &&
                  <TVChart style={{ height: '100%' }}
                    pair={currentPair}
                    exchange={currentExchange}
                    setExchange={actions.updateExchange}
                    setPair={actions.updatePair}
                    ticker={ticker} />
                }
                {(mobileView === 2) && <AccountActivity />}
                {(mobileView === 3) &&
                  <OrderBook
                    precisions={this.props.exchangeMarketsData[this.props.currentPair]
                      ? this.props.exchangeMarketsData[this.props.currentPair].precision
                      : {}} />
                }
                {(mobileView === 4) &&
                <TradingHistory
                  precisions={exchangeMarketsData[currentPair] ? exchangeMarketsData[currentPair].precision : {}} />
                }
              </Paper>
            </ResponsiveGridLayout>
          </div>
        }
      </div>
    );
  }
}

Trade.defaultProps = {
  tradeSelectBalance: {},
  ticker: {},
  currentAccountId: '',
  currentPair: '',
  currentExchange: '',
  exchanges: {},
  exchangeMarketsData: {},
  openOrdersData: [],
  features: {}
};

Trade.propTypes = {
  actions: PropTypes.objectOf(PropTypes.func).isRequired,
  classes: PropTypes.object.isRequired,
  tradeLayout: PropTypes.array.isRequired,
  tradeSelectBalance: PropTypes.object,
  isLoading: PropTypes.bool.isRequired,
  ticker: PropTypes.objectOf(PropTypes.object),
  currentAccountId: PropTypes.string,
  currentPair: PropTypes.string,
  currentExchange: PropTypes.string,
  exchanges: PropTypes.object,
  exchangeMarketsData: PropTypes.object,
  openOrdersData: PropTypes.array,
  features: PropTypes.object,
  orderType: PropTypes.number.isRequired,
};

function mapStateToProps(state) {
  return {
    tradeLayout: state.global.user.user.preferences.other.tradeLayout,
    tradeSelectBalance: state.trade.pairBalances.balance,
    isLoading: state.trade.pairBalances.isLoading,
    ticker: state.trade.ticker.ticker,
    currentAccountId: state.trade.interactions.currentAccountId,
    currentPair: state.trade.interactions.currentPair,
    currentExchange: state.trade.interactions.currentExchange,
    exchanges: state.global.exchanges.exchanges,
    exchangeMarketsData: state.trade.markets.exchangeMarketsData,
    openOrdersData: state.global.orders.openOrdersData,
    features: state.global.paywall.features,
    orderType: state.trade.orderForm.orderType,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      ...bindActionCreators({
        showSaveLayoutPrompt,
        initTradeScreen,
        unsubscribeAllStreams,
        updateExchange,
        updatePair,
        updateMarket,
        updateOrderSide,
        updateOrderType,
        updateOrderPrice,
        updateStopPrice,
        updateOrderAmount,
        cancelOrder,
      }, dispatch)
    }
  };
}

const base = (withTheme()(withStyles(styles)(Trade)));
export default connect(mapStateToProps, mapDispatchToProps)(base);



// WEBPACK FOOTER //
// ./src/containers/trade/trade.js