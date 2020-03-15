import React, { Component } from 'react';
import { connect } from 'react-redux';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import Grid from '@material-ui/core/Grid';
import Hidden from '@material-ui/core/Hidden';
import Button from '@material-ui/core/Button';
import ButtonBase from '@material-ui/core/ButtonBase';
import { withTheme, withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import sortBy from 'lodash/sortBy';
import AnimateOnChange from 'react-animate-on-change';
import CoinIcon from '../icons/coinIcon';
import TradeMenu from '../common/tradeMenu';
import TooltipIcon from '../common/tooltipIcon';
import {
  getChangeColor,
  formatCurrency,
  formatChangePct,
  formatAmount,
  ellipsize,
  getPairForSparkline
} from '../../utils/helpers';
import SparklinesChart from '../common/sparklinesChart';
import withPaywall from '../hocs/paywall';
import { ACCOUNT_TYPES } from '../../utils/types';
import EmptyStateCover from '../common/emptyStateCover';

const animationClassGreen = 'animateChangeGreen';
const animationClassRed = 'animateChangeRed';


const styles = theme => ({
  table: {
    padding: 'none',
  },
  tableAssetHeader: {
    backgroundColor: theme.palette.background.paper,
    border: 'none',
  },
  tableRowSticky: {
    height: '2rem',
    border: 'none',
  },
  tableHeadCell: {
    border: 'none',
    padding: '0.2rem 0.4rem 0.2rem',
  },
  tableHeadCellSticky: {
    backgroundColor: theme.palette.background.paper,
    position: 'sticky',
    top: 0,
    padding: '0.4rem',
  },
  tableCell: {
    padding: '0.5rem',
    width: '11.85%',
    fontWeight: 'normal',
    borderBottom: `1px solid ${theme.palette.background.paperDarker}`,
    verticalAlign: 'top',
    '&:first-child': {
      verticalAlign: 'middle',
      textAlign: 'center',
      borderBottom: 'none',
      width: '5%',
    },
    '&:last-child': {
      textAlign: 'center',
      verticalAlign: 'middle',
      width: '5%',
      padding: '0 0.4rem 0',
    }
  },
  cellNumeric: {
    textAlign: 'right',
  },
  primaryTextLarger: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
    wordWrap: 'nowrap',
  },
  primaryText: {
    fontSize: '1rem',
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
    wordWrap: 'nowrap',
  },
  secondaryText: {
    fontSize: '1rem',
    color: theme.palette.text.secondary,
    fontWeight: 'normal',
  },
  noCoinsText: {
    color: theme.palette.text.secondary,
    fontStyle: 'italic',
    margin: '1.5rem 0'
  },
  errorIcon: {
    color: theme.palette.text.secondary,
  },
  errorIconTooltip: {
    backgroundColor: theme.palette.text.secondary,
  },
  sparklines: {
    margin: '0 1rem 0 1rem'
  },
  [`${animationClassGreen}`]: {
    animation: 'colorGreen 2000ms linear both'
  },
  [`${animationClassRed}`]: {
    animation: 'colorRed 2000ms linear both'
  },
  '@keyframes colorGreen': {
    '0%': {
      color: theme.palette.icons.green,
    },
    '100%': {
      color: theme.palette.text.primary,
    },
  },
  '@keyframes colorRed': {
    '0%': {
      color: theme.palette.icons.red,
    },
    '100%': {
      color: theme.palette.text.primary,
    },
  },
  grid: {
    padding: '20px'
  }
});

class HoldingsTable extends Component {
  constructor(props) {
    super(props);

    this.state = {
      sort: 'value',
      sortOrder: 1
    };
    this.oldPrices = {};
  }

  setSortBy = (event) => {
    const { sort, sortOrder } = this.state;
    const sortField = event.target.value;

    this.setState({
      sort: sortField,
      sortOrder: sortField === sort ? !sortOrder : 1
    });
  };


