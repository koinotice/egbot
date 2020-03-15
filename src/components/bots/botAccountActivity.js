import React, { Fragment, Component } from 'react';
import { withRouter } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { NavTab, NavTabs } from '../tabs';
import Trades from './output/trades';
import OpenOrders from './output/openOrders';
import Positions from './output/positions';
import { STATUSES } from '../../utils/botConstants';

const styles = () => ({
  scrollContainer: {
    height: 'calc(100% - 40px)',
    overflowY: 'auto'
  },
  paper: {
    marginTop: '1.0714rem',
    display: 'flex',
  },
});

const ACTIVITY_TABS = {
  OPEN_POSITIONS: 'OPEN_POSITIONS',
  OPEN_ORDERS: 'OPEN_ORDERS',
  TRADES: 'TRADES',
};
Object.freeze(ACTIVITY_TABS);

class BotAccountActivity extends Component {
  static getDerivedStateFromProps(props, state) {
    if (state.currentTab === ACTIVITY_TABS.OPEN_POSITIONS && props.botStatus !== STATUSES.RUNNING.toUpperCase()) {
      return {
        ...state,
        currentTab: ACTIVITY_TABS.OPEN_ORDERS
      };
    }
    return state;
  }

  constructor(props) {
    super(props);

    this.state = {
      currentTab: props.botStatus === STATUSES.RUNNING.toUpperCase()
        ? ACTIVITY_TABS.OPEN_POSITIONS
        : ACTIVITY_TABS.OPEN_ORDERS,
    };
  }

  setCurrentTab = (val) => {
    this.setState({
      currentTab: val,
    });
  };

  selectOrder = (order) => {
    const { updatePair, updateAccount, history } = this.props;
    updatePair(order.pair);
    updateAccount(order.accountId);
    history.push('/trade');
  };

  renderSelectedTab = () => {
    const { currentTab } = this.state;
    const {
      trades,
      positions,
      openOrders,
      accounts,
      cancelOrder,
      ticker
    } = this.props;

    switch (currentTab) {
      case ACTIVITY_TABS.OPEN_POSITIONS:
        return (<Positions
          positions={positions}
          ticker={ticker} />);
      case ACTIVITY_TABS.OPEN_ORDERS:
        return (
          <OpenOrders
            orders={openOrders}
            accounts={accounts}
            selectOrder={this.selectOrder}
            cancelOrder={cancelOrder} />
        );
      case ACTIVITY_TABS.TRADES:
        return (
          <Trades data={trades} />
        );
      default:
        return (<div />);
    }
  };

  render() {
    const {
      classes,
      openOrders,
      botStatus,
    }
    = this.props;

    const {
      currentTab,
    } = this.state;

    return (
      <Fragment>
        <div className={classes.paper}>
          <NavTabs justify="flex-start" value={currentTab} onChange={this.setCurrentTab}>
            {botStatus === STATUSES.RUNNING.toUpperCase() &&
            <NavTab
              name="openPositions"
              key="openPositions"
              label="Open Positions"
              value={ACTIVITY_TABS.OPEN_POSITIONS} />
            }
            <NavTab
              name="openOrders"
              key="openOrders"
              label="Open Orders"
              badgeValue={ openOrders.length }
              value={ACTIVITY_TABS.OPEN_ORDERS} />
            <NavTab
              name="tradeHistory"
              key="tradeHistory"
              label="Trade History"
              value={ACTIVITY_TABS.TRADES} />
          </NavTabs>
        </div>
        <div className={classes.scrollContainer} style={{ flex: 1 }}>
          {this.renderSelectedTab()}
        </div>
      </Fragment>
    );
  }
}

BotAccountActivity.defaultProps = {
  ticker: {}
};

BotAccountActivity.propTypes = {
  classes: PropTypes.object.isRequired,
  openOrders: PropTypes.array.isRequired,
  trades: PropTypes.array.isRequired,
  positions: PropTypes.array.isRequired,
  accounts: PropTypes.array.isRequired,
  cancelOrder: PropTypes.func.isRequired,
  botStatus: PropTypes.string.isRequired,
  updatePair: PropTypes.func.isRequired,
  updateAccount: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  ticker: PropTypes.object
};


export default withRouter(withStyles(styles, { withTheme: true })(BotAccountActivity));



// WEBPACK FOOTER //
// ./src/components/bots/botAccountActivity.js