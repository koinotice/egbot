import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import maxBy from 'lodash/maxBy';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import Grid from '@material-ui/core/Grid';
import { GridLoader } from 'react-spinners';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import uuidv4 from '../../utils/uuid';
import { getChangeColor, getPricePrecisionFrom, getAmountPrecisionFrom } from '../../utils/helpers';
import { NavTab, NavTabs } from '../tabs';


const styles = theme => ({
  container: {
    height: 'calc(100% - 40px)',
    overflowY: 'auto',
    overflowX: 'hidden'
  },
  tableRow: {
    height: '1.429rem',
    border: 'none',
    '&:hover': {
      backgroundColor: theme.palette.background.paperDarker
    }
  },
  tableHeaderCell: {
    padding: '5px 0',
    fontSize: '0.8571rem',
    lineHeight: '1.071rem',
    backgroundColor: theme.palette.background.paper,
    position: 'sticky',
    top: 0,
    border: 'none',
  },
  tableCell: {
    padding: 0,
    fontSize: '0.8571rem',
    lineHeight: '1.071rem',
    border: 'none',
    '&:last-child': {
      padding: 0,
    }
  },
  barCell: {
    width: '12%',
    maxWidth: '12%'
  },
  dataCell: {
    width: '24%',
    maxWidth: '24%'
  },
  size: {
    color: theme.palette.text.primary
  },
  priceSell: {
    color: theme.palette.icons.red
  },
  priceBuy: {
    color: theme.palette.icons.green
  },
  time: {
    color: theme.palette.text.secondary
  },
  bar: {
    width: '100%',
    minHeight: '1.429rem',
    height: '100%'
  },
  progressContainer: {
    height: '100%',
  }
});

class TradeHistory extends Component {
  getTableBody = (trades, classes, maxSize, precisions) => {
    return (
      trades.map((d) => {
        const priceClass = d.type === 'BUY' ? classes.priceBuy : classes.priceSell;
        const size = getAmountPrecisionFrom(d.size, precisions);
        const price = getPricePrecisionFrom(d.price, precisions);
        return (
          <TableRow classes={ { root: classes.tableRow } } key={uuidv4()} >
            <TableCell classes={ { root: classes.tableCell } } className={ `${classes.barCell}`}>
              <div
                className={classes.bar}
                style={{
                  backgroundColor: getChangeColor((d.type === 'BUY' ? 1 : -1)),
                  width: (() => {
                    const width = (d.size / maxSize) * 20;
                    if (width < 1) return '0.07143rem';
                    return `${width}px`;
                  })()
                }} />
            </TableCell>
            <TableCell classes={ { root: classes.tableCell } } className={ `${classes.dataCell} ${classes.size}` }>
              {size}
            </TableCell>
            <TableCell classes={ { root: classes.tableCell } } className={ `${classes.dataCell} ${priceClass}` }>
              {price}
            </TableCell>
            <TableCell classes={ { root: classes.tableCell } } className={ `${classes.dataCell} ${classes.time}` }>
              {d.time}
            </TableCell>
          </TableRow>
        );
      })
    );
  }

  calculateMaxSize = (trades) => {
    if (!trades || !trades.length) {
      return 0;
    }
    return maxBy(trades, (o) => { return parseFloat(o.size); }).size;
  };

  render() {
    const {
      classes, tradeStreamData, precisions, isLoaded
    } = this.props;
    const maxSize = this.calculateMaxSize(tradeStreamData);

    if (!isLoaded || !Object.keys(precisions).length) {
      return (
        <Grid container alignItems="center" justify="center" className={classes.progressContainer}>
          <GridLoader className={classes.progress} size={6} color="#52B0B0" loading />
        </Grid>
      );
    }
    return (
      <Fragment>
        <NavTabs onChange={() => {} } disableUnderline>
          <NavTab key="tradeHistory" label="Trade History" value="TRADE_HISTORY" />
        </NavTabs>
        <div className={classes.container}>
          <Table>
            <TableHead>
              <TableRow className={classes.tableRow}>
                <TableCell className={classes.tableHeaderCell} />
                <TableCell className={classes.tableHeaderCell}>Size</TableCell>
                <TableCell className={classes.tableHeaderCell}>Price</TableCell>
                <TableCell className={classes.tableHeaderCell}>Time</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.getTableBody(tradeStreamData, classes, maxSize, precisions)}
            </TableBody>
          </Table>
        </div>
      </Fragment>
    );
  }
}

TradeHistory.defaultProps = {
  tradeStreamData: [],
  isLoaded: false,
  precisions: {},
};

TradeHistory.propTypes = {
  classes: PropTypes.object.isRequired,
  isLoaded: PropTypes.bool,
  tradeStreamData: PropTypes.array,
  precisions: PropTypes.object,
};

function mapStateToProps(state) {
  return {
    tradeStreamData: state.trade.tradeHistory.tradeStreamData,
    isLoaded: state.trade.tradeHistory.isLoaded,
  };
}

const base = withStyles(styles)(TradeHistory);
export default connect(mapStateToProps)(base);



// WEBPACK FOOTER //
// ./src/components/trade/tradeHistory.js