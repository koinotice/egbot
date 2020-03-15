import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { PulseLoader } from 'react-spinners';
import Grid from '@material-ui/core/Grid';
import ButtonBase from '@material-ui/core/ButtonBase';
import Hidden from '@material-ui/core/Hidden';
import { withStyles, withTheme } from '@material-ui/core/styles';
import Icon from '@material-ui/core/Icon';
import Paper from '@material-ui/core/Paper';
import Input from '@material-ui/core/Input';
import Popper from '@material-ui/core/Popper';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import PropTypes from 'prop-types';
import { NavTabs, NavTab } from '../../components/tabs/index';
import MarketsTable from '../../components/trade/marketsTable';
import ChangeArrow from '../../components/icons/changeArrow';
import { updatePair, updateMarket } from '../../store/ducks/trade/interactions';
import { setExchangeMarketsSort } from '../../store/ducks/trade/markets';
import {
  getChangeColor,
  isMarketPrefCurrency,
} from '../../utils/helpers';
import Formatted from '../../components/common/formatted';
import TooltipIcon from '../../components/common/tooltipIcon';

const styles = theme => ({
  progress: {
    marginTop: '1rem',
  },
  progressContainer: {
    height: '100%',
    maxHeight: '48px',
    borderBottom: `1px solid ${theme.palette.background.default}`,
  },
  symbolButton: {
    color: theme.palette.text.primary,
    fontSize: '1.125rem',
    fontWeight: '600',
    lineHeight: '1.188rem',
    padding: ' 0.6875rem 0.9375rem',
    height: '100%'
  },
  inputWrapper: {
    width: '100%',
    margin: '0.375rem',
    backgroundColor: theme.palette.background.default,
  },
  input: {
    maxWidth: '111px',
    padding: '0.1rem 0.6rem',
    fontSize: '0.95rem',
    color: '#a8bad6',
    textTransform: 'uppercase',
  },
  tabsWrapper: {
    width: '100%',
    paddingTop: '0.2375rem'
  },
  symbolMenuPaper: {
    backgroundColor: theme.palette.background.default,
    // overflow: 'hidden',
    width: '48rem',
    height: '28rem',
    [theme.breakpoints.down(600)]: {
      width: '100%',
    },
  },
  symbolMenuContent: {
    backgroundColor: theme.palette.background.paper,
    width: '100%',
    height: 'calc(100% - 39px)',
    [theme.breakpoints.down(600)]: {
      height: 'calc(100% - 5.571rem)',
    },
  },
  container: {
    height: '100%',
    maxHeight: '48px',
    borderBottom: `1px solid ${theme.palette.background.default}`,
  },
  tickerPrice: {
    alignSelf: 'center',
    fontSize: '1.229rem',
    fontWeight: '600',
    lineHeight: '1.429rem',
    marginLeft: '1rem',
    color: theme.palette.text.primary,
    [theme.breakpoints.down(600)]: {
      marginLeft: '0.5rem',
    }
  },
  fiat: {
    color: theme.palette.text.secondary,
    fontSize: '1.043rem',
    fontWeight: 'bold',
    lineHeight: '1.429rem',
    marginLeft: '0.4rem'
  },
  col: {
    alignSelf: 'center',
    marginLeft: '1.543rem',
    [theme.breakpoints.down(600)]: {
      marginLeft: '1rem',
    }
  },
  label: {
    fontFamily: 'Source Sans Pro',
    fontSize: '0.7571rem',
    lineHeight: '1.071rem',
    color: theme.palette.text.secondary
  },
  value: {
    fontFamily: 'Source Sans Pro',
    fontSize: '0.9rem',
    fontWeight: '600',
    lineHeight: ' 1.286rem',
    color: theme.palette.text.primary
  },
  drag: {
    flexGrow: 1
  }
});

class TopBar extends Component {
  constructor(props) {
    super(props);
    const { currentExchange } = props;

    this.state = {
      anchorEl: null,
      menuOpen: false,
      menuView: '',
      searchFilter: '',
      recentPairs: {
      }
    };

    if (currentExchange) {
      this.state.recentPairs[currentExchange] = [];
    }

    this.lastChangeDir = 0;
    this.lastTickerPrice = 0.0;
  }

