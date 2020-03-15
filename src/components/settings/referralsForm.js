import React from 'react';
import { withStyles, withTheme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import PropTypes from 'prop-types';

const styles = theme => ({
  referralForm: {
    marginTop: '30px',
    paddingTop: '30px',
    marginBottom: '15px',
  },
  row: {
    fontWeight: '300',
    display: 'flex',
    margin: '15px 0'
  },
  label: {
    display: 'inline',
    color: theme.palette.text.secondary,
    width: '140px',
    marginRight: '30px',
    textAlign: 'left'
  },
  value: {
    display: 'inline',
    width: 'calc(100% - 130px)',
    textAlign: 'left',
    fontWeight: '600'
  },
  input: {
    padding: '0'
  },
  saveButton: {
    justifyContent: 'flex-end',
    marginTop: '15px'
  },
  error: {
    width: '100%',
    textAlign: 'right',
    color: theme.palette.error.main
  },
  [theme.breakpoints.down('md')]: {
    row: {
      display: 'initial'
    },
    label: {
      display: 'block'
    },
    value: {
      display: 'block',
      width: '100%',
      marginBottom: '15px'
    }
  }
});

const ReferralForm = ({
  classes,
  referralCode,
  totalReferred,
  totalEarned,
  walletAddress,
  newWalletAddress,
  updateNewWalletAddress,
  disabled,
  save,
  errorMsg
}) => (
  <div className={classes.referralForm}>
    <div className={classes.row}>
      <Typography className={classes.label}>My Referral Link</Typography>
      <Typography className={classes.value}>{`${window.location.protocol}//${window.location.hostname}?r=${referralCode}`}</Typography>
    </div>
    <div className={classes.row}>
      <Typography className={classes.label}>Number of Referrals</Typography>
      <Typography className={classes.value}>{totalReferred}</Typography>
    </div>
    <div className={classes.row}>
      <Typography className={classes.label}>Total Rewards Earned</Typography>
      <Typography className={classes.value}>{`$${totalEarned}`}</Typography>
    </div>
    <div className={classes.row}>
      <Typography className={classes.label}>Reward BTC Address</Typography>
      <div className={classes.value}>
        <TextField
          placeholder={walletAddress || 'Enter Wallet Address'}
          className={classes.textField}
          inputProps={{
            style: { paddingTop: '0' }
          }}
          value={newWalletAddress}
          onChange={event => updateNewWalletAddress(event.target.value)}
          fullWidth />
      </div>
    </div>
    <div className={classes.row}>
      <div className={classes.error} style={{ visibility: errorMsg ? 'visible' : 'hidden' }}>{errorMsg}</div>
    </div>
    <div className={classes.row} style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <Button
        color="primary"
        variant="outlined"
        className={classes.saveButton}
        onClick={save}
        disabled={disabled}
        name="save">
        Save
      </Button>
    </div>
  </div>
);

ReferralForm.defaultProps = {
  walletAddress: '',
  newWalletAddress: '',
  errorMsg: ''
};

ReferralForm.propTypes = {
  classes: PropTypes.object.isRequired,
  referralCode: PropTypes.string.isRequired,
  totalReferred: PropTypes.number.isRequired,
  totalEarned: PropTypes.number.isRequired,
  walletAddress: PropTypes.string,
  newWalletAddress: PropTypes.string,
  updateNewWalletAddress: PropTypes.func.isRequired,
  save: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired,
  errorMsg: PropTypes.string
};

export default withTheme()(withStyles(styles)(ReferralForm));



// WEBPACK FOOTER //
// ./src/components/settings/referralsForm.js