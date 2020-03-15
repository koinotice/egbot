import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { InlineDateTimePicker, MuiPickersUtilsProvider } from 'material-ui-pickers';
import MomentUtils from '@date-io/moment';
import { connect } from 'react-redux';
import { withStyles, withTheme } from '@material-ui/core';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import TextField from '@material-ui/core/TextField';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import AutocompleteSelect from '../selects/autocompleteSelect';
import { createManualTrade } from '../../store/ducks/global/accounts';
import getPrecision from '../../utils/numbers';


const styles = theme => ({
  actionButtons: {
    marginTop: '1.243rem',
  },
  fees: {
    paddingTop: '0px',
    marginTop: '0px'
  },
  date: {
    textAlign: 'left',
    marginTop: '1.143rem'
  },
  checkBoxGroup: {
    textAlign: 'left'
  },
  formError: {
    color: theme.palette.buttons.red,
  },
  formErrorMessage: {
    marginTop: '1.229rem',
  },
  form: {
    width: '80%'
  }
});

class AddManualTrade extends Component {
  constructor(props) {
    super(props);

    this.MAX_PRECISION = 8;
    this.MAX_LENGTH = 16;

    this.state = {
      tradeAmount: '',
      tradePrice: '',
      tradeFee: '',
      tradeFeeAsset: '',
      tradePair: '',
      tradePairError: '',
      tradeTimestamp: (new Date()),
      tradeFormError: '',
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.tradeSide !== this.props.tradeSide) {
      this.clearError();
    }
  }

  setTradeAmount = (event) => {
    const newAmount = event.target.value;
    if (this.isInvalidNumber(newAmount)) {
      return;
    }
    this.setState({
      tradeAmount: event.target.value,
      tradeFormError: ''
    });
  }

  setTradePrice = (event) => {
    const newPrice = event.target.value;
    if (this.isInvalidNumber(newPrice)) {
      return;
    }
    this.setState({
      tradePrice: newPrice,
      tradeFormError: ''
    });
  }

  setTradeFee = (event) => {
    const newFee = event.target.value;
    if (this.isInvalidNumber(newFee)) {
      return;
    }
    this.setState({
      tradeFee: event.target.value,
    });
  }

  setFeeAsset = (event) => {
    this.setState({
      tradeFeeAsset: event.target.value,
    });
  }

  setTimestamp = (event) => {
    this.setState({
      tradeTimestamp: (new Date(event.unix() * 1000)),
    });
  }

  getPairSuggestions = (pairs) => {
    return pairs.sort().map(pair => ({ label: pair }));
  }

  clearError= () => {
    this.setState({
      tradeFormError: ''
    });
  }

  isInvalidNumber = (numString) => {
    const num = parseFloat(numString);
    const newPricePrecision = getPrecision(num);
    const greaterThanMaxLength = numString.includes('.')
      ? numString.length > (this.MAX_LENGTH + 1)
      : numString.length > this.MAX_LENGTH;
    return newPricePrecision > this.MAX_PRECISION || greaterThanMaxLength;
  }

