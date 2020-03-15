import React from 'react';
import { withTheme, withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import { PulseLoader } from 'react-spinners';
import Typography from '@material-ui/core/Typography';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import PropTypes from 'prop-types';
import { isoToDateTime } from '../../utils/time';

const styles = theme => ({
  tableContainer: {
    overflowX: 'auto',
    overflowY: 'auto'
  },
  tableCell: {
    border: 'none',
    padding: '0.5rem',
  },
  progressContainer: {
    height: '100%',
  },
  noReferralsText: {
    color: theme.palette.text.secondary,
    fontStyle: 'italic',
    margin: '1.5rem 0'
  }
});

const MyReferrals = ({ classes, rewards, loaded }) => {
  if (!loaded) {
    return (
      <Grid container alignItems="center" justify="center" className={classes.progressContainer}>
        <PulseLoader size={6} color="#52B0B0" loading />
      </Grid>
    );
  }

  if (rewards.length === 0) {
    return (
      <Grid container alignItems="center" justify="center">
        <Typography className={classes.noReferralsText}>No Referrals Yet</Typography>
      </Grid>
    );
  }

  return (
    <div className={classes.tableContainer}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell classes={{ root: classes.tableCell }}>Email</TableCell>
            <TableCell classes={{ root: classes.tableCell }}>Subscribed on</TableCell>
            <TableCell classes={{ root: classes.tableCell }}>My Reward</TableCell>
            <TableCell classes={{ root: classes.tableCell }}>Reward Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {
            rewards.map(reward => (
              <TableRow key={reward.subscribedOn}>
                <TableCell classes={{ root: classes.tableCell }}>{reward.referralEmail}</TableCell>
                <TableCell classes={{ root: classes.tableCell }}>{isoToDateTime(reward.subscribedOn)}</TableCell>
                <TableCell classes={{ root: classes.tableCell }}>{`$${reward.amount}`}</TableCell>
                <TableCell classes={{ root: classes.tableCell }}>{reward.status}</TableCell>
              </TableRow>
            ))
          }
        </TableBody>
      </Table>
    </div>
  );
};

MyReferrals.propTypes = {
  classes: PropTypes.object.isRequired,
  rewards: PropTypes.array.isRequired,
  loaded: PropTypes.bool.isRequired
};

export default withTheme()(withStyles(styles)(MyReferrals));



// WEBPACK FOOTER //
// ./src/components/settings/myReferrals.js