import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTheme, withStyles } from '@material-ui/core/styles';
import { PulseLoader } from 'react-spinners';
import Grid from '@material-ui/core/Grid';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import IconButton from '@material-ui/core/IconButton';
import Icon from '@material-ui/core/Icon';
import { cancelOrder } from '../../store/ducks/global/orders';
import { updateAccount, updatePair } from '../../store/ducks/trade/interactions';
import { formatAmount, getChangeColor } from '../../utils/helpers';
import { epochMsToDateTime } from '../../utils/time';
import withPaywall from '../hocs/paywall';
import CoinIcon from '../icons/coinIcon';
import EmptyStateCover from '../common/emptyStateCover';

const NUM_COLUMNS = 6;
const COLUMN_WIDTH = 100 / NUM_COLUMNS;

const styles = theme => ({
  progressContainer: {
    height: '100%',
  },
  emptyTableText: {
    color: theme.palette.text.secondary,
    fontStyle: 'italic',
    margin: '1.5rem 0',
  },
  table: {
    padding: 0,
    tableLayout: 'fixed',
    maxWidth: '100%',
    overflowX: 'hidden',
    border: 'none',
  },
  tableHeaderCell: {
    position: 'sticky',
    top: 0,
    border: 'none',
    padding: '0.5rem',
    width: `${COLUMN_WIDTH}%`,
    '&:first-child': {
      width: '52px',
      border: 'none',
    },
    '&:last-child': {
      width: `${COLUMN_WIDTH / 2}%`,
      paddingRight: '1rem',
      textAlign: 'center',
      verticalAlign: 'middle',
    }
  },
  tableHeaderCellSticky: {
    background: theme.palette.background.paper
  },
  tableRow: {
    height: '2rem',
  },
  tableRowHover: {
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: `${theme.palette.background.paperDarker} !important`
    }
  },
  tableCell: {
    borderBottom: `1px solid ${theme.palette.background.paperDarker}`,
    fontWeight: 'normal',
    fontSize: '1rem',
    padding: '0.5rem',
    verticalAlign: 'top',
    width: `${COLUMN_WIDTH}%`,
    '&:first-child': {
      width: '62px',
      paddingLeft: '1rem',
      textAlign: 'center',
    },
    '&:last-child': {
      width: `${COLUMN_WIDTH / 2}%`,
      paddingRight: '1rem',
      textAlign: 'center',
      verticalAlign: 'middle',
    }
  },
  primaryText: {
    fontSize: '1rem',
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
    wordWrap: 'nowrap',
  },
  secondaryText: {
    fontSize: '0.8571rem',
    color: theme.palette.text.secondary,
    fontWeight: 'normal',
  },
  iconButton: {
    padding: '5px',
  },
  grid: {
    padding: '20px'
  }
});


class OpenOrdersTable extends Component {
  getAccountLabelFromId = (id) => {
    const { accounts } = this.props;
    if (accounts.length) {
      const currentAccount = accounts.find(account => account.id === id);
      return currentAccount ? currentAccount.label : null;
    }
    return null;
  };
  cancelOrder = (orderId, accountId, event) => {
    event.stopPropagation();
    const { isFeatureEnabled, showPaywallModal, actions } = this.props;
    if (!isFeatureEnabled.TRADE) {
      showPaywallModal();
      return;
    }
    actions.cancelOrder(orderId, accountId);
  };

  selectOrder = (order) => {
    const { actions, history } = this.props;
    actions.updatePair(order.pair);
    actions.updateAccount(order.accountId);
    history.push('/trade');
  }

  filterOpenOrders = (openOrdersData) => {
    const {
      filterAccountId, filterPair, filterSymbol, searchTerm
    } = this.props;
    return openOrdersData
      .filter(order => (searchTerm ? (order.pair.toUpperCase()).includes(searchTerm.toUpperCase()) : true))
      .filter(order => (filterAccountId ? order.accountId === filterAccountId : true))
      .filter(order => (filterPair ? order.pair === filterPair : true))
      .filter(order => (filterSymbol ? order.pair.split('/')[0] === filterSymbol : true))
      .map((order) => {
        const [base, quote] = order.pair.split('/');

        return {
          side: order.side,
          type: order.type,
          pair: order.pair,
          base,
          quote,
          price: formatAmount(quote, order.price),
          stopPrice: order.type === 'STOP' ? formatAmount(quote, order.stop_price) : 0,
          amount: formatAmount(base, order.amount),
          filled: formatAmount(base, order.filled),
          total: formatAmount(quote, order.amount * order.price),
          timeStamp: order.e_timestamp,
          orderId: order.e_orderId,
          accountId: order.accountId,
          exchange: order.exchange,
          isRequestPending: order.isRequestPending,
        };
      });
  };

