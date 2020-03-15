import React from 'react';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import uuidv4 from '../../../utils/uuid';
import CoinIcon from '../../icons/coinIcon';
import { epochMsToDateTime } from '../../../utils/time';
import { getChangeColor, formatAmount, formatCurrency } from '../../../utils/helpers';
import EmptyStateCover from '../../common/emptyStateCover';

const NUM_COLUMNS = 6;
const COLUMN_WIDTH = 100 / NUM_COLUMNS;

const styles = theme => ({
  container: {
    maxHeight: '35.7143rem',
    overflowY: 'auto',
    overflowX: 'hidden',
  },
  table: {
    padding: 0,
    tableLayout: 'fixed',
    maxWidth: '100%',
    overflowX: 'hidden',
    border: 'none',
  },
  tableHeaderCell: {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    position: 'sticky',
    top: 0,
    border: 'none',
    padding: '0.5rem',
    width: `${COLUMN_WIDTH}%`,
    '&:first-child': {
      width: '52px',
      border: 'none',
    },
    '&:last-child': {
      paddingRight: '1rem',
      textAlign: 'center'
    }
  },
  tableRow: {
    height: '2rem',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: `${theme.palette.background.paperDarker} !important`,
    }
  },
  tableCell: {
    borderBottom: `1px solid ${theme.palette.background.paperDarker}`,
    fontWeight: 'normal',
    fontSize: '1rem',
    padding: '0.5rem',
    verticalAlign: 'top',
    width: `${COLUMN_WIDTH}%`,
    '&:first-child': {
      width: '52px',
      paddingLeft: '1rem',
      textAlign: 'center',
    },
    '&:last-child': {
      paddingRight: '1rem',
      textAlign: 'center'
    }
  },
  primaryText: {
    fontSize: '1rem',
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
    wordWrap: 'nowrap',
  },
  secondaryText: {
    fontSize: '0.8571rem',
    color: theme.palette.text.secondary,
    fontWeight: 'normal',
  }
});

const Trades = ({ classes, data, theme }) => {
  if (!data || !data.length) {
    return (
      <Grid container alignItems="center" justify="center" className={classes.grid}>
        <EmptyStateCover subheading="No Trades" icon="empty" iconSmall />
      </Grid>
    );
  }

  return (
    <div className={classes.container}>
      <Table className={classes.table}>
        <TableHead>
          <TableRow className={classes.tableRow}>
            <TableCell className={classes.tableHeaderCell} />
            <TableCell className={classes.tableHeaderCell}>Pair/Account</TableCell>
            <TableCell className={classes.tableHeaderCell}>Side</TableCell>
            <TableCell className={classes.tableHeaderCell}>Amount</TableCell>
            <TableCell className={classes.tableHeaderCell}>Price/Fee</TableCell>
            <TableCell className={classes.tableHeaderCell}>Total</TableCell>
            <TableCell className={classes.tableHeaderCell}>Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data
            .sort((a, b) => b.ts - a.ts)
            .map((trade) => {
              const [base, quote] = trade.pair.split('/');
              return (
                <TableRow
                  key={uuidv4()}
                  className={classes.tableRow}>
                  <TableCell className={classes.tableCell}><CoinIcon coin={base.toLowerCase()} /></TableCell>
                  <TableCell className={classes.tableCell}>
                    <span className={classes.primaryText}>{trade.pair}</span>
                  </TableCell>
                  <TableCell className={classes.tableCell}>
                    <span
                      className={classes.primaryText}
                      style={{ color: getChangeColor(trade.side === 'BUY' ? 1 : -1, theme) }}>
                      {trade.side}
                    </span>
                  </TableCell>
                  <TableCell className={classes.tableCell}>
                    <span className={classes.primaryText}>
                      {formatAmount(base, trade.amount)} {base}
                    </span>
                  </TableCell>
                  <TableCell className={classes.tableCell}>
                    <span className={classes.primaryText}>
                      <span className={classes.primaryText}>{formatCurrency(quote, trade.price)} {quote}</span>
                      <br />
                      <span
                        className={classes.secondaryText}>{formatCurrency(trade.fee_currency, trade.fee)} {trade.fee_currency}
                      </span>
                    </span>
                  </TableCell>
                  <TableCell className={classes.tableCell}>
                    <span className={classes.primaryText}>
                      {formatCurrency(quote, ((trade.amount * trade.price)))} {quote}
                    </span>
                  </TableCell>
                  <TableCell className={classes.tableCell}>
                    <span className={classes.secondaryText}>{epochMsToDateTime(trade.ts)}</span>
                  </TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
    </div>
  );
};

Trades.defaultProps = {
  data: []
};

Trades.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  data: PropTypes.array
};

export default withStyles(styles, { withTheme: true })(Trades);



// WEBPACK FOOTER //
// ./src/components/bots/output/trades.js