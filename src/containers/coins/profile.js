import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { GridLoader } from 'react-spinners';
import { withStyles } from '@material-ui/core/styles';
import withWidth, { isWidthDown } from '@material-ui/core/withWidth';
import Grid from '@material-ui/core/Grid';
import PropTypes from 'prop-types';
import ProfileSummary from '../../components/coins/profileSummary';
import ProfileCoinBar from '../../components/coins/profileCoinBar';
import { initCoinOverview, clearCoinOverview, updateChartTimeFrame, updateChartQuote } from '../../store/ducks/coins/overview';
import { fetchMarketsForCoin, clearMarketsForCoin } from '../../store/ducks/coins/markets';
import { fetchNewsForCoin, clearNewsForCoin } from '../../store/ducks/coins/news';
import { updateExchange, updatePair } from '../../store/ducks/trade/interactions';
import { fetchProfileSummary, resetProfileSummary } from '../../store/ducks/coins/summary';
import { NavTab, NavTabs } from '../../components/tabs';
import ProfileOverview from '../../components/coins/profileOverview';
import ProfileMarkets from '../../components/coins/profileMarkets';
import ProfileNews from '../../components/coins/profileNews';
import ProfileHoldings from '../../components/coins/profileHoldings';
import { getSessionToken } from '../../utils/token';


const styles = theme => ({
  root: {
    flexGrow: 1,
    padding: '0.5714rem',
    marginTop: '4.2857rem'
  },
  mt30: {
    marginTop: '2.1429rem'
  },
  container: {
    [theme.breakpoints.down('sm')]: {
      padding: '1.0714rem'
    }
  },
  mt60: {
    marginTop: '2.1429rem'
  },
  loaderContainer: {
    height: '42.8571rem'
  }
});

const TABS = {
  OVERVIEW: 'OVERVIEW',
  MARKETS: 'MARKETS',
  NEWS: 'NEWS',
  MY_HOLDINGS: 'MY_HOLDINGS'
};
Object.freeze(TABS);

class Profile extends Component {
  constructor() {
    super();

    this.state = {
      currentTab: TABS.OVERVIEW
    };
  }

  componentDidMount() {
    const { match, actions } = this.props;
    window.scrollTo(0, 0);
    actions.initCoinOverview(match.params.symbol);
    actions.fetchProfileSummary(match.params.symbol);
    actions.fetchMarketsForCoin(match.params.symbol);
    actions.fetchNewsForCoin(match.params.symbol);
  }

  componentWillUnmount() {
    const { actions } = this.props;
    actions.clearCoinOverview();
    actions.resetProfileSummary();
    actions.clearMarketsForCoin();
    actions.clearNewsForCoin();
  }

  onSelectPair = (exchange, pair) => {
    const { history, actions } = this.props;
    actions.updateExchange(exchange);
    actions.updatePair(pair);
    history.push('/trade');
  };

  setCurrentTab = (val) => {
    this.setState({
      currentTab: val
    });
  };

  updateChartTimeFrame = (e, timeframe) => {
    const { match, actions } = this.props;
    actions.updateChartTimeFrame(match.params.symbol, timeframe);
  };

  updateChartQuote = (e) => {
    const { actions } = this.props;
    actions.updateChartQuote(e.target.value);
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
    const { classes } = this.props;
    return (
      <Grid container justify="center" alignItems="center" className={classes.loaderContainer}>
        <GridLoader color="#52B0B0" size={6} loading />
      </Grid>
    );
  }

  renderSelectedTab(tab) {
    const {
      match, stats, chart, chartLoaded, prefCurrency, markets, marketsLoaded, news, newsLoaded, chartTimeFrame, chartMarkets, chartQuote
    } = this.props;
    switch (tab) {
      case TABS.OVERVIEW:
        return (
          <ProfileOverview
            symbol={match.params.symbol}
            name={stats.name}
            rank={stats.rank}
            marketCap={stats.marketCap}
            circulatingSupply={stats.circulatingSupply}
            y2050={stats.y2050}
            allTimeHigh={stats.allTimeHigh}
            roi={stats.roi}
            chart={chart}
            chartMarkets={chartMarkets}
            chartQuote={chartQuote}
            chartTimeFrame={chartTimeFrame}
            chartLoaded={chartLoaded}
            updateChartTimeFrame={this.updateChartTimeFrame}
            updateChartQuote={this.updateChartQuote}
            background={stats.background}
            prefCurrency={prefCurrency} />
        );
      case TABS.MARKETS:
        return (
          <ProfileMarkets
            markets={markets}
            marketsLoaded={marketsLoaded}
            onClickPair={this.onSelectPair}
            prefCurrency={prefCurrency} />
        );
      case TABS.NEWS:
        return (
          <ProfileNews
            news={news}
            newsLoaded={newsLoaded} />
        );
      case TABS.MY_HOLDINGS:
        return (
          <ProfileHoldings symbol={match.params.symbol} />
        );
      default:
        break;
    }
  }

