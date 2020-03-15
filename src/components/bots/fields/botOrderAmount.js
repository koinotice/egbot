import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import BotNumField from './botNumField';
import { getPrices } from '../../../api/public/prices';
import logger from '../../../utils/logger';
import getPrecision, { sanitizeScientificNotation } from '../../../utils/numbers';
import exchangeConfig from '../../../config/exchangeConfig';


class BotOrderAmount extends Component {
  constructor(props) {
    super(props);

    this.currentPrice = null;
    this.fetchPriceInterval = null;
  }

  componentDidMount() {
    const { value } = this.props;
    this.validate(value);
  }

  componentDidUpdate(prevProps) {
    if (this.props.exchange !== prevProps.exchange || this.props.account !== prevProps.account || this.props.pair !== prevProps.pair) {
      this.clearCurrentPriceInterval();
      this.validate(this.props.value);
    } else if (this.props.direction !== prevProps.direction) {
      this.validate(this.props.value);
    }
  }

  componentWillUnmount() {
    this.clearCurrentPriceInterval();
  }

  getCurrentPrice = async () => {
    const { exchange, pair } = this.props;

    if (!exchange || !pair) {
      return;
    }

    if (!this.currentPrice) {
      try {
        const price = await getPrices(exchange, pair);
        this.currentPrice = price[pair][exchange.toUpperCase()].price;
        this.startPriceFetchInterval();
      } catch (error) {
        logger.error(`error fetching current price ${error}`);
      }
    }
    return this.currentPrice;
  }

  fetchPairBalances = () => {
    const { balances, account, pair } = this.props;
    const [base, quote] = pair.split('/');
    const balancesForAccount = balances.filter(bal => bal.accountId === account);
    const baseBalanceObj = balancesForAccount.find(bal => bal.asset === base);
    const quoteBalanceObj = balancesForAccount.find(bal => bal.asset === quote);

    const baseBalance = baseBalanceObj ? baseBalanceObj.free : null;
    const quoteBalance = quoteBalanceObj ? quoteBalanceObj.free : null;

    return {
      baseBalance,
      quoteBalance
    };
  }

  clearCurrentPriceInterval() {
    this.currentPrice = null;
    if (this.fetchPriceInterval) {
      clearInterval(this.fetchPriceInterval);
    }
  }

  startPriceFetchInterval = () => {
    this.fetchPriceInterval = setInterval(async () => {
      const { exchange, pair } = this.props;
      const price = await getPrices(exchange, pair);
      this.currentPrice = price[pair][exchange.toUpperCase()].price;
    }, 60000);
  }

  updateValue = (value) => {
    const { onChange } = this.props;
    this.validate(value);
    onChange(value);
  }

  checkOrderSizeError = async (value) => {
    const { markets, exchange, pair } = this.props;

    if (exchange && pair) {
      if (markets[exchange.toUpperCase()] && markets[exchange.toUpperCase()][pair.toUpperCase()]) {
        const precisions = markets[exchange.toUpperCase()][pair.toUpperCase()].limits;
        const minOrderSize = precisions.cost.min;
        const maxOrderSize = precisions.cost.max;
        const currentPrice = await this.getCurrentPrice();

        const cost = currentPrice * parseFloat(value);
        if (minOrderSize !== null && cost < minOrderSize) {
          return `Minimum order size for ${exchange.toUpperCase()} is ${minOrderSize} ${pair.split('/')[1]}`;
        } else if (maxOrderSize !== null && cost > maxOrderSize) {
          return `Maximum order size for ${exchange.toUpperCase()} is ${maxOrderSize} ${pair.split('/')[1]}`;
        }
      }
    }
    return '';
  }

  checkOrderAmountError = (value) => {
    const { markets, exchange, pair } = this.props;
    if (exchange && pair) {
      if (markets[exchange.toUpperCase()] && markets[exchange.toUpperCase()][pair.toUpperCase()]) {
        const precisions = markets[exchange.toUpperCase()][pair.toUpperCase()].limits;
        const minOrderAmount = precisions.amount.min;
        const maxOrderAmount = precisions.amount.max;
        const amountStep = precisions.amount.min;

        const amountNum = parseFloat(value);

        // check amount min/max
        if (minOrderAmount !== null && (amountNum < minOrderAmount)) {
          return `Minimum order amount for ${exchange.toUpperCase()} is ${minOrderAmount} ${pair.split('/')[0]}`;
        } else if (maxOrderAmount !== null && amountNum > maxOrderAmount) {
          return `Maximum order amount for ${exchange.toUpperCase()} is ${maxOrderAmount} ${pair.split('/')[0]}`;
        }

        // check amount step
        if (amountStep !== null && exchangeConfig.hasPrecision.supportedExchanges.has(exchange.toUpperCase())) {
          const amountPrecision = getPrecision(amountNum);
          const stepPrecision = getPrecision(parseFloat(amountStep));

          if (stepPrecision < amountPrecision) {
            return `Amount must be an increment of ${sanitizeScientificNotation(amountStep)}`;
          }
        }
      }
    }
    return '';
  }

  checkSufficientBalanceError = async (value) => {
    const {
      exchange, balances, account, pair
    } = this.props;
    if (exchange && balances && account && pair) {
      const pairBalances = this.fetchPairBalances();
      const currentPrice = await this.getCurrentPrice();

      const { baseBalance, quoteBalance } = pairBalances;
      const [base, quote] = pair.split('/');
      const { direction } = this.props;

      if (!direction || (direction && direction === 'LONG')) {
        const cost = value * currentPrice;
        if (cost > quoteBalance) {
          return `Insufficient ${quote} to place buy order (${quoteBalance || 0} < ${cost})`;
        }
      }
      if (!direction || (direction && direction === 'SHORT')) {
        if (value > baseBalance) {
          return `Insufficient ${base} to place sell order (${baseBalance || 0} < ${value})`;
        }
      }
    }
    return '';
  }

  validate = async (value) => {
    const { validation, setError } = this.props;

    if (!validation) {
      return;
    }

    if (validation.isRequired && !value) {
      setError('Field is required');
      return;
    }

    if (validation.validateOrderSize) {
      const error = await this.checkOrderSizeError(value);
      if (error) {
        setError(error);
        return;
      }
    }

    if (validation.validateOrderAmount) {
      const error = this.checkOrderAmountError(value);
      if (error) {
        setError(error);
        return;
      }
    }

    if (validation.validateBalance) {
      const error = await this.checkSufficientBalanceError(value);
      if (error) {
        setError(error);
        return;
      }
    }

    setError('');
  }

  render() {
    const {
      name, value, setError, disabled
    } = this.props;

    return (
      <BotNumField
        name={name}
        value={value}
        onChange={this.updateValue}
        setError={setError}
        disabled={disabled} />
    );
  }
}

BotOrderAmount.defaultProps = {
  value: '',
  name: '',
  validation: {},
  exchange: '',
  account: '',
  pair: '',
  balances: [],
  direction: ''
};

BotOrderAmount.propTypes = {
  name: PropTypes.string,
  value: PropTypes.string,
  validation: PropTypes.object,
  exchange: PropTypes.string,
  account: PropTypes.string,
  pair: PropTypes.string,
  balances: PropTypes.array,
  direction: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  setError: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired,
  markets: PropTypes.object.isRequired
};

function mapStateToProps(state) {
  return {
    markets: state.global.markets.markets,
    balances: state.global.balances.balances
  };
}

export default connect(mapStateToProps, null)(BotOrderAmount);



// WEBPACK FOOTER //
// ./src/components/bots/fields/botOrderAmount.js