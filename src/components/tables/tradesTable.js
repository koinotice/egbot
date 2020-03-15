import React, { Component, Fragment } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTheme, withStyles } from '@material-ui/core/styles';
import { PulseLoader } from 'react-spinners';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import ButtonBase from '@material-ui/core/ButtonBase';
import Paper from '@material-ui/core/Paper';
import Modal from '@material-ui/core/Modal';
import Icon from '@material-ui/core/Icon';
import Button from '@material-ui/core/Button';
import { withRouter } from 'react-router-dom';
import { formatAmount, getChangeColor } from '../../utils/helpers';
import { isoToTableDateTime } from '../../utils/time';
import { fetchUserTradeHistory, syncAndFetchUserTradeHistory } from '../../store/ducks/trade/userTradeHistory';
import uuidv4 from '../../utils/uuid';
import { updateAccount, updatePair } from '../../store/ducks/trade/interactions';
import CoinIcon from '../icons/coinIcon';
import { ACCOUNT_TYPES } from '../../utils/types';
import UpdateManualTrade from '../../components/forms/updateManualTrade';
import { deleteManualTrade } from '../../store/ducks/global/accounts';
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
  tableRowHover: {
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
      width: '52px',
      paddingLeft: '1rem',
      textAlign: 'center',
    },
    '&:last-child': {
      paddingRight: '1rem',
      textAlign: 'center'
    }
  },
  actionButton: {
    color: '#278EFF',
    maxHeight: '1.429rem',
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
  buttonRow: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  grid: {
    padding: '20px'
  }
});


