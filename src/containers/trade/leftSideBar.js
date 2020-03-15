import React, { Component, Fragment } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Typography from '@material-ui/core/Typography';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { updateExchange, updateAccount } from '../../store/ducks/trade/interactions';
import { ACCOUNT_TYPES } from '../../utils/types';

const styles = theme => ({
  row: {
    width: '100%',
    marginBottom: '1.143rem',
  },
  label: {
    fontSize: '0.8571428571428571rem',
    lineHeight: '1.071rem',
    paddingBottom: '0.3571rem'
  },
  select: {
    width: '100%',
    backgroundColor: theme.palette.background.paperLighter,
    fontSize: '1rem',
    borderRadius: '0.2857rem',
  },
  input: {
    paddingLeft: '1.071rem',
    // fix focus in firefox
    '&:focus': {
      color: `${theme.palette.text.primary} !important`,
      backgroundColor: `${theme.palette.background.paperLighter} !important`,
    }
  },
  drag: {
    paddingTop: '10px',
    marginTop: '-10px'
  }
});

class LeftSideBar extends Component {
  setAccount = (event) => {
    if (this.props.currentAccountId !== event.target.value && event.target.value !== 'noAccounts') {
      this.props.actions.updateAccount(event.target.value);
    }
  };

  setExchange = (event) => {
    if (this.props.currentExchange !== event.target.value) {
      this.props.actions.updateExchange(event.target.value);
    }
  };

  getExchangeMenuItems = (exchanges) => {
    if (!exchanges) {
      return null;
    }
    return Object.keys(exchanges).map((exchangeName) => {
      return (
        <MenuItem
          inputprops={{ name: exchangeName }}
          key={exchangeName}
          value={exchangeName}>
          {exchanges[exchangeName].exchange_label}
        </MenuItem>
      );
    });
  };

  getAccountMenuItems = (accounts) => {
    if (!accounts || accounts.error) {
      return null;
    }

    const exchangeAccounts = accounts.filter(accountObj => accountObj.type.toUpperCase() === ACCOUNT_TYPES.EXCHANGE);

    if (exchangeAccounts.length) {
      const userAccounts = exchangeAccounts
        .map((accountObj) => {
          const displayLabel = (accountObj.label === accountObj.exchange_label) ?
            accountObj.label :
            `${accountObj.label} @${accountObj.exchange_label}`;
          return <MenuItem key={accountObj.id} value={accountObj.id}>{displayLabel}</MenuItem>;
        });
      if (this.props.currentAccountId === '') {
        userAccounts.unshift(<MenuItem key="noAccounts" value="noAccounts">Select Account</MenuItem>);
      }
      return userAccounts;
    }
    return ([<MenuItem key="noAccounts" value="noAccounts">Select Account</MenuItem>]);
  };

  render() {
    const {
      classes, currentExchange, exchanges, accounts, currentAccountId
    } = this.props;

    return (
      <Fragment>
        <div className={`${classes.drag} dragHandle`}>
          <Typography name="exchangeLabel" className={classes.label} color="textSecondary">Exchange</Typography>
        </div>
        <div className={classes.row}>
          <Select
            name="exchangeMenu"
            value={currentExchange}
            onChange={this.setExchange}
            inputProps={{ className: classes.input }}
            className={classes.select}
            disableUnderline>
            {this.getExchangeMenuItems(exchanges)}
          </Select>
        </div>
        {accounts.length > 0 &&
          <div className={classes.row}>
            <Typography name="accountLabel" className={classes.label} color="textSecondary">Account</Typography>
            <Select
              name="accountMenu"
              value={currentAccountId || 'noAccounts'}
              onChange={this.setAccount}
              inputProps={{ name: 'account', className: classes.input }}
              className={classes.select}
              disableUnderline>
              {this.getAccountMenuItems(accounts)}
            </Select>
          </div>
        }
      </Fragment>
    );
  }
}

LeftSideBar.defaultProps = {
  actions: {},
  exchanges: {},
  accounts: [],
  currentExchange: '',
  currentAccountId: '',
};

LeftSideBar.propTypes = {
  actions: PropTypes.objectOf(PropTypes.func),
  classes: PropTypes.object.isRequired,
  currentExchange: PropTypes.string,
  exchanges: PropTypes.object,
  accounts: PropTypes.array,
  currentAccountId: PropTypes.string,
};

function mapStateToProps(state) {
  return {
    currentExchange: state.trade.interactions.currentExchange,
    currentAccountId: state.trade.interactions.currentAccountId,
    accounts: state.global.accounts.accounts,
    exchanges: state.global.exchanges.exchanges
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: { ...bindActionCreators({ updateExchange, updateAccount }, dispatch) }
  };
}

const base = (withStyles(styles)(LeftSideBar));
const tradeSelect = connect(mapStateToProps, mapDispatchToProps)(base);


export default tradeSelect;



// WEBPACK FOOTER //
// ./src/containers/trade/leftSideBar.js