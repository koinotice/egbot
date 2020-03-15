import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { InlineDateTimePicker, MuiPickersUtilsProvider } from 'material-ui-pickers';
import MomentUtils from '@date-io/moment';
import { connect } from 'react-redux';
import { withStyles, withTheme } from '@material-ui/core';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import FormHelperText from '@material-ui/core/FormHelperText';
import AutocompleteSelect from '../selects/autocompleteSelect';
import { updateManualTransaction } from '../../store/ducks/global/accounts';
import BtnGroup from '../buttons/buttonGroup';
import getPrecision from '../../utils/numbers';


const styles = theme => ({
  actionButtons: {
    marginTop: '3.029rem',
  },
  checkBoxGroup: {
    textAlign: 'left'
  },
  date: {
    textAlign: 'left',
    marginTop: '1.143rem'
  },
  selectType: {
    paddingBottom: '1rem',
  },
  buttonGroup: {
    marginTop: '1.243rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  form: {
    width: '80%'
  },
  formError: {
    color: theme.palette.buttons.red,
  },
  formErrorMessage: {
    marginTop: '1.229rem',
  },
});

const MAX_PRECISION = 8;
const MAX_LENGTH = 24;

class UpdateManualTransactions extends Component {
  constructor(props) {
    super(props);

    const {
      asset, type, amount, timestamp, fee
    } = props.transactionToUpdate;

    this.state = {
      transactionAsset: asset,
      transactionAssetError: '',
      transactionTimestamp: (new Date(timestamp)),
      transactionAmount: amount,
      transactionFee: fee,
      transactionType: type,
      transactionFormError: '',
    };
  }

  setTransactionAmount = (event) => {
    const newAmount = event.target.value;
    if (this.isInvalidNumber(newAmount)) {
      return;
    }
    this.setState({
      transactionAmount: newAmount,
      transactionFormError: '',
    });
  }

  setTransactionFee = (event) => {
    const newFee = event.target.value;
    if (this.isInvalidNumber(newFee)) {
      return;
    }
    this.setState({
      transactionFee: newFee,
      transactionFormError: '',
    });
  }

  setTimestamp = (event) => {
    this.setState({
      transactionTimestamp: (new Date(event.unix() * 1000)),
      transactionFormError: '',
    });
  }

  getAssetSuggestions = (assets) => {
    return assets.sort().map(asset => ({ label: asset }));
  }

  setTransactionType = (transactionType) => {
    this.setState({
      transactionType
    });
  }

  selectTransactionAsset = (value) => {
    const { assets } = this.props;
    const isAsset = assets.some(asset => asset === value);
    if (isAsset) {
      this.setState({ transactionAsset: value, transactionFormError: '', transactionAssetError: '', });
      return;
    }
    this.setState({ transactionAsset: '', transactionFormError: '', transactionAssetError: '', });
  }

  isInvalidNumber = (numString) => {
    const num = parseFloat(numString);
    const newPricePrecision = getPrecision(num);
    const greaterThanMaxLength = numString.includes('.')
      ? numString.length > (MAX_LENGTH + 1)
      : numString.length > MAX_LENGTH;
    return newPricePrecision > MAX_PRECISION || greaterThanMaxLength;
  }

  submit = (event) => {
    event.preventDefault();
    const {
      transactionAsset, transactionAssetError, transactionAmount, transactionTimestamp, transactionFee, transactionType
    } = this.state;
    const { transactionToUpdate, actions, } = this.props;

    if (transactionAssetError) {
      return;
    }

    const isValidTransaction = this.validateTransaction();
    if (isValidTransaction) {
      this.setState({
        transactionFormError: isValidTransaction
      });
      return;
    }

    actions.updateManualTransaction(
      transactionToUpdate.accountId,
      transactionToUpdate.id,
      transactionAsset,
      transactionTimestamp,
      transactionType,
      transactionAmount,
      transactionFee
    );

    this.setState({
      transactionAsset: '',
      transactionTimestamp: (new Date()),
      transactionAmount: '',
      transactionFee: '',
      transactionType: 'DEPOSIT',
    });
    this.props.submitCallback();
  }

  selectTransactionAssetOnBlur = (value) => {
    const { assets } = this.props;
    if (value) {
      const isAsset = assets.some(asset => asset === value);
      if (!isAsset) {
        this.setState({ transactionAssetError: 'invalid asset', });
      }
    }
  }

  isSubmitDisable = () => {
    const {
      transactionAsset,
      transactionType,
      transactionAmount,
      transactionTimestamp,
      transactionFee,
    } = this.state;

    const {
      asset, type, amount, timestamp, fee
    } = this.props.transactionToUpdate;

    const isSame = transactionAsset === asset
      && transactionType === type
      && parseFloat(transactionAmount) === parseFloat(amount)
      && transactionTimestamp.toISOString() === timestamp
      && parseFloat(transactionFee) === parseFloat(fee);

    const isEmpty = !transactionAsset || !transactionAmount;
    return isSame || isEmpty;
  }

