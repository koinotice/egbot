import React, { Component } from 'react';
import { withStyles, withTheme } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import PropTypes from 'prop-types';
import { isoToDateTime } from '../../utils/time';

const styles = theme => ({
  tableContainer: {
    overflowX: 'auto'
  },
  tableCell: {
    paddingRight: theme.spacing.unit * 2,
    border: 'none'
  }
});

class ActivityLog extends Component {
  constructor() {
    super();

    this.activityMap = new Map();
    this.activityMap
      .set('LOGIN_SUCCESS', 'Login')
      .set('2FA_ENABLED', '2FA Enabled')
      .set('2FA_DISABLED', '2FA Disabled');
  }

  formatLocation = (city, country) => {
    if (!city || !country) {
      return 'Unknown';
    }
    return `${city}, ${country}`;
  }

  render() {
    const { classes, logs } = this.props;

    return (
      <div className={classes.tableContainer}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell className={classes.tableCell}>Activity</TableCell>
              <TableCell className={classes.tableCell}>Date/Time</TableCell>
              <TableCell className={classes.tableCell}>IP Address</TableCell>
              <TableCell className={classes.tableCell}>Location</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map(log => (
              <TableRow key={log.created_timestamp}>
                <TableCell className={classes.tableCell}>{this.activityMap.get(log.activity)}</TableCell>
                <TableCell className={classes.tableCell}>{isoToDateTime(log.created_timestamp)}</TableCell>
                <TableCell className={classes.tableCell}>{log.ip_address}</TableCell>
                <TableCell className={classes.tableCell}>{this.formatLocation(log.city, log.country)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }
}

ActivityLog.propTypes = {
  classes: PropTypes.object.isRequired,
  logs: PropTypes.array.isRequired
};

export default withTheme()(withStyles(styles)(ActivityLog));



// WEBPACK FOOTER //
// ./src/components/settings/activityLog.js