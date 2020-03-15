import React, { Component, Fragment } from 'react';
import { withStyles, withTheme } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import Link from '@material-ui/core/Link';
import { PulseLoader } from 'react-spinners';
import PropTypes from 'prop-types';
import ReferralsForm from './referralsForm';
import MyReferrals from './myReferrals';

const styles = theme => ({
  title: {
    marginBottom: '0.7142857142857143rem'
  },
  paper: {
    padding: '1.0714285714285714rem 2.142857142857143rem',
    marginBottom: '2.142857142857143rem'
  },
  paperTitle: {
    marginBottom: '1.7857142857142858rem'
  },
  topPaper: {
    textAlign: 'center'
  },
  topPaperTitle: {
    fontSize: '18px',
    paddingTop: '35px',
    paddingBottom: '45px'
  },
  greenSpan: {
    fontSize: '26px',
    fontWeight: '600',
    color: '#9FC950'
  },
  greenSpanSmall: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#9FC950'
  },
  topPaperText: {
    padding: '0 135px',
    marginBottom: '30px'
  },
  link: {
    color: '#52B0B0'
  },
  referralLinkButton: {
    marginTop: '30px',
    marginBottom: '60px'
  },
  progressContainer: {
    height: '100%',
  },
  [theme.breakpoints.down('md')]: {
    topPaperText: {
      padding: '0'
    },
  }
});

class Referrals extends Component {
  constructor() {
    super();

    this.state = {
      newWalletAddress: '',
      errorMsg: '',
      requestPending: false
    };
  }

  componentDidMount() {
    this.props.fetchReferrerInfo();
  }

  setNewWalletAddress = (addr) => {
    this.setState({
      newWalletAddress: addr
    });
  }

  validate = () => {
    const { walletAddress } = this.props;
    const { newWalletAddress } = this.state;

    if (newWalletAddress === walletAddress) {
      this.setState({
        errorMsg: 'Please enter a new wallet address'
      });
      return false;
    }
    const validAddress = !/[~`!#$%^&*+=\-[\]\\';,/{}|\\":<>? ]/g.test(newWalletAddress);
    if (!validAddress) {
      this.setState({
        errorMsg: 'Invalid wallet address'
      });
      return false;
    }

    return true;
  };

  save = () => {
    const { updateWalletAddress, setPayoutAddress } = this.props;
    const { newWalletAddress } = this.state;

    const isValid = this.validate();
    if (!isValid) {
      return;
    }

    this.setState({ requestPending: true });
    updateWalletAddress(newWalletAddress).then((res) => {
      if (res.error) {
        this.setState({
          errorMsg: res.error
        });
      } else {
        setPayoutAddress(newWalletAddress);
        this.setState({
          errorMsg: ''
        });
      }
      this.setState({
        newWalletAddress: '',
        requestPending: false
      });
    });
  };

  renderLoader() {
    const { classes } = this.props;
    return (
      <Grid container alignItems="center" justify="center" className={classes.progressContainer}>
        <PulseLoader size={6} color="#52B0B0" loading />
      </Grid>
    );
  }

  render() {
    const {
      classes,
      referrals,
      walletAddress,
      makeReferrer
    } = this.props;
    const { newWalletAddress, errorMsg, requestPending } = this.state;

    if (!referrals.referrerLoaded) {
      return this.renderLoader();
    }

    return (
      <Fragment>
        <Typography variant="h5" className={classes.title}>Referral Program</Typography>
        <Paper className={`${classes.paper} ${classes.topPaper}`}>
          <Typography variant="subtitle1" className={classes.topPaperTitle}>
            Refer your friends and earn <span className={classes.greenSpan}>50%</span> monthly commissions in BTC. <br />
            PLUS, your friends get <span className={classes.greenSpanSmall}>25%</span> discount through your referral link!
          </Typography>
          <Typography className={classes.topPaperText}>
            To qualify, your referrals must subscribe to one of the <a className={classes.link} href="/pricing" target="_blank">paid plans</a> offered by Quadency.
          </Typography>
          <Typography className={classes.topPaperText}>
            Rewards are paid in BTC to the address provided below.
          </Typography>
          <Typography>
            <Link href="/referrals" target="__blank" className={classes.link}>Click here for additional details.</Link>
          </Typography>

          { !referrals.token &&
            <Button
              color="primary"
              variant="outlined"
              name="getReferralLink"
              className={classes.referralLinkButton}
              onClick={makeReferrer}>
              Get Referral Link
            </Button>
          }
          { referrals.token &&
            <ReferralsForm
              referralCode={referrals.token}
              totalReferred={referrals.totalReferred}
              totalEarned={referrals.totalEarned}
              walletAddress={walletAddress}
              newWalletAddress={newWalletAddress}
              updateNewWalletAddress={this.setNewWalletAddress}
              save={this.save}
              disabled={!newWalletAddress || requestPending}
              errorMsg={errorMsg} />
          }
        </Paper>
        <Paper className={classes.paper}>
          <Typography variant="subtitle1" className={classes.paperTitle}>My Referrals</Typography>
          <MyReferrals
            rewards={referrals.rewards}
            loaded={referrals.rewardsLoaded} />
        </Paper>
      </Fragment>
    );
  }
}

Referrals.defaultProps = {
  walletAddress: ''
};

Referrals.propTypes = {
  classes: PropTypes.object.isRequired,
  fetchReferrerInfo: PropTypes.func.isRequired,
  makeReferrer: PropTypes.func.isRequired,
  referrals: PropTypes.object.isRequired,
  walletAddress: PropTypes.string,
  updateWalletAddress: PropTypes.func.isRequired,
  setPayoutAddress: PropTypes.func.isRequired
};

export default withTheme()(withStyles(styles)(Referrals));



// WEBPACK FOOTER //
// ./src/components/settings/referrals.js