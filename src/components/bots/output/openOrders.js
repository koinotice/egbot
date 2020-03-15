import React, { Component } from 'react';
import { withStyles } from '@material-ui/core';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import { PulseLoader } from 'react-spinners';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableBody from '@material-ui/core/TableBody';
import IconButton from '@material-ui/core/IconButton';
import Icon from '@material-ui/core/Icon';
import CoinIcon from '../../icons/coinIcon';
import { formatAmount, getChangeColor } from '../../../utils/helpers';
import { epochMsToDateTime } from '../../../utils/time';
import EmptyStateCover from '../../common/emptyStateCover';
import withPaywall from '../../hocs/paywall';


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
    backgroundColor: theme.palette.background.paper,
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
  tableRow: {
    height: '2rem',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: `${theme.palette.background.paperDarker} !important`,
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

class OpenOrders extends Component {
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
    const { isFeatureEnabled, showPaywallModal, cancelOrder } = this.props;
    if (!isFeatureEnabled.TRADE) {
      showPaywallModal();
      return;
    }
    cancelOrder(orderId, accountId);
  };

  render() {
    const {
      classes,
      orders,
      theme,
      selectOrder
    } = this.props;

    if (!orders) {
      return (
        <Grid container alignItems="center" justify="center" className={classes.progressContainer}>
          <PulseLoader size={6} color="#52B0B0" loading />
        </Grid>
      );
    }

    const tableData = orders;

    if (!tableData || !tableData.length) {
      const emptyMessage = 'No Open Orders';
      return (
        <Grid container alignItems="center" justify="center" className={classes.grid}>
          <EmptyStateCover subheading={emptyMessage} icon="empty" iconSmall />
        </Grid>
      );
    }

    // used to name row so we can assert on automation tests for each row
    let rowButtonIndex = 0;

    return (
      <div>
        <Table className={classes.table} name={name}>
          <TableHead>
            <TableRow className={classes.tableRow}>
              <TableCell className={classes.tableHeaderCell} />
              <TableCell className={classes.tableHeaderCell}>Pair/Account</TableCell>
              <TableCell className={classes.tableHeaderCell}>Side/Type</TableCell>
              <TableCell className={classes.tableHeaderCell}>Amount/Filled</TableCell>
              <TableCell className={classes.tableHeaderCell}>Price</TableCell>
              <TableCell className={classes.tableHeaderCell}>Order Total</TableCell>
              <TableCell className={classes.tableHeaderCell}>Date</TableCell>
              <TableCell className={classes.tableHeaderCell} style={{ zIndex: 1 }}>Cancel</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {
              tableData.map((order) => {
                const [base, quote] = order.pair.split('/');
                return (
                  <TableRow
                    name={`row${rowButtonIndex}`}
                    hover
                    key={order.e_orderId}
                    className={classes.tableRow}
                    onClick={ () => selectOrder(order)}>
                    <TableCell className={classes.tableCell}><CoinIcon coin={base.toLowerCase()} /></TableCell>
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
                      <span className={classes.primaryText}>{formatAmount(base, order.amount)} {base}</span>
                      <br />
                      <span className={classes.secondaryText}>{formatAmount(base, order.filled)} {base}</span>
                    </TableCell>
                    <TableCell className={classes.tableCell}>
                      <span className={classes.primaryText}>{formatAmount(quote, order.price)} {quote}</span>
                      {
                        order.type === 'STOP' &&
                        <span
                          className={classes.secondaryText}>
                          <br />@{order.type === 'STOP' ? formatAmount(quote, order.stop_price) : 0} {quote}
                        </span>
                      }
                    </TableCell>
                    <TableCell className={classes.tableCell}>
                      <span className={classes.primaryText}>
                        {formatAmount(quote, order.amount * order.price)} {quote}
                      </span>
                    </TableCell>
                    <TableCell className={classes.tableCell}>
                      <span className={classes.secondaryText}>{epochMsToDateTime(order.e_timestamp)}</span>
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
                              this.cancelOrder(order.e_orderId, order.accountId, event);
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

OpenOrders.defaultProps = {
  orders: [],
  accounts: [],
};

OpenOrders.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  orders: PropTypes.array,
  accounts: PropTypes.array,
  isFeatureEnabled: PropTypes.object.isRequired,
  showPaywallModal: PropTypes.func.isRequired,
  cancelOrder: PropTypes.func.isRequired,
  selectOrder: PropTypes.func.isRequired,
};

export default withStyles(styles, { withTheme: true })(withPaywall('TRADE')(OpenOrders));



// WEBPACK FOOTER //
// ./src/components/bots/output/openOrders.js