  componentWillReceiveProps(nextProps) {
    const nextExchange = nextProps.currentExchange;
    // if exchange changes, change to first market value and clear search
    if (nextExchange !== this.props.currentExchange) {
      const recentPairsState = this.state.recentPairs;
      if (!Object.prototype.hasOwnProperty.call(recentPairsState, nextExchange)) {
        recentPairsState[nextExchange] = [];
        this.setState({
          recentPairs: recentPairsState,
        });
      }
      this.clearSearchFilter();
    }

    if (!Object.keys(this.props.ticker).length && Object.keys(nextProps.ticker).length) {
      this.setState({
        menuView: Object.keys(nextProps.ticker.byMarket)[0],
      });
    }
  }

  setMenuView = (val) => {
    this.setState({
      menuView: val,
    });

    if (this.props.ticker.byMarket) {
      this.props.actions.updateMarket(val);
    }
  };

  setMarketsTableSort = (nextSortType) => {
    const { actions } = this.props;
    actions.setExchangeMarketsSort(nextSortType);
  }

  getPriceData = (priceBySymbol, currentExchange, currentPair) => {
    const pairPrice = priceBySymbol[currentPair][currentExchange].price;
    const { percentChange } = priceBySymbol[currentPair][currentExchange];
    const formattedPairChange = ((!percentChange) || (percentChange >= 0)) ? `+${percentChange.toFixed(3)}%` : `${percentChange.toFixed(3)}%`;
    const pairVolume = priceBySymbol[currentPair][currentExchange].volume24h;
    const pairHigh = priceBySymbol[currentPair][currentExchange].high;
    const pairLow = priceBySymbol[currentPair][currentExchange].low;
    const symbols = currentPair.split('/');
    const market = symbols[symbols.length - 1];

    const { lastChangeDir, lastTickerPrice } = this;
    let changeDir = lastChangeDir;

    if (pairPrice > this.lastTickerPrice) {
      changeDir = 1;
    } else if (pairPrice < lastTickerPrice) {
      changeDir = -1;
    }

    this.lastTickerPrice = pairPrice;
    this.lastChangeDir = changeDir;

    return {
      pairPrice,
      market,
      formattedPairChange,
      pairVolume,
      pairHigh,
      pairLow,
      percentChange,
      changeDir,
    };
  }

  getTableView = (tickerData, currentMarket, currentExchange, selectMenu, recentPairs, searchFilter, sortType, sortOrder, exchangeMarketsData) => {
    if (selectMenu === 'RECENT') {
      const recentTickerData = {};
      recentPairs[currentExchange].forEach((pair) => {
        if (tickerData.bySymbol[pair][currentExchange]) {
          recentTickerData[pair] = tickerData.bySymbol[pair][currentExchange];
        }
      });
      return (
        <MarketsTable
          data={recentTickerData}
          updatePair={this.selectPair}
          exchangeMarketsData={exchangeMarketsData}
          setSort={this.setMarketsTableSort}
          resetSearchFilter={this.clearSearchFilter} />
      );
    }
    return (
      <MarketsTable
        data={tickerData.byMarket[currentMarket]}
        updatePair={this.selectPair}
        searchFilter={searchFilter}
        sortType={sortType}
        sortOrder={sortOrder}
        setSort={this.setMarketsTableSort}
        resetSearchFilter={this.clearSearchFilter}
        sortEnabled
        exchangeMarketsData={exchangeMarketsData} />
    );
  }

  getCurrentMenuView = (menuView, currentMarket, marketData) => {
    if (currentMarket) {
      return currentMarket;
    }
    return menuView === undefined ? Object.keys(marketData)[0] : menuView;
  }

  clearSearchFilter = () => {
    this.setState({
      searchFilter: ''
    });
  }

  handleSearch = (event) => {
    this.setState({
      searchFilter: event.target.value
    });
  }

