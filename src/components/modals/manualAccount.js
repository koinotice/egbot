import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import Modal from '@material-ui/core/Modal';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Icon from '@material-ui/core/Icon';
import ButtonBase from '@material-ui/core/ButtonBase';
import BtnGroup from '../buttons/buttonGroup';
import AddManualTrade from '../forms/addManualTrade';
import AddManualTransaction from '../forms/addManualTransactions';
import { getAssetsFrom } from '../../utils/helpers';


const styles = theme => ({
  modal: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalPaper: {
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
  selectType: {
    paddingBottom: '1rem',
  },
  button: {
    color: theme.palette.primary.main,
  }
});

const ADD_TYPES = {
  BUY: 'BUY',
  SELL: 'SELL',
  DEPOSIT: 'DEPOSIT',
  WITHDRAWAL: 'WITHDRAWAL',
};
Object.freeze(ADD_TYPES);

class ManualAccount extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showTransactionModal: props.dialogOpen,
      manualAddType: props.initialType === 'TRADES' ? ADD_TYPES.BUY : ADD_TYPES.DEPOSIT,
      addAnother: false,
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.initialType !== this.props.initialType) {
      this.updateAddTypeFromSelectedTab(this.props.initialType === 'TRADES' ? ADD_TYPES.BUY : ADD_TYPES.DEPOSIT);
    }
  }

  setManualType = (tradeType) => {
    this.setState({
      manualAddType: tradeType,
    });
  }

  setAddAnother = (event) => {
    this.setState({
      addAnother: event.target.checked,
    });
  }

  updateAddTypeFromSelectedTab = (addType) => {
    this.setState({
      manualAddType: addType
    });
  }

  closeModal = () => {
    this.setState({
      showTransactionModal: false,
      addAnother: false,
    });
  }

  submitCallback = () => {
    this.setState({
      showTransactionModal: this.state.addAnother,
    });
  }

  render() {
    const {
      classes, accountId, pairs, buttonStyles, balances
    } = this.props;
    const {
      showTransactionModal, manualAddType, addAnother
    } = this.state;

    if (showTransactionModal || addAnother) {
      return (
        <Modal
          open={showTransactionModal || addAnother}
          onBackdropClick={this.closeModal}
          className={classes.modal}>
          <Paper className={classes.modalPaper}>
            <Grid container justify="space-around" spacing={24}>
              <Grid item xs={12}>
                <Typography variant="h6">
                  {`Add ${(manualAddType === ADD_TYPES.BUY || manualAddType === ADD_TYPES.SELL) ? 'Trade' : 'Transaction'}`}
                </Typography>
              </Grid>
              <Grid item xs={12} className={classes.modal}>
                <BtnGroup
                  className={classes.selectType}
                  selectedValue={manualAddType}
                  onChange={this.setManualType}
                  buttons={ [
                    { name: 'buy', label: 'Buy', value: 'BUY' },
                    { name: 'sell', label: 'Sell', value: 'SELL' },
                    { name: 'deposit', label: 'Deposit', value: 'DEPOSIT' },
                    { name: 'withdrawal', label: 'Withdrawal', value: 'WITHDRAWAL' },
                  ] } />
              </Grid>
              {(manualAddType === ADD_TYPES.BUY || manualAddType === ADD_TYPES.SELL) &&
                <AddManualTrade
                  pairs={pairs}
                  balances={balances}
                  tradeSide={manualAddType}
                  accountId={accountId}
                  addAnother={addAnother}
                  addAnotherFn={this.setAddAnother}
                  submitCallback={this.submitCallback}
                  cancelCallback={this.closeModal} />}
              {(manualAddType === ADD_TYPES.DEPOSIT || manualAddType === ADD_TYPES.WITHDRAWAL) &&
                <AddManualTransaction
                  assets={getAssetsFrom(pairs)}
                  balances={balances}
                  transactionType={manualAddType}
                  accountId={accountId}
                  addAnother={addAnother}
                  addAnotherFn={this.setAddAnother}
                  submitCallback={this.submitCallback}
                  cancelCallback={this.closeModal} />}
            </Grid>
          </Paper>
        </Modal>
      );
    }

    return (
      <ButtonBase
        name={`add${(manualAddType === 'BUY' || manualAddType === 'SELL') ? 'Trade' : 'Transaction'}`}
        className={classes.button}
        style={buttonStyles}
        onClick={() => {
          this.setState({
            showTransactionModal: true
          });
        } }>
        <Icon style={{ marginRight: '6px' }}>add_circle_outline</Icon>
        Add {(manualAddType === 'BUY' || manualAddType === 'SELL') ? 'Trade' : 'Transaction'}
      </ButtonBase>
    );
  }
}

ManualAccount.defaultProps = {
  buttonStyles: {},
  initialType: ADD_TYPES.BUY,
  dialogOpen: false,
};

ManualAccount.propTypes = {
  accountId: PropTypes.string.isRequired,
  classes: PropTypes.object.isRequired,
  balances: PropTypes.array.isRequired,
  pairs: PropTypes.array.isRequired,
  buttonStyles: PropTypes.object,
  initialType: PropTypes.string,
  dialogOpen: PropTypes.bool,
};

export default withStyles(styles, { withTheme: true })(ManualAccount);



// WEBPACK FOOTER //
// ./src/components/modals/manualAccount.js