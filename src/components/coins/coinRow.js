import React, { Component } from 'react';
import { withStyles, withTheme } from '@material-ui/core/styles';
import Hidden from '@material-ui/core/Hidden';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import PropTypes from 'prop-types';
import AnimateOnChange from 'react-animate-on-change';
import { formatCurrency, formatAmount, ellipsize, getChangeColor, formatChangePct } from '../../utils/helpers';
import CoinIcon from '../icons/coinIcon';
import SparklinesChart from '../common/sparklinesChart';

const animationClassGreen = 'animateChangeGreen';
const animationClassRed = 'animateChangeRed';

const styles = theme => ({
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
    fontWeight: 'normal'
  },
  tableRow: {
    '&:hover': {
      cursor: 'pointer',
      backgroundColor: `${theme.palette.background.paperDarker} !important`
    }
  },
  tableCell: {
    padding: '0.5rem',
    width: '10%',
    fontWeight: 'normal',
    borderBottom: `1px solid ${theme.palette.background.paperDarker}`,
    verticalAlign: 'top',
    '&:first-child': {
      textAlign: 'center',
      verticalAlign: 'middle',
      width: '3%',
    },
    '&:nth-child(2)': {
      textAlign: 'right',
      width: '5%',
    },
    '&:lastChild': {
      width: '7%',
      verticalAlign: 'middle',
    }
  },
  cellNumeric: {
    textAlign: 'right'
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
  }
});

class CoinRow extends Component {
  constructor(props) {
    super(props);
    this.oldPrice = 0;
  }

  shouldComponentUpdate(nextProps) {
    return (
      this.props.price !== nextProps.price ||
      this.props.prefCurrency !== nextProps.prefCurrency ||
      this.props.theme.palette.type !== nextProps.theme.palette.type
    );
  }

  render() {
    const {
      name,
      symbol,
      rank,
      marketCap,
      price,
      circulatingSupply,
      volume24Hr,
      change24Hr,
      changePercent24Hr,
      classes,
      theme,
      prefCurrency,
      sparklinePair,
      onClick
    } = this.props;

    let animate = false;
    let animationClass = animationClassGreen;

    if (this.oldPrice && this.oldPrice !== price) {
      animate = true;
      animationClass = (price > this.oldPrice) ? animationClassGreen : animationClassRed;
    }

    this.oldPrice = price;
    return (
      <TableRow
        className={classes.tableRow}
        onClick={() => onClick(symbol)}
        hover>
        <TableCell classes={{ root: classes.tableCell }}>
          <span className={classes.primaryTextLarger}>
            {rank}
          </span>
        </TableCell>
        <TableCell classes={{ root: classes.tableCell }}><CoinIcon coin={symbol.toLowerCase()} /></TableCell>
        <TableCell classes={{ root: classes.tableCell }}>
          <div>
            <span className={classes.primaryTextLarger} >{ ellipsize(name, 16) }</span><br />
            <span className={classes.secondaryText}>{symbol}</span>
          </div>
        </TableCell>
        <Hidden xsDown>
          <TableCell className={classes.cellNumeric} classes={{ root: classes.tableCell }}>
            <AnimateOnChange
              baseClassName={classes.primaryText}
              animationClassName={classes[animationClass]}
              animate={animate}>
              {marketCap ? formatCurrency(prefCurrency, marketCap, true) : '-'}
            </AnimateOnChange>
          </TableCell>
        </Hidden>
        <Hidden xsDown>
          <TableCell className={classes.cellNumeric} classes={{ root: classes.tableCell }}>
            {circulatingSupply ?
              <div>
                <span className={classes.primaryText}>{formatAmount(symbol, circulatingSupply, true)}</span>
                <span className={classes.secondaryText}> {symbol}</span>
              </div>
              : '-'
            }
          </TableCell>
        </Hidden>
        <Hidden smDown>
          <TableCell className={classes.cellNumeric} classes={{ root: classes.tableCell }}>
            <span className={classes.primaryText}>{volume24Hr ? formatCurrency(prefCurrency, volume24Hr, true) : '-'}</span>
          </TableCell>
        </Hidden>
        <TableCell className={classes.cellNumeric} classes={{ root: classes.tableCell }}>
          <AnimateOnChange
            baseClassName={classes.primaryTextLarger}
            animationClassName={classes[animationClass]}
            animate={animate}>
            {price ? formatCurrency(prefCurrency, price) : '-'}
          </AnimateOnChange>
          <div className={classes.secondaryText}>
            {changePercent24Hr !== 0 && changePercent24Hr !== Infinity ? formatCurrency(prefCurrency, change24Hr) : '-' }
          </div>
        </TableCell>
        <Hidden smDown>
          <TableCell classes={{ root: classes.tableCell }} style={{ textAlign: 'center', verticalAlign: 'middle' }}>
            <div
              style={{ color: changePercent24Hr ? getChangeColor(changePercent24Hr, theme) : 'inherit' }}
              className={classes.primaryTextLarger}>
              {changePercent24Hr !== 0 && changePercent24Hr !== Infinity ? formatChangePct(prefCurrency, changePercent24Hr) : '-'}
            </div>
          </TableCell>
        </Hidden>
        <Hidden smDown>
          <TableCell classes={{ root: classes.tableCell }} style={{ textAlign: 'center', verticalAlign: 'middle' }}>
            {sparklinePair ?
              <SparklinesChart margin="0 1rem" pair={sparklinePair} change={change24Hr} />
              : '-'
            }
          </TableCell>
        </Hidden>
      </TableRow>
    );
  }
}

CoinRow.defaultProps = {
  rank: 0,
  marketCap: 0,
  price: 0,
  circulatingSupply: 0,
  volume24Hr: 0,
  change24Hr: 0,
  changePercent24Hr: 0,
  sparklinePair: '',
  onClick: () => {}
};

CoinRow.propTypes = {
  name: PropTypes.string.isRequired,
  symbol: PropTypes.string.isRequired,
  rank: PropTypes.number,
  marketCap: PropTypes.number,
  price: PropTypes.number,
  circulatingSupply: PropTypes.number,
  volume24Hr: PropTypes.number,
  change24Hr: PropTypes.number,
  changePercent24Hr: PropTypes.number,
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  prefCurrency: PropTypes.string.isRequired,
  sparklinePair: PropTypes.string,
  onClick: PropTypes.func
};

export default withStyles(styles)(withTheme()(CoinRow));



// WEBPACK FOOTER //
// ./src/components/coins/coinRow.js