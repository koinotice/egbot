import React, { Fragment, Component } from 'react';
import Button from '@material-ui/core/Button';
import Modal from '@material-ui/core/Modal';
import Paper from '@material-ui/core/Paper';
import Icon from '@material-ui/core/Icon';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withTheme, withStyles } from '@material-ui/core/styles';
import { PulseLoader } from 'react-spinners';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import { NavTab, NavTabs } from '../tabs';
import OpenOrdersTable from '../tables/openOrdersTable';
import OrderHistoryTable from '../tables/orderHistoryTable';
import HoldingsTable from '../tables/holdingsTable';
import TradesTable from '../tables/tradesTable';
import TransactionsTable from '../tables/transactionsTable';
import { fetchHoldings } from '../../store/ducks/holdings/holdings';
import { getSessionToken } from '../../utils/token';
import { updateAccountFilter, updatePairFilter } from '../../store/ducks/trade/interactions';
import { canceAllOrders } from '../../store/ducks/global/orders';
import withPaywall from '../hocs/paywall';
import { ACCOUNT_TYPES } from '../../utils/types';
import ManualAccount from '../modals/manualAccount';
import { getAssetsFrom, ellipsize } from '../../utils/helpers';

const styles = theme => ({
  scrollContainer: {
    height: 'calc(100% - 60px)',
    overflowY: 'auto'
  },
  progressContainer: {
    height: '100%',
  },
  paper: {
    display: 'flex',
  },
  tabsContainer: {
    marginBottom: '1.0714rem'
  },
  checkBox: {
    width: '25px',
    height: '25px',
    marginRight: '5px',
  },
  checkBoxLabel: {
    fontSize: '0.8571rem',
    color: theme.palette.text.secondary,
  },
  checkBoxLabelRoot: {
    marginLeft: '5px',
  },
  emptyTableText: {
    color: theme.palette.text.secondary,
    fontStyle: 'italic',
    margin: '1.5rem 0',
  },
  drag: {
    flexGrow: 1
  },
  modal: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalPaper: {
    position: 'absolute',
    width: theme.spacing.unit * 75,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing.unit * 4,
    textAlign: 'center',
    '&:focus': {
      outline: 'none'
    }
  },
  modalIcon: {
    fontSize: '72px',
    color: theme.palette.error.main,
    marginBottom: '15px'
  },
  modalText: {
    marginBottom: '15px'
  },
  cancelAllButton: {
    color: theme.palette.error.main,
    marginRight: '5px',
    textTransform: 'none',
    padding: '3px',
    minHeight: '24px',
  },
  button: {
    color: theme.palette.error.main,
    marginLeft: '10px',
    textTransform: 'none',
  },
  buttonIcon: {
    marginRight: '5px',
    color: theme.palette.error.main,
  }
});

const ACTIVITY_TABS = {
  BALANCES: 'BALANCES',
  OPEN_ORDERS: 'OPEN_ORDERS',
  ORDER_HISTORY: 'ORDER_HISTORY',
  TRADES: 'TRADES',
  TRANSACTIONS: 'TRANSACTIONS',
};
Object.freeze(ACTIVITY_TABS);

class AccountActivity extends Component {
  static getDerivedStateFromProps(props, state) {
    const { currentAccountId, accounts } = props;
    const currentAccountType = currentAccountId ? accounts.filter(acc => acc.id === currentAccountId)[0].type : null;

    const { currentTab } = state;
    if (currentAccountType === ACCOUNT_TYPES.MANUAL && (currentTab === ACTIVITY_TABS.OPEN_ORDERS || currentTab === ACTIVITY_TABS.ORDER_HISTORY)) {
      return {
        ...state,
        currentTab: ACTIVITY_TABS.BALANCES,
        transactionsDialogOpen: false,
      };
    }
    return state;
  }

  constructor(props) {
    super(props);

    this.state = {
      confirmationOpen: false,
      currentTab: ACTIVITY_TABS.BALANCES,
    };
    this.sessionToken = getSessionToken();
  }

  componentDidMount() {
    const { actions, accounts } = this.props;
    if (this.sessionToken && accounts.length) actions.fetchHoldings();
  }

  setCurrentTab = (val) => {
    this.setState({
      currentTab: val,
    });
  };