  selectPair = (pair) => {
    const { currentExchange } = this.props;
    const { recentPairs } = this.state;

    if (recentPairs[currentExchange].includes(pair)) {
      const filtered = recentPairs[currentExchange].filter(current => current !== pair);
      filtered.unshift(pair);
      this.setState({
        ...this.state,
        recentPairs: {
          ...this.state.recentPairs,
          [currentExchange]: filtered
        }
      });
    } else {
      recentPairs[currentExchange].unshift(pair);
    }

    if (recentPairs[currentExchange].length > 50) {
      this.setState({
        ...this.state,
        recentPairs: {
          ...this.state.recentPairs,
          [currentExchange]: recentPairs[currentExchange].slice(0, 50)
        }
      });
    }

    this.setState({
      menuOpen: false
    });
    this.props.actions.updatePair(pair);
  }

  handleSymbolMenuToggle = (event) => {
    const { currentTarget } = event;
    this.setState(state => ({
      anchorEl: currentTarget,
      menuOpen: !state.menuOpen
    }));
  };

  handleSymbolMenuClose = (event) => {
    if (!this.symbolMenu.contains(event.target)) {
      this.setState({
        menuOpen: false
      });
    }
  };

  render() {
    const {
      classes, theme, prefCurrency, currentPair, currentMarket, currentExchange, ticker, exchangeMarketsData, sortType, sortOrder
    } = this.props;

    const {
      anchorEl, menuOpen, menuView, recentPairs, searchFilter
    } = this.state;
    const id = menuOpen ? 'simple-popper' : null;

    const isReadyToLoad = currentExchange
      && Object.keys(ticker).length
      && ticker.bySymbol[currentPair]
      && ticker.bySymbol[currentPair][currentExchange]
      && Object.keys(exchangeMarketsData).length
      && exchangeMarketsData[currentPair];

    if (!isReadyToLoad) {
      return (
        <Grid container alignItems="center" justify="center" className={classes.progressContainer}>
          <PulseLoader className={classes.progress} color="#52B0B0" size={6} loading />
        </Grid>
      );
    }

    const priceData = this.getPriceData(ticker.bySymbol, currentExchange, currentPair);
    const quote = currentPair.split('/')[1];
    return (
      <Grid container
        direction="row"
        justify="flex-start"
        alignItems="stretch"
        className={classes.container}>
        <Grid item>
          <div ref={(node) => {
            this.symbolMenu = node;
          }}
          style={{ height: '100%' }}>
            <ButtonBase
              name="tickerPair"
              className={classes.symbolButton}
              style={{ backgroundColor: menuOpen ? theme.palette.background.default : '' }}
              aria-describedby={id}
              onClick={this.handleSymbolMenuToggle}>
              {currentPair} <Icon>keyboard_arrow_down</Icon>
            </ButtonBase>
          </div>
        </Grid>
        <Popper
          id={id}
          anchorEl={anchorEl}
          placement="bottom-start"
          open={menuOpen}
          style={{ zIndex: '5000' }}>
          <ClickAwayListener onClickAway={this.handleSymbolMenuClose}>
            <Paper square className={classes.symbolMenuPaper} elevation={18}>
              <div className={classes.tabsWrapper}>
                <Hidden smUp>
                  <div className={classes.inputWrapper}>
                    <Input
                      placeholder="Search"
                      classes={{ root: classes.input }}
                      disableUnderline
                      onChange={this.handleSearch} />
                  </div>
                </Hidden>
                <Hidden smDown>
                  <span className={classes.inputWrapper}>
                    <Input
                      placeholder="Search"
                      classes={{ root: classes.input }}
                      disableUnderline
                      onChange={this.handleSearch} />
                  </span>
                </Hidden>
                <NavTabs
                  justify="flex-end"
                  inline
                  value={this.getCurrentMenuView(menuView, currentMarket, ticker.byMarket)}
                  onChange={this.setMenuView}>
                  <NavTab label="Recent" name="recent" value="RECENT" />
                  {
                    Object.keys(ticker.byMarket).map((market) => {
                      return <NavTab key={market} label={market} name={market.toLowerCase()} value={market} />;
                    })
                  }
                </NavTabs>
              </div>
              <Paper square className={classes.symbolMenuContent}>
                {this.getTableView(
                  ticker,
                  currentMarket,
                  currentExchange,
                  menuView,
                  recentPairs,
                  searchFilter,
                  sortType,
                  sortOrder,
                  exchangeMarketsData,
                )}
              </Paper>
            </Paper>
          </ClickAwayListener>
        </Popper>
        <Grid item className={classes.tickerPrice}>
          <span
            style={{ color: getChangeColor(priceData.changeDir, theme) }}>
            { priceData.pairPrice ? <Formatted
              asset={quote}
              amount={parseFloat(priceData.pairPrice)} /> : null }
          </span>
          <ChangeArrow change={priceData.changeDir} />
          { !isMarketPrefCurrency(quote, prefCurrency) &&
            <span className={classes.fiat} >
              <Formatted
                asset={quote}
                amount={parseFloat(priceData.pairPrice)}
                exchange={currentExchange}
                convertToPref />
            </span>
          }
        </Grid>
        <Hidden smDown>
          <Grid item className={classes.col}>
            <div className={classes.label}>24h Change</div>
            <div
              className={classes.value}
              style={{ color: getChangeColor(priceData.percentChange, theme) }}>
              {priceData.formattedPairChange}
            </div>
          </Grid>
        </Hidden>
        <Hidden mdDown>
          <Grid item className={`${classes.col}`}>
            <div className={classes.label}>High</div>
            <div className={classes.value}>
              {priceData.pairHigh ? <Formatted
                asset={quote}
                amount={parseFloat(priceData.pairHigh)} /> : null}
            </div>
          </Grid>
          <Grid item className={`${classes.col}`}>
            <div className={classes.label}>Low</div>
            <div className={classes.value}>
              {priceData.pairLow ? <Formatted
                asset={quote}
                amount={parseFloat(priceData.pairLow)} /> : null}
            </div>
          </Grid>
        </Hidden>
        <Hidden smDown>
          <Grid item className={`${classes.col}`}>
            <div className={classes.label}>24h Volume ({quote})</div>
            <div className={classes.value}>
              {priceData.pairVolume ? <Formatted
                asset={quote}
                abbreviate
                amount={parseFloat(priceData.pairVolume)} /> : null}
            </div>
          </Grid>
        </Hidden>
        <Grid item className={`${classes.col}`}>
          <ButtonBase component={Link} to={`/market/${currentPair.split('/')[0]}`}>
            <TooltipIcon title={`View Profile for ${currentPair.split('/')[0]}`} large />
          </ButtonBase>
        </Grid>
        <Grid item className={`${classes.drag} dragHandle`} />
      </Grid>
    );
  }
}

