import React, { Component, Fragment } from 'react';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { NavTab, NavTabs } from '../tabs';
import OpenOrdersTable from '../tables/openOrdersTable';
import OrderHistoryTable from '../tables/orderHistoryTable';
import HoldingsTable from '../tables/holdingsTable';
import TradesTable from '../tables/tradesTable';
import TransactionsTable from '../tables/transactionsTable';

const styles = {
  tabsContainer: {
    marginBottom: '1.0714rem'
  }
};

const ACTIVITY_TABS = {
  BALANCES: 'BALANCES',
  OPEN_ORDERS: 'OPEN_ORDERS',
  ORDER_HISTORY: 'ORDER_HISTORY',
  TRADES: 'TRADES',
  TRANSACTIONS: 'TRANSACTIONS',
};
Object.freeze(ACTIVITY_TABS);

class ProfileHoldings extends Component {
  constructor() {
    super();

    this.state = {
      currentTab: ACTIVITY_TABS.BALANCES
    };
  }

  setCurrentTab = (val) => {
    this.setState({
      currentTab: val
    });
  };

  renderSelectedTab = (currentTab) => {
    const { symbol } = this.props;

    switch (currentTab) {
      case ACTIVITY_TABS.BALANCES:
        return (
          <HoldingsTable filterSymbol={symbol} />
        );
      case ACTIVITY_TABS.OPEN_ORDERS:
        return (
          <OpenOrdersTable filterSymbol={symbol} />
        );
      case ACTIVITY_TABS.ORDER_HISTORY:
        return (
          <OrderHistoryTable filterSymbol={symbol} />
        );
      case ACTIVITY_TABS.TRADES:
        return (
          <TradesTable filterSymbol={symbol} />
        );
      case ACTIVITY_TABS.TRANSACTIONS:
        return (
          <TransactionsTable filterSymbol={symbol} />
        );
      default:
        return <div />;
    }
  };

  render() {
    const { classes } = this.props;
    const { currentTab } = this.state;

    return (
      <Fragment>
        <div className={classes.tabsContainer}>
          <NavTabs value={currentTab} onChange={this.setCurrentTab}>
            <NavTab label="Balances" value={ACTIVITY_TABS.BALANCES} />
            <NavTab label="Open Orders" value={ACTIVITY_TABS.OPEN_ORDERS} />
            <NavTab label="History" value={ACTIVITY_TABS.ORDER_HISTORY} />
            <NavTab label="Trades" value={ACTIVITY_TABS.TRADES} />
            <NavTab label="Transfers" value={ACTIVITY_TABS.TRANSACTIONS} />
          </NavTabs>
        </div>
        {this.renderSelectedTab(currentTab)}
      </Fragment>
    );
  }
}

ProfileHoldings.propTypes = {
  classes: PropTypes.object.isRequired,
  symbol: PropTypes.string.isRequired
};

export default withStyles(styles)(ProfileHoldings);



// WEBPACK FOOTER //
// ./src/components/coins/profileHoldings.js