  getHeader = (classes, stickyHeader, costbasisEnabled, enableActions, accountType, prefCurrency) => {
    const headClass = stickyHeader ? classes.tableAssetHeader : null;
    const rowClass = stickyHeader ? classes.tableRowSticky : null;
    const cellClass = stickyHeader ? `${classes.tableHeadCell} ${classes.tableHeadCellSticky }` : classes.tableHeadCell;

    return (
      <TableHead classes={{ root: headClass }}>
        <TableRow classes={{ root: rowClass }}>
          <TableCell classes={{ root: cellClass }} />
          <TableCell classes={{ root: cellClass }}>
            <ButtonBase value="asset" onClick={this.setSortBy}>Asset</ButtonBase>
          </TableCell>
          <TableCell className={classes.cellNumeric} classes={{ root: cellClass }}>
            {accountType !== ACCOUNT_TYPES.MANUAL ? (
              <ButtonBase className={classes.cellNumeric} value="rawTotal" onClick={this.setSortBy}>
              Total<br />Available
              </ButtonBase>
            ) : (
              <ButtonBase className={classes.cellNumeric} value="rawTotal" onClick={this.setSortBy}>
                Total
              </ButtonBase>
            )}
          </TableCell>
          <TableCell className={classes.cellNumeric} classes={{ root: cellClass }}>
            {costbasisEnabled ?
              <div>
                <div>
                  <ButtonBase className={classes.cellNumeric} value="price" onClick={this.setSortBy}>
                Last&nbsp;Price<TooltipIcon title="Latest global average price of asset" />
                  </ButtonBase>
                </div>
                <div>
                  <ButtonBase className={classes.cellNumeric} value="price" onClick={this.setSortBy}>
                Avg&nbsp;Cost&nbsp;Basis
                    <TooltipIcon
                      title="Average price paid per each unit of currently held asset"
                      learnMoreLink="https://support.quadency.com/portfolio-and-performance-monitoring/portfolio-overview" />
                  </ButtonBase>
                </div>
              </div>
              :
              <ButtonBase className={classes.cellNumeric} value="price" onClick={this.setSortBy}>Last&nbsp;Price</ButtonBase>
            }
          </TableCell>
          <TableCell className={classes.cellNumeric} classes={{ root: cellClass }}>
            {costbasisEnabled ?
              <div>
                <div>
                  <ButtonBase className={classes.cellNumeric} value="value" onClick={this.setSortBy}>
                  Value&nbsp;({prefCurrency})<TooltipIcon title="Current market value of asset (Last Global Avg Price * Total)" />
                  </ButtonBase>
                </div>
                <div>
                  <ButtonBase className={classes.cellNumeric} value="value" onClick={this.setSortBy}>
                  Cost&nbsp;Basis
                    <TooltipIcon
                      title="Total acquisition cost of currently held quantity (Avg Cost Basis * Total)"
                      learnMoreLink="https://support.quadency.com/portfolio-and-performance-monitoring/portfolio-overview" />
                  </ButtonBase>
                </div>
              </div>
              :
              <ButtonBase className={classes.cellNumeric} value="value" onClick={this.setSortBy}>Market&nbsp;Value</ButtonBase>
            }
          </TableCell>
          <Hidden smDown>
            {!stickyHeader && costbasisEnabled &&
            <TableCell className={classes.cellNumeric} classes={{ root: cellClass }}>
              <div>
                <div>
                  <ButtonBase className={classes.cellNumeric} value="percentReturn" onClick={this.setSortBy}>
                %&nbsp;Return<TooltipIcon title="Percent profit/loss of asset (Market Value - Cost Basis) / Cost Basis" />
                  </ButtonBase>
                </div>
                <div>
                  <ButtonBase className={classes.cellNumeric} value="percentReturn" onClick={this.setSortBy}>
                Total&nbsp;Return
                    <TooltipIcon title="Total (open) profit/loss of asset (Market Value - Cost Basis)"
                      learnMoreLink="https://support.quadency.com/portfolio-and-performance-monitoring/portfolio-overview" />
                  </ButtonBase>
                </div>
              </div>
            </TableCell>
            }
          </Hidden>
          <TableCell className={classes.cellNumeric} classes={{ root: cellClass }}>
            <ButtonBase value="percentChange" onClick={this.setSortBy}>24h&nbsp;Change</ButtonBase>
          </TableCell>
          <Hidden smDown>
            {!stickyHeader &&
              <TableCell className={classes.cellNumeric} classes={{ root: cellClass }} style={{ textAlign: 'center' }}>
                <ButtonBase value="percentChange" onClick={this.setSortBy}>24h&nbsp;Chart</ButtonBase>
              </TableCell>
            }
            {enableActions &&
              <TableCell classes={{ root: cellClass }} style={{ zIndex: stickyHeader ? '1' : '0', textAlign: 'center' }}>
                Actions
              </TableCell>
            }
          </Hidden>
        </TableRow>
      </TableHead>
    );
  }

  getAccountLabelFromId = (id) => {
    const { accounts } = this.props;
    if (accounts.length) {
      const currentAccount = accounts.find(account => account.id === id);
      return currentAccount ? currentAccount.label : null;
    }
    return null;
  };

  sort = (arr) => {
    const { sort, sortOrder } = this.state;
    const sorted = sortBy(arr, o => o[sort]);

    // reverse here because lodash by default sorts strings in reverse alphabetical order
    if (sort === 'name') sorted.reverse();

    return sortOrder ? sorted.reverse() : sorted;
  };

