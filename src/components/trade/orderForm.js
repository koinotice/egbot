/* eslint-disable jsx-a11y/interactive-supports-focus,jsx-a11y/click-events-have-key-events */
import React, { Component } from 'react';
import Paper from '@material-ui/core/Paper/Paper';
import { PulseLoader } from 'react-spinners';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { withStyles, withTheme } from '@material-ui/core/styles';
import Input from '@material-ui/core/Input';
import InputAdornment from '@material-ui/core/InputAdornment';
import ButtonBase from '@material-ui/core/ButtonBase';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Formatted from '../common/formatted';
import getPrecision, { sanitizeScientificNotation } from '../../utils/numbers';
import { isMarketPrefCurrency, ellipsize, formatAmount } from '../../utils/helpers';
import BtnGroup from '../buttons/buttonGroup';
import BtnToggle from '../buttons/buttonToggle';
import exchangeConfig from '../../config/exchangeConfig';
import {
  ORDER_TYPES,
  ORDER_SIDE,
  getBestOrderPrice,
  updateOrderPrice,
  updateOrderFeeTotal,
  updateOrderTotal,
  updateStopPrice,
  updateOrderSide,
  updateOrderType,
  updateOrderAmount,
  submitOrder,
  clearOrderForm,
} from '../../store/ducks/trade/orderForm';
import withPaywall from '../hocs/paywall';
import TooltipIcon from '../common/tooltipIcon';

const styles = theme => ({
  heading: {
    fontSize: '0.8571428571428571rem',
    lineHeight: '1.071rem',
    paddingBottom: '0.3571rem'
  },
  paper: {
    backgroundColor: theme.palette.background.paperDarker,
    borderRadius: '0.4286rem',
    padding: '0.1571rem 1.071rem',
  },
  balanceRow: {
    width: '100%',
    height: '2.571rem',
    marginTop: '0.7143rem',
    '&:hover': {
      cursor: 'pointer'
    },
  },
  balanceValue: {
    float: 'right',
    position: 'relative',
    top: '-0.2857rem',
    textAlign: 'right'
  },
  balanceContainer: {
    height: '9.351142857142857rem',
    marginBottom: '0.35714285714285715rem'
  },


  btnGroupWrapper: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '1.071rem'
  },
  btnToggle: {
    marginBottom: '1.071rem'
  },
  presets: {
    color: theme.palette.text.secondary,
    marginBottom: '1.071rem',
  },
  limitPresets: {
    color: theme.palette.text.secondary,
    marginBottom: '0.5rem',
  },
  presetBtn: {
    backgroundColor: theme.palette.background.paperDarker,
    width: '2.5rem',
    padding: '0.2429rem 0.2857rem',
    borderRadius: '0.2143rem',
    fontSize: '0.7143rem'
  },
  input: {
    backgroundColor: theme.palette.background.paperDarker,
    padding: '0 0.3571rem',
    borderRadius: '0.2857rem',
    width: '100%',
    marginBottom: '0.3571rem'
  },
  inputInvalid: {
    backgroundColor: theme.palette.background.paperDarker,
    padding: '0 0.3571rem',
    borderRadius: '0.2857rem',
    width: '100%',
    marginBottom: '0.3571rem',
    border: '1px solid #BD2048',
  },
  fee: {
    width: '100%',
    height: '1.571rem',
  },
  total: {
    width: '100%',
    height: '2.571rem',
    marginBottom: '1.071rem'
  },
  label: {
    float: 'left'
  },
  inputLabel: {
    paddingBottom: '0.3571rem',
  },
  value: {
    float: 'right',
    position: 'relative',
    top: '-0.1429rem',
    textAlign: 'right',
  },
  primaryText: {
    fontWeight: 'bold'
  },
  secondaryText: {
    fontWeight: 'bold',
    color: theme.palette.text.secondary,
  },
  orderForm: {
    paddingTop: '0.3571rem',
  },
  orderFormError: {
    color: theme.palette.buttons.red,
  },
  orderFormErrorMessage: {
    marginTop: '1.229rem',
    padding: '1rem',
    backgroundColor: theme.palette.background.paperDarker,
    borderRadius: '3px',
  },
  submit: {
    fontSize: '0.8571rem',
    fontWeight: '600',
    lineHeight: '1.357rem',
    paddingTop: '0.3571rem',
    paddingBottom: '0.3571rem',
    color: '#FFF',
    borderRadius: '0.2857rem',
    width: '100%',
    height: '2.286rem'
  },
  green: {
    backgroundColor: theme.palette.buttons.green,
    '&:hover': {
      backgroundColor: theme.palette.buttons.greenHover,
    },
  },
  red: {
    backgroundColor: theme.palette.buttons.red,
    '&:hover': {
      backgroundColor: theme.palette.buttons.redHover,
    },
  },
  disabled: {
    backgroundColor: theme.palette.background.btnGroup,
  },
  progressContainer: {
    height: '250px',
  },
});

