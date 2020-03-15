import React, { Component, Fragment } from 'react';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import flatten from 'lodash/flatten';
import PropTypes from 'prop-types';
import uuidv4 from '../../utils/uuid';
import { updateAccount, updatePair } from '../../store/ducks/trade/interactions';
import { getPairsForAsset } from '../../utils/helpers';

class TradeMenu extends Component {
  constructor() {
    super();
    this.state = {
      anchorEl: null
    };
  }

  selectPair = (pair, accountId) => {
    const { actions, history } = this.props;
    this.closeTradeMenu();
    actions.updatePair(pair);
    actions.updateAccount(accountId);
    history.push('/trade');
  };

  closeTradeMenu = () => {
    this.setState({
      anchorEl: null
    });
  };

  openTradeMenu = (event) => {
    this.setState({
      anchorEl: event.currentTarget
    });
  };

  generateTradeMenuItems() {
    const {
      asset, accounts, accountId, markets
    } = this.props;

    const items = [];
    accounts.forEach((account) => {
      if (!Object.keys(markets).length || !markets[account.name]) return '';
      const pairs = getPairsForAsset(asset, markets[account.name]);
      const filteredItems = pairs.map((pair) => {
        return {
          pair,
          label: `${pair} @${account.label}`,
          accountId: account.id
        };
      }).filter(item => (accountId ? item.accountId === accountId : true));
      items.push(filteredItems);
    });
    return flatten(items);
  }

  render() {
    const { anchorEl } = this.state;
    const { marketsLoaded } = this.props;
    if (!marketsLoaded) return null;

    const menuItems = this.generateTradeMenuItems();
    return (
      <Fragment>
        <Button
          style={{ border: '1px solid #354052', borderRadius: '4px' }}
          size="small"
          color="secondary"
          aria-owns={anchorEl ? 'trade-menu' : null}
          onClick={this.openTradeMenu}>
          Trade
        </Button>
        <Menu
          id="trade-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={this.closeTradeMenu}>
          {menuItems.map(item => (
            <MenuItem name={item.label} key={uuidv4()} onClick={() => this.selectPair(item.pair, item.accountId)}>{item.label}</MenuItem>
          ))}
        </Menu>
      </Fragment>
    );
  }
}

TradeMenu.defaultProps = {
  accountId: null
};

TradeMenu.propTypes = {
  asset: PropTypes.string.isRequired,
  actions: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  accounts: PropTypes.array.isRequired,
  markets: PropTypes.object.isRequired,
  marketsLoaded: PropTypes.bool.isRequired,
  accountId: PropTypes.string
};

function mapStateToProps(state) {
  return {
    accounts: state.global.accounts.accounts,
    markets: state.global.markets.markets,
    marketsLoaded: state.global.markets.marketsLoaded,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      ...bindActionCreators({
        updatePair,
        updateAccount
      }, dispatch)
    }
  };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(TradeMenu));



// WEBPACK FOOTER //
// ./src/components/common/tradeMenu.js