  validateTrade = () => {
    const {
      tradePair, tradeAmount, tradePrice
    } = this.state;

    if (!tradePair || !tradeAmount || !tradePrice) {
      return '';
    }
    const { tradeSide, balances, accountId } = this.props;
    if (!accountId || !balances || !balances.length) {
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
    const [base, quote] = tradePair.split('/');
    if (tradeSide === 'SELL') {
      if (!assetsAndValues[base] || assetsAndValues[base] < tradeAmount) {
        return `Not enough ${base} balance for trade, enter ${base} DEPOSIT transaction`;
      }
      return '';
    }
    // BUY
    const total = tradeAmount * tradePrice;
    if (!assetsAndValues[quote] || assetsAndValues[quote] < total) {
      return `Not enough ${quote} balance for trade, enter ${quote} DEPOSIT transaction`;
    }
    return '';
  }

  submit = (event) => {
    event.preventDefault();
    const {
      tradePair, tradePairError, tradeAmount, tradePrice, tradeFee, tradeFeeAsset, tradeTimestamp,
    } = this.state;
    const { accountId, actions, tradeSide } = this.props;

    if (tradePairError) {
      return;
    }

    const isValidTrade = this.validateTrade();
    if (isValidTrade) {
      this.setState({
        tradeFormError: isValidTrade
      });
      return;
    }

    actions.createManualTrade(accountId, tradePair, tradeSide, tradeAmount, tradePrice, tradeFee, tradeFeeAsset, tradeTimestamp);

    this.setState({
      tradeAmount: '',
      tradePrice: '',
      tradeFee: '',
      tradeFeeAsset: '',
      tradeTimestamp: new Date(),
    });
    this.props.submitCallback();
  }

  selectTradePair = (value) => {
    const { pairs } = this.props;
    const isPair = pairs.some(pair => pair === value);
    if (isPair) {
      this.setState({
        tradePair: value, tradeFeeAsset: value.split('/')[0], tradeFormError: this.validateTrade(), tradePairError: '',
      });
      return;
    }
    this.setState({
      tradePair: '', tradeFeeAsset: '', tradeFormError: '', tradePairError: '',
    });
  }

  selectTradePairOnBlur = (value) => {
    const { pairs } = this.props;
    if (value) {
      const isPair = pairs.some(pair => pair === value);
      if (!isPair) {
        this.setState({ tradePairError: 'invalid pair', });
      }
    }
  }

  isSubmitDisable = () => {
    const {
      tradeAmount, tradePrice, tradePair
    } = this.state;
    return !tradeAmount || !tradePrice || !tradePair;
  }

  render() {
    const {
      classes, addAnother, addAnotherFn, pairs, cancelCallback, theme
    } = this.props;
    const {
      tradeAmount, tradePrice, tradeFee, tradeFeeAsset, tradePair, tradePairError, tradeTimestamp, tradeFormError
    } = this.state;
    const feeAssets = tradePair ? tradePair.split('/') : [];
    const disableSubmit = this.isSubmitDisable();

    return (
      <form onSubmit={ this.submit } className={classes.form}>
        <Grid item xs={12}>
          <AutocompleteSelect
            name="pair"
            label="Pair"
            placeholder="Search for pair"
            onSuggestionBlur={this.selectTradePairOnBlur}
            onSuggestionChange={this.selectTradePair}
            suggestions={this.getPairSuggestions(pairs)} />
        </Grid>
        {tradePairError && (
          <Grid item xs={12} >
            <FormHelperText style={{ color: theme.palette.buttons.red }} error={!!tradePairError}>{tradePairError}</FormHelperText>
          </Grid>
        )}
        <Grid item xs={12}>
          <TextField
            name="amount"
            placeholder={tradePair ? `Enter amount (${feeAssets[0]})` : 'Enter amount'}
            label={tradePair ? `Amount (${feeAssets[0]})` : 'Amount'}
            type="number"
            fullWidth
            margin="normal"
            inputProps={{ step: 'any' }}
            onChange={this.setTradeAmount}
            value={tradeAmount} />
        </Grid>
        <Grid item xs={12}>
          <TextField
            name="price"
            placeholder={tradePair ? `Enter price (${feeAssets[1]})` : 'Enter price'}
            label={tradePair ? `Price (${feeAssets[1]})` : 'Price'}
            type="number"
            fullWidth
            margin="normal"
            inputProps={{ step: 'any' }}
            onChange={this.setTradePrice}
            value={tradePrice} />
        </Grid>
        <Grid container direction="row" justify="space-around" alignItems="flex-end" spacing={24} >
          <Grid item xs={6} className={classes.fees}>
            <TextField
              name="fee"
              placeholder="Enter fee"
              label="Fee (optional)"
              type="number"
              fullWidth
              margin="normal"
              inputProps={{ step: 'any' }}
              onChange={this.setTradeFee}
              value={tradeFee} />
          </Grid>
          <Grid item xs={6}>
            {tradePair &&
            <Select
              name="feeAsset"
              inputProps={{ name: 'feeAsset' }}
              value={tradeFeeAsset}
              onChange={this.setFeeAsset}
              disableUnderline>
              <MenuItem value={feeAssets[0]}>{feeAssets[0]}</MenuItem>
              <MenuItem value={feeAssets[1]}>{feeAssets[1]}</MenuItem>
            </Select>
            }
          </Grid>
        </Grid>
        <Grid item xs={12} className={classes.date}>
          <MuiPickersUtilsProvider utils={MomentUtils}>
            <InlineDateTimePicker
              keyboard
              format="MMM D YYYY, hh:mm A"
              ampm
              label="Date/Time"
              value={tradeTimestamp}
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
        <Grid container justify="space-evenly" alignItems="center" className={classes.actionButtons}>
          <Grid item xs={6} >
            <Button
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
        {tradeFormError &&
        <Grid container justify="space-evenly" alignItems="center" className={classes.formError}>
          <p name="manualTradeFormError" className={classes.formErrorMessage}>{tradeFormError}</p>
        </Grid>
        }
      </form>
    );
  }
}

AddManualTrade.defaultProps = {
  addAnother: false,
  addAnotherFn: () => {},
  submitCallback: () => {},
  cancelCallback: () => {},
  pairs: [],
};

AddManualTrade.propTypes = {
  classes: PropTypes.object.isRequired,
  addAnother: PropTypes.bool,
  addAnotherFn: PropTypes.func,
  submitCallback: PropTypes.func,
  cancelCallback: PropTypes.func,
  actions: PropTypes.object.isRequired,
  accountId: PropTypes.string.isRequired,
  tradeSide: PropTypes.string.isRequired,
  pairs: PropTypes.array,
  balances: PropTypes.array.isRequired,
  theme: PropTypes.object.isRequired,
};

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      ...bindActionCreators({
        createManualTrade,
      }, dispatch)
    }
  };
}

const base = withTheme()(withStyles(styles)(AddManualTrade));
export default connect(null, mapDispatchToProps)(base);



// WEBPACK FOOTER //
// ./src/components/forms/addManualTrade.js