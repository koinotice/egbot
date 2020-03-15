import React from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import CoinIcon from '../icons/coinIcon';
import { ellipsize } from '../../utils/helpers';

const styles = theme => ({
  iconGridItem: {
    display: 'flex',
    alignItems: 'center',
    [theme.breakpoints.down('xs')]: {
      marginBottom: '1.0714rem'
    }
  },
  searchGridItem: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  icon: {
    width: '50px',
    height: '50px',
    backgroundSize: 'cover !important',
    marginRight: '15px'
  },
  flexCol: {
    display: 'flex',
    flexFlow: 'column'
  },
  name: {
    fontSize: '24px',
    fontWeight: 'bold',
    lineHeight: '24px'
  },
  tagline: {
    fontSize: '16px',
    fontWeight: 'bold',
    lineHeight: '30px'
  }
});

const ProfileCoinBar = ({
  classes, symbol, name, tagline, overview
}) => (
  <Grid container>
    <Grid className={classes.iconGridItem} item xs={12} md={3}>
      <CoinIcon coin={symbol.toLowerCase()} className={classes.icon} />
      <div className={classes.flexCol}>
        <Typography className={classes.name}>{ellipsize(name, 15)}</Typography>
        <Typography>{symbol}</Typography>
      </div>
    </Grid>
    <Grid item xs={12} md={9}>
      <Typography className={classes.tagline}>{ellipsize(tagline, 100)}</Typography>
      <Typography color="textSecondary">{ellipsize(overview, 300)}</Typography>
    </Grid>
  </Grid>
);

ProfileCoinBar.defaultProps = {
  name: '-',
  tagline: 'No Data',
  overview: 'No Overview'
};

ProfileCoinBar.propTypes = {
  classes: PropTypes.object.isRequired,
  symbol: PropTypes.string.isRequired,
  name: PropTypes.string,
  tagline: PropTypes.string,
  overview: PropTypes.string
};

export default withStyles(styles, { withTheme: true })(ProfileCoinBar);



// WEBPACK FOOTER //
// ./src/components/coins/profileCoinBar.js