class OrderForm extends Component {
  constructor() {
    super();

    this.state = {
      fee: 0,
      amountValidError: '',
      priceValidError: '',
      stopPriceValidError: '',
      totalValidError: '',
      balanceValidError: '',
    };

    this.MAX_INPUT_LENGTH = 16;
    this.ELLIPSE_LENGTH = 6;
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.currentPair !== nextProps.currentPair || this.props.currentExchange !== nextProps.currentExchange) {
      nextProps.actions.updateOrderTotal(0);
      nextProps.actions.updateOrderFeeTotal(0);
      nextProps.actions.updateOrderAmount('');
      this.setState({
        amountValidError: '',
        priceValidError: '',
        stopPriceValidError: '',
        totalValidError: '',
        balanceValidError: '',
      });
      return;
    }

    if (nextProps.orderPrice !== this.props.orderPrice || nextProps.orderAmount !== this.props.orderAmount) {
      if (nextProps.orderType === ORDER_TYPES.MARKET) {
        const {
          actions, orderAmount, orderSide, orderBookStreamData, orderTotal, orderType, currentPair, exchangeMarketsData
        } = nextProps;
        const currentPrice = getBestOrderPrice(orderAmount, null, orderSide, orderBookStreamData);
        const fee = this.getFeePercentage(orderType, currentPair, exchangeMarketsData);
        const feeTotal = (orderAmount ? parseFloat(orderAmount) : 0) * currentPrice * fee;
        const total = ((orderAmount ? parseFloat(orderAmount) : 0) * currentPrice) + feeTotal;
        if (total !== orderTotal) {
          actions.updateOrderTotal(total);
          if (this.state.fee !== feeTotal) {
            actions.updateOrderFeeTotal(parseFloat(feeTotal.toFixed(8)));
          }
        }
      }
    }
  }

  componentWillUnmount() {
    this.props.actions.clearOrderForm();
  }

  setOrderType = (type) => {
    if (this.props.orderType !== type) {
      let { orderTotal: total } = this.props;
      const { currentPair, exchangeMarketsData } = this.props;
      if (type === ORDER_TYPES.MARKET) {
        const {
          orderAmount, orderSide, orderBookStreamData, actions
        } = this.props;
        if (orderAmount) {
          const currentPrice = getBestOrderPrice(orderAmount, null, orderSide, orderBookStreamData);
          const orderAmountNumber = parseFloat(orderAmount);
          const fee = this.getFeePercentage(type, currentPair, exchangeMarketsData);
          const feeTotal = orderAmountNumber * currentPrice * fee;
          total = (currentPrice * orderAmountNumber) + (feeTotal);
          actions.updateOrderFeeTotal(feeTotal);
        } else {
          total = 0;
          actions.updateOrderFeeTotal(0);
        }
      } else { // for LIMIT || STOPS
        const { orderAmount, orderPrice, actions } = this.props;
        if (orderAmount && orderPrice) {
          const orderAmountNumber = parseFloat(orderAmount);
          const orderOrderPrice = parseFloat(orderPrice);
          const fee = this.getFeePercentage(type, currentPair, exchangeMarketsData);
          const feeTotal = orderAmountNumber * orderOrderPrice * fee;
          total = (orderAmountNumber * orderOrderPrice) + feeTotal;
          actions.updateOrderFeeTotal(feeTotal);
        } else {
          total = 0;
          actions.updateOrderFeeTotal(0);
        }
      }

      this.props.actions.updateOrderType(type);
      if (this.props.orderTotal !== total) {
        this.props.actions.updateOrderTotal(total);
      }

      this.setState({
        amountValidError: '',
        totalValidError: '',
        balanceValidError: '',
      });
    }
  };

  setOrderSide = (side) => {
    if (this.props.orderSide !== side) {
      this.props.actions.updateOrderSide(side);

      this.setState({
        amountValidError: '',
        totalValidError: '',
        balanceValidError: '',
      });
    }
  };

  getFeePercentage = (orderType, currentPair, exchangeMarketsData) => {
    if (orderType === ORDER_TYPES.MARKET && exchangeMarketsData[currentPair].taker) {
      return exchangeMarketsData[currentPair].taker;
    } else if (exchangeMarketsData[currentPair].maker) {
      return exchangeMarketsData[currentPair].maker;
    }
    return 0;
  }

  setAmount = (event) => {
    const amount = event.target.value;
    if (amount.length > this.MAX_INPUT_LENGTH) {
      return;
    }
    const {
      actions, orderPrice, orderType, orderSide, orderBookStreamData, currentPair, exchangeMarketsData,
    } = this.props;

    const fee = this.getFeePercentage(orderType, currentPair, exchangeMarketsData);
    const currentPrice = orderType === ORDER_TYPES.MARKET ? getBestOrderPrice(amount, null, orderSide, orderBookStreamData) : orderPrice;
    const feeTotal = amount * currentPrice * fee;
    actions.updateOrderFeeTotal(parseFloat(feeTotal.toFixed(8)));
    const total = (amount * currentPrice) + (feeTotal);

    actions.updateOrderTotal(total);
    actions.updateOrderAmount(amount.toString());
  };

  setPrice = (event) => {
    const newPrice = event.target.value;
    if (newPrice.length > this.MAX_INPUT_LENGTH) {
      return;
    }
    this.props.actions.updateOrderPrice(newPrice);

    if (newPrice) {
      const {
        orderAmount, currentPair, exchangeMarketsData, actions
      } = this.props;
      if (orderAmount) {
        const fee = this.getFeePercentage(ORDER_TYPES.LIMIT, currentPair, exchangeMarketsData);
        const feeTotal = parseFloat(orderAmount) * parseFloat(newPrice) * fee;
        const total = (parseFloat(orderAmount) * parseFloat(newPrice)) + feeTotal;
        this.props.actions.updateOrderTotal(total);
        actions.updateOrderFeeTotal(parseFloat(feeTotal.toFixed(8)));
        return;
      }
    }
    this.props.actions.updateOrderTotal(0);
    this.props.actions.updateOrderFeeTotal(0);
  };

  setStopPrice = (event) => {
    const newStopPrice = event.target.value;
    if (newStopPrice.length > this.MAX_INPUT_LENGTH) {
      return;
    }
    this.props.actions.updateStopPrice(newStopPrice);
  }

  setAmountPercentage = (percentage, orderType, limitPrice, side, balances, actions, orderBook) => {
    if (orderType !== ORDER_TYPES.MARKET && limitPrice === '') {
      return;
    }

    const precisions = this.props.exchangeMarketsData[this.props.currentPair].limits;
    const exchange = this.props.currentExchange;

    const amountStep = precisions.amount.min;
    const decimalPlaces = amountStep.toString().split('.')[1];
    const precisionLength = decimalPlaces ? decimalPlaces.length : 0;
    const fee = this.getFeePercentage(orderType, this.props.currentPair, this.props.exchangeMarketsData);

    if (side === ORDER_SIDE.BUY) {
      const rawTotal = percentage * balances.quoteBalance.free;
      const currentPrice = orderType === ORDER_TYPES.MARKET ? getBestOrderPrice(null, rawTotal, side, orderBook) : limitPrice;
      const rawAmount = (rawTotal) / (currentPrice * (1 + fee));

      // due to step size, we'll need to calculate raw, then go backwards for BUYs
      const amount = exchangeConfig.hasPrecision.supportedExchanges.has(exchange)
        ? parseFloat(((Math.floor(rawAmount / amountStep)) * amountStep).toFixed(precisionLength))
        : (Math.floor(rawAmount * (10 ** exchangeConfig.hasPrecision.defaultDecimalPrecision)) / (10 ** exchangeConfig.hasPrecision.defaultDecimalPrecision));

      const feeTotal = amount * currentPrice * fee;
      const total = (amount * currentPrice) + feeTotal;
      actions.updateOrderAmount(amount.toString());
      actions.updateOrderTotal(total);
      actions.updateOrderFeeTotal(parseFloat(feeTotal.toFixed(8)));
      return;
    }

    // SELL
    const rawTotal = percentage * balances.baseBalance.free;
    const amount = exchangeConfig.hasPrecision.supportedExchanges.has(exchange)
      ? parseFloat((Math.floor((rawTotal) / amountStep) * amountStep).toFixed(precisionLength))
      : (Math.floor(rawTotal * (10 ** exchangeConfig.hasPrecision.defaultDecimalPrecision)) / (10 ** exchangeConfig.hasPrecision.defaultDecimalPrecision));
    const currentPrice = orderType === ORDER_TYPES.MARKET ? getBestOrderPrice(amount, null, side, orderBook) : limitPrice;
    const feeTotal = amount * currentPrice * fee;
    const total = (amount * currentPrice) + feeTotal;

    actions.updateOrderAmount(amount.toString());
    actions.updateOrderTotal(total);
    actions.updateOrderFeeTotal(parseFloat(feeTotal.toFixed(8)));
  }

  getGetOrderTypes = (exchanges, currentExchange) => {
    if (exchanges[currentExchange]) {
      const { orderTypes } = exchanges[currentExchange].config;
      return orderTypes.map((orderType) => {
        return {
          name: orderType.toLowerCase(),
          label: `${orderType.charAt(0).toUpperCase()}${orderType.substr(1).toLowerCase()}`, // title case
          value: ORDER_TYPES[orderType.toUpperCase()],
        };
      });
    }
    return [
      { name: 'market', label: 'Market', value: ORDER_TYPES.MARKET },
      { name: 'limit', label: 'Limit', value: ORDER_TYPES.LIMIT },
      { name: 'stop', label: 'Stop', value: ORDER_TYPES.STOP },
    ];
  }

  balanceClicked = (percentage, orderType, limitPrice, side, balances, actions, orderBookStreamData) => {
    this.setOrderSide(side);
    this.setAmountPercentage(percentage, orderType, limitPrice, side, balances, actions, orderBookStreamData);
  }

  validateAmount = (amount, exchange) => {
    if (Object.keys(this.props.exchangeMarketsData).length) {
      const precisions = this.props.exchangeMarketsData[this.props.currentPair].limits;
      const amountNum = parseFloat(amount);
      const amountStep = precisions.amount.min;
      const minAmountRequired = precisions.amount.min;
      let isValid = amountNum >= minAmountRequired;
      let errorMessage = isValid ? '' : `Amount must be greater than or equal to ${minAmountRequired}`;

      if (isValid && exchangeConfig.hasPrecision.supportedExchanges.has(exchange)) {
        const pricePrecision = getPrecision(amountNum);
        const stepPrecision = getPrecision(parseFloat(amountStep));

        isValid = stepPrecision >= pricePrecision;
        errorMessage = isValid ? '' : `Amount must be an increment of ${sanitizeScientificNotation(parseFloat(amountStep))}`;
      }

      this.setState({
        amountValidError: errorMessage,
      });

      if (!this.state.balanceValid) {
        this.setState({
          balanceValidError: '',
        });
      }
      return isValid;
    }
    return true;
  }

  validatePrice = (price) => {
    if (this.props.orderType !== ORDER_TYPES.MARKET) {
      if (Object.keys(this.props.exchangeMarketsData).length) {
        const { precision: precisions, limits } = this.props.exchangeMarketsData[this.props.currentPair];

        const priceNum = parseFloat(price);
        const pricePrecision = getPrecision(priceNum);
        const stepPrecision = precisions.price;
        const isPrecisionValid = stepPrecision >= pricePrecision;

        const precisionErrorMessage = isPrecisionValid ? '' : 'Price is too precise';

        if (!isPrecisionValid || !Object.keys(limits.price).length) {
          this.setState({
            priceValidError: precisionErrorMessage,
          });
          return isPrecisionValid;
        }

        const { min, max } = limits.price;
        const priceMinValid = priceNum >= min;
        const priceMinErrorMessage = priceMinValid ? '' : `Price must be greater than or equal to ${min.toFixed(8)}`;

        // not all exchanges have price maxes
        if (!priceMinValid || !max) {
          this.setState({
            priceValidError: priceMinErrorMessage,
          });
          return priceMinValid;
        }

        const priceMaxValid = priceNum <= max;
        const priceMaxErrorMessage = priceMaxValid ? '' : `Price must be less than or equal to ${max.toFixed(8)}`;

        this.setState({
          priceValidError: priceMaxErrorMessage,
        });
        return priceMaxValid;
      }
    }
    return true;
  }

  validateStopPrice = (stopPrice) => {
    if (this.props.orderType === ORDER_TYPES.STOP) {
      if (Object.keys(this.props.exchangeMarketsData).length) {
        const precisions = this.props.exchangeMarketsData[this.props.currentPair].precision;

        const priceNum = parseFloat(stopPrice);
        const pricePrecision = getPrecision(priceNum);
        const stepPrecision = precisions.price;
        const isValid = stepPrecision >= pricePrecision;
        const errorMessage = isValid ? '' : 'Stop price is too precise';

        this.setState({
          stopPriceValidError: errorMessage,
        });
        return isValid;
      }
    }
    return true;
  }

  validateTotal = () => {
    const {
      orderAmount, exchangeMarketsData, orderSide, orderBookStreamData
    } = this.props;
    if (Object.keys(exchangeMarketsData).length) {
      const precisions = this.props.exchangeMarketsData[this.props.currentPair].limits;
      const totalMin = precisions.cost && precisions.cost.min ? precisions.cost.min : 0;

      if (this.props.orderType === ORDER_TYPES.MARKET) {
        const amountNum = parseFloat(orderAmount);
        const currentTickerPrice = getBestOrderPrice(orderAmount, null, orderSide, orderBookStreamData);
        const total = amountNum * currentTickerPrice;
        const isValid = total >= totalMin;
        const errorMessage = isValid ? '' : `Total must be greater than or equal to ${totalMin}`;
        this.setState({
          totalValidError: errorMessage,
        });
        return isValid;
      }
      const { orderPrice } = this.props;
      const priceNum = parseFloat(orderPrice);
      const amountNum = parseFloat(orderAmount);
      const total = amountNum * priceNum;
      const isValid = total >= totalMin;
      const errorMessage = isValid ? '' : `Total must be greater than or equal to ${totalMin}`;
      this.setState({
        totalValidError: errorMessage,
      });
      return isValid;
    }
    return true;
  }

  validateBalance = () => {
    const {
      orderSide, orderAmount, balances, orderTotal, orderType, orderBookStreamData, actions
    } = this.props;
    if (Object.keys(balances).length) {
      if (orderSide === ORDER_SIDE.BUY) {
        let isValid = parseFloat(balances.quoteBalance.free) >= orderTotal;
        // check amount is still good to buy cause price can shift
        if (orderType === ORDER_TYPES.MARKET) {
          const price = getBestOrderPrice(orderAmount, null, orderSide, orderBookStreamData);
          const total = parseFloat(orderAmount) * price;
          isValid = parseFloat(balances.quoteBalance.free) >= total;

          if (!isValid) {
            actions.updateOrderTotal(total);
          }
        }

        this.setState({
          balanceValidError: isValid ? '' : 'Insufficient funds'
        });
        return isValid;
      }
      // SELL
      const isValid = parseFloat(balances.baseBalance.free) >= orderAmount;
      this.setState({
        balanceValidError: isValid ? '' : 'Insufficient funds'
      });
      return isValid;
    }
    return true;
  }

  clearForm = () => {
    const { actions } = this.props;
    actions.updateOrderAmount('');
    actions.updateOrderPrice('');
    actions.updateStopPrice('');
    actions.updateOrderTotal(0);
    actions.updateOrderFeeTotal(0);
  };

  submitOrder = (event) => {
    event.preventDefault();

    const {
      isWithinFeatureLimit, showPaywallModal, orderAmount, orderPrice, orderStopPrice, currentExchange, tradeUsage
    } = this.props;

    if (!isWithinFeatureLimit('TRADE', tradeUsage)) {
      this.clearForm();
      showPaywallModal('You have reached your monthly trade limit');
      return;
    }

    const amountValid = this.validateAmount(orderAmount, currentExchange);
    const priceValid = this.validatePrice(orderPrice);
    const stopPriceValid = this.validateStopPrice(orderStopPrice);
    const totalValid = this.validateTotal();
    const balanceIsValid = this.validateBalance();

    if (amountValid
      && priceValid
      && stopPriceValid
      && orderAmount
      && totalValid
      && balanceIsValid) {
      this.props.actions.submitOrder();
    }
  }

  renderPairBalance = () => {
    const {
      classes,
      className: classNameProp,
      currentExchange,
      isLoading,
      tradeSelectBalance,
      precisions,
      prefCurrency,
      orderType,
      orderPrice,
      balances,
      actions,
      orderBookStreamData,
    } = this.props;
    const isLoaded =
      orderBookStreamData &&
      Object.keys(tradeSelectBalance).length &&
      Object.keys(precisions).length &&
      currentExchange &&
      !isLoading;

    if (!isLoaded) {
      return (
        <Grid container alignItems="center" justify="center" className={classes.balanceContainer}>
          <PulseLoader size={6} color="#52B0B0" loading />
        </Grid>
      );
    }

    return (
      <div>
        <Typography className={classes.heading} variant="caption" color="textSecondary">
          Balances
          <TooltipIcon className={classes.tooltipIcon} title="Available (free) balances for currently selected pair & account" />
        </Typography>
        <Paper className={classNames({ [classes.paper]: true }, classNameProp)} elevation={0}>
          <div
            className={classes.balanceRow}
            onClick={
              () => this.balanceClicked(1, orderType, orderPrice, ORDER_SIDE.SELL, balances, actions, orderBookStreamData)
            }
            role="button">
            <div className={classes.label}>
              <Typography variant="caption" color="textSecondary">{ellipsize(tradeSelectBalance.baseBalance.asset, this.ELLIPSE_LENGTH)}</Typography>
            </div>
            <div className={classes.value}>
              <Typography className={classes.primaryText} name="baseAmount">
                <Formatted asset={tradeSelectBalance.baseBalance.asset} amount={tradeSelectBalance.baseBalance.free} />
              </Typography>
              {!isMarketPrefCurrency(tradeSelectBalance.baseBalance.asset, prefCurrency) &&
              <Typography variant="caption" color="textSecondary" name="baseValue">
                <Formatted
                  asset={tradeSelectBalance.baseBalance.asset}
                  amount={tradeSelectBalance.baseBalance.free}
                  exchange={currentExchange}
                  convertToPref />
              </Typography>
              }
            </div>
          </div>
          <div
            className={classes.balanceRow}
            onClick={
              () => this.balanceClicked(1, orderType, orderPrice, ORDER_SIDE.BUY, balances, actions, orderBookStreamData)
            }
            role="button">
            <div className={classes.label}>
              <Typography variant="caption" color="textSecondary">{ellipsize(tradeSelectBalance.quoteBalance.asset, this.ELLIPSE_LENGTH)}</Typography>
            </div>
            <div className={classes.value}>
              <Typography className={classes.primaryText} name="quoteAmount">
                <Formatted asset={tradeSelectBalance.quoteBalance.asset} amount={tradeSelectBalance.quoteBalance.free} />
              </Typography>
              {!isMarketPrefCurrency(tradeSelectBalance.quoteBalance.asset, prefCurrency) &&
              <Typography variant="caption" color="textSecondary" name="quoteValue">
                <Formatted
                  asset={tradeSelectBalance.quoteBalance.asset}
                  amount={tradeSelectBalance.quoteBalance.free}
                  exchange={currentExchange}
                  convertToPref />
              </Typography>
              }
            </div>
          </div>
        </Paper>
      </div>
    );
  }

  renderOrderForm = () => {
    const {
      classes,
      theme,
      user,
      currentExchange,
      exchangeMarketsData,
      currentPair,
      exchanges,
      requestPending,
      orderType,
      orderSide,
      orderAmount,
      feeTotal,
      orderTotal,
      orderPrice,
      orderStopPrice,
      balances,
      actions,
      orderBookStreamData,
    } = this.props;
    const {
      amountValidError,
      priceValidError,
      stopPriceValidError,
      totalValidError,
      balanceValidError,
    } = this.state;

    const isLoaded = currentPair && Object.keys(exchangeMarketsData).length && orderBookStreamData;

    const validationError = amountValidError || priceValidError || stopPriceValidError || totalValidError || balanceValidError;

    if (!isLoaded) {
      return (
        <Grid container alignItems="center" justify="center" className={classes.progressContainer}>
          <PulseLoader color="#52B0B0" size={6} loading />
        </Grid>
      );
    }

    const { pref_currency: prefCurrency } = user.preferences;
    const baseAndQuote = currentPair.split('/');
    const base = baseAndQuote[0];
    const quote = baseAndQuote[1];
    const exchangeLabel = exchanges[currentExchange].exchange_label;

    return (
      <div>
        <div className={classes.btnGroupWrapper}>
          <BtnGroup
            selectedValue={orderType}
            onChange={this.setOrderType}
            className={classes.btnGroup}
            buttons={ this.getGetOrderTypes(exchanges, currentExchange) } />
        </div>
        <BtnToggle
          selectedValue={orderSide}
          onChange={this.setOrderSide}
          className={classes.btnToggle}
          buttonOne={{
            label: ORDER_SIDE.BUY,
            value: ORDER_SIDE.BUY,
            activeColor: theme.palette.buttons.green
          }}
          buttonTwo={{
            label: ORDER_SIDE.SELL,
            value: ORDER_SIDE.SELL,
            activeColor: theme.palette.buttons.red
          }} />
        <form onSubmit={ this.submitOrder }>
          <Typography className={classes.inputLabel} variant="caption" color="textSecondary">Amount</Typography>
          <Input
            name="amount"
            type="number"
            inputProps={{ step: 'any' }}
            value={orderAmount}
            onChange={this.setAmount}
            endAdornment={<InputAdornment position="end">{ellipsize(base, this.ELLIPSE_LENGTH)}</InputAdornment>}
            className={amountValidError ? classes.inputInvalid : classes.input}
            disableUnderline />
          <Grid
            container
            justify="space-between"
            className={(orderType === ORDER_TYPES.LIMIT || orderType === ORDER_TYPES.STOP) ? classes.limitPresets : classes.presets}>
            <ButtonBase
              tabIndex="-1"
              className={classNames({ [classes.presetBtn]: true, [classes.presetBtnFirst]: true })}
              onClick={() => { this.setAmountPercentage(0.25, orderType, orderPrice, orderSide, balances, actions, orderBookStreamData); }}>
              25%
            </ButtonBase>
            <ButtonBase
              tabIndex="-1"
              className={classes.presetBtn}
              onClick={() => { this.setAmountPercentage(0.50, orderType, orderPrice, orderSide, balances, actions, orderBookStreamData); }}>
              50%
            </ButtonBase>
            <ButtonBase
              tabIndex="-1"
              className={classes.presetBtn}
              onClick={() => { this.setAmountPercentage(0.75, orderType, orderPrice, orderSide, balances, actions, orderBookStreamData); }}>
              75%
            </ButtonBase>
            <ButtonBase
              tabIndex="-1"
              className={classNames({ [classes.presetBtn]: true, [classes.presetBtnLast]: true })}
              onClick={() => { this.setAmountPercentage(1, orderType, orderPrice, orderSide, balances, actions, orderBookStreamData); }}>
              100%
            </ButtonBase>
          </Grid>
          { (orderType === ORDER_TYPES.STOP) &&
          <div>
            <Typography className={classes.inputLabel} variant="caption" color="textSecondary">Stop Price</Typography>
            <Input
              name="stopPrice"
              type="number"
              inputProps={{ step: 'any' }}
              value={orderStopPrice}
              onChange={this.setStopPrice}
              endAdornment={<InputAdornment position="end">{ellipsize(quote, this.ELLIPSE_LENGTH)}</InputAdornment>}
              className={stopPriceValidError ? classes.inputInvalid : classes.input }
              disableUnderline />
          </div>
          }
          {(orderType === ORDER_TYPES.LIMIT || orderType === ORDER_TYPES.STOP) &&
          <div>
            <Typography
              className={classes.inputLabel}
              variant="caption"
              color="textSecondary">
              {orderType === ORDER_TYPES.STOP ? 'Limit Price' : 'Price'}
            </Typography>
            <Input
              style={{ marginBottom: '1.071rem' }}
              name="price"
              type="number"
              inputProps={{ step: 'any' }}
              value={orderPrice}
              onChange={this.setPrice}
              endAdornment={<InputAdornment position="end">{ellipsize(quote, this.ELLIPSE_LENGTH)}</InputAdornment>}
              className={priceValidError ? classes.inputInvalid : classes.input }
              disableUnderline />
          </div>
          }
          <div className={classes.fee}>
            <div className={classes.label}>
              <Typography variant="caption" color="textSecondary">{`${exchangeLabel} Fee`}</Typography>
            </div>
            <div className={classes.value}>
              <Typography className={classes.secondaryText}>
                {orderType === ORDER_TYPES.MARKET ? '≈ ' : ''}{formatAmount(quote, feeTotal) } {ellipsize(quote, this.ELLIPSE_LENGTH)}
              </Typography>
            </div>
          </div>
          <div className={classes.total}>
            <div className={classes.label}>
              <Typography variant="caption" color="textSecondary">Total</Typography>
            </div>
            <div className={classes.value}>
              <Typography className={classes.primaryText}>
                {orderType === ORDER_TYPES.MARKET ? '≈ ' : ''}{formatAmount(quote, orderTotal)} {ellipsize(quote, this.ELLIPSE_LENGTH)}
              </Typography>
              {!isMarketPrefCurrency(quote, prefCurrency) &&
              <Typography variant="caption" color="textSecondary">
                <Formatted asset={quote} amount={orderTotal} convertToPref exchange={currentExchange} />
              </Typography>
              }
            </div>
          </div>
          <ButtonBase
            name="sendOrder"
            className={ `${classes.submit} ${
              requestPending ? classes.disabled : ( /* eslint-disable-line */
                orderSide === ORDER_SIDE.BUY ?
                  classes.green :
                  classes.red
              )}`
            }
            type="submit"
            disabled={requestPending}>
            { requestPending ?
              <PulseLoader color="#FFF" size={6} loading /> :
              `SEND ${orderSide} ORDER` }
          </ButtonBase>
        </form>
        {validationError &&
        <Grid container alignItems="center" justify="center" className={classes.orderFormError}>
          <p name="orderFormError" className={classes.orderFormErrorMessage}>{validationError}</p>
        </Grid>
        }
      </div>
    );
  }

  render() {
    return (
      <div>
        {this.renderPairBalance()}
        {this.renderOrderForm()}
      </div>
    );
  }
}

