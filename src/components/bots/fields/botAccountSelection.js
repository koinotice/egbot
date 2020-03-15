import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';
import { formatAmount } from '../../../utils/helpers';
import Formatted from '../../common/formatted';


const styles = theme => ({
  balancesLabel: {
    marginTop: '2.2857rem'
  },
  container: {
    marginTop: '0.5714rem',
    padding: '1.0714rem',
    borderRadius: '0.3571rem',
    backgroundColor: theme.palette.background.paperDarker,
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.5714rem 0'
  },
  col: {
    display: 'flex',
    flexFlow: 'column',
    textAlign: 'right'
  },
  noExchangeText: {
    marginTop: '1.8571rem',
    color: '#7F8FA4',
  }
});

class BotAccountSelection extends Component {
  componentDidMount() {
    const { value } = this.props;
    this.validate(value);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.exchange !== this.props.exchange) {
      this.updateValue('');
    }
  }

  getBalances(assetsArray) {
    const { balances, value: account } = this.props;
    const assetsSet = new Set(assetsArray);

    const balancesForAssets = [];
    balances.forEach((bal) => {
      if (assetsSet.has(bal.asset) && parseFloat(bal.accountId) === parseFloat(account)) {
        balancesForAssets.push(bal);
        assetsSet.delete(bal.asset);
      }
    });

    assetsSet.forEach((asset) => {
      balancesForAssets.push({
        asset,
        free: 0,
        total: 0
      });
    });

    return balancesForAssets;
  }

  validate = (value) => {
    const { validation, setError } = this.props;

    if (!validation) {
      return;
    }

    if (validation.isRequired && (!value || value === '')) {
      setError('Field is required');
      return;
    }
    setError('');
  }

  updateValue(value) {
    const { onChange } = this.props;
    this.validate(value);
    onChange(value);
  }

  // Have to do this because this component depends on exchange and pair
  // because this component is essentially 2 components mashed into one.
  // We want to disable if bot is running, or if exchange is missing
  // but not if pair is missing, because pair is only needed for balances.
  shouldDisable() {
    const { disabled, exchange, pair } = this.props;
    if (disabled) {
      if (exchange && pair) {
        return true;
      }
      if (!exchange) {
        return true;
      }
    }
    return false;
  }

  renderAccountDropDown() {
    const {
      accounts, exchange, value
    } = this.props;
    const accountsForExchange = accounts.filter(acc => acc.type === 'EXCHANGE' && acc.name.toLowerCase() === exchange);

    if (!accountsForExchange.length) {
      return (
        <Button component="a" href="/a/onboarding/select-exchange" color="primary" variant="contained">Connect An Account</Button>
      );
    }

    return (
      <Select
        value={value}
        onChange={e => this.updateValue(e.target.value)}
        inputProps={{ disabled: this.shouldDisable() }}
        disabled={this.shouldDisable()}>
        {accountsForExchange.map(acc => <MenuItem key={acc.id} value={acc.id}>{acc.label}</MenuItem>)}
      </Select>
    );
  }

  renderBalances() {
    const {
      classes, pair, value: account
    } = this.props;

    if (!account || !pair) {
      return null;
    }

    const assetsArray = pair.includes(',') ? pair.split(',') : pair.split('/');
    const balancesForAssets = this.getBalances(assetsArray);

    return (
      <Fragment>
        <div className={classes.balancesLabel}>
          <Typography color="textSecondary">Balances (Free / Total)</Typography>
        </div>
        <div className={classes.container}>
          {balancesForAssets.map(balance => (
            <div className={classes.row} key={balance.asset}>
              <div className={classes.col}>
                <Typography color="textSecondary">{balance.asset}</Typography>
              </div>
              <div className={classes.col}>
                <Typography>
                  {formatAmount(balance.asset, balance.free)} / {formatAmount(balance.asset, balance.total)}
                </Typography>
                <Typography color="textSecondary">
                  <Formatted asset={balance.asset} amount={balance.free} convertToPref /> / <Formatted asset={balance.asset} amount={balance.total} convertToPref />
                </Typography>
              </div>
            </div>
          ))}
        </div>
      </Fragment>
    );
  }

  render() {
    const { exchange, classes } = this.props;
    if (!exchange) {
      return <Typography color="secondary" className={classes.noExchangeText}>Select an exchange to see your accounts</Typography>;
    }
    return (
      <Fragment>
        {this.renderAccountDropDown()}
        {this.renderBalances()}
      </Fragment>
    );
  }
}

BotAccountSelection.defaultProps = {
  accounts: [],
  exchange: '',
  value: '',
  pair: ''
};

BotAccountSelection.propTypes = {
  classes: PropTypes.object.isRequired,
  accounts: PropTypes.array,
  balances: PropTypes.array.isRequired,
  exchange: PropTypes.string,
  pair: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired,
  validation: PropTypes.object.isRequired,
  setError: PropTypes.func.isRequired
};

function mapStateToProps(state) {
  return {
    accounts: state.global.accounts.accounts,
    balances: state.global.balances.balances,
    prefCurrency: state.global.user.user.preferences.pref_currency
  };
}

export default connect(mapStateToProps, null)(withStyles(styles)(BotAccountSelection));



// WEBPACK FOOTER //
// ./src/components/bots/fields/botAccountSelection.js