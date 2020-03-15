import React, { Component, Fragment } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import { GridLoader, PulseLoader } from 'react-spinners';
import PropTypes from 'prop-types';
import { withStyles, withTheme } from '@material-ui/core/styles';
import maxBy from 'lodash/maxBy';
import ChangeArrow from '../icons/changeArrow';
import {
  getChangeColor,
  getAmountPrecisionFrom,
  getPricePrecisionFrom,
  getTotalPrecisionFrom,
  isMarketPrefCurrency,
} from '../../utils/helpers';
import { ORDER_SIDE, setLimitPrice } from '../../store/ducks/trade/orderForm';
import { NavTab, NavTabs } from '../tabs';
import Formatted from '../common/formatted';

const styles = theme => ({
  container: {
    height: 'calc(100% - 40px)',
    overflow: 'hidden'
  },
  pane: {
    overflow: 'hidden !important'
  },
  paneContent: {
    position: 'relative',
    height: '100%',
    width: '100%'
  },
  tableHeaderCell: {
    padding: '5px 0',
    fontSize: '0.8571rem',
    lineHeight: '1.071rem',
    backgroundColor: theme.palette.background.paper,
    position: 'sticky',
    top: 0,
    border: 'none'
  },
  tableCell: {
    padding: 0,
    fontSize: '0.8571rem',
    lineHeight: '1.071rem',
    border: 'none',
    '&:last-child': {
      padding: 0,
    }
  },
  tableRow: {
    height: '1.129rem',
    border: 'none',
    '&:hover': {
      cursor: 'pointer',
      backgroundColor: theme.palette.background.paperDarker
    }
  },
  barCell: {
    width: '12%',
    maxWidth: '12%'
  },
  dataCell: {
    width: '24%',
    maxWidth: '24%',
    overflow: 'hidden',
  },
  paperDivider: {
    height: '2.214rem',
    padding: '0.2857rem 0.8571rem',
    backgroundColor: theme.palette.background.paperDarker,
    position: 'sticky !important',
    top: '20px',
    bottom: '0',
    overflow: 'visible',
    borderRadius: '0',
    textAlign: 'center',
  },
  size: {
    color: theme.palette.text.primary
  },
  sizeForOpenOrder: {
    color: theme.palette.primary.main,
    fontWeight: 'bold'
  },
  priceSell: {
    color: theme.palette.icons.red
  },
  priceBuy: {
    color: theme.palette.icons.green
  },
  total: {
    color: theme.palette.text.secondary
  },
  tickerFiat: {
    fontSize: '1.043rem',
    fontWeight: '600',
    lineHeight: '1.429rem',
    color: theme.palette.text.secondary,
    marginLeft: '1.286rem'
  },
  tickerPrice: {
    fontSize: '1.229rem',
    fontWeight: '600',
    lineHeight: '1.643rem',
    color: '#9FC950',
    marginLeft: '20px'
  },
  bar: {
    width: '100%',
    minHeight: '1.429rem',
    height: '100%'
  },
  bidAskContainer: {
    height: '50%',
    overflowY: 'auto',
    overflowX: 'hidden',
  },
  progressContainer: {
    height: '100%',
  }
});

class OrderBook extends Component {
  constructor() {
    super();

    this.asksContainer = React.createRef();
    this.lastTickerPrice = 0.0;
    this.lastChangeDir = 0;

    this.asksContainerScrolledMouse = false;

    this.state = {
      bidOpenOrders: [],
      askOpenOrders: []
    };
  }

  componentDidMount() {
    const { openOrdersData, currentAccountId, currentPair } = this.props;
    this.resetScrolledBottom();
    this.getOpenOrders(openOrdersData, currentAccountId, currentPair);
  }

  componentWillReceiveProps = (nextProps) => {
    if (
      this.props.openOrdersData.length !== nextProps.openOrdersData.length ||
      this.props.currentAccountId !== nextProps.currentAccountId ||
      this.props.currentPair !== nextProps.currentPair
    ) {
      this.getOpenOrders(nextProps.openOrdersData, nextProps.currentAccountId, nextProps.currentPair);
    }
  }

  componentDidUpdate = (prevProps) => {
    const { orderBookStreamData, currentPair, currentExchange } = this.props;
    const { orderBookStreamData: oldOrderBookStreamData, currentPair: oldCurrentPair, currentExchange: oldCurrentExchange } = prevProps;
    if (currentPair !== oldCurrentPair || currentExchange !== oldCurrentExchange) {
      this.resetScrolledBottom();
    }

    const isLoaded =
      orderBookStreamData &&
      orderBookStreamData.asks.length &&
      oldOrderBookStreamData &&
      oldOrderBookStreamData.asks.length;

    if (!isLoaded) return;

    const { asks } = orderBookStreamData;
    const { asks: oldAsks } = oldOrderBookStreamData;

    if (!asks || !oldAsks) return;

    const lowestAsk = asks[asks.length - 1].price;
    const oldLowestAsk = oldAsks[oldAsks.length - 1].price;

    if (lowestAsk !== oldLowestAsk) {
      this.scrollToBottom();
    }
  }