OrderForm.defaultProps = {
  actions: {},
  currentPair: '',
  currentExchange: '',
  balances: {},
  orderAmount: '',
  feeTotal: 0,
  orderTotal: 0,
  orderPrice: '',
  orderStopPrice: '',
  orderType: ORDER_TYPES.MARKET,
  orderSide: ORDER_SIDE.BUY,
  exchangeMarketsData: {},
  exchanges: {},
  tradeSelectBalance: {},
  className: null,
  precisions: {},
  orderBookStreamData: null,
};

OrderForm.propTypes = {
  className: PropTypes.string,
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  actions: PropTypes.objectOf(PropTypes.func),
  user: PropTypes.object.isRequired,
  currentPair: PropTypes.string,
  currentExchange: PropTypes.string,
  balances: PropTypes.object,
  orderAmount: PropTypes.string,
  feeTotal: PropTypes.number,
  orderTotal: PropTypes.number,
  orderPrice: PropTypes.string,
  orderStopPrice: PropTypes.string,
  orderType: PropTypes.number,
  orderSide: PropTypes.string,
  exchangeMarketsData: PropTypes.object,
  requestPending: PropTypes.bool.isRequired,
  exchanges: PropTypes.object,
  precisions: PropTypes.object,
  tradeSelectBalance: PropTypes.object,
  isLoading: PropTypes.bool.isRequired,
  prefCurrency: PropTypes.string.isRequired,
  orderBookStreamData: PropTypes.object,
  isWithinFeatureLimit: PropTypes.func.isRequired,
  showPaywallModal: PropTypes.func.isRequired,
  tradeUsage: PropTypes.number.isRequired
};

