import React, { Component, Fragment } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import PropTypes from 'prop-types';
import BotTermsAgreement from './botTermsAgreement';
import EmptyStateCover from '../../common/emptyStateCover';
import { sentenceCase } from '../../../utils/strings';


const styles = theme => ({
  form: {
    marginTop: '2.286rem',
    textAlign: 'left',
  },
  group: {
    marginTop: '1.429rem',
  },
  input: {
    marginTop: '0.2857rem',
    paddingLeft: '1.071rem',
    // fix focus in firefox
    '&:focus': {
      color: `${theme.palette.text.primary} !important`,
      backgroundColor: `${theme.palette.background.paperLighter} !important`,
    }
  },
  label: {
    paddingLeft: '1.071rem',
  },
  buttonArea: {
    textAlign: 'right',
    marginTop: '3.571rem',
  },
  balanceError: {
    paddingLeft: '1.071rem',
    paddingTop: '1rem',
    color: theme.palette.buttons.red,
  },
  notEnabledImage: {
    width: '100px',
    height: '100px',
    marginBottom: '15px',
  },
  notEnabledText: {
    color: theme.palette.secondary.main,
    fontSize: '1.143rem',
  },
  sourceLink: {
    textDecoration: 'none',
    color: theme.palette.primary.main,
  },
});

class LiveSettingsSingleAccountForm extends Component {
  setAccount = (event) => {
    const selectedAccount = event.target.value;
    if (!selectedAccount) {
      return;
    }

    const { setSelectedAccounts } = this.props;
    const selectedAccounts = selectedAccount !== 'noAccounts' ? [selectedAccount] : [];
    setSelectedAccounts(selectedAccounts);
  };

  getAccountMenuItems = (accountsForExchange) => {
    const accountItems = accountsForExchange.map((account) => {
      return (
        <MenuItem key={account.id} value={account.id}>{account.label}</MenuItem>
      );
    });
    accountItems.unshift(<MenuItem key="noAccounts" value="noAccounts">Select Account</MenuItem>);
    return accountItems;
  };

  checkSufficientBalance(selectedAccount, capitalBase, pair, holdingsByAccount) {
    if (selectedAccount) {
      const balanceForAccount = holdingsByAccount.find(account => account.id === selectedAccount);
      if (balanceForAccount) {
        const { assets, exchangeLabel } = balanceForAccount;
        const [, quote] = pair.split('/');
        const asset = assets.find(ass => ass.name === quote.toUpperCase());
        const balanceForQuote = asset ? asset.freeTotal : 0;
        if (balanceForQuote < parseFloat(capitalBase)) {
          return `Total ${quote.toUpperCase()} amount on ${exchangeLabel} is lower than the starting capital: ${balanceForQuote} < ${capitalBase}.`;
        }
      }
    }
    return '';
  }

  filterAccountsForExchange(accounts, exchange) {
    return accounts
      .filter(account => account.type === 'EXCHANGE' && !!exchange && account.name === exchange.toUpperCase());
  }

  render() {
    const {
      classes, accounts, selectedAccounts, currentBotConfig, holdingsByAccount, onSubmit, botTermsAgreed, botTerms, updateBotTermsCheck, bots, disableAccountSelection
    } = this.props;

    const { config: { exchange, capitalBase, pair }, botId } = currentBotConfig;
    const { live_enabled_exchanges: enabledExchanges, label: botLabel } = bots[botId];
    if (!enabledExchanges[exchange] || (!enabledExchanges[exchange].enabled)) {
      return (
        <Fragment>
          <img className={classes.notEnabledImage} src="/platform/static/images/sad-bot.svg" alt="flat-rocket.svg" />
          <Typography className={classes.notEnabledText}>
            {`Live bot trading with ${botLabel} on ${enabledExchanges[exchange] && enabledExchanges[exchange].label
              ? enabledExchanges[exchange].label
              : sentenceCase(exchange)} is coming soon.`}<br />
            <a
              className={classes.sourceLink}
              href="https://support.quadency.com/en/articles/2281036-which-exchanges-are-supported"
              rel="noopener noreferrer"
              target="_blank">
              See supported exchanges
            </a>
          </Typography>
        </Fragment>
      );
    }

    const accountsForExchange = this.filterAccountsForExchange(accounts, exchange);

    if (!accountsForExchange.length) {
      return (
        <EmptyStateCover
          iconSmall
          icon="disconnected"
          title="No Account"
          subheading={`Connect your ${exchange || ''} account to start trading`}
          cta="Add Account"
          ctaPath="/a/onboarding/select-exchange" />
      );
    }
    const [selectedAccount] = selectedAccounts;
    const isSufficientBalanceError = this.checkSufficientBalance(selectedAccount, capitalBase, pair, holdingsByAccount);

    return (
      <form onSubmit={onSubmit} className={classes.form}>
        <div className={classes.group}>
          <Typography name="accountLabel" color="textSecondary" className={classes.label}>Account</Typography>
          <Select
            name="accountMenu"
            value={(selectedAccount || 'noAccounts')}
            onChange={this.setAccount}
            inputProps={{ name: 'account', className: classes.input }}
            className={classes.select}
            disabled={disableAccountSelection}
            disableUnderline>
            {this.getAccountMenuItems(accountsForExchange)}
          </Select>
        </div>
        {!botTerms &&
          <BotTermsAgreement
            botTermsAgreed={botTermsAgreed}
            updateBotTermsCheck={updateBotTermsCheck} />
        }
        {isSufficientBalanceError &&
          <Typography name="balanceError" className={classes.balanceError} color="textSecondary">{isSufficientBalanceError}</Typography>
        }
        <div className={classes.buttonArea}>
          <Button
            name="startLiveMode"
            color="primary"
            variant="contained"
            disabled={(!selectedAccount || !!isSufficientBalanceError || !exchange || !botTermsAgreed)}
            type="submit">
            Start Live Mode
          </Button>
        </div>
      </form>
    );
  }
}

LiveSettingsSingleAccountForm.defaultProps = {
  currentBotConfig: null,
  holdingsByAccount: []
};

LiveSettingsSingleAccountForm.propTypes = {
  classes: PropTypes.object.isRequired,
  accounts: PropTypes.array.isRequired,
  selectedAccounts: PropTypes.array.isRequired,
  setSelectedAccounts: PropTypes.func.isRequired,
  currentBotConfig: PropTypes.object,
  holdingsByAccount: PropTypes.array,
  onSubmit: PropTypes.func.isRequired,
  bots: PropTypes.object.isRequired,
  botTerms: PropTypes.bool.isRequired,
  botTermsAgreed: PropTypes.bool.isRequired,
  updateBotTermsCheck: PropTypes.func.isRequired,
  disableAccountSelection: PropTypes.bool.isRequired
};

export default withStyles(styles, { withTheme: true })(LiveSettingsSingleAccountForm);



// WEBPACK FOOTER //
// ./src/components/bots/modals/liveSettingsSingleAccountForm.js