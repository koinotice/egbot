import React, { Component, Fragment } from 'react';
import { bindActionCreators } from 'redux';
import { withStyles, withTheme } from '@material-ui/core';
import PropTypes from 'prop-types';
import Table from '@material-ui/core/Table';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import ButtonBase from '@material-ui/core/ButtonBase';
import Modal from '@material-ui/core/Modal';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Icon from '@material-ui/core/Icon';
import { PulseLoader } from 'react-spinners';
import Typography from '@material-ui/core/Typography';
import { connect } from 'react-redux';
import { fetchTransactionHistory } from '../../store/ducks/trade/transactionHistory';
import { deleteManualTransaction } from '../../store/ducks/global/accounts';
import CoinIcon from '../icons/coinIcon';
import { ellipsize, formatAmount } from '../../utils/helpers';
import { isoToTableDateTime } from '../../utils/time';
import { ACCOUNT_TYPES } from '../../utils/types';
import UpdateManualTransactions from '../../components/forms/updateManualTransactions';
import EmptyStateCover from '../common/emptyStateCover';

const NUM_COLUMNS = 7;
const COLUMN_WIDTH = 100 / NUM_COLUMNS;

const styles = theme => ({
  primaryTextLarger: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
    wordWrap: 'nowrap',
  },
  primaryText: {
    fontSize: '1rem',
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
    wordWrap: 'nowrap',
  },
  table: {
    padding: 0,
    tableLayout: 'fixed',
    maxWidth: '100%',
    overflowX: 'hidden',
    border: 'none',
  },
  emptyTableText: {
    color: theme.palette.text.secondary,
    fontStyle: 'italic',
    margin: '1.5rem 0',
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
      paddingRight: '1rem',
      textAlign: 'center'
    }
  },
  tableHeaderCellSticky: {
    background: theme.palette.background.paper
  },
  tableRow: {
    height: '2rem',
  },
  tableCell: {
    borderBottom: `1px solid ${theme.palette.background.paperDarker}`,
    fontWeight: 'normal',
    fontSize: '1rem',
    padding: '0.5rem',
    verticalAlign: 'top',
    width: `${COLUMN_WIDTH}%`,
    '&:first-child': {
      width: '52px',
      paddingLeft: '1rem',
      textAlign: 'center',
    },
    '&:last-child': {
      paddingRight: '1rem',
      textAlign: 'center'
    }
  },
  secondaryText: {
    fontSize: '0.8571rem',
    color: theme.palette.text.secondary,
    fontWeight: 'normal',
  },
  buttonRow: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  clearButton: {
    marginLeft: '6px',
  },
  createIcon: {
    '&:hover': {
      color: `${theme.palette.primary.main} !important`,
    }
  },
  clearIcon: {
    '&:hover': {
      color: `${theme.palette.error.main} !important`,
    }
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
  editModalPaper: {
    position: 'absolute',
    width: theme.spacing.unit * 50,
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
  grid: {
    padding: '20px'
  }
});

