import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { withStyles, withTheme } from '@material-ui/core';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Modal from '@material-ui/core/Modal';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import { bindActionCreators } from 'redux';
import { createManualAccount } from '../../store/ducks/global/accounts';
import { isAlphanumeric } from '../../utils/validator';


const styles = theme => ({
  modal: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalPaper: {
    position: 'absolute',
    width: theme.spacing.unit * 60,
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
  img: {
    width: '100px',
    height: '100px',
    marginBottom: '10px',
  },
  button: {
    marginTop: '20px',
    marginLeft: '10px',
    marginRight: '10px',
  },
  form: {
    marginTop: '15px',
    width: '100%'
  },
  formError: {
    color: theme.palette.buttons.red,
  },
  formErrorMessage: {
    marginTop: '1.229rem',
  },
});

const PROMPTS = {
  ACCOUNT_TYPE: 'accountType',
  ADD_WALLET: 'addWallet',
};
Object.freeze(PROMPTS);

class AddAccount extends Component {
  constructor(props) {
    super(props);

    this.LABEL_MAX_LENGTH = 20;

    this.state = {
      showAddAccountModal: false,
      currentPrompt: PROMPTS.ACCOUNT_TYPE,
      accountLabel: '',
      walletError: '',
    };
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeypress);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeypress);
  }

  setWalletLabel = (event) => {
    const { value } = event.target;
    if ((value.length < this.LABEL_MAX_LENGTH && isAlphanumeric(value)) || value === '') {
      this.setState({
        accountLabel: value,
        walletError: '',
      });
    }
  }

  handleKeypress = (e) => {
    const { showAddAccountModal } = this.state;
    const { key } = e;
    if (key === 'Escape' && showAddAccountModal) {
      this.closeModal();
    }
  }

  createWallet = (event) => {
    event.preventDefault();
    const { history, actions, accounts } = this.props;
    const { accountLabel } = this.state;

    const accountLabelExists = accounts.some(acc => acc.label === accountLabel);
    if (accountLabelExists) {
      this.setState({
        walletError: `${accountLabel} already exists, enter new label`
      });
      return;
    }

    actions.createManualAccount(accountLabel);
    if (history.location.pathname === '/portfolio') {
      this.closeModal();
      return;
    }
    history.push('/portfolio');
  }

  whichExchangePrompt = () => {
    const { hostname } = window.location;
    const { classes, } = this.props;
    return (
      <Fragment>
        <img className={ classes.img } src="/platform/static/images/flat-bitcoin.svg" alt="bitcoin" />
        <Typography variant="h6" className={classes.modalText}>
          What type of account would you like to add?
        </Typography>
        <div className={classes.buttonRow}>
          <Button
            name="wallet"
            color="primary"
            className={classes.button}
            variant="contained"
            onClick={() => { this.setState({ currentPrompt: PROMPTS.ADD_WALLET }); }}>
            wallet
          </Button>
          <Button
            name="exchange"
            color="primary"
            className={classes.button}
            variant="contained"
            onClick={() => {
              location.href = `//${hostname}/a/onboarding/select-exchange`;
            }}>Exchange
          </Button>
        </div>
      </Fragment>
    );
  }

  openModal = () => {
    this.setState({
      showAddAccountModal: true,
    });
  }

  closeModal = () => {
    this.setState({
      showAddAccountModal: false,
      currentPrompt: PROMPTS.ACCOUNT_TYPE,
      accountLabel: '',
    });
  }

  addWalletPrompt = () => {
    const { classes } = this.props;
    const { accountLabel, walletError } = this.state;
    return (
      <Fragment>
        <Typography variant="h6" className={classes.modalText}>
          Enter your wallet label
        </Typography>
        <form className={classes.form} onSubmit={ this.createWallet } >
          <Grid container alignItems="center" justify="center">
            <Grid item xs={12}>
              <TextField
                style={{ width: '80%' }}
                name="accountLabel"
                placeholder="eg. Trezor, Paper, Offline etc"
                type="string"
                value={accountLabel}
                onChange={this.setWalletLabel} />
            </Grid>
            <Grid item xs={12} style={{ marginTop: '10px' }}>
              <Button
                className={classes.button}
                name="cancel"
                variant="text"
                onClick={this.closeModal}>
                Cancel
              </Button>
              <Button
                className={classes.button}
                name="create"
                variant="outlined"
                color="primary"
                disabled={!accountLabel.length}
                type="submit">
                Create
              </Button>
            </Grid>
          </Grid>
          {walletError &&
          <Grid container justify="space-evenly" alignItems="center" className={classes.formError}>
            <p name="manualTradeFormError" className={classes.formErrorMessage}>{walletError}</p>
          </Grid>
          }
        </form>
      </Fragment>
    );
  }

  renderPrompt = (currentPrompt) => {
    switch (currentPrompt) {
      case PROMPTS.ACCOUNT_TYPE:
        return this.whichExchangePrompt();
      case PROMPTS.ADD_WALLET:
        return this.addWalletPrompt();
      default:
        return null;
    }
  }


  render() {
    const { buttonStyleOverride, classes, addButtonVariant } = this.props;
    const { showAddAccountModal, currentPrompt } = this.state;

    return (
      <Fragment>
        <Button
          name="addAccount"
          variant={addButtonVariant}
          style={buttonStyleOverride}
          color="primary"
          onClick={this.openModal}>
          Add Account
        </Button>
        <Modal
          open={showAddAccountModal}
          onBackdropClick={this.closeModal}
          className={classes.modal}>
          <Paper className={classes.modalPaper}>
            {this.renderPrompt(currentPrompt)}
          </Paper>
        </Modal>
      </Fragment>
    );
  }
}

AddAccount.defaultProps = {
  buttonStyleOverride: null,
  addButtonVariant: 'outlined',
};

AddAccount.propTypes = {
  buttonStyleOverride: PropTypes.object,
  classes: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  addButtonVariant: PropTypes.string,
  accounts: PropTypes.array.isRequired,
};

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      ...bindActionCreators({
        createManualAccount,

      }, dispatch)
    }
  };
}

const base = withRouter(withTheme()(withStyles(styles)(AddAccount)));
export default connect(null, mapDispatchToProps)(base);



// WEBPACK FOOTER //
// ./src/components/common/addAccount.js