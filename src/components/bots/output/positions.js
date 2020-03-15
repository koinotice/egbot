import React, { Component } from 'react';
import { withStyles } from '@material-ui/core';
import PropTypes from 'prop-types';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import ButtonBase from '@material-ui/core/ButtonBase';
import TableBody from '@material-ui/core/TableBody';
import Grid from '@material-ui/core/Grid';
import AnimateOnChange from 'react-animate-on-change';
import TooltipIcon from '../../common/tooltipIcon';
import CoinIcon from '../../icons/coinIcon';
import { formatAmount, formatCurrency, formatChangePct, getChangeColor } from '../../../utils/helpers';
import EmptyStateCover from '../../common/emptyStateCover';
import { POSITION_TYPES } from '../../../utils/botConstants';


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
    width: '16.67%',
    fontWeight: 'normal',
    borderBottom: `1px solid ${theme.palette.background.paperDarker}`,
    verticalAlign: 'middle',
    '&:first-child': {
      verticalAlign: 'middle',
      textAlign: 'center',
      borderBottom: 'none',
      width: '5%',
    },
    '&:nth-child(2)': {
      verticalAlign: 'middle',
      width: '10%',
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

class Positions extends Component {
  constructor(props) {
    super(props);
    this.oldPrices = {};
  }

  getLastPrice(position) {
    const { ticker } = this.props;
    if (ticker.price) {
      return ticker.price;
    }
    return position.currentPrice;
  }

  getHeader = (classes) => {
    return (
      <TableHead className={classes.tableAssetHeader}>
        <TableRow className={classes.tableRowSticky}>
          <TableCell classes={{ root: `${classes.tableHeadCell} ${classes.tableHeadCellSticky }` }} />
          <TableCell classes={{ root: `${classes.tableHeadCell} ${classes.tableHeadCellSticky }` }}>
            <ButtonBase value="asset" onClick={this.setSortBy}>Pair</ButtonBase>
          </TableCell>
          <TableCell className={classes.cellNumeric} classes={{ root: `${classes.tableHeadCell} ${classes.tableHeadCellSticky}` }}>
            Side
          </TableCell>
          <TableCell className={classes.cellNumeric} classes={{ root: `${classes.tableHeadCell} ${classes.tableHeadCellSticky }` }}>
            <ButtonBase className={classes.cellNumeric} value="rawTotal" onClick={this.setSortBy}>
              Amount
            </ButtonBase>
          </TableCell>
          <TableCell className={classes.cellNumeric} classes={{ root: `${classes.tableHeadCell} ${classes.tableHeadCellSticky }` }}>
            <ButtonBase className={classes.cellNumeric} value="price" onClick={this.setSortBy}>
              Avg&nbsp;Entry&nbsp;Price
              <TooltipIcon
                title="Average cost at which the position was opened (bought/sold)"
                learnMoreLink="https://support.quadency.com/portfolio-and-performance-monitoring/portfolio-overview" />
            </ButtonBase>
          </TableCell>
          <TableCell className={classes.cellNumeric} classes={{ root: `${classes.tableHeadCell} ${classes.tableHeadCellSticky }` }}>
            <ButtonBase className={classes.cellNumeric} value="price" onClick={this.setSortBy}>
              Last&nbsp;Price<TooltipIcon title="Latest price of asset" />
            </ButtonBase>
          </TableCell>
          <TableCell className={classes.cellNumeric} classes={{ root: `${classes.tableHeadCell} ${classes.tableHeadCellSticky }` }}>
            <div>
              <div>
                <ButtonBase className={classes.cellNumeric} value="value" onClick={this.setSortBy}>
                  %PnL
                  <TooltipIcon
                    title="Unrealized percent gain/loss" />
                </ButtonBase>
              </div>
              <div>
                <ButtonBase className={classes.cellNumeric} value="value" onClick={this.setSortBy}>
                  PnL
                  <TooltipIcon
                    title="Unrealized profit/loss ((Last Price * Amount) - (Avg Entry Price * Amount))" />
                </ButtonBase>
              </div>
            </div>
          </TableCell>
        </TableRow>
      </TableHead>
    );
  }

  renderTable = () => {
    const {
      classes, positions, theme
    } = this.props;

    return (
      <Table className={classes.table} name="positionsTable">
        {this.getHeader(classes)}
        <TableBody>
          {positions.map((position) => {
            const [base, quote] = position.pair.split('/');

            const lastPrice = this.getLastPrice(position);
            const animate = !!(this.oldPrices[base] && this.oldPrices[base] !== lastPrice);
            const animationClass = (lastPrice > this.oldPrices[base]) ? animationClassGreen : animationClassRed;
            this.oldPrices[base] = lastPrice;

            const absAmount = Math.abs(position.amount);
            const pnl = (position.type === POSITION_TYPES.SHORT ? -1 : 1) * ((lastPrice * absAmount) - (position.cost_basis * absAmount));

            return (
              <TableRow key={position.pair} name={position.pair}>
                <TableCell className={classes.tableCell}><CoinIcon coin={base.toLowerCase()} /></TableCell>
                <TableCell classes={{ root: classes.tableCell }}>
                  <span className={classes.primaryText}>
                    {position.pair}
                  </span>
                </TableCell>
                {/* side */}
                <TableCell className={classes.cellNumeric} classes={{ root: classes.tableCell }}>
                  <span className={classes.primaryText}>
                    {position.type}
                  </span>
                </TableCell>
                {/* amount */}
                <TableCell className={classes.cellNumeric} classes={{ root: classes.tableCell }} >
                  <span className={classes.primaryText}>
                    {formatAmount(base, Math.abs(position.amount))} {base}
                  </span>
                </TableCell>
                {/* avg entry price */}
                <TableCell className={classes.cellNumeric} classes={{ root: classes.tableCell }}>
                  <div className={classes.primaryText}>{formatCurrency(quote, position.cost_basis)} {quote}</div>
                </TableCell>
                {/* lastPrice */}
                <TableCell className={classes.cellNumeric} classes={{ root: classes.tableCell }}>
                  <AnimateOnChange
                    baseClassName={classes.primaryText}
                    animationClassName={classes[animationClass]}
                    animate={animate}>
                    <div className={classes.primaryText}>{formatCurrency(quote, lastPrice)} {quote}</div>
                  </AnimateOnChange>
                </TableCell>
                <TableCell className={classes.cellNumeric} classes={{ root: classes.tableCell }}>
                  <div
                    className={classes.primaryText}
                    style={{ color: getChangeColor((pnl / (position.cost_basis * absAmount)), theme) }}>
                    {formatChangePct(null, (pnl / (position.cost_basis * absAmount)))}
                  </div>
                  <div className={classes.secondaryText}>{formatCurrency(quote, pnl)} {quote}</div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    );
  }

  render() {
    const { positions, classes } = this.props;
    if (!positions || !positions.length) {
      return (
        <Grid container alignItems="center" justify="center" className={classes.grid}>
          <EmptyStateCover subheading="No Open Positions" icon="empty" iconSmall />
        </Grid>
      );
    }
    return this.renderTable();
  }
}

Positions.defaultProps = {
  ticker: {}
};

Positions.propTypes = {
  classes: PropTypes.object.isRequired,
  positions: PropTypes.array.isRequired,
  theme: PropTypes.object.isRequired,
  ticker: PropTypes.object
};

export default withStyles(styles, { withTheme: true })(Positions);



// WEBPACK FOOTER //
// ./src/components/bots/output/positions.js