  getOpenOrders = (openOrdersData, currentAccountId, currentPair) => {
    const openOrdersForCurrentAccountAndPair = openOrdersData.filter(order => (order.accountId === currentAccountId && order.pair === currentPair));

    const bidOpenOrders = [];
    const askOpenOrders = [];
    openOrdersForCurrentAccountAndPair.forEach((order) => {
      if (order.side === 'BUY') {
        bidOpenOrders.push(parseFloat(order.price));
      } else {
        askOpenOrders.push(parseFloat(order.price));
      }
    });
    this.setState({
      bidOpenOrders,
      askOpenOrders
    });
  };

  setWidth = (size, maxSize) => {
    const width = (size / maxSize) * 20;
    if (width < 1) return '0.07143rem';

    return `${width}px`;
  };

  resetScrolledBottom = () => {
    this.asksContainerScrolledMouse = false;
  };

  mouseScrolled = () => {
    this.asksContainerScrolledMouse = true;
  }

  scrollToBottom = () => {
    if (!this.asksContainer || !this.asksContainer.current || this.asksContainerScrolledMouse) return;

    this.asksContainer.current.scrollTop = 9999999999;
  };

  calculateMaxSizes = (orders) => {
    if (orders.length) {
      return maxBy(orders, (o) => { return parseFloat(o.volume); }).volume;
    }
    return 0;
  };

  selectOrder = (price, side) => {
    this.props.actions.selectOrder(price, side);
  };

  renderTickerPane = () => {
    const {
      classes, theme, currentExchange, currentPair, ticker, prefCurrency
    } = this.props;

    const { lastChangeDir, lastTickerPrice } = this;

    const isReadyToLoad = Object.keys(ticker).length
      && ticker.bySymbol[currentPair]
      && ticker.bySymbol[currentPair][currentExchange];

    if (!isReadyToLoad) {
      return (
        <Paper className={classes.paperDivider} elevation={0} style={{ paddingTop: '0.5rem' }}>
          <Grid container alignItems="center" justify="center">
            <PulseLoader size={6} color="#52B0B0" loading />
          </Grid>
        </Paper>
      );
    }

    const tickerDisplay = {
      price: parseFloat(ticker.bySymbol[currentPair][currentExchange].price),
      changeDir: lastChangeDir,
    };

    if (tickerDisplay.price > lastTickerPrice) {
      tickerDisplay.changeDir = 1;
    } else if (tickerDisplay.price < lastTickerPrice) {
      tickerDisplay.changeDir = -1;
    }

    this.lastTickerPrice = tickerDisplay.price;
    this.lastChangeDir = tickerDisplay.changeDir;
    const quote = currentPair.split('/')[1];

    return (
      <Paper className={classes.paperDivider} elevation={0}>
        <span
          className={classes.tickerPrice}
          style={{ color: getChangeColor(tickerDisplay.changeDir, theme) }}>
          { tickerDisplay.price &&
            <Formatted
              asset={quote}
              amount={tickerDisplay.price} />
          }
          <ChangeArrow change={tickerDisplay.changeDir} />
        </span>
        <span className={classes.tickerFiat}>
          {!isMarketPrefCurrency(quote, prefCurrency) &&
          <Formatted
            asset={quote}
            amount={tickerDisplay.price}
            convertToPref />
          }
        </span>
      </Paper>
    );
  }

