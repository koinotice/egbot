import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import Hidden from '@material-ui/core/Hidden';
import ButtonBase from '@material-ui/core/ButtonBase';
import PropTypes from 'prop-types';
import { withStyles, withTheme } from '@material-ui/core/styles/index';
import {
  getPricePrecisionFrom,
  getAmountPrecisionFrom,
  getChangeColor,
  formatChangePct,
  formatCurrency,
  formatAmount,
  isMarketPrefCurrency,
  getPriceInPrefCurrency
} from '../../utils/helpers';
import TooltipIcon from '../common/tooltipIcon';


const styles = theme => ({
  container: {
    height: '100%',
    overflowY: 'auto',
    overflowX: 'hidden'
  },
  tableRow: {
    height: '1.563rem',
    width: '100%',
    backgroundColor: theme.palette.background.paper,
    '&:hover': {
      cursor: 'pointer',
      backgroundColor: theme.palette.background.paperDarker
    },
  },
  tableCell: {
    fontSize: '1.0rem',
    fontWeight: '600',
    lineHeight: '1.4rem',
    fontFamily: 'Source Sans Pro',
    padding: '0.2857rem 0.8571rem 0.2857rem 1.286rem',
    textAlign: 'left',
    border: 'none',
  },
  tableCellHead: {
    backgroundColor: theme.palette.background.paper,
    position: 'sticky',
    top: 0,
    border: 'none',
  }
});


class MarketsTable extends Component {
  componentWillUnmount() {
    this.props.resetSearchFilter();
  }

  getTableBody(
    searchFilter,
    updatePairFn,
    data,
    classes,
    theme,
    currentExchange,
    sortEnabled,
    sortType,
    sortOrder,
    exchangeMarketsData,
    prices,
    forex,
    prefCurrency
  ) {
    if (data) {
      const filteredPairs = Object.keys(data).filter(pair => pair.toUpperCase().includes(searchFilter.toUpperCase()));
      const sorted = this.sortData(data, filteredPairs, sortEnabled, sortType, sortOrder);
      const rows = sorted.map((key) => {
        const formattedPrice = getPricePrecisionFrom(data[key].price, exchangeMarketsData[key] ? exchangeMarketsData[key].precision : null);
        const volume = getAmountPrecisionFrom(data[key].volume24h, exchangeMarketsData[key] ? exchangeMarketsData[key].precision : null);
        const [base, marketFromPair] = key.split('/');
        return (
          <TableRow name={key.toLowerCase()} key={key} className={classes.tableRow} onClick={() => updatePairFn(key)}>
            <TableCell className={classes.tableCell} style={{ paddingRight: '0' }}>
              {key}
              <ButtonBase onClick={event => event.stopPropagation()} component={Link} to={`/market/${base}`}>
                <TooltipIcon title={`View Profile for ${base}`} />
              </ButtonBase>
            </TableCell>
            <TableCell className={classes.tableCell} style={{ paddingLeft: '0', paddingRight: '0.1rem' }}>
              {formattedPrice}
              { !isMarketPrefCurrency(marketFromPair, prefCurrency) &&
                <span style={{ color: theme.palette.text.secondary, fontWeight: '400' }}>
                  { ` / ${formatCurrency(prefCurrency, data[key].price *
                    getPriceInPrefCurrency(marketFromPair, prefCurrency, prices, forex))}`}
                </span>
              }
            </TableCell>
            <TableCell className={classes.tableCell} style={{ paddingRight: '.2rem', color: getChangeColor(data[key].percentChange, theme) }}>
              { formatChangePct(prefCurrency, data[key].percentChange / 100) }
            </TableCell>
            <Hidden smDown>
              <TableCell className={classes.tableCell}>{formatAmount(prefCurrency, volume)}</TableCell>
            </Hidden>
          </TableRow>);
      });
      if (rows) {
        return (
          <TableBody className={classes.container}>
            {rows}
          </TableBody>);
      }
      return null;
    }
    return null;
  }

  sortData = (data, filteredPairs, sortEnabled, sortType, sortOrder) => {
    if (sortEnabled) {
      if (sortType === 'Symbol') {
        const sorted = filteredPairs.sort();
        return sortOrder ? sorted : sorted.reverse();
      }
      if (sortType === 'Price') {
        const sorted = filteredPairs.sort((a, b) => {
          return parseFloat(data[b].price) - parseFloat(data[a].price);
        });
        return sortOrder ? sorted : sorted.reverse();
      }
      if (sortType === 'Change') {
        const sorted = filteredPairs.sort((a, b) => {
          return data[b].percentChange - data[a].percentChange;
        });
        return sortOrder ? sorted : sorted.reverse();
      }
      // default to volume
      const sorted = filteredPairs.sort((a, b) => {
        return parseFloat(data[b].volume24h) - parseFloat(data[a].volume24h);
      });
      return sortOrder ? sorted : sorted.reverse();
    }
    return filteredPairs;
  }

  render() {
    const {
      classes,
      theme,
      data,
      updatePair,
      currentExchange,
      searchFilter,
      sortType,
      sortOrder,
      setSort,
      sortEnabled,
      exchangeMarketsData,
      prices,
      forex,
      user
    } = this.props;

    const { pref_currency: prefCurrency } = user.preferences;

    return (
      <div className={classes.container}>
        <Table>
          <TableHead>
            <TableRow className={classes.tableRow}>
              <TableCell className={classes.tableCellHead} onClick={() => { setSort('Symbol'); }} >Symbol</TableCell>
              <TableCell className={classes.tableCellHead} onClick={() => { setSort('Price'); }} >Price</TableCell>
              <TableCell className={classes.tableCellHead} onClick={() => { setSort('Change'); }} >Change</TableCell>
              <Hidden smDown>
                <TableCell className={classes.tableCellHead} onClick={() => { setSort('Volume'); }}>Volume</TableCell>
              </Hidden>
            </TableRow>
          </TableHead>
          {
            this.getTableBody(
              searchFilter,
              updatePair,
              data,
              classes,
              theme,
              currentExchange,
              sortEnabled,
              sortType,
              sortOrder,
              exchangeMarketsData,
              prices,
              forex,
              prefCurrency
            )
          }
        </Table>
      </div>
    );
  }
}

MarketsTable.defaultProps = {
  updatePair: null,
  data: {},
  searchFilter: '',
  resetSearchFilter: null,
  sortType: '',
  sortOrder: true,
  setSort: null,
  sortEnabled: false,
  exchangeMarketsData: {},
  currentExchange: '',
  prices: {},
  forex: {},
};

MarketsTable.propTypes = {
  updatePair: PropTypes.func,
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  data: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.array
  ]),
  searchFilter: PropTypes.string,
  resetSearchFilter: PropTypes.func,
  sortType: PropTypes.string,
  sortOrder: PropTypes.bool,
  setSort: PropTypes.func,
  sortEnabled: PropTypes.bool,
  exchangeMarketsData: PropTypes.objectOf(PropTypes.object),
  currentExchange: PropTypes.string,
  prices: PropTypes.object,
  forex: PropTypes.object,
  user: PropTypes.object.isRequired,
};

function mapStateToProps(state) {
  return {
    user: state.global.user.user,
    forex: state.global.forex.forex,
    prices: state.global.prices.prices,
    currentExchange: state.trade.interactions.currentExchange,
    holdingsLoaded: state.holdings.holdings.holdingsLoaded
  };
}

const base = (withTheme()(withStyles(styles)(MarketsTable)));
export default connect(mapStateToProps)(base);



// WEBPACK FOOTER //
// ./src/components/trade/marketsTable.js