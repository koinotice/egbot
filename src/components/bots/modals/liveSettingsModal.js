import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import FormModal from '../../modals/formModal';
import LiveSettingsSingleAccountForm from './liveSettingsSingleAccountForm';
import LiveSettingsMultiAccountsForm from './liveSettingsMultiAccountsForm';

const styles = {
  text: {
    padding: '15px 0'
  }
};

class LiveSettingsModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedAccounts: [],
      botsTermsAgreed: true,
      disableAccountSelection: false
    };
  }

  componentDidMount() {
    if (this.props.currentBotConfig) {
      const { currentBotConfig: { config: { account } } } = this.props;
      if (account) {
        this.setSelectedAccounts([account]);
        this.setDisableAccountSelection(true);
      }
    }
  }

  setSelectedAccounts = (newSelectedAccounts) => {
    this.setState({
      selectedAccounts: newSelectedAccounts
    });
  };

  setDisableAccountSelection = (disableAccountSelection) => {
    this.setState({
      disableAccountSelection
    });
  };

  getForm() {
    const {
      currentBotConfig, botTerms, bots, holdingsByAccount, accounts
    } = this.props;
    const { config: { liveModeMultiAccounts } } = currentBotConfig;
    const { selectedAccounts, botsTermsAgreed, disableAccountSelection } = this.state;

    return (
      <Fragment>
        { liveModeMultiAccounts &&
          <LiveSettingsMultiAccountsForm
            accounts={accounts}
            selectedAccounts={selectedAccounts}
            setSelectedAccounts={this.setSelectedAccounts}
            currentBotConfig={currentBotConfig}
            holdingsByAccount={holdingsByAccount}
            onSubmit={this.submitForm}
            bots={bots}
            botTerms={botTerms}
            botTermsAgreed={botsTermsAgreed}
            updateBotTermsCheck={this.updateBotTermsCheck}
            disableAccountSelection={disableAccountSelection} />
        }
        { !liveModeMultiAccounts &&
          <LiveSettingsSingleAccountForm
            accounts={accounts}
            selectedAccounts={selectedAccounts}
            setSelectedAccounts={this.setSelectedAccounts}
            currentBotConfig={currentBotConfig}
            holdingsByAccount={holdingsByAccount}
            onSubmit={this.submitForm}
            bots={bots}
            botTerms={botTerms}
            botTermsAgreed={botsTermsAgreed}
            updateBotTermsCheck={this.updateBotTermsCheck}
            disableAccountSelection={disableAccountSelection} />
        }
      </Fragment>
    );
  }

  updateBotTermsCheck = (event) => {
    this.setState({
      botsTermsAgreed: event.target.checked,
    });
  };

  submitForm = (event) => {
    event.preventDefault();
    const {
      botTerms, submit, submitBotTermsAgreed
    } = this.props;
    const { selectedAccounts, botsTermsAgreed } = this.state;

    if (botsTermsAgreed || botTerms) {
      if (!botTerms && botsTermsAgreed) {
        submitBotTermsAgreed();
      }
      submit(selectedAccounts);
    }
  };

  render() {
    const {
      isVisible, hide, currentBotConfig
    } = this.props;

    if (!currentBotConfig || !isVisible) {
      return null;
    }

    return (
      <FormModal
        header="Live Mode Settings"
        isVisible={isVisible}
        hide={hide}
        form={this.getForm()} />
    );
  }
}

LiveSettingsModal.defaultProps = {
  currentBotConfig: null,
  botTerms: false,
  submitBotTermsAgreed: () => {},
  holdingsByAccount: []
};

LiveSettingsModal.propTypes = {
  bots: PropTypes.object.isRequired,
  isVisible: PropTypes.bool.isRequired,
  hide: PropTypes.func.isRequired,
  submit: PropTypes.func.isRequired,
  accounts: PropTypes.array.isRequired,
  currentBotConfig: PropTypes.object,
  submitBotTermsAgreed: PropTypes.func,
  botTerms: PropTypes.bool,
  holdingsByAccount: PropTypes.array
};

export default withStyles(styles)(LiveSettingsModal);



// WEBPACK FOOTER //
// ./src/components/bots/modals/liveSettingsModal.js