TopBar.defaultProps = {
  actions: {},
  currentPair: '',
  currentMarket: '',
  currentExchange: '',
  ticker: {},
  exchangeMarketsData: {},
  sortType: '',
  sortOrder: true
};

TopBar.propTypes = {
  actions: PropTypes.objectOf(PropTypes.func),
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  prefCurrency: PropTypes.string.isRequired,
  currentPair: PropTypes.string,
  currentMarket: PropTypes.string,
  currentExchange: PropTypes.string,
  ticker: PropTypes.objectOf(PropTypes.object),
  exchangeMarketsData: PropTypes.objectOf(PropTypes.object),
  sortType: PropTypes.string,
  sortOrder: PropTypes.bool
};


function mapStateToProps(state) {
  return {
    prefCurrency: state.global.user.user.preferences.pref_currency,
    currentPair: state.trade.interactions.currentPair,
    currentMarket: state.trade.interactions.currentMarket,
    currentExchange: state.trade.interactions.currentExchange,
    ticker: state.trade.ticker.ticker,
    exchangeMarketsData: state.trade.markets.exchangeMarketsData,
    sortType: state.trade.markets.sortType,
    sortOrder: state.trade.markets.sortOrder
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: { ...bindActionCreators({ updateMarket, updatePair, setExchangeMarketsSort }, dispatch) }
  };
}

const base = (withTheme()(withStyles(styles)(TopBar)));
export default connect(mapStateToProps, mapDispatchToProps)(base);



// WEBPACK FOOTER //
// ./src/containers/trade/topBar.js