  getAccountLabelFromId = (id) => {
    const { accounts } = this.props;
    if (accounts.length) {
      const currentAccount = accounts.find(account => account.id === id);
      return currentAccount ? currentAccount.label : null;
    }
    return null;
  };

  getCancelAllLabel = () => {
    const {
      showFilters, accountFilter, pairFilter, currentAccountId, currentPair
    } = this.props;
    if (showFilters) {
      let cancelLabel = 'Are you sure you want to cancel all';
      if (accountFilter && currentAccountId) {
        cancelLabel = `${cancelLabel} ${this.getAccountLabelFromId(currentAccountId)}`;
      }
      if (pairFilter && currentPair) {
        cancelLabel = `${cancelLabel} ${currentPair}`;
      }
      return `${cancelLabel} orders`;
    }

    return currentAccountId
      ? `Are you sure you want to cancel all ${this.getAccountLabelFromId(currentAccountId)} orders`
      : 'Are you sure you want to cancel all orders?';
  }

  openTransactionsDialog = () => {
    this.setState({
      transactionsDialogOpen: true,
    });
  };

  handleFilterChange = filterName => (event) => {
    const { actions } = this.props;

    if (filterName === 'pairFilter') {
      actions.updatePairFilter(event.target.checked);
    }

    if (filterName === 'accountFilter') {
      actions.updateAccountFilter(event.target.checked);
    }
  };

  filterOpenOrderCount = (openOrdersData) => {
    const { accountFilter, currentAccountId } = this.props;
    if (accountFilter && currentAccountId) {
      return openOrdersData.filter(order => order.accountId === currentAccountId).length;
    }
    return openOrdersData.length;
  }

  handleCancelAllConfirmation = () => {
    const { isFeatureEnabled, showPaywallModal } = this.props;
    if (!isFeatureEnabled.TRADE) {
      showPaywallModal();
      return;
    }
    this.setState({
      confirmationOpen: true
    });
  }

  handleConfirmationClose = () => {
    this.setState({
      confirmationOpen: false
    });
  }

  handleCancelAllExecution = (accountId, pair) => {
    const { actions } = this.props;
    actions.canceAllOrders(accountId, pair);

    this.setState({
      confirmationOpen: false
    });
  }

  openOrdersForFilter = () => {
    const {
      showFilters, accountFilter, pairFilter, currentPair, currentAccountId, openOrdersData
    } = this.props;

    if (showFilters) {
      const filteredByAccount = accountFilter ? openOrdersData.filter(order => order.accountId === currentAccountId) : openOrdersData;
      return pairFilter ? filteredByAccount.some(order => order.pair === currentPair) : filteredByAccount.length > 0;
    }
    return currentAccountId ? openOrdersData.some(order => order.accountId === currentAccountId) : openOrdersData.length > 0;
  }

