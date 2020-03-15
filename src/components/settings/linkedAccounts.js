import React, { Component, Fragment } from 'react';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import Button from '@material-ui/core/Button';
import Modal from '@material-ui/core/Modal';
import Icon from '@material-ui/core/Icon';
import Grid from '@material-ui/core/Grid';
import Hidden from '@material-ui/core/Hidden';
import { withStyles } from '@material-ui/core/styles';
import { PulseLoader } from 'react-spinners';
import PropTypes from 'prop-types';
import { ellipsize } from '../../utils/helpers';
import EmptyStateCover from '../common/emptyStateCover';
import InlineEditable from '../common/inlineEditable';
import AddAccount from '../common/addAccount';
import { isAlphanumeric } from '../../utils/validator';
import TooltipIcon from '../common/tooltipIcon';

const styles = theme => ({
  title: {
    marginBottom: '0.7142857142857143rem'
  },
  placeholderContainer: {
    padding: '0 2.142rem',
    maxWidth: '35.714rem',
    margin: '0 auto'
  },
  tableContainer: {
    overflowX: 'auto'
  },
  tableCell: {
    padding: '0.286rem 0.214rem 0.286rem 0.857rem',
    borderBottom: 'none'
  },
  icon: {
    marginRight: '0.2rem'
  },
  paper: {
    padding: '1.0714285714285714rem 2.142857142857143rem'
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
  buttonRow: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  buttonBase: {
    textTransform: 'uppercase',
    color: theme.palette.error.main
  },
  button: {
    color: theme.palette.error.main,
  },
  error: {
    color: theme.palette.error.main
  },
  [theme.breakpoints.down('md')]: {
    tableCell: {
      textAlign: 'center'
    }
  },
  progressContainer: {
    height: '100%',
  },
  invalidApiIcon: {
    color: '#ffb300',
    marginRight: '10px'
  }
});

class LinkedAccounts extends Component {
  constructor() {
    super();

    this.state = {
      confirmationOpen: false,
      selectedAccount: {}
    };
  }

  componentWillMount() {
    const { fetchAccounts } = this.props;
    fetchAccounts();
  }

  handleConfirmationOpen = (id, label) => {
    const selectedAccount = {
      id,
      label
    };
    this.setState({
      selectedAccount,
      confirmationOpen: true
    });
  };

  handleConfirmationClose = () => {
    this.setState({
      selectedAccount: {},
      confirmationOpen: false
    });
  };

  delete = (id) => {
    const { deleteAccount, updateAccount } = this.props;
    deleteAccount(id);
    updateAccount('');
    this.handleConfirmationClose();
  };

  updateLabel = (accountId, newLabel, clearFieldFn) => {
    const { accounts, updateAccountLabel } = this.props;

    if (!accountId || !newLabel) {
      clearFieldFn();
      return;
    }

    if (!isAlphanumeric(newLabel)) {
      return;
    }

    // check label exists
    for (let i = 0; i < accounts.length; i++) {
      if (accounts[i].label === newLabel) {
        clearFieldFn();
        return;
      }
    }

    updateAccountLabel(accountId, newLabel);
  };

  renderLoader() {
    const { classes } = this.props;

    return (
      <Grid container alignItems="center" justify="center" className={classes.progressContainer}>
        <PulseLoader size={6} color="#52B0B0" loading />
      </Grid>
    );
  }

  renderLinkAccountsPlaceholder() {
    const { classes, accounts } = this.props;

    return (
      <div className={classes.placeholderContainer}>
        <EmptyStateCover
          icon="disconnected"
          title="No Accounts"
          subheading="Begin by adding your exchange accounts or offline wallets"
          cta="Add Account"
          ctaButtonOverride={<AddAccount accounts={accounts} addButtonVariant="contained" />}
          ctaPath="/a/onboarding/select-exchange" />
      </div>
    );
  }

  renderAccountsTable() {
    const { classes, accounts } = this.props;

    return (
      <Fragment>
        <div className={classes.tableContainer}>
          <AddAccount accounts={accounts} buttonStyleOverride={{ float: 'right' }} />
          <Table>
            <TableHead>
              <TableRow>
                <TableCell className={classes.tableCell}>Label</TableCell>
                <TableCell className={classes.tableCell}>Type</TableCell>
                <TableCell className={classes.tableCell}>Exchange</TableCell>
                <Hidden mdDown>
                  <TableCell className={classes.tableCell}>API Key</TableCell>
                </Hidden>
                <TableCell className={classes.tableCell} />
                <TableCell className={classes.tableCell} />
              </TableRow>
            </TableHead>
            <TableBody>
              {accounts.map(account => (
                <TableRow key={account.id}>
                  <TableCell className={classes.tableCell}>
                    <InlineEditable
                      value={account.label}
                      onFocusOut={(newLabel, callback) => this.updateLabel(account.id, newLabel, callback) } />
                  </TableCell>
                  <TableCell className={classes.tableCell}>{account.type}</TableCell>
                  <TableCell className={classes.tableCell}>{account.exchange_label ? account.exchange_label : ''}</TableCell>
                  <Hidden mdDown>
                    <TableCell className={classes.tableCell}>{account.apiKey ? ellipsize(account.apiKey, 15) : ''}</TableCell>
                  </Hidden>
                  <TableCell className={classes.tableCell}>
                    <Button
                      className={classes.buttonBase}
                      onClick={() => this.handleConfirmationOpen(account.id, account.label)}>
                      Delete
                    </Button>
                  </TableCell>
                  <TableCell className={classes.tableCell}>
                    { account.tokensValid === false &&
                      <TooltipIcon
                        title="This account is not updating due to invalid API keys. Please delete this account and connect it again with new keys"
                        placement="bottom"
                        Icon={<Icon className={classes.invalidApiIcon}>warning</Icon>} />
                    }
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Fragment>
    );
  }

  render() {
    const { classes, accounts, accountsLoaded } = this.props;
    const {
      confirmationOpen,
      selectedAccount: { id, label }
    } = this.state;

    if (!accountsLoaded) {
      return this.renderLoader();
    }

    return (
      <Fragment>
        <Typography variant="h5" className={classes.title}>My Accounts</Typography>
        <Paper className={classes.paper}>
          <Typography variant="subtitle1">Accounts</Typography>
          {accounts.length === 0 ? this.renderLinkAccountsPlaceholder() : this.renderAccountsTable()}
        </Paper>
        <Modal
          open={confirmationOpen}
          onClose={this.handleConfirmationClose}
          className={classes.modal}>
          <Paper className={classes.modalPaper}>
            <Icon className={classes.modalIcon}>error_outline</Icon>
            <Typography variant="h6" className={classes.modalText}>
              Are you sure you want to delete <br />
              {label}?
            </Typography>
            <Typography className={classes.modalText}>This account and all associated data will be removed.</Typography>
            <div className={classes.buttonRow}>
              <Button onClick={this.handleConfirmationClose}>Cancel</Button>
              <Button className={classes.button} variant="outlined" onClick={() => this.delete(id)}>Confirm Delete</Button>
            </div>
          </Paper>
        </Modal>
      </Fragment>
    );
  }
}

LinkedAccounts.propTypes = {
  classes: PropTypes.object.isRequired,
  accounts: PropTypes.array.isRequired,
  accountsLoaded: PropTypes.bool.isRequired,
  fetchAccounts: PropTypes.func.isRequired,
  updateAccount: PropTypes.func.isRequired,
  updateAccountLabel: PropTypes.func.isRequired,
  deleteAccount: PropTypes.func.isRequired,
};

export default withStyles(styles, { withTheme: true })(LinkedAccounts);



// WEBPACK FOOTER //
// ./src/components/settings/linkedAccounts.js