import React, { Component } from 'react';
import { GridLoader } from 'react-spinners';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import { withStyles } from '@material-ui/core/styles';
import AnimateOnChange from 'react-animate-on-change';
import PropTypes from 'prop-types';
import { getChangeColor, formatChangePct, formatCurrency, formatAmount } from '../../utils/helpers';
import SparklinesChart from '../common/sparklinesChart';

const animationClassGreen = 'animateChangeGreen';
const animationClassRed = 'animateChangeRed';

const styles = theme => ({
  loaderContainer: {
    height: '42.8571rem'
  },
  hover: {
    '&:hover': {
      cursor: 'pointer'
    }
  },
  table: {
    padding: 'none'
  },
  tableHeader: {
    bacgroundColor: theme.palette.background.default,
    border: 'none',
  },
  tableHeadCell: {
    border: 'none',
    padding: '0 0.4rem 0'
  },
  tableRow: {
    minHeight: '3.7857rem',
    '&:hover': {
      cursor: 'pointer',
      backgroundColor: `${theme.palette.background.paperDarker} !important`
    }
  },
  tableCell: {
    padding: '0.5rem',
    width: '5%',
    borderBottom: `0.0714rem solid ${theme.palette.background.paperDarker}`,
    fontSize: '1rem',
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
    wordWrap: 'nowrap',
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
});

const SORT_BY = {
  EXCHANGE: 'exchange',
  PAIR: 'pair',
  VOLUME: 'volume24hPrefCurrency',
  PRICE: 'pricePrefCurrency',
  CHANGE: 'percentChange'
};
Object.freeze(SORT_BY);

class ProfileMarkets extends Component {
  constructor() {
    super();
    this.oldMarkets = {};

    this.state = {
      sortBy: SORT_BY.VOLUME,
      desc: true
    };
  }

  setSortBy = (sortBy) => {
    if (this.state.sortBy === sortBy) {
      this.setState({
        desc: !this.state.desc
      });
    } else {
      this.setState({ sortBy });
    }
  };

  sortByExchange(markets) {
    const { sortBy, desc } = this.state;
    return Object.keys(markets).sort((a, b) => {
      const exchangeA = markets[a][sortBy].toUpperCase();
      const exchangeB = markets[b][sortBy].toUpperCase();

      if (exchangeA < exchangeB) {
        return desc ? -1 : 1;
      } else if (exchangeA > exchangeB) {
        return desc ? 1 : -1;
      }
      return 0;
    });
  }

  sortByPair(markets) {
    const { sortBy, desc } = this.state;
    return Object.keys(markets).sort((a, b) => {
      const quoteA = markets[a][sortBy].split('/')[1].toUpperCase();
      const quoteB = markets[b][sortBy].split('/')[1].toUpperCase();

      if (quoteA < quoteB) {
        return desc ? -1 : 1;
      } else if (quoteA > quoteB) {
        return desc ? 1 : -1;
      }
      return 0;
    });
  }

  sortByValue(markets) {
    const { sortBy, desc } = this.state;
    return Object.keys(markets).sort((a, b) => {
      return desc ? markets[b][sortBy] - markets[a][sortBy] : markets[a][sortBy] - markets[b][sortBy];
    });
  }

  sortMarkets(markets) {
    const { sortBy } = this.state;
    if (sortBy === SORT_BY.EXCHANGE) {
      return this.sortByExchange(markets);
    } else if (sortBy === SORT_BY.PAIR) {
      return this.sortByPair(markets);
    }
    return this.sortByValue(markets);
  }

  renderLoader() {
    const { classes } = this.props;

    return (
      <Grid container justify="center" alignItems="center" className={classes.loaderContainer}>
        <GridLoader color="#52B0B0" size={6} loading />
      </Grid>
    );
  }

  renderMarkets() {
    const {
      classes, theme, markets, onClickPair, prefCurrency
    } = this.props;

    const sortedMarkets = this.sortMarkets(markets);
    return sortedMarkets.map((market) => {
      const {
        exchange, exchangeLabel, pair, price, volume24h, pricePrefCurrency, volume24hPrefCurrency, percentChange
      } = markets[market];

      let animate = false;
      let animationClass = animationClassGreen;
      if (this.oldMarkets[market] && this.oldMarkets[market].price !== price) {
        animate = true;
        animationClass = this.oldMarkets[market].price > price ? animationClassGreen : animationClassRed;
      }
      this.oldMarkets[market] = markets[market];
      const quote = pair.split('/')[1];
      return (
        <TableRow
          className={classes.tableRow}
          key={market}
          onClick={() => onClickPair(exchange, pair)}>
          <TableCell classes={{ root: classes.tableCell }}>{exchangeLabel}</TableCell>
          <TableCell classes={{ root: classes.tableCell }}>{pair}</TableCell>
          <TableCell classes={{ root: classes.tableCell }}>
            {formatCurrency(prefCurrency, volume24hPrefCurrency, true)}
            <Typography color="textSecondary">{formatAmount(null, volume24h, true)} {quote}</Typography>
          </TableCell>
          <TableCell classes={{ root: classes.tableCell }}>
            <AnimateOnChange animationClassName={classes[animationClass]} animate={animate}>
              {formatCurrency(prefCurrency, pricePrefCurrency)}
            </AnimateOnChange>
            <Typography color="textSecondary">{formatAmount(null, price)} {quote}</Typography>
          </TableCell>
          <TableCell
            classes={{ root: classes.tableCell }}
            style={{ color: getChangeColor(percentChange, theme) }} >
            {formatChangePct(null, percentChange)}
          </TableCell>
          <TableCell classes={{ root: classes.tableCell }}>
            <SparklinesChart
              margin="0 1rem"
              pair={pair}
              change={percentChange} />
          </TableCell>
        </TableRow>
      );
    });
  }

  render() {
    const { classes, marketsLoaded, prefCurrency } = this.props;

    if (!marketsLoaded) {
      return this.renderLoader();
    }

    return (
      <Table className={classes.table}>
        <TableHead classes={{ root: classes.tableHeader }}>
          <TableRow>
            <TableCell classes={{ root: classes.tableHeadCell }} className={classes.hover} onClick={() => this.setSortBy(SORT_BY.EXCHANGE)}>Exchange</TableCell>
            <TableCell classes={{ root: classes.tableHeadCell }} className={classes.hover} onClick={() => this.setSortBy(SORT_BY.PAIR)}>Market</TableCell>
            <TableCell classes={{ root: classes.tableHeadCell }} className={classes.hover} onClick={() => this.setSortBy(SORT_BY.VOLUME)}>
              <div>24h Volume ({prefCurrency})</div>
              <div>24h Volume (Quote)</div>
            </TableCell>
            <TableCell classes={{ root: classes.tableHeadCell }} className={classes.hover} onClick={() => this.setSortBy(SORT_BY.PRICE)}>
              <div>Last Price ({prefCurrency})</div>
              <div>Last Price (Quote)</div>
            </TableCell>
            <TableCell classes={{ root: classes.tableHeadCell }} className={classes.hover} onClick={() => this.setSortBy(SORT_BY.CHANGE)}>24h % Change</TableCell>
            <TableCell classes={{ root: classes.tableHeadCell }} style={{ textAlign: 'center' }}>Chart (24h)</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {this.renderMarkets()}
        </TableBody>
      </Table>
    );
  }
}

ProfileMarkets.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  markets: PropTypes.object.isRequired,
  marketsLoaded: PropTypes.bool.isRequired,
  onClickPair: PropTypes.func.isRequired,
  prefCurrency: PropTypes.string.isRequired
};

export default withStyles(styles, { withTheme: true })(ProfileMarkets);



// WEBPACK FOOTER //
// ./src/components/coins/profileMarkets.js