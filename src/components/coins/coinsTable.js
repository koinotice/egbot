import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableFooter from '@material-ui/core/TableFooter';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import ButtonBase from '@material-ui/core/ButtonBase';
import Hidden from '@material-ui/core/Hidden';
import { withStyles, withTheme } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import CoinRow from './coinRow';
import Pagination from '../tables/pagination';
import { MAX_COINS_PER_PAGE } from '../../store/ducks/coins/table';
import { getPairForSparkline } from '../../utils/helpers';

const styles = theme => ({
  table: {
    padding: 'none'
  },
  tableHeader: {
    bacgroundColor: theme.palette.background.default,
    border: 'none',
  },
  tableHeadCell: {
    border: 'none',
    padding: '0 0.4rem 0',
    '&:first-child': {
      textAlign: 'center'
    }
  },
  cellNumeric: {
    textAlign: 'right'
  },
  noCoinsText: {
    color: theme.palette.text.secondary,
    fontStyle: 'italic',
    margin: '1.5rem 0'
  },
});

class CoinsTable extends Component {
  constructor() {
    super();
    this.state = {
      page: 0
    };
  }

  componentWillReceiveProps(nextProps) {
    const page = nextProps.offset / MAX_COINS_PER_PAGE;
    if (this.state.page !== page) {
      this.setState({
        page
      });
    }
  }

  renderHeader() {
    const { classes, sortBy, prefCurrency } = this.props;

    return (
      <TableHead classes={{ root: classes.tableHeader }}>
        <TableRow>
          <TableCell classes={{ root: classes.tableHeadCell }}>
            <ButtonBase onClick={() => sortBy('rank')}>Rank</ButtonBase>
          </TableCell>
          <TableCell classes={{ root: classes.tableHeadCell }} />
          <TableCell classes={{ root: classes.tableHeadCell }}>
            <ButtonBase onClick={() => sortBy('name')}>Name</ButtonBase>
          </TableCell>
          <Hidden xsDown>
            <TableCell className={classes.cellNumeric} classes={{ root: classes.tableHeadCell }}>
              <ButtonBase onClick={() => sortBy('marketCap')}>Market Cap ({prefCurrency})</ButtonBase>
            </TableCell>
          </Hidden>
          <Hidden xsDown>
            <TableCell className={classes.cellNumeric} classes={{ root: classes.tableHeadCell }}>
              <ButtonBase onClick={() => sortBy('circulatingSupply')}>Circulating Supply</ButtonBase>
            </TableCell>
          </Hidden>
          <Hidden smDown>
            <TableCell className={classes.cellNumeric} classes={{ root: classes.tableHeadCell }}>
              <ButtonBase onClick={() => sortBy('volume24Hr')}>24h Volume</ButtonBase>
            </TableCell>
          </Hidden>
          <TableCell className={classes.cellNumeric} classes={{ root: classes.tableHeadCell }}>
            <ButtonBase onClick={() => sortBy('price')}>Avg Price<br /> Change</ButtonBase>
          </TableCell>
          <Hidden smDown>
            <TableCell className={classes.cellNumeric} classes={{ root: classes.tableHeadCell }} style={{ textAlign: 'center' }}>
              <ButtonBase onClick={() => sortBy('percentChange24Hr')}>24h % Change</ButtonBase>
            </TableCell>
          </Hidden>
          <Hidden smDown>
            <TableCell className={classes.cellNumeric} classes={{ root: classes.tableHeadCell }} style={{ textAlign: 'center' }}>
              Chart (24 Hr)
            </TableCell>
          </Hidden>
        </TableRow>
      </TableHead>
    );
  }

  renderBody() {
    const {
      coins, prefCurrency, prices, onCoinClick
    } = this.props;

    return (
      <TableBody>
        {coins.map(coin => (
          <CoinRow
            key={coin.name}
            name={coin.name}
            rank={coin.rank}
            symbol={coin.symbol}
            marketCap={coin.marketCap}
            price={coin.price}
            circulatingSupply={coin.circulatingSupply}
            volume24Hr={coin.volume24Hr}
            change24Hr={coin.change24Hr}
            changePercent24Hr={coin.changePercent24Hr}
            prefCurrency={prefCurrency}
            sparklinePair={getPairForSparkline(coin.symbol, prefCurrency, prices)}
            onClick={onCoinClick} />
        ))}
      </TableBody>
    );
  }

  renderFooter() {
    const {
      numCoins,
      prevPage,
      nextPage,
      firstPage,
      lastPage
    } = this.props;
    const { page } = this.state;

    return (
      <TableFooter>
        <TableRow>
          <Pagination
            onChangePage={() => {
              window.scrollTo(0, 0);
            }}
            count={numCoins}
            page={page}
            rowsPerPage={MAX_COINS_PER_PAGE}
            rowsPerPageOptions={[MAX_COINS_PER_PAGE]}
            prevPageHandler={prevPage}
            nextPageHandler={nextPage}
            firstPageHandler={firstPage}
            lastPageHandler={lastPage} />
        </TableRow>
      </TableFooter>
    );
  }

  render() {
    const { classes, search, coins } = this.props;

    if (coins.length === 0) {
      return (
        <Grid container alignItems="center" justify="center">
          <Typography className={classes.noCoinsText}>No Coins</Typography>
        </Grid>
      );
    }

    return (
      <Table className={classes.table}>
        { this.renderHeader() }
        { this.renderBody() }
        { search.length === 0 && this.renderFooter() }
      </Table>
    );
  }
}

CoinsTable.defaultProps = {
  offset: null
};

CoinsTable.propTypes = {
  classes: PropTypes.object.isRequired,
  coins: PropTypes.array.isRequired,
  prevPage: PropTypes.func.isRequired,
  nextPage: PropTypes.func.isRequired,
  firstPage: PropTypes.func.isRequired,
  lastPage: PropTypes.func.isRequired,
  sortBy: PropTypes.func.isRequired,
  numCoins: PropTypes.number.isRequired,
  offset: PropTypes.number,
  search: PropTypes.string.isRequired,
  prefCurrency: PropTypes.string.isRequired,
  prices: PropTypes.object.isRequired,
  onCoinClick: PropTypes.func.isRequired,
};

export default withStyles(styles)(withTheme()(CoinsTable));



// WEBPACK FOOTER //
// ./src/components/coins/coinsTable.js