  render() {
    const {
      prefCurrency, match, stats, classes, coinsLoaded, statsLoaded, width, profileAvgPrice, profileChange24h, profilePercentChange, profileVolume24h
    } = this.props;

    const { currentTab } = this.state;

    if (!coinsLoaded || !statsLoaded) {
      return this.renderWithRoot((
        <Fragment>
          {this.renderLoader()};
        </Fragment>
      ));
    }

    return this.renderWithRoot((
      <Grid container className={classes.container} justify="center" spacing={16}>
        <Grid item xs={12} md={10}>
          <ProfileSummary
            avgPrice={profileAvgPrice}
            change24h={profileChange24h}
            percentChange={profilePercentChange}
            volume24h={profileVolume24h}
            prefCurrency={prefCurrency} />
        </Grid>
        <Grid className={classes.mt30} item xs={12} md={10}>
          <ProfileCoinBar symbol={match.params.symbol} name={stats.name} tagline={stats.tagline} overview={stats.overview} />
        </Grid>
        <Grid className={classes.mt30} item xs={12} md={10}>
          <NavTabs value={currentTab} onChange={this.setCurrentTab} large={!isWidthDown('xs', width)} activeDark>
            <NavTab label="Overview" value={TABS.OVERVIEW} />
            <NavTab label="Markets" value={TABS.MARKETS} />
            <NavTab label="News" value={TABS.NEWS} />
            {getSessionToken() &&
              <NavTab label="My Holdings" value={TABS.MY_HOLDINGS} />
            }
          </NavTabs>
        </Grid>
        <Grid className={classes.mt30} item xs={12} md={10}>
          {this.renderSelectedTab(currentTab)}
        </Grid>
      </Grid>
    ));
  }
}

function mapStateToProps(state) {
  return {
    stats: state.coins.overview.stats,
    chart: state.coins.overview.chart,
    coinsLoaded: state.coins.coins.coinsLoaded,
    profileAvgPrice: state.coins.summary.profileAvgPrice,
    profileChange24h: state.coins.summary.profileChange24h,
    profilePercentChange: state.coins.summary.profilePercentChange,
    profileVolume24h: state.coins.summary.profileVolume24h,
    statsLoaded: state.coins.overview.statsLoaded,
    chartLoaded: state.coins.overview.chartLoaded,
    markets: state.coins.markets.markets,
    marketsLoaded: state.coins.markets.marketsLoaded,
    news: state.coins.news.news,
    newsLoaded: state.coins.news.newsLoaded,
    prefCurrency: state.global.user.user.preferences.pref_currency,
    chartTimeFrame: state.coins.overview.chartTimeFrame,
    chartMarkets: state.coins.overview.chartMarkets,
    chartQuote: state.coins.overview.chartQuote
  };
}

Profile.propTypes = {
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  stats: PropTypes.object.isRequired,
  chart: PropTypes.array.isRequired,
  coinsLoaded: PropTypes.bool.isRequired,
  statsLoaded: PropTypes.bool.isRequired,
  chartLoaded: PropTypes.bool.isRequired,
  markets: PropTypes.object.isRequired,
  marketsLoaded: PropTypes.bool.isRequired,
  news: PropTypes.array.isRequired,
  newsLoaded: PropTypes.bool.isRequired,
  prefCurrency: PropTypes.string.isRequired,
  width: PropTypes.string.isRequired,
  chartMarkets: PropTypes.array.isRequired,
  chartTimeFrame: PropTypes.object.isRequired,
  chartQuote: PropTypes.string.isRequired,
  profileAvgPrice: PropTypes.number,
  profileChange24h: PropTypes.number,
  profilePercentChange: PropTypes.number,
  profileVolume24h: PropTypes.number,
};

Profile.defaultProps = {
  profileAvgPrice: 0,
  profileChange24h: 0,
  profilePercentChange: 0,
  profileVolume24h: 0,
};

function mapDispatchToProps(dispatcher) {
  return {
    actions: {
      ...bindActionCreators({
        initCoinOverview,
        clearCoinOverview,
        fetchMarketsForCoin,
        clearMarketsForCoin,
        fetchNewsForCoin,
        clearNewsForCoin,
        updateExchange,
        updatePair,
        updateChartTimeFrame,
        updateChartQuote,
        fetchProfileSummary,
        resetProfileSummary
      }, dispatcher)
    }
  };
}

const base = withStyles(styles, { withTheme: true })(withWidth()(Profile));
export default connect(mapStateToProps, mapDispatchToProps)(base);



// WEBPACK FOOTER //
// ./src/containers/coins/profile.js