  renderSelectedTab = (currentAccountType) => {
    const { currentTab } = this.state;
    const {
      showFilters,
      accountFilter,
      pairFilter,
      currentPair,
      exchanges,
      currentExchange,
      currentAccountId,
      classes,
      stickyHeader,
      searchTerm,
      pairs,
    } = this.props;

    if (!this.sessionToken) {
      const exchangeLabel = Object.keys(exchanges).length && exchanges[currentExchange] ? exchanges[currentExchange].exchange_label : 'exchange';
      return (
        <Grid container alignItems="center" justify="center" >
          <Typography className={classes.emptyTableText}>Connect your {exchangeLabel} account to view your account activity here.</Typography>
        </Grid>
      );
    }

    const suggestionAssets = getAssetsFrom(pairs);

    switch (currentTab) {
      case ACTIVITY_TABS.BALANCES:
        return (<HoldingsTable
          emptyStateFn={() => {
            this.setCurrentTab(ACTIVITY_TABS.TRANSACTIONS);
            this.openTransactionsDialog();
          }}
          searchTerm={searchTerm}
          enableActions={currentAccountType === ACCOUNT_TYPES.EXCHANGE}
          stickyHeader={stickyHeader}
          filterAccountId={accountFilter ? currentAccountId : ''}
          filterPair={pairFilter && showFilters ? currentPair : ''} />
        );
      case ACTIVITY_TABS.OPEN_ORDERS:
        return (
          <OpenOrdersTable
            searchTerm={searchTerm}
            showOrderTotal
            name="openOrdersTables"
            stickyHeader={stickyHeader}
            filterAccountId={accountFilter ? currentAccountId : ''}
            filterPair={pairFilter && showFilters ? currentPair : ''} />
        );
      case ACTIVITY_TABS.ORDER_HISTORY:
        return (
          <OrderHistoryTable
            searchTerm={searchTerm}
            name="orderHistoryTable"
            stickyHeader={stickyHeader}
            showOrderTotal
            filterAccountId={accountFilter ? currentAccountId : ''}
            filterPair={pairFilter && showFilters ? currentPair : ''} />
        );
      case ACTIVITY_TABS.TRADES:
        return (
          <TradesTable
            searchTerm={searchTerm}
            name="tradesTable"
            stickyHeader={stickyHeader}
            filterAccountId={accountFilter ? currentAccountId : ''}
            filterPair={pairFilter && showFilters ? currentPair : ''} />
        );
      case ACTIVITY_TABS.TRANSACTIONS:
        return (
          <TransactionsTable
            searchTerm={searchTerm}
            name="transactionsTable"
            stickyHeader={stickyHeader}
            assets={suggestionAssets}
            filterAccountId={accountFilter ? currentAccountId : ''}
            filterPair={pairFilter && showFilters ? currentPair : ''} />
        );
      default:
        return (<div />);
    }
  };

  render() {
    const {
      classes,
      openOrdersData,
      accountsLoaded,
      accounts,
      currentAccountId,
      currentExchange,
      currentPair,
      pairFilter,
      accountFilter,
      showFilters,
      inline,
      pairs,
      holdingsByAccount,
    }
     = this.props;

    const {
      currentTab,
      confirmationOpen,
    } = this.state;

    if (this.sessionToken && !accountsLoaded && !currentExchange) {
      return (
        <Grid container alignItems="center" justify="center" className={classes.progressContainer}>
          <PulseLoader size={6} color="#52B0B0" loading />
        </Grid>
      );
    }

    const currentAccountType = currentAccountId ? accounts.filter(acc => acc.id === currentAccountId)[0].type : null;
    const openOrdersCount = this.filterOpenOrderCount(openOrdersData);

    return (
      <Fragment>
        <div className={`${classes.paper} ${classes.tabsContainer}`}>
          <NavTabs justify="flex-start" inline={inline} value={currentTab} onChange={this.setCurrentTab} activeDark>
            <NavTab name="balances" key="balances" label="Balances" value={ACTIVITY_TABS.BALANCES} />
            {(!currentAccountType || currentAccountType === ACCOUNT_TYPES.EXCHANGE)
            && <NavTab
              name="openOrders"
              key="openOrders"
              label="Open Orders"
              badgeValue={ openOrdersCount }
              value={ACTIVITY_TABS.OPEN_ORDERS} />}
            {(!currentAccountType || currentAccountType === ACCOUNT_TYPES.EXCHANGE)
            && <NavTab
              name="history"
              key="orderHistory"
              label="History"
              value={ACTIVITY_TABS.ORDER_HISTORY} />}
            <NavTab name="trades" key="trades" label="Trades" value={ACTIVITY_TABS.TRADES} />
            <NavTab name="transactions" key="transaction" label="Transfers" value={ACTIVITY_TABS.TRANSACTIONS} />
          </NavTabs>
          { this.sessionToken && currentAccountId && showFilters &&
          <FormControlLabel
            classes={{ label: classes.checkBoxLabel, root: classes.checkBoxLabelRoot }}
            control={
              <Checkbox className={classes.checkBox}
                checked={accountFilter}
                onChange={this.handleFilterChange('accountFilter')}
                value="accountFilter"
                color="primary" />
            }
            label={`${ellipsize(this.getAccountLabelFromId(currentAccountId), 5)} Only`} />
          }
          { this.sessionToken && currentAccountId && showFilters &&
          <FormControlLabel
            classes={{ label: classes.checkBoxLabel, root: classes.checkBoxLabelRoot }}
            control={
              <Checkbox className={classes.checkBox}
                checked={pairFilter}
                onChange={this.handleFilterChange('pairFilter')}
                value="pairFilter"
                color="primary" />
            }
            label={`${currentPair} Only`} />
          }
          <span className={`${classes.drag} dragHandle`} />
          { this.sessionToken && this.openOrdersForFilter() && currentTab === ACTIVITY_TABS.OPEN_ORDERS &&
            <Button
              size="small"
              className={classes.cancelAllButton}
              disableRipple
              onClick={() => { this.handleCancelAllConfirmation(); }}>
              Cancel All
            </Button>
          }
          {currentAccountId
          && (currentTab === ACTIVITY_TABS.TRANSACTIONS || currentTab === ACTIVITY_TABS.TRADES)
          && currentAccountType === ACCOUNT_TYPES.MANUAL &&
            <ManualAccount dialogOpen={this.state.transactionsDialogOpen}
              buttonStyles={{ marginRight: '10px' }}
              accountId={currentAccountId}
              initialType={currentTab}
              balances={holdingsByAccount}
              pairs={pairs} />
          }
        </div>
        <div className={classes.scrollContainer} style={{ flex: 1 }}>
          {
            this.renderSelectedTab(currentAccountType)
          }
        </div>
        <Modal
          open={confirmationOpen}
          onClose={this.handleConfirmationClose}
          className={classes.modal}>
          <Paper className={classes.modalPaper}>
            <Icon className={classes.modalIcon}>highlight_off</Icon>
            <Typography variant="h6" className={classes.modalText}>
              {this.getCancelAllLabel()}  <br />
            </Typography>
            <div className={classes.buttonRow}>
              <Button onClick={this.handleConfirmationClose}>Cancel</Button>
              <Button
                className={classes.button}
                variant="outlined"
                onClick={() => {
                  this.handleCancelAllExecution(
                    (showFilters && accountFilter) || (!showFilters) ? currentAccountId : '',
                    (showFilters && pairFilter) ? currentPair : ''
                  );
                }}>
                Confirm Cancellations
              </Button>
            </div>
          </Paper>
        </Modal>
      </Fragment>
    );
  }
}