  render() {
    const {
      currentPair,
      currentExchange,
      orderBookStreamData,
      classes,
      precisions,
    } = this.props;

    const { bidOpenOrders, askOpenOrders } = this.state;

    const isLoaded = (
      orderBookStreamData &&
      orderBookStreamData.asks.length && orderBookStreamData.bids.length &&
      currentPair &&
      currentExchange &&
      Object.keys(precisions).length);

    if (!isLoaded) {
      return (
        <Grid container alignItems="center" justify="center" className={classes.progressContainer}>
          <GridLoader color="#52B0B0" size={6} loading />
        </Grid>
      );
    }

    const { bids, asks } = orderBookStreamData;

    const maxSize = Math.max(
      this.calculateMaxSizes(bids),
      this.calculateMaxSizes(asks)
    );

    const quote = currentPair.split('/')[1];
    this.scrollToBottom();

    return (
      <Fragment>
        <NavTabs onChange={() => { this.resetScrolledBottom(); }} disableUnderline>
          <NavTab key="orderBook" label="Order Book" value="ORDER_BOOK" />
        </NavTabs>
        <div className={classes.container} >
          <div className={classes.bidAskContainer} ref={this.asksContainer}>
            <Table>
              <TableHead>
                <TableRow className={classes.tableRow}>
                  <TableCell className={classes.tableHeaderCell} />
                  <TableCell className={classes.tableHeaderCell}>Size</TableCell>
                  <TableCell className={classes.tableHeaderCell}>Price ({quote})</TableCell>
                  <TableCell className={classes.tableHeaderCell}>Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {asks.map((ask) => {
                  const formattedSize = getAmountPrecisionFrom(ask.volume, precisions);
                  const formattedPrice = getPricePrecisionFrom(ask.price, precisions);
                  const formattedTotal = getTotalPrecisionFrom(ask.total, precisions);

                  const orderAtThisPrice = askOpenOrders.includes(parseFloat(ask.price));

                  return (
                    <TableRow classes={ { root: classes.tableRow } }
                      onClick={() => this.selectOrder(formattedPrice, ORDER_SIDE.SELL) }
                      onWheel={() => this.mouseScrolled() }
                      key={ ask.price }>
                      <TableCell className={ `${classes.tableCell} ${classes.barCell}`} style={{ padding: '0' }}>
                        <div
                          className={classes.bar}
                          style={{
                            backgroundColor: getChangeColor(-1),
                            width: this.setWidth(ask.volume, maxSize)
                          }} />
                      </TableCell>
                      <TableCell className={ `${classes.tableCell} ${orderAtThisPrice ? classes.sizeForOpenOrder : classes.size} ${classes.dataCell}` }>
                        {formattedSize}
                      </TableCell>
                      <TableCell className={ `${classes.tableCell} ${classes.priceSell} ${classes.dataCell}` }>
                        {formattedPrice}
                      </TableCell>
                      <TableCell className={ `${classes.tableCell} ${classes.total} ${classes.dataCell}` }>
                        {formattedTotal}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          {
            this.renderTickerPane()
          }
          <div className={classes.bidAskContainer}>
            <Table>
              <TableBody>
                {bids.map((bid) => {
                  const formattedSize = getAmountPrecisionFrom(bid.volume, precisions);
                  const formattedPrice = getPricePrecisionFrom(bid.price, precisions);
                  const formattedTotal = getTotalPrecisionFrom(bid.total, precisions);

                  const orderAtThisPrice = bidOpenOrders.includes(parseFloat(bid.price));

                  return (
                    <TableRow classes={ { root: classes.tableRow } }
                      onClick={() => this.selectOrder(formattedPrice, ORDER_SIDE.BUY)}
                      key={ bid.price } >
                      <TableCell className={ `${classes.tableCell} ${classes.barCell}`} style={{ padding: '0' }}>
                        <div
                          className={classes.bar}
                          style={{
                            backgroundColor: getChangeColor(1),
                            width: this.setWidth(bid.volume, maxSize)
                          }} />
                      </TableCell>
                      <TableCell className={ `${classes.tableCell} ${orderAtThisPrice ? classes.sizeForOpenOrder : classes.size} ${classes.dataCell}` }>
                        {formattedSize}
                      </TableCell>
                      <TableCell className={ `${classes.tableCell} ${classes.priceBuy} ${classes.dataCell}` }>
                        {formattedPrice}
                      </TableCell>
                      <TableCell className={ `${classes.tableCell} ${classes.total} ${classes.dataCell}` }>
                        {formattedTotal}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </Fragment>
    );
  }
}

OrderBook.defaultProps = {
  actions: {},
  precisions: {},
  currentPair: null,
  currentExchange: null,
  currentAccountId: null,
  orderBookStreamData: null,
  ticker: {},
  openOrdersData: []
};

OrderBook.propTypes = {
  actions: PropTypes.objectOf(PropTypes.func),
  classes: PropTypes.object.isRequired,
  orderBookStreamData: PropTypes.object,
  ticker: PropTypes.objectOf(PropTypes.object),
  currentPair: PropTypes.string,
  currentExchange: PropTypes.string,
  currentAccountId: PropTypes.string,
  prefCurrency: PropTypes.string.isRequired,
  precisions: PropTypes.object,
  openOrdersData: PropTypes.array,
  theme: PropTypes.object.isRequired,
};

function mapStateToProps(state) {
  return {
    orderBookStreamData: state.trade.orderBook.orderBookStreamData,
    ticker: state.trade.ticker.ticker,
    currentPair: state.trade.interactions.currentPair,
    currentExchange: state.trade.interactions.currentExchange,
    currentAccountId: state.trade.interactions.currentAccountId,
    prefCurrency: state.global.user.user.preferences.pref_currency,
    openOrdersData: state.global.orders.openOrdersData,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: { ...bindActionCreators({ selectOrder: setLimitPrice }, dispatch) }
  };
}

const base = withTheme()(withStyles(styles)(OrderBook));
export default connect(mapStateToProps, mapDispatchToProps)(base);



// WEBPACK FOOTER //
// ./src/components/trade/orderBook.js