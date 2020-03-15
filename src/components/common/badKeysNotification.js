import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core';
import Icon from '@material-ui/core/Icon';
import PropTypes from 'prop-types';
import TooltipIcon from './tooltipIcon';


const styles = {
  icon: {
    color: '#ffb300',
    marginRight: '10px'
  }
};

class BadKeysNotification extends Component {
  shouldShowNotification() {
    const { accounts } = this.props;
    if (!accounts.length) {
      return false;
    }

    const accountsWithBadTokens = accounts.filter(account => (account.tokensValid === false));
    return !!accountsWithBadTokens.length;
  }

  renderNotification() {
    const { classes } = this.props;
    return (
      <Link to="/settings/accounts">
        <TooltipIcon
          title="Invalid API Key - Click for more info"
          placement="bottom"
          Icon={<Icon className={classes.icon}>warning</Icon>} />
      </Link>
    );
  }

  render() {
    if (this.shouldShowNotification()) {
      return this.renderNotification();
    }
    return null;
  }
}

BadKeysNotification.defaultProps = {
  accounts: []
};

BadKeysNotification.propTypes = {
  classes: PropTypes.object.isRequired,
  accounts: PropTypes.array
};

function mapStateToProps(state) {
  return {
    accounts: state.global.accounts.accounts
  };
}

const base = withStyles(styles, { withTheme: true })(BadKeysNotification);
export default connect(mapStateToProps, null)(base);



// WEBPACK FOOTER //
// ./src/components/common/badKeysNotification.js