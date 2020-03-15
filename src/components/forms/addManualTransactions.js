import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { InlineDateTimePicker, MuiPickersUtilsProvider } from 'material-ui-pickers';
import MomentUtils from '@date-io/moment';
import { connect } from 'react-redux';
import { withStyles, withTheme } from '@material-ui/core';
import FormHelperText from '@material-ui/core/FormHelperText';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import AutocompleteSelect from '../selects/autocompleteSelect';
import { createManualTransaction } from '../../store/ducks/global/accounts';
import getPrecision from '../../utils/numbers';


const styles = theme => ({
  actionButtons: {
    marginTop: '1.243rem',
  },
  checkBoxGroup: {
    textAlign: 'left'
  },
  date: {
    textAlign: 'left',
    marginTop: '1.143rem'
  },
  form: {
    width: '80%',
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

class AddManualTransactions extends Component {
  constructor(props) {
    super(props);

    this.state = {
      transactionAsset: '',
      transactionAssetError: '',
      transactionTimestamp: (new Date()),
      transactionAmount: '',
      transactionFee: '',
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
      transactionFee: event.target.value,
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

  isInvalidNumber = (numString) => {
    const num = parseFloat(numString);
    const newPricePrecision = getPrecision(num);
    const greaterThanMaxLength = numString.includes('.')
      ? numString.length > (MAX_LENGTH + 1)
      : numString.length > MAX_LENGTH;
    return newPricePrecision > MAX_PRECISION || greaterThanMaxLength;
  }

  validateTransaction = () => {
    const {
      transactionAsset, transactionAmount
    } = this.state;
    const { transactionType, balances, accountId } = this.props;

    if (!transactionAsset || !transactionAmount || !transactionType) {
      return '';
    }
    const accountBalance = balances.find(obj => obj.id === accountId);
    if (!accountBalance) {
      return '';
    }

    const { assets } = accountBalance;
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

  submit = (event) => {
    event.preventDefault();
    const {
      transactionAsset, transactionAmount, transactionTimestamp, transactionFee, transactionAssetError
    } = this.state;
    const { accountId, actions, transactionType } = this.props;

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

    actions.createManualTransaction(accountId, transactionAsset, transactionTimestamp, transactionType, transactionAmount, transactionFee);

    this.setState({
      transactionAmount: '',
      transactionFee: '',
      transactionTimestamp: (new Date()),
      transactionFormError: '',
    });
    this.props.submitCallback();
  }

  selectTransactionAsset = (value) => {
    const { assets } = this.props;
    const isAsset = assets.some(asset => asset === value);
    if (isAsset) {
      this.setState({ transactionAsset: value, transactionAssetError: '', });
      return;
    }
    this.setState({ transactionAsset: '', transactionAssetError: '', });
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
      transactionAsset, transactionAmount
    } = this.state;
    return !transactionAsset || !transactionAmount;
  }

  render() {
    const {
      classes, addAnother, addAnotherFn, assets, cancelCallback, theme
    } = this.props;
    const {
      transactionAsset, transactionAssetError, transactionAmount, transactionTimestamp, transactionFee, transactionFormError,
    } = this.state;

    const disableSubmit = this.isSubmitDisable();

    return (
      <form onSubmit={ this.submit } className={classes.form}>
        <Grid item xs={12}>
          <AutocompleteSelect
            name="asset"
            label="Asset"
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
            name="amount"
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
            name="fee"
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
        <Grid item xs={7} style={{ marginTop: '25px' }}>
          <FormControlLabel
            className={classes.checkBoxGroup}
            control={
              <Checkbox
                style={{ paddingLeft: '0px', paddingRight: '5px' }}
                checked={addAnother}
                onChange={addAnotherFn}
                value="addAnother"
                color="primary" />
            }
            label="Add another" />
        </Grid>
        <Grid item xs={5} />
        <Grid container justify="space-between" alignItems="center" className={classes.actionButtons}>
          <Grid item xs={6} >
            <Button
              name="cancel"
              variant="text"
              onClick={cancelCallback}>
              Cancel
            </Button>
          </Grid>
          <Grid item xs={6} >
            <Button
              name="create"
              variant="outlined"
              color="primary"
              disabled={!!disableSubmit}
              type="submit">
              Create
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

AddManualTransactions.defaultProps = {
  addAnother: false,
  addAnotherFn: () => {},
  submitCallback: () => {},
  cancelCallback: () => {},
  assets: [],
};

AddManualTransactions.propTypes = {
  classes: PropTypes.object.isRequired,
  addAnother: PropTypes.bool,
  addAnotherFn: PropTypes.func,
  submitCallback: PropTypes.func,
  cancelCallback: PropTypes.func,
  actions: PropTypes.object.isRequired,
  accountId: PropTypes.string.isRequired,
  transactionType: PropTypes.string.isRequired,
  assets: PropTypes.array,
  balances: PropTypes.array.isRequired,
  theme: PropTypes.object.isRequired,
};

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      ...bindActionCreators({
        createManualTransaction,
      }, dispatch)
    }
  };
}

const base = withTheme()(withStyles(styles)(AddManualTransactions));
export default connect(null, mapDispatchToProps)(base);



// WEBPACK FOOTER //
// ./src/components/forms/addManualTransactions.js