class TransactionsTable extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showDeleteModal: false,
      transactionToDelete: '',
      showEditModal: false,
      transactionToEdit: '',
    };
  }

  componentDidMount() {
    const { filterAccountId } = this.props;
    this.props.actions.fetchTransactionHistory(filterAccountId);
  }

  componentWillReceiveProps(nextProps) {
    const { filterAccountId } = this.props;

    if (filterAccountId !== nextProps.filterAccountId) {
      this.props.actions.fetchTransactionHistory(nextProps.filterAccountId);
    }
  }

  getAccountLabelFromId = (id) => {
    const { accounts } = this.props;
    if (accounts.length) {
      const currentAccount = accounts.find(account => account.id === id);
      return currentAccount ? currentAccount.label : null;
    }
    return null;
  };

  setTransactionToDelete = (id) => {
    this.setState({
      showDeleteModal: true,
      transactionToDelete: id,
    });
  }

  setTransactionToUpdate = (id) => {
    this.setState({
      showEditModal: true,
      transactionToEdit: id,
    });
  }

  handleEditClose = () => {
    this.setState({
      showEditModal: false,
      transactionToEdit: ''
    });
  }

  deleteTransaction = () => {
    if (this.state.transactionToDelete) {
      this.props.actions.deleteManualTransaction(this.state.transactionToDelete);
    }
    this.setState({
      showDeleteModal: false,
      transactionToDelete: ''
    });
  }

  handleDeleteClose = () => {
    this.setState({
      showDeleteModal: false,
      transactionToDelete: ''
    });
  }

  filterTransactions(transactions) {
    const { filterPair, filterSymbol } = this.props;

    if (filterPair) {
      return transactions.filter(transaction => filterPair.split('/').includes(transaction.asset));
    }

    if (filterSymbol) {
      return transactions.filter(transaction => transaction.asset === filterSymbol);
    }

    return transactions;
  }

  render() {
    const {
      classes, filterAccountId, accounts, accountsLoaded, transactions, assets, searchTerm, holdingsByAccount, name, stickyHeader
    } = this.props;

    const { transactionToEdit, showDeleteModal, showEditModal } = this.state;

    if (!accountsLoaded) {
      return (
        <Grid container alignItems="center" justify="center" className={classes.progressContainer}>
          <PulseLoader size={6} color="#52B0B0" loading />
        </Grid>
      );
    }

    const filteredTransactions = this.filterTransactions(transactions);

    if (!filteredTransactions || !filteredTransactions.length) {
      let emptyMessage = 'No Transfers';
      if (filterAccountId) {
        emptyMessage = `No Transfers for ${this.getAccountLabelFromId(filterAccountId)}`;
      }
      return (
        <Grid container alignItems="center" justify="center" className={classes.grid}>
          <EmptyStateCover subheading={emptyMessage} icon="empty" iconSmall />
        </Grid>
      );
    }

    const accountType = filterAccountId
      ? accounts.find(acc => acc.id === filterAccountId).type
      : null;

    const balanceForCurrentAccount = holdingsByAccount.find(obj => obj.id === filterAccountId);

    const tableHeadCellClasses = `${classes.tableHeaderCell} ${stickyHeader ? classes.tableHeaderCellSticky : ''}`;

    return (
      <Fragment>
        <Table className={classes.table} name={name} >
          <TableHead>
            <TableRow className={classes.tableRow}>
              <TableCell className={tableHeadCellClasses} />
              <TableCell className={tableHeadCellClasses}>Asset</TableCell>
              <TableCell className={tableHeadCellClasses}>Type</TableCell>
              <TableCell className={tableHeadCellClasses}>Amount</TableCell>
              <TableCell className={tableHeadCellClasses}>Fee</TableCell>
              <TableCell className={tableHeadCellClasses}>Date</TableCell>
              {accountType === ACCOUNT_TYPES.MANUAL && <TableCell className={tableHeadCellClasses} />}
            </TableRow>
          </TableHead>
          <TableBody>
            {
              filteredTransactions
                .filter((transaction) => {
                  return searchTerm
                    ? (transaction.asset.toUpperCase().includes(searchTerm.toUpperCase())
                      || transaction.fullName.toUpperCase().includes(searchTerm.toUpperCase()))
                    : true;
                })
                .map((transaction, index) => {
                  return (
                    <TableRow name={`row${index}`} key={transaction.id} className={classes.tableRow} >
                      <TableCell className={classes.tableCell}><CoinIcon coin={transaction.asset.toLowerCase()} /></TableCell>
                      <TableCell classes={{ root: classes.tableCell }}>
                        <span className={classes.primaryTextLarger}>
                          <span>{ ellipsize(transaction.fullName, 16)}</span><br />
                          <span className={classes.secondaryText}> {transaction.asset}</span>
                        </span>
                      </TableCell>
                      <TableCell className={classes.tableCell}>
                        <span className={classes.primaryText}>
                          {transaction.type}
                        </span>
                      </TableCell>
                      <TableCell className={classes.tableCell}>
                        <span className={classes.primaryText}>
                          {formatAmount(transaction.asset, parseFloat(transaction.amount))}
                        </span>
                      </TableCell>
                      <TableCell className={classes.tableCell}>
                        <span className={classes.primaryText}>
                          {formatAmount(transaction.feeCurrency, transaction.fee)} {transaction.feeCurrency}
                        </span>
                      </TableCell>
                      <TableCell className={classes.tableCell}>
                        <span className={classes.secondaryText}>{ isoToTableDateTime(transaction.timestamp) }</span>
                      </TableCell>
                      {accountType === ACCOUNT_TYPES.MANUAL &&
                        <TableCell className={classes.tableCell}>
                          <span className={classes.secondaryText}>
                            <ButtonBase onClick={() => { this.setTransactionToUpdate(transaction.id); }}>
                              <Icon className={classes.createIcon}>create</Icon>
                            </ButtonBase>
                            <ButtonBase className={classes.clearButton} onClick={() => { this.setTransactionToDelete(transaction.id); }}>
                              <Icon className={classes.clearIcon}>clear</Icon>
                            </ButtonBase>
                          </span>
                        </TableCell>
                      }
                    </TableRow>);
                })
            }
          </TableBody>
        </Table>
        <Modal
          open={showDeleteModal}
          onClose={this.handleDeleteClose}
          className={classes.modal}>
          <Paper className={classes.modalPaper}>
            <Icon className={classes.modalIcon}>error_outline</Icon>
            <Typography variant="h6" className={classes.modalText}>
              Are you sure you want to delete this transaction?
            </Typography>
            <div className={classes.buttonRow}>
              <Button onClick={this.handleDeleteClose}>Cancel</Button>
              <Button className={classes.button} variant="outlined" onClick={this.deleteTransaction}>Confirm Delete</Button>
            </div>
          </Paper>
        </Modal>
        <Modal
          open={showEditModal && transactionToEdit !== ''}
          onClose={this.handleEditClose}
          className={classes.modal}>
          <Paper className={classes.editModalPaper}>
            <Grid container justify="space-around" spacing={24}>
              <UpdateManualTransactions assets={assets}
                balancesForAccount={balanceForCurrentAccount}
                transactionToUpdate={transactions.find(trans => trans.id === transactionToEdit)}
                submitCallback={this.handleEditClose}
                cancelCallback={this.handleEditClose} />
            </Grid>
          </Paper>
        </Modal>
      </Fragment>
    );
  }
}

