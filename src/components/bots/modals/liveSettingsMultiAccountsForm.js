import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import BotTermsAgreement from './botTermsAgreement';


const styles = {
  form: {
    marginTop: '2.286rem',
    textAlign: 'left',
  },
  group: {
    marginTop: '1.429rem',
  },
  buttonArea: {
    textAlign: 'right',
    marginTop: '3.571rem',
  },
  listItem: {
    padding: '0',
    height: '2.1429rem',
    marginBottom: '0.5714rem'
  },
  listItemText: {
    padding: '0'
  },
  label: {
    padding: '0 1.0714rem'
  }
};

class LiveSettingsMutliAccountsForm extends Component {
  filterAccountsForEnabledExchanges(accounts) {
    const { bots, currentBotConfig: { botId } } = this.props;
    const { live_enabled_exchanges: enabledExchanges } = bots[botId];
    return accounts.filter(account => (account.type === 'EXCHANGE' && enabledExchanges[account.name.toLowerCase()] && (enabledExchanges[account.name.toLowerCase()].enabled)));
  }

  updateSelectedAccounts(accountId) {
    const { selectedAccounts, setSelectedAccounts } = this.props;

    let newSelectedAccounts;
    if (selectedAccounts.includes(accountId)) {
      newSelectedAccounts = selectedAccounts.filter(accId => (accId !== accountId));
    } else {
      newSelectedAccounts = [...selectedAccounts];
      newSelectedAccounts.push(accountId);
    }
    setSelectedAccounts(newSelectedAccounts);
  }

  renderAccounts() {
    const { classes, accounts, selectedAccounts } = this.props;
    const accountsFilteredForEnabledExchanges = this.filterAccountsForEnabledExchanges(accounts);
    return (
      <List dense component="div" role="list">
        {accountsFilteredForEnabledExchanges.map(account => (
          <ListItem key={account.id} role="listitem" button onClick={() => this.updateSelectedAccounts(account.id)} className={classes.listItem}>
            <ListItemIcon>
              <Checkbox
                checked={selectedAccounts.includes(account.id)}
                color="primary"
                disableRipple />
            </ListItemIcon>
            <ListItemText primary={account.label} className={classes.listItemText} />
          </ListItem>
        ))}
      </List>
    );
  }

  render() {
    const {
      classes, onSubmit, botTerms, botTermsAgreed, updateBotTermsCheck, selectedAccounts
    } = this.props;

    return (
      <form onSubmit={onSubmit} className={classes.form}>
        <div className={classes.group}>
          <Typography name="accountLabel" color="textSecondary" className={classes.label}>Accounts</Typography>
          {this.renderAccounts()}
        </div>
        {!botTerms &&
          <BotTermsAgreement
            botTermsAgreed={botTermsAgreed}
            updateBotTermsCheck={updateBotTermsCheck} />
        }
        <div className={classes.buttonArea}>
          <Button
            name="startLiveMode"
            color="primary"
            variant="contained"
            disabled={(!selectedAccounts.length || !botTermsAgreed)}
            type="submit">
            Start Live Mode
          </Button>
        </div>
      </form>
    );
  }
}

LiveSettingsMutliAccountsForm.defaultProps = {
  currentBotConfig: null,
};

LiveSettingsMutliAccountsForm.propTypes = {
  classes: PropTypes.object.isRequired,
  accounts: PropTypes.array.isRequired,
  selectedAccounts: PropTypes.array.isRequired,
  setSelectedAccounts: PropTypes.func.isRequired,
  currentBotConfig: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  bots: PropTypes.object.isRequired,
  botTerms: PropTypes.bool.isRequired,
  botTermsAgreed: PropTypes.bool.isRequired,
  updateBotTermsCheck: PropTypes.func.isRequired
};

export default withStyles(styles, { withTheme: true })(LiveSettingsMutliAccountsForm);



// WEBPACK FOOTER //
// ./src/components/bots/modals/liveSettingsMultiAccountsForm.js