  validateTransaction = () => {
    const {
      transactionAsset, transactionAmount, transactionType
    } = this.state;
    const { balancesForAccount } = this.props;

    if (!transactionAsset || !transactionAmount || !transactionType) {
      return '';
    }
    if (!balancesForAccount) {
      return '';
    }
    const { assets } = balancesForAccount;
    const assetsAndValues = assets.reduce((acc, curr) => {
      acc[curr.name] = curr.rawTotal;
      return acc;
    }, {});

    if (transactionType === 'WITHDRAWAL') {
      if (!assetsAndValues[transactionAsset] || parseFloat(assetsAndValues[transactionAsset]) < parseFloat(transactionAmount)) {
        return `Not enough ${transactionAsset} balance for WITHDRAWAL, enter DEPOSIT transaction`;
      }
    }
    return '';
  }

  render() {
    const {
      classes, assets, cancelCallback, theme
    } = this.props;
    const {
      transactionAsset, transactionAssetError, transactionType, transactionAmount, transactionTimestamp, transactionFee, transactionFormError
    } = this.state;

    const disableSubmit = this.isSubmitDisable();

    return (
      <form onSubmit={ this.submit } className={classes.form}>
        <Grid item xs={12}>
          <Typography variant="h6" className={classes.modalText}>
            Update Transaction
          </Typography>
        </Grid>
        <Grid item xs={12} className={classes.buttonGroup}>
          <BtnGroup
            className={classes.selectType}
            selectedValue={transactionType}
            onChange={this.setTransactionType}
            buttons={ [
              { name: 'deposit', label: 'Deposit', value: 'DEPOSIT' },
              { name: 'withdrawal', label: 'Withdrawal', value: 'WITHDRAWAL' },
            ] } />
        </Grid>
        <Grid item xs={12}>
          <AutocompleteSelect
            initialSelected={transactionAsset}
            label="Assets"
            placeholder="Search for symbol"
            onSuggestionChange={this.selectTransactionAsset}
            onSuggestionBlur={this.selectTransactionAssetOnBlur}
            suggestions={this.getAssetSuggestions(assets)} />
        </Grid>
        {transactionAssetError && (
          <Grid item xs={12} >
            <FormHelperText style={{ color: theme.palette.buttons.red }} error={!!transactionAssetError}>{transactionAssetError}</FormHelperText>
          </Grid>
        )}
        <Grid item xs={12}>
          <TextField
            placeholder={transactionAsset ? `Enter amount (${transactionAsset})` : 'Enter amount'}
            label={transactionAsset ? `Amount (${transactionAsset})` : 'Amount'}
            type="number"
            fullWidth
            margin="normal"
            inputProps={{ step: 'any' }}
            onChange={this.setTransactionAmount}
            value={transactionAmount} />
        </Grid>
        <Grid item xs={6} className={classes.fees}>
          <TextField
            placeholder={transactionAsset ? `Enter fee (${transactionAsset})` : 'Enter fee'}
            label={transactionAsset ? `${transactionAsset} Fee (optional)` : 'Fee (optional)'}
            type="number"
            fullWidth
            margin="normal"
            inputProps={{ step: 'any' }}
            onChange={this.setTransactionFee}
            value={transactionFee} />
        </Grid>
        <Grid item xs={12} className={classes.date}>
          <MuiPickersUtilsProvider utils={MomentUtils}>
            <InlineDateTimePicker
              format="MMM D YYYY, hh:mm A"
              keyboard
              ampm
              label="Date/Time"
              value={transactionTimestamp}
              onChange={this.setTimestamp}
              disablePast={false}
              disableFuture />
          </MuiPickersUtilsProvider>
        </Grid>
        <Grid container justify="space-between" alignItems="center" className={classes.actionButtons}>
          <Grid item xs={6} >
            <Button
              variant="text"
              onClick={cancelCallback}>
              Cancel
            </Button>
          </Grid>
          <Grid item xs={6} >
            <Button
              variant="outlined"
              color="primary"
              disabled={!!disableSubmit}
              type="submit">
              Update
            </Button>
          </Grid>
        </Grid>
        {transactionFormError &&
        <Grid container justify="space-evenly" alignItems="center" className={classes.formError}>
          <p name="manualTradeFormError" className={classes.formErrorMessage}>{transactionFormError}</p>
        </Grid>
        }

      </form>
    );
  }
}

UpdateManualTransactions.defaultProps = {
  submitCallback: () => {},
  cancelCallback: () => {},
  assets: [],
  balancesForAccount: {},
};

UpdateManualTransactions.propTypes = {
  classes: PropTypes.object.isRequired,
  submitCallback: PropTypes.func,
  cancelCallback: PropTypes.func,
  actions: PropTypes.object.isRequired,
  transactionToUpdate: PropTypes.object.isRequired,
  assets: PropTypes.array,
  balancesForAccount: PropTypes.object,
  theme: PropTypes.object.isRequired,
};

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      ...bindActionCreators({
        updateManualTransaction,
      }, dispatch)
    }
  };
}

const base = withTheme()(withStyles(styles)(UpdateManualTransactions));
export default connect(null, mapDispatchToProps)(base);



// WEBPACK FOOTER //
// ./src/components/forms/updateManualTransactions.js