TransactionsTable.defaultProps = {
  filterAccountId: '',
  filterPair: '',
  filterSymbol: '',
  searchTerm: '',
  assets: [],
  name: '',
  stickyHeader: false
};

TransactionsTable.propTypes = {
  actions: PropTypes.objectOf(PropTypes.func).isRequired,
  classes: PropTypes.object.isRequired,
  filterAccountId: PropTypes.string,
  filterPair: PropTypes.string,
  filterSymbol: PropTypes.string,
  accounts: PropTypes.array.isRequired,
  accountsLoaded: PropTypes.bool.isRequired,
  transactions: PropTypes.array.isRequired,
  assets: PropTypes.array,
  searchTerm: PropTypes.string,
  name: PropTypes.string,
  holdingsByAccount: PropTypes.array.isRequired,
  stickyHeader: PropTypes.bool
};

function mapStateToProps(state) {
  return {
    accounts: state.global.accounts.accounts,
    accountsLoaded: state.global.accounts.accountsLoaded,
    transactions: state.trade.transactionHistory.transactionHistory,
    holdingsByAccount: state.holdings.holdings.byAccount,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      ...bindActionCreators({
        fetchTransactionHistory,
        deleteManualTransaction,
      }, dispatch)
    }
  };
}

const base = (withTheme()(withStyles(styles)(TransactionsTable)));
export default connect(mapStateToProps, mapDispatchToProps)(base);



// WEBPACK FOOTER //
// ./src/components/tables/transactionsTable.js