AccountActivity.defaultProps = {
  accountFilter: true,
  pairFilter: true,
  showFilters: true,
  inline: true,
  currentExchange: '',
  stickyHeader: true,
  searchTerm: '',
};

AccountActivity.propTypes = {
  classes: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  currentAccountId: PropTypes.string.isRequired,
  currentExchange: PropTypes.string,
  currentPair: PropTypes.string.isRequired,
  accounts: PropTypes.array.isRequired,
  openOrdersData: PropTypes.array.isRequired,
  accountsLoaded: PropTypes.bool.isRequired,
  exchanges: PropTypes.object.isRequired,
  accountFilter: PropTypes.bool,
  pairFilter: PropTypes.bool,
  showFilters: PropTypes.bool,
  inline: PropTypes.bool,
  isFeatureEnabled: PropTypes.object.isRequired,
  showPaywallModal: PropTypes.func.isRequired,
  stickyHeader: PropTypes.bool,
  searchTerm: PropTypes.string,
  pairs: PropTypes.array.isRequired,
  holdingsByAccount: PropTypes.array.isRequired,
};

function mapStateToProps(state, { accountFilter }) {
  return {
    accountsLoaded: state.global.accounts.accountsLoaded,
    accounts: state.global.accounts.accounts,
    openOrdersData: state.global.orders.openOrdersData,
    currentPair: state.trade.interactions.currentPair,
    currentExchange: state.trade.interactions.currentExchange,
    exchanges: state.global.exchanges.exchanges,
    currentAccountId: state.trade.interactions.currentAccountId,
    accountFilter: accountFilter || state.trade.interactions.accountFilter,
    pairFilter: state.trade.interactions.pairFilter,
    pairs: state.global.prices.pairs,
    holdingsByAccount: state.holdings.holdings.byAccount,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      ...bindActionCreators({
        fetchHoldings,
        updatePairFilter,
        updateAccountFilter,
        canceAllOrders,
      }, dispatch)
    }
  };
}

const base = (withTheme()(withStyles(styles)(withPaywall('TRADE')(AccountActivity))));
export default connect(mapStateToProps, mapDispatchToProps)(base);



// WEBPACK FOOTER //
// ./src/components/trade/accountActivity.js