  render() {
    const {
      classes,
      theme,
      ordersLoaded,
      openOrdersData,
      filterAccountId,
      accountsLoaded,
      name,
      showOrderTotal,
      stickyHeader
    } = this.props;

    if (!ordersLoaded || !accountsLoaded) {
      return (
        <Grid container alignItems="center" justify="center" className={classes.progressContainer}>
          <PulseLoader size={6} color="#52B0B0" loading />
        </Grid>
      );
    }

    const tableData = this.filterOpenOrders(openOrdersData);

    if (!tableData || !tableData.length) {
      let emptyMessage = 'No Open Orders';
      if (filterAccountId) {
        emptyMessage = `No Open Orders for ${this.getAccountLabelFromId(filterAccountId)}`;
      }
      return (
        <Grid container alignItems="center" justify="center" className={classes.grid}>
          <EmptyStateCover subheading={emptyMessage} icon="empty" iconSmall />
        </Grid>
      );
    }

    // used to name row so we can assert on automation tests for each row
    let rowButtonIndex = 0;

    const tableHeadCellClasses = `${classes.tableHeaderCell} ${stickyHeader ? classes.tableHeaderCellSticky : ''}`;

    return (
      <div>
        <Table className={classes.table} name={name}>
          <TableHead>
            <TableRow className={classes.tableRow}>
              <TableCell className={tableHeadCellClasses} />
              <TableCell className={tableHeadCellClasses}>Pair/Account</TableCell>
              <TableCell className={tableHeadCellClasses}>Side/Type</TableCell>
              <TableCell className={tableHeadCellClasses}>Amount/Filled</TableCell>
              <TableCell className={tableHeadCellClasses}>Price</TableCell>
              {showOrderTotal &&
              <TableCell className={tableHeadCellClasses}>Order Total</TableCell>
              }
              <TableCell className={tableHeadCellClasses}>Date</TableCell>
              <TableCell className={tableHeadCellClasses} style={{ zIndex: 1 }}>Cancel</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {
              tableData.map((order) => {
                const assetName = order.pair.split('/')[0];
                return (
                  <TableRow
                    name={`row${rowButtonIndex}`}
                    hover
                    key={order.orderId}
                    className={classes.tableRow}
                    classes={{ hover: classes.tableRowHover }}
                    onClick={ () => this.selectOrder(order)}>
                    <TableCell className={classes.tableCell}><CoinIcon coin={assetName.toLowerCase()} /></TableCell>
                    <TableCell className={classes.tableCell}>
                      <span className={classes.primaryText}> {order.pair} </span>
                      <br />
                      <span className={classes.secondaryText}>{this.getAccountLabelFromId(order.accountId)}</span>
                    </TableCell>
                    <TableCell className={classes.tableCell}>
                      <span
                        className={classes.primaryText}
                        style={{ color: getChangeColor(order.side === 'BUY' ? 1 : -1, theme) }}>
                        {order.side}
                      </span>
                      <br />
                      <span className={classes.secondaryText}>{order.type}</span>
                    </TableCell>
                    <TableCell className={classes.tableCell}>
                      <span className={classes.primaryText}>{order.amount} {order.base}</span>
                      <br />
                      <span className={classes.secondaryText}>{order.filled} {order.base}</span>
                    </TableCell>
                    <TableCell className={classes.tableCell}>
                      <span className={classes.primaryText}>{order.price} {order.quote}</span>
                      {
                        order.type === 'STOP' &&
                        <span className={classes.secondaryText}><br />@{order.stopPrice} {order.quote}</span>
                      }
                    </TableCell>
                    {showOrderTotal &&
                    <TableCell className={classes.tableCell}>
                      <span className={classes.primaryText}>{order.total} {order.quote}</span>
                    </TableCell>
                    }
                    <TableCell className={classes.tableCell}>
                      <span className={classes.secondaryText}>{epochMsToDateTime(order.timeStamp)}</span>
                    </TableCell>
                    <TableCell className={classes.tableCell}>
                      {
                        order.isRequestPending ?
                          <PulseLoader color="#FFF" size={3} loading /> :
                          <IconButton className={classes.iconButton}
                            name={`button${rowButtonIndex++}`}
                            color="primary"
                            size="small"
                            onClick={(event) => {
                              this.cancelOrder(order.orderId, order.accountId, event);
                            }} >
                            <Icon>highlight_off</Icon>
                          </IconButton>
                      }
                    </TableCell>
                  </TableRow>
                );
              })
            }
          </TableBody>
        </Table>
      </div>
    );
  }
}

OpenOrdersTable.defaultProps = {
  filterPair: '',
  searchTerm: '',
  filterAccountId: '',
  filterSymbol: '',
  name: '',
  showOrderTotal: false,
  stickyHeader: false
};

OpenOrdersTable.propTypes = {
  actions: PropTypes.objectOf(PropTypes.func).isRequired,
  history: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  ordersLoaded: PropTypes.bool.isRequired,
  openOrdersData: PropTypes.array.isRequired,
  accounts: PropTypes.array.isRequired,
  accountsLoaded: PropTypes.bool.isRequired,
  filterPair: PropTypes.string,
  filterSymbol: PropTypes.string,
  searchTerm: PropTypes.string,
  filterAccountId: PropTypes.string,
  name: PropTypes.string,
  isFeatureEnabled: PropTypes.object.isRequired,
  showPaywallModal: PropTypes.func.isRequired,
  showOrderTotal: PropTypes.bool,
  stickyHeader: PropTypes.bool,
};

function mapStateToProps(state) {
  return {
    accounts: state.global.accounts.accounts,
    accountsLoaded: state.global.accounts.accountsLoaded,
    openOrdersData: state.global.orders.openOrdersData,
    ordersLoaded: state.global.orders.openOrdersLoaded,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      ...bindActionCreators({
        cancelOrder,
        updatePair,
        updateAccount,
      }, dispatch)
    }
  };
}

const base = withRouter(withTheme()(withStyles(styles)(withPaywall('TRADE')(OpenOrdersTable))));
export default connect(mapStateToProps, mapDispatchToProps)(base);



// WEBPACK FOOTER //
// ./src/components/tables/openOrdersTable.js