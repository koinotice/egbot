import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { InlineDateTimePicker, MuiPickersUtilsProvider } from 'material-ui-pickers';
import MomentUtils from '@date-io/moment';
import { connect } from 'react-redux';
import { withStyles, withTheme } from '@material-ui/core';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import FormHelperText from '@material-ui/core/FormHelperText';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import AutocompleteSelect from '../selects/autocompleteSelect';
import { updateManualTrade } from '../../store/ducks/global/accounts';
import getPrecision from '../../utils/numbers';
import BtnGroup from '../buttons/buttonGroup';


const styles = theme => ({
  actionButtons: {
    marginTop: '3.029rem',
  },
  fees: {
    paddingTop: '0px',
    marginTop: '0px'
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
  formError: {
    color: theme.palette.buttons.red,
  },
  formErrorMessage: {
    marginTop: '1.229rem',
    padding: '1rem',
    borderRadius: '3px',
  },
  form: {
    width: '80%',
  }
});

const MAX_PRECISION = 8;
const MAX_LENGTH = 16;

class UpdateManualTrade extends Component {
  constructor(props) {
    super(props);

    const {
      pair, side, price, fee, feeCurrency, amount, timestamp
    } = props.tradeToUpdate;

    this.state = {
      tradePair: pair,
      tradePairError: '',
      tradeSide: side,
      tradeAmount: amount,
      tradePrice: parseFloat(price).toFixed(8),
      tradeFee: fee,
      tradeFeeAsset: feeCurrency,
      tradeTimestamp: (new Date(timestamp)),
      tradeFormError: '',
    };
  }

  setTradeAmount = (event) => {
    const newAmount = event.target.value;
    if (this.isInvalidNumber(newAmount)) {
      return;
    }
    this.setState({
      tradeAmount: event.target.value,
      tradeFormError: '',
    });
  }

  setTradePrice = (event) => {
    const newPrice = event.target.value;
    if (this.isInvalidNumber(newPrice)) {
      return;
    }
    this.setState({
      tradePrice: newPrice,
      tradeFormError: '',
    });
  }

  setTradeFee = (event) => {
    const newFee = event.target.value;
    if (this.isInvalidNumber(newFee)) {
      return;
    }
    this.setState({
      tradeFee: event.target.value,
      tradeFormError: '',
    });
  }

  setTradeAsset = (event) => {
    this.setState({
      tradeFeeAsset: event.target.value,
      tradeFormError: '',
    });
  }

  setTimestamp = (event) => {
    this.setState({
      tradeTimestamp: (new Date(event.unix() * 1000)),
      tradeFormError: '',
    });
  }

  getPairSuggestions = (pairs) => {
    return pairs.sort().map(pair => ({ label: pair }));
  }

  setTradeSide = (tradeSide) => {
    this.setState({
      tradeSide,
      tradeFormError: '',
    });
  }

  selectTradePair = (value) => {
    const { pairs } = this.props;
    const isPair = pairs.some(pair => pair === value);
    if (isPair) {
      this.setState({
        tradePair: value, tradePairError: '', tradeFeeAsset: value.split('/')[0], tradeFormError: '',
      });
      return;
    }
    this.setState({
      tradePair: '', tradePairError: '', tradeFeeAsset: '', tradeFormError: '',
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

  validateTrade = () => {
    const {
      tradePair, tradeAmount, tradePrice, tradeSide
    } = this.state;

    if (!tradePair || !tradeAmount || !tradePrice || !tradeSide) {
      return '';
    }
    const { balancesForAccount } = this.props;
    if (!balancesForAccount || !Object.keys(balancesForAccount).length) {
      return '';
    }

    const { assets } = balancesForAccount;
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
      tradePair, tradePairError, tradeSide, tradeAmount, tradePrice, tradeFee, tradeFeeAsset, tradeTimestamp,
    } = this.state;
    const { tradeToUpdate, actions, } = this.props;

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
    actions.updateManualTrade(
      tradeToUpdate.accountId,
      tradeToUpdate.id,
      tradePair,
      tradeSide,
      tradeAmount,
      tradePrice,
      tradeFee,
      tradeFeeAsset,
      tradeTimestamp
    );

    this.setState({
      tradeAmount: '',
      tradePrice: '',
      tradeFee: '',
      tradeFeeAsset: '',
      tradeTimestamp: new Date(),
      tradeFormError: '',
    });
    this.props.submitCallback();
  }

  isInvalidNumber = (numString) => {
    const num = parseFloat(numString);
    const newPricePrecision = getPrecision(num);
    const greaterThanMaxLength = numString.includes('.')
      ? numString.length > (MAX_LENGTH + 1)
      : numString.length > MAX_LENGTH;
    return newPricePrecision > MAX_PRECISION || greaterThanMaxLength;
  }

  isSubmitDisable = () => {
    const {
      pair, side, price, fee, feeCurrency, amount, timestamp
    } = this.props.tradeToUpdate;

    const {
      tradePair, tradeSide, tradeAmount, tradePrice, tradeFee, tradeFeeAsset, tradeTimestamp,
    } = this.state;

    const isSame = pair === tradePair
      && side === tradeSide
      && parseFloat(price) === parseFloat(tradePrice)
      && parseFloat(amount) === parseFloat(tradeAmount)
      && tradeTimestamp.toISOString() === timestamp
      && parseFloat(tradeFee) === parseFloat(fee)
      && feeCurrency === tradeFeeAsset;

    const isEmpty = !tradeAmount || !tradePrice || !tradePair;
    return isSame || isEmpty;
  }

  render() {
    const {
      classes, pairs, cancelCallback, theme
    } = this.props;
    const {
      tradeAmount, tradeSide, tradePrice, tradeFee, tradeFeeAsset, tradePair, tradePairError, tradeTimestamp, tradeFormError
    } = this.state;
    const feeAssets = tradePair ? tradePair.split('/') : [];
    const disableSubmit = this.isSubmitDisable();

    return (
      <form onSubmit={ this.submit } className={classes.form}>
        <Grid item xs={12}>
          <Typography variant="h6" className={classes.modalText}>
            Update Trade
          </Typography>
        </Grid>

        <Grid item xs={12} className={classes.buttonGroup}>
          <BtnGroup
            className={classes.selectType}
            selectedValue={tradeSide}
            onChange={this.setTradeSide}
            buttons={ [
              { name: 'buy', label: 'Buy', value: 'BUY' },
              { name: 'sell', label: 'Sell', value: 'SELL' },
            ] } />
        </Grid>

        <Grid item xs={12}>
          <AutocompleteSelect
            initialSelected={tradePair}
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
              inputProps={{ name: 'feeAsset' }}
              value={tradeFeeAsset}
              onChange={this.setTradeAsset}
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
              format="MMM D YYYY, hh:mm A"
              keyboard
              ampm
              label="Date/Time"
              value={tradeTimestamp}
              onChange={this.setTimestamp}
              disablePast={false}
              disableFuture />
          </MuiPickersUtilsProvider>
        </Grid>
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
              variant="outlined"
              color="primary"
              disabled={!!disableSubmit}
              type="submit">
              Update
            </Button>
          </Grid>
        </Grid>
        <Grid container alignItems="center" justify="center" className={classes.formError}>
          <p name="orderFormError" className={classes.formErrorMessage}>{tradeFormError}</p>
        </Grid>
      </form>
    );
  }
}

UpdateManualTrade.defaultProps = {
  submitCallback: () => {},
  cancelCallback: () => {},
  pairs: [],
  balancesForAccount: {},
};

UpdateManualTrade.propTypes = {
  classes: PropTypes.object.isRequired,
  submitCallback: PropTypes.func,
  cancelCallback: PropTypes.func,
  actions: PropTypes.object.isRequired,
  pairs: PropTypes.array,
  tradeToUpdate: PropTypes.object.isRequired,
  balancesForAccount: PropTypes.object,
  theme: PropTypes.object.isRequired,
};

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      ...bindActionCreators({
        updateManualTrade,
      }, dispatch)
    }
  };
}

const base = withTheme()(withStyles(styles)(UpdateManualTrade));
export default connect(null, mapDispatchToProps)(base);



// WEBPACK FOOTER //
// ./src/components/forms/updateManualTrade.js