import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withStyles, withTheme } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import PropTypes from 'prop-types';
import { GridLoader } from 'react-spinners';
import debounce from 'lodash/debounce';
import CoinsTable from '../../components/coins/coinsTable';
import CoinsSummary from '../../components/coins/coinsSummary';
import Search from '../../components/common/search';
import { fetchNextPage, fetchPrevPage, fetchFirstPage, fetchLastPage, fetchAndSortBy, searchCoins } from '../../store/ducks/coins/table';

const styles = theme => ({
  root: {
    flexGrow: 1,
    padding: '8px',
    marginTop: '60px'
  },
  paper: {
    padding: '12px 24px',
    color: theme.palette.text.secondary,
    boxShadow: 'none',
  },
  defaultBackground: {
    backgroundColor: theme.palette.background.default
  }
});

class Coins extends Component {
  constructor() {
    super();

    this.state = {
      searchTerm: ''
    };
  }

  componentDidMount() {
    const { actions, search } = this.props;
    this.initializeSearchTerm(search);
    this.debouncedSearchCoins = debounce(actions.searchCoins, 500);
  }

  setSearch = (value) => {
    this.setState({
      searchTerm: value
    });
    this.debouncedSearchCoins(value);
  };

  initializeSearchTerm(searchTerm) {
    this.setState({
      searchTerm
    });
  }

  viewCoinProfile = (symbol) => {
    const { history } = this.props;
    history.push(`/market/${symbol}`);
  };

  renderWithRoot(component) {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        {component}
      </div>
    );
  }

  renderLoader() {
    return (
      <Grid container alignItems="center" justify="center">
        <GridLoader color="#52B0B0" size={6} loading />
      </Grid>
    );
  }

  render() {
    const {
      coins,
      coinsLoaded,
      globalTotalMarketCap,
      globalChange,
      globalPercentChange,
      globalVolume24h,
      globalBtcDom,
      globalNumCoins,
      globalSummaryLoaded,
      offset,
      actions,
      classes,
      search,
      prefCurrency,
      prices,
      pricesLoaded
    } = this.props;
    const { searchTerm } = this.state;

    return this.renderWithRoot((
      <Grid container justify="center" spacing={16}>
        <Grid item xs={12} md={10}>
          { globalSummaryLoaded ?
            <CoinsSummary
              totalMarketCap={globalTotalMarketCap}
              change={globalChange}
              percentChange={globalPercentChange}
              volume24h={globalVolume24h}
              btcDom={globalBtcDom}
              prefCurrency={prefCurrency} />
            :
            this.renderLoader() }
        </Grid>
        <Grid item xs={12} md={10}>
          <Paper square className={classes.paper}>
            <Search
              heading="Market Overview"
              placeholder="Search Coins"
              value={searchTerm}
              onChange={this.setSearch} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={10}>
          <Paper square className={`${classes.paper} ${classes.defaultBackground}`}>
            { coinsLoaded && pricesLoaded ?
              <CoinsTable
                coins={coins}
                numCoins={parseInt(globalNumCoins, 10)}
                offset={offset}
                nextPage={actions.fetchNextPage}
                prevPage={actions.fetchPrevPage}
                firstPage={actions.fetchFirstPage}
                lastPage={actions.fetchLastPage}
                sortBy={actions.fetchAndSortBy}
                search={search}
                prefCurrency={prefCurrency}
                prices={prices}
                onCoinClick={this.viewCoinProfile} />
              :
              this.renderLoader() }
          </Paper>
        </Grid>
      </Grid>
    ));
  }
}

Coins.defaultProps = {
  offset: null,
  coinsLoaded: false,
  search: '',
  globalTotalMarketCap: 0,
  globalChange: 0,
  globalPercentChange: 0,
  globalVolume24h: 0,
  globalBtcDom: 0,
  globalNumCoins: 0,
};

Coins.propTypes = {
  classes: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  coins: PropTypes.array.isRequired,
  coinsLoaded: PropTypes.bool,
  globalTotalMarketCap: PropTypes.number,
  globalChange: PropTypes.number,
  globalPercentChange: PropTypes.number,
  globalVolume24h: PropTypes.number,
  globalBtcDom: PropTypes.number,
  globalNumCoins: PropTypes.number,
  globalSummaryLoaded: PropTypes.bool.isRequired,
  offset: PropTypes.number,
  search: PropTypes.string,
  prefCurrency: PropTypes.string.isRequired,
  prices: PropTypes.object.isRequired,
  pricesLoaded: PropTypes.bool.isRequired,
  history: PropTypes.object.isRequired
};

function mapStateToProps(state) {
  return {
    coins: state.coins.coins.coins,
    coinsLoaded: state.coins.coins.coinsLoaded,
    globalTotalMarketCap: state.coins.summary.globalTotalMarketCap,
    globalChange: state.coins.summary.globalChange,
    globalPercentChange: state.coins.summary.globalPercentChange,
    globalVolume24h: state.coins.summary.globalVolume24h,
    globalBtcDom: state.coins.summary.globalBtcDom,
    globalNumCoins: state.coins.summary.globalNumCoins,
    globalSummaryLoaded: state.coins.summary.globalSummaryLoaded,
    offset: state.coins.table.offset,
    search: state.coins.table.search,
    prefCurrency: state.global.user.user.preferences.pref_currency,
    prices: state.global.prices.prices,
    pricesLoaded: state.global.prices.pricesLoaded
  };
}

function mapDispatchToProps(dispatcher) {
  return {
    actions: {
      ...bindActionCreators({
        fetchNextPage,
        fetchPrevPage,
        fetchFirstPage,
        fetchLastPage,
        fetchAndSortBy,
        searchCoins,
      }, dispatcher)
    }
  };
}

const base = withStyles(styles)(withTheme()(Coins));
export default connect(mapStateToProps, mapDispatchToProps)(base);



// WEBPACK FOOTER //
// ./src/containers/coins/coins.js