class TradesTable extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showDeleteModal: false,
      tradeToDelete: '',
      showEditModal: false,
      tradeToEdit: '',
    };
  }

  componentDidMount() {
    const { filterPair } = this.props;
    this.fetchTrades(filterPair);
  }

  componentWillReceiveProps(nextProps) {
    const { filterPair, filterAccountId } = this.props;

    if (filterPair !== nextProps.filterPair) {
      this.fetchTrades(nextProps.filterPair);
    }

    if (filterAccountId !== nextProps.filterAccountId) {
      this.fetchTrades();
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

  setTradeToUpdate = (id) => {
    this.setState({
      showEditModal: true,
      tradeToEdit: id,
    });
  }

  setTradeToDelete = (id) => {
    this.setState({
      showDeleteModal: true,
      tradeToDelete: id,
    });
  }

  handleDeleteClose = () => {
    this.setState({
      showDeleteModal: false,
      tradeToDelete: ''
    });
  }

  handleEditClose = () => {
    this.setState({
      showEditModal: false,
      tradeToEdit: ''
    });
  }

  deleteTrade = () => {
    if (this.state.tradeToDelete) {
      this.props.actions.deleteManualTrade(this.state.tradeToDelete);
    }
    this.setState({
      showDeleteModal: false,
      tradeToDelete: ''
    });
  }

  fetchTrades(filterPair) {
    const { actions } = this.props;
    if (filterPair) {
      actions.syncAndFetchUserTradeHistory();
    } else {
      actions.fetchUserTradeHistory();
    }
  }

  selectTrade = (trade) => {
    const { accounts, history } = this.props;
    const acountTypeForTrade = accounts.filter(acc => acc.id === trade.accountId)[0].type;
    if (acountTypeForTrade === ACCOUNT_TYPES.EXCHANGE) {
      const { actions } = this.props;
      actions.updatePair(trade.pair);
      actions.updateAccount(trade.accountId);
      history.push('/trade');
    }
  }

  filterTrades = (tradesData) => {
    const { filterAccountId, filterPair, filterSymbol } = this.props;
    return tradesData
      .filter(trade => (filterAccountId ? trade.accountId === filterAccountId : true))
      .filter(trade => (filterPair ? trade.pair === filterPair : true))
      .filter(trade => (filterSymbol ? trade.pair.split('/')[0] === filterSymbol : true))
      .map((trade) => {
        const [base, quote] = trade.pair.split('/');
        return {
          id: trade.id,
          accountId: trade.accountId,
          exchange: trade.exchange,
          pair: trade.pair,
          base,
          quote,
          side: trade.side,
          price: formatAmount(quote, trade.price),
          fee: formatAmount(trade.feeCurrency, trade.fee),
          feeCurrency: trade.feeCurrency,
          amount: formatAmount(base, trade.amount),
          total: formatAmount(quote, ((parseFloat(trade.amount) * parseFloat(trade.price)))),
          timestamp: trade.timestamp,
        };
      });
  };

  render() {
    const {
      classes,
      theme,
      tradesLoaded,
      filterAccountId,
      accountsLoaded,
      userTradesData,
      accounts,
      pairs,
      holdingsByAccount,
      searchTerm,
      enableEdit,
      name,
      stickyHeader
    } = this.props;

    const { showDeleteModal, showEditModal, tradeToEdit } = this.state;

    if (!tradesLoaded || !accountsLoaded) {
      return (
        <Grid container alignItems="center" justify="center" className={classes.progressContainer}>
          <PulseLoader size={6} color="#52B0B0" loading />
        </Grid>
      );
    }

    const tableData = this.filterTrades(userTradesData);

    if (!tableData || !tableData.length) {
      let emptyMessage = 'No Trades';
      if (filterAccountId) {
        emptyMessage = `No Trades for ${this.getAccountLabelFromId(filterAccountId)}`;
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
        <Table className={classes.table} name={name}>
          <TableHead>
            <TableRow className={classes.tableRow}>
              <TableCell className={tableHeadCellClasses} />
              <TableCell className={tableHeadCellClasses}>Pair/Account</TableCell>
              <TableCell className={tableHeadCellClasses}>Side</TableCell>
              <TableCell className={tableHeadCellClasses}>Amount</TableCell>
              <TableCell className={tableHeadCellClasses}>Price/Fee</TableCell>
              <TableCell className={tableHeadCellClasses}>Total</TableCell>
              <TableCell className={tableHeadCellClasses}>Date</TableCell>
              {(accountType === ACCOUNT_TYPES.MANUAL && enableEdit) && <TableCell className={tableHeadCellClasses} />}
            </TableRow>
          </TableHead>
          <TableBody>
            {
              tableData
                .filter((trade) => { return searchTerm ? (trade.pair.toUpperCase().includes(searchTerm.toUpperCase())) : true; })
                .map((trade, index) => {
                  const assetName = trade.pair.split('/')[0];
                  return (
                    <TableRow
                      name={`row${index}`}
                      hover
                      key={uuidv4()}
                      className={classes.tableRow}
                      classes={{ hover: classes.tableRowHover }}
                      onClick={ () => this.selectTrade(trade)}>
                      <TableCell className={classes.tableCell}><CoinIcon coin={assetName.toLowerCase()} /></TableCell>
                      <TableCell className={classes.tableCell}>
                        <span className={classes.primaryText}>{trade.pair}</span>
                        <br />
                        <span className={classes.secondaryText}>
                          {this.getAccountLabelFromId(trade.accountId)}
                        </span>
                      </TableCell>
                      <TableCell className={classes.tableCell}>
                        <span
                          className={classes.primaryText}
                          style={{ color: getChangeColor(trade.side === 'BUY' ? 1 : -1, theme) }}>
                          {trade.side}
                        </span>
                      </TableCell>
                      <TableCell className={classes.tableCell}>
                        <span className={classes.primaryText}>
                          { trade.amount } { trade.base }
                        </span>
                      </TableCell>
                      <TableCell className={classes.tableCell}>
                        <span className={classes.primaryText}>{ trade.price } { trade.quote }</span>
                        <br />
                        <span className={classes.secondaryText}>{trade.fee} {trade.feeCurrency}</span>
                      </TableCell>
                      <TableCell className={classes.tableCell}>
                        <span className={classes.primaryText}>
                          {trade.total}  { trade.quote }
                        </span>
                      </TableCell>
                      <TableCell className={classes.tableCell}>
                        <span className={classes.secondaryText}>{ isoToTableDateTime(trade.timestamp) }</span>
                      </TableCell>
                      {(accountType === ACCOUNT_TYPES.MANUAL && enableEdit) &&
                    <TableCell className={classes.tableCell}>
                      <span className={classes.secondaryText}>
                        <ButtonBase onClick={() => { this.setTradeToUpdate(trade.id); }}>
                          <Icon className={classes.createIcon}>create</Icon>
                        </ButtonBase>
                        <ButtonBase className={classes.clearButton} onClick={() => { this.setTradeToDelete(trade.id); }}>
                          <Icon className={classes.clearIcon}>clear</Icon>
                        </ButtonBase>
                      </span>
                    </TableCell>
                      }
                    </TableRow>
                  );
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
              Are you sure you want to delete this trade?
            </Typography>
            <div className={classes.buttonRow}>
              <Button onClick={this.handleDeleteClose}>Cancel</Button>
              <Button className={classes.button} variant="outlined" onClick={this.deleteTrade}>Confirm Delete</Button>
            </div>
          </Paper>
        </Modal>
        <Modal
          open={showEditModal && tradeToEdit !== ''}
          onClose={this.handleEditClose}
          className={classes.modal}>
          <Paper className={classes.editModalPaper}>
            <Grid container justify="space-around" spacing={24}>
              <UpdateManualTrade tradeToUpdate={userTradesData.find(trade => trade.id === tradeToEdit)}
                balancesForAccount={balanceForCurrentAccount}
                pairs={pairs}
                submitCallback={this.handleEditClose}
                cancelCallback={this.handleEditClose} />
            </Grid>
          </Paper>
        </Modal>
      </Fragment>
    );
  }
}

TradesTable.defaultProps = {
  filterPair: '',
  filterAccountId: '',
  filterSymbol: '',
  searchTerm: '',
  name: '',
  enableEdit: true,
  stickyHeader: false
};

TradesTable.propTypes = {
  actions: PropTypes.objectOf(PropTypes.func).isRequired,
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  tradesLoaded: PropTypes.bool.isRequired,
  userTradesData: PropTypes.array.isRequired,
  accounts: PropTypes.array.isRequired,
  accountsLoaded: PropTypes.bool.isRequired,
  filterPair: PropTypes.string,
  filterAccountId: PropTypes.string,
  filterSymbol: PropTypes.string,
  history: PropTypes.object.isRequired,
  pairs: PropTypes.array.isRequired,
  holdingsByAccount: PropTypes.array.isRequired,
  searchTerm: PropTypes.string,
  name: PropTypes.string,
  enableEdit: PropTypes.bool,
  stickyHeader: PropTypes.bool
};

function mapStateToProps(state) {
  return {
    markets: state.global.markets.markets,
    marketsLoaded: state.global.markets.marketsLoaded,
    accounts: state.global.accounts.accounts,
    accountsLoaded: state.global.accounts.accountsLoaded,
    userTradesData: state.trade.userTradeHistory.userTradesHistory,
    tradesLoaded: state.trade.userTradeHistory.isLoaded,
    pairs: state.global.prices.pairs,
    holdingsByAccount: state.holdings.holdings.byAccount,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      ...bindActionCreators({
        fetchUserTradeHistory,
        syncAndFetchUserTradeHistory,
        updatePair,
        updateAccount,
        deleteManualTrade
      }, dispatch)
    }
  };
}

const base = withRouter(withTheme()(withStyles(styles)(TradesTable)));
export default connect(mapStateToProps, mapDispatchToProps)(base);



// WEBPACK FOOTER //
// ./src/components/tables/tradesTable.js