  filterRows = (searchTerm, filterAccountId, filterPair, filterSymbol) => {
    const {
      holdingsByAccount, holdingsByAsset, prefCurrency, prices
    } = this.props;
    let assets;
    if (filterAccountId) {
      const accountSummary = holdingsByAccount.find(account => account.id === filterAccountId);
      if (accountSummary) {
        // eslint-disable-next-line prefer-destructuring
        assets = accountSummary.assets;
      } else {
        assets = [];
      }
    } else {
      assets = holdingsByAsset;
    }

    assets.forEach((asset) => {
      asset.sparkLinesPair = getPairForSparkline(asset.name, prefCurrency, prices);
    });

    if (searchTerm) {
      const normalizedAssetFilter = searchTerm.toUpperCase();
      return assets.filter((a) => {
        return a.name.includes(normalizedAssetFilter) ||
          a.fullName.toUpperCase().includes(normalizedAssetFilter) ||
          a.fullName.toUpperCase().includes(normalizedAssetFilter);
      });
    }

    if (filterPair) {
      const pairAssets = filterPair.split('/');
      const base = pairAssets[0];
      const quote = pairAssets[1];
      return assets.filter((a) => {
        return a.name.includes(base) || a.name.includes(quote);
      });
    }

    if (filterSymbol) {
      return assets.filter((a) => {
        const base = a.name.split('/')[0];
        return base === filterSymbol;
      });
    }

    return assets;
  };