function mapStateToProps(state) {
  return {
    user: state.global.user.user,
    currentPair: state.trade.interactions.currentPair,
    currentExchange: state.trade.interactions.currentExchange,
    balances: state.trade.pairBalances.balance,
    orderAmount: state.trade.orderForm.orderAmount,
    feeTotal: state.trade.orderForm.feeTotal,
    orderTotal: state.trade.orderForm.orderTotal,
    orderPrice: state.trade.orderForm.orderPrice,
    orderStopPrice: state.trade.orderForm.orderStopPrice,
    orderType: state.trade.orderForm.orderType,
    orderSide: state.trade.orderForm.orderSide,
    exchangeMarketsData: state.trade.markets.exchangeMarketsData,
    requestPending: state.trade.orderForm.requestPending,
    exchanges: state.global.exchanges.exchanges,
    prefCurrency: state.global.user.user.preferences.pref_currency,
    orderBookStreamData: state.trade.orderBook.orderBookStreamData,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      ...bindActionCreators({
        updateOrderPrice,
        updateOrderFeeTotal,
        updateOrderTotal,
        updateStopPrice,
        updateOrderSide,
        updateOrderType,
        updateOrderAmount,
        submitOrder,
        clearOrderForm,
      }, dispatch)
    }
  };
}

const base = withTheme()(withStyles(styles)(withPaywall('TRADE')(OrderForm)));
export default connect(mapStateToProps, mapDispatchToProps)(base);



// WEBPACK FOOTER //
// ./src/components/trade/orderForm.js