import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import withWidth, { isWidthDown } from '@material-ui/core/withWidth';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import Icon from '@material-ui/core/Icon';
import Hidden from '@material-ui/core/Hidden';
import { withStyles } from '@material-ui/core/styles';
import AccountActivity from '../trade/accountActivity';


const styles = theme => ({
  defaultBackground: {
    backgroundColor: theme.palette.background.default,
  },
  paper: {
    padding: '12px 24px',
    color: theme.palette.text.secondary,
    boxShadow: 'none',
  },
  endGrid: {
    textAlign: 'center',
  },
  headingTypography: {
    display: 'inline-block',
    fontSize: '1.5rem',
  },
  search: {
    backgroundColor: theme.palette.background.default,
    width: '12.31rem',
    fontSize: '1rem',
    fontColor: '#414F64',
  },
  holdingsContainer: {
    marginTop: '20px',
  },
  plusIcon: {
    marginRight: '0.625rem',
    transform: 'scale(.75)',
  },
});


class AccountHoldings extends Component {
  constructor(props) {
    super(props);

    this.state = {
      search: ''
    };
  }

  getViewLabel = () => {
    const { accounts, currentAccountId } = this.props;
    if (accounts.length && currentAccountId) {
      const currentAccount = accounts.find(account => account.id === currentAccountId);
      return currentAccount ? currentAccount.label : null;
    }
    return 'Portfolio';
  };

  setSearch = (event) => {
    this.setState({
      search: event.target.value
    });
  };

  render() {
    const {
      classes, width, currentAccountId
    } = this.props;
    const { search } = this.state;

    return (
      <Grid container>
        <Grid item xs={12} sm>
          <Paper square className={classes.paper}>
            <Grid
              container
              direction={isWidthDown('xs', width) ? 'column' : 'row'}
              justify="space-between"
              alignItems={isWidthDown('xs', width) ? 'stretch' : 'center'} >
              <Hidden xsDown>
                <Grid item>
                  <Typography className={classes.headingTypography} variant="h5">
                    {this.getViewLabel()} Overview
                  </Typography>
                </Grid>
              </Hidden>
              <Grid item>
                <TextField
                  placeholder="Search Assets"
                  fullWidth
                  margin="normal"
                  InputProps={{
                    startAdornment:
                      <InputAdornment position="start">
                        <Icon className={classes.plusIcon}>search</Icon>
                      </InputAdornment>,
                  }}
                  onChange={this.setSearch}
                  value={search} />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid item xs={12} className={classes.holdingsContainer}>
          <Paper square className={`${classes.paper} ${classes.defaultBackground}`}>
            <AccountActivity
              stickyHeader={false}
              currentAccountId={currentAccountId}
              accountFilter={ currentAccountId !== ''}
              showFilters={false}
              inline={false}
              searchTerm={search} />
          </Paper>
        </Grid>
      </Grid>
    );
  }
}

AccountHoldings.propTypes = {
  classes: PropTypes.object.isRequired,
  width: PropTypes.string.isRequired,
  currentAccountId: PropTypes.string.isRequired,
  accounts: PropTypes.array.isRequired,
};

function mapStateToProps(state) {
  return {
    currentAccountId: state.trade.interactions.currentAccountId,
    accounts: state.global.accounts.accounts,
  };
}

const base = withWidth()(withStyles(styles, { withTheme: true })(AccountHoldings));
export default connect(mapStateToProps)(base);



// WEBPACK FOOTER //
// ./src/components/portfolio/accountHoldings.js