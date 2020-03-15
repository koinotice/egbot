import logger from '../logger';
import { formatAmount } from '../helpers';

export default class ChartOpenOrdersHandler {
  constructor(exchange, account, pair, cancelOrderFn, openOrdersData = null, chart = null) {
    this.exchange = exchange;
    this.account = account;
    this.pair = pair;
    this.cancelOrderFn = cancelOrderFn;

    this.chart = chart;
    this.currentOpenOrders = openOrdersData ? this.getOpenOrdersForExchangeAccountPair(openOrdersData) : [];

    this.openOrderLines = [];

    if (this.currentOpenOrders.length > 0 && this.chart) {
      this.showOpenOrdersOnChart();
    }
  }

  // Private
  getOpenOrdersForExchangeAccountPair = (openOrdersData) => {
    return openOrdersData.filter((order) => {
      return (order.exchange === this.exchange && order.accountId === this.account && order.pair === this.pair);
    });
  }

  createBuyOrderLine = () => (
    this.chart.createOrderLine()
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

  createSellOrderLine = () => (
    this.chart.createOrderLine()
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

  showOpenOrdersOnChart = () => {
    if (!this.chart) {
      logger.error('no reference to chart');
      return;
    }
    this.currentOpenOrders.forEach((order) => {
      const base = order.pair.split('/')[0];
      const price = parseFloat(order.price);
      const amount = formatAmount(base, order.amount);
      const openOrderLine = order.side === 'BUY' ? this.createBuyOrderLine() : this.createSellOrderLine();
      openOrderLine
        .setPrice(price)
        .setQuantity(amount)
        .setText(order.side)
        .onMove(() => openOrderLine.setPrice(price))
        .onCancel(() => {
          this.cancelOrderFn(order.e_orderId, order.accountId);
          openOrderLine.setCancelButtonBackgroundColor('rgba(161, 149, 149, 0.5)');
          openOrderLine.setCancelButtonBorderColor('rgba(161, 149, 149, 0.5)');
          openOrderLine.setEditable(false);
        });
      this.openOrderLines.push(openOrderLine);
    });
  }

  clearOpenOrdersFromChart = () => {
    if (this.openOrderLines.length === 0) {
      return;
    }
    this.openOrderLines.forEach(order => order.remove());
    this.openOrderLines = [];
  };

  // public
  setChart = (chart) => {
    this.chart = chart;
  }

  updateOpenOrders = (exchange, account, pair, openOrdersData) => {
    const oldExchange = this.exchange;
    const oldAccount = this.account;
    const oldPair = this.pair;
    const oldOpenOrders = this.currentOpenOrders;

    this.exchange = exchange;
    this.account = account;
    this.pair = pair;
    this.currentOpenOrders = this.getOpenOrdersForExchangeAccountPair(openOrdersData);

    if (exchange !== oldExchange || account !== oldAccount || pair !== oldPair || oldOpenOrders.length !== this.currentOpenOrders.length) {
      this.clearOpenOrdersFromChart();
      this.showOpenOrdersOnChart();
    }
  }
}



// WEBPACK FOOTER //
// ./src/utils/chart/chartOpenOrdersHandler.js