  renderTable = (assets) => {
    const {
      classes, theme, stickyHeader, prefCurrency, filterAccountId, isFeatureEnabled, enableActions, accounts
    } = this.props;

    const accountType = filterAccountId ? accounts.find(acc => acc.id === filterAccountId).type : null;

    return (
      <Table className={classes.table} name="holdingsTable">
        {this.getHeader(classes, stickyHeader, isFeatureEnabled.COSTBASIS, enableActions, accountType, prefCurrency)}
        <TableBody>
          {assets.map((asset) => {
            let animate = false;
            let animationClass = animationClassGreen;
            if (this.oldPrices[asset.name] && this.oldPrices[asset.name] !== asset.currentPrice) {
              animate = true;
              animationClass = (asset.currentPrice > this.oldPrices[asset.name]) ? animationClassGreen : animationClassRed;
            }

            this.oldPrices[asset.name] = asset.currentPrice;

            return (
              <TableRow key={asset.name} name={asset.name}>
                {/* Asset name */}
                <TableCell className={classes.tableCell}><CoinIcon coin={asset.name.toLowerCase()} /></TableCell>
                <TableCell classes={{ root: classes.tableCell }}>
                  <span className={classes.primaryTextLarger}>
                    <span>{ ellipsize(asset.fullName, 16)}</span><br />
                    <span className={classes.secondaryText}> {asset.name}</span>
                  </span>
                </TableCell>
                {/* total / available */}
                <TableCell className={classes.cellNumeric} classes={{ root: classes.tableCell }} >
                  <span className={classes.primaryText}>{formatAmount(asset.asset, asset.rawTotal)}</span>
                  {accountType !== ACCOUNT_TYPES.MANUAL &&
                    <span className={classes.secondaryText}><br />{formatAmount(asset.asset, asset.freeTotal)}</span>
                  }
                </TableCell>
                {/* last price / avg cost */}
                <TableCell className={classes.cellNumeric} classes={{ root: classes.tableCell }}>
                  <AnimateOnChange
                    baseClassName={classes.primaryText}
                    animationClassName={classes[animationClass]}
                    animate={animate}>
                    <div>{formatCurrency(prefCurrency, asset.currentPrice)}</div>
                  </AnimateOnChange>
                  {asset.cost !== 0 && isFeatureEnabled.COSTBASIS &&
                    <div className={classes.secondaryText}>{formatCurrency(prefCurrency, asset.avgUnitCost)}</div>
                  }
                </TableCell>
                {/* market value / cost basis */}
                <TableCell className={classes.cellNumeric} classes={{ root: classes.tableCell }} >
                  <AnimateOnChange
                    baseClassName={classes.primaryText}
                    animationClassName={classes[animationClass]}
                    animate={animate}>
                    {formatCurrency(prefCurrency, asset.value)}
                  </AnimateOnChange>
                  {asset.cost !== 0 && isFeatureEnabled.COSTBASIS &&
                    <div className={classes.secondaryText}>{formatCurrency(prefCurrency, asset.cost)}</div>
                  }
                </TableCell>
                {/* % return / total return */}
                <Hidden smDown>
                  {!stickyHeader && isFeatureEnabled.COSTBASIS &&
                  <TableCell className={classes.cellNumeric} classes={{ root: classes.tableCell }}>
                    {asset.cost !== 0 &&
                    <div>
                      <div className={classes.primaryTextLarger}
                        style={{ color: getChangeColor(asset.percentReturn, theme) }}>
                        {formatChangePct(prefCurrency, asset.percentReturn)}
                      </div>
                      <div className={classes.secondaryText} style={{ color: getChangeColor(asset.return, theme) }}>
                        {formatCurrency(prefCurrency, asset.return)}
                      </div>
                    </div>
                    }
                  </TableCell>
                  }
                </Hidden>
                {/* 24 change */}
                <TableCell className={classes.cellNumeric} classes={{ root: classes.tableCell }}>
                  <div className={classes.primaryTextLarger} style={{ color: getChangeColor(asset.percentChange, theme) }}>
                    {formatChangePct(prefCurrency, asset.percentChange)}
                  </div>
                  <div className={classes.secondaryText} style={{ color: getChangeColor(asset.change24h, theme) }}>
                    {formatCurrency(prefCurrency, asset.change24h)}
                  </div>
                </TableCell>
                <Hidden smDown>
                  { !stickyHeader &&
                    <TableCell classes={{ root: classes.tableCell }} style={{ padding: '0 1rem', textAlign: 'center', verticalAlign: 'middle' }}>
                      {asset.sparkLinesPair ?
                        <SparklinesChart margin="0 1rem" pair={asset.sparkLinesPair} change={asset.change24h} />
                        : '-'
                      }
                    </TableCell>
                  }
                  {enableActions &&
                    <TableCell classes={{ root: classes.tableCell }} name={`trade${asset.fullName}`} style={{ verticalAlign: 'middle' }}>
                      <TradeMenu asset={asset.name} accountId={filterAccountId} />
                    </TableCell>
                  }
                </Hidden>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    );
  };

  renderNotFound = () => {
    const {
      classes, filterAccountId, accounts, emptyStateFn
    } = this.props;
    const accountType = filterAccountId ? accounts.find(acc => acc.id === filterAccountId).type : null;

    let emptyMessage = 'No Assets';
    if (filterAccountId) {
      emptyMessage = `No Assets for ${this.getAccountLabelFromId(filterAccountId)}`;
    }

    if (!accountType || accountType === ACCOUNT_TYPES.EXCHANGE) {
      return (
        <Grid container alignItems="center" justify="center" className={classes.grid}>
          <EmptyStateCover subheading={emptyMessage} icon="empty" iconSmall />
        </Grid>
      );
    }
    return (
      <Grid container direction="column" alignItems="center" justify="center" className={classes.grid}>
        <EmptyStateCover subheading={emptyMessage} icon="empty" iconSmall />
        <Button
          variant="outlined"
          color="primary"
          tabIndex="-1"
          onKeyPress={() => { emptyStateFn(); }}
          onClick={() => { emptyStateFn(); }}> Add First Transaction
        </Button>
      </Grid>
    );
  };

  render() {
    const {
      searchTerm, filterAccountId, filterPair, filterSymbol, marketsLoaded,
    } = this.props;

    if (!marketsLoaded) {
      return this.renderNotFound();
    }
    const filteredAssets = this.sort(this.filterRows(searchTerm, filterAccountId, filterPair, filterSymbol));
    return filteredAssets.length !== 0 ? this.renderTable(filteredAssets) : this.renderNotFound();
  }
}

HoldingsTable.defaultProps = {
  stickyHeader: false,
  searchTerm: '',
  filterPair: '',
  filterAccountId: '',
  filterSymbol: '',
  enableActions: true,
  emptyStateFn: () => {},
};

HoldingsTable.propTypes = {
  classes: PropTypes.object.isRequired,
  accounts: PropTypes.array.isRequired,
  prices: PropTypes.object.isRequired,
  marketsLoaded: PropTypes.bool.isRequired,
  holdingsByAccount: PropTypes.array.isRequired,
  holdingsByAsset: PropTypes.array.isRequired,
  theme: PropTypes.object.isRequired,
  searchTerm: PropTypes.string,
  stickyHeader: PropTypes.bool,
  prefCurrency: PropTypes.string.isRequired,
  filterAccountId: PropTypes.string,
  filterPair: PropTypes.string,
  filterSymbol: PropTypes.string,
  isFeatureEnabled: PropTypes.object.isRequired,
  enableActions: PropTypes.bool,
  emptyStateFn: PropTypes.func,
};

function mapStateToProps(state) {
  return {
    prefCurrency: state.global.user.user.preferences.pref_currency,
    accounts: state.global.accounts.accounts,
    prices: state.global.prices.prices,
    marketsLoaded: state.global.markets.marketsLoaded,
    holdingsByAccount: state.holdings.holdings.byAccount,
    holdingsByAsset: state.holdings.holdings.byAsset,
  };
}

const base = (withTheme()(withStyles(styles)(withPaywall('COSTBASIS')(HoldingsTable))));
export default connect(mapStateToProps)(base);



// WEBPACK FOOTER //
// ./src/components/tables/holdingsTable.js