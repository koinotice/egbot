import React from 'react';
import Paper from '@material-ui/core/Paper';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { PulseLoader } from 'react-spinners';
import Grid from '@material-ui/core/Grid';
import Table from '@material-ui/core/Table';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import Hidden from '@material-ui/core/Hidden';
import Typography from '@material-ui/core/Typography';
import { isoToTableDateTime } from '../../../utils/time';


const styles = theme => ({
  paper: {
    backgroundColor: theme.palette.background.paperDarker,
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
    backgroundColor: theme.palette.background.paperDarker,
    color: theme.palette.text.secondary,
    position: 'sticky',
    top: 0,
    border: 'none',
    '&:first-child': {
      border: 'none',
      paddingRight: '0px',
      marginRight: '0px',
    },
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
    verticalAlign: 'top',
    '&:first-child': {
      border: 'none',
      paddingRight: '0px',
      marginRight: '0px',
    },
  },
  emptyTableText: {
    color: theme.palette.text.secondary,
    fontStyle: 'italic',
    margin: '1.5rem 0',
  },
});

const Logs = ({
  classes, theme, botConfigLogs, botConfigLogsLoaded
}) => {
  if (!botConfigLogsLoaded) {
    return (
      <Grid container alignItems="center" justify="center">
        <PulseLoader color="#52B0B0" size={6} loading />
      </Grid>);
  }

  if (!botConfigLogs.length) {
    return (
      <Paper className={classes.paper} elevation={0} square style={{ textAlign: 'center' }}>
        <Typography className={classes.emptyTableText}>There are no logs</Typography>
      </Paper>
    );
  }

  return (
    <Paper className={classes.paper} elevation={0} square>
      <Table className={classes.table}>
        <TableHead>
          <TableRow className={classes.tableRow}>
            <TableCell className={classes.tableHeaderCell} colSpan={3}>Date</TableCell>
            <Hidden xsDown>
              <TableCell
                className={classes.tableHeaderCell}
                colSpan={1}
                style={
                  {
                    padding: '0px',
                    margin: '0px',
                  }}>
              Type
              </TableCell>
            </Hidden>
            <TableCell className={classes.tableHeaderCell} colSpan={10}>Message</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {
            botConfigLogs.map((log) => {
              return (
                <TableRow className={classes.tableRow} key={log.logId}>
                  <TableCell className={classes.tableCell} colSpan={3}>
                    {isoToTableDateTime(log.createdTimestamp)}
                  </TableCell>
                  <Hidden xsDown>
                    <TableCell
                      colSpan={1}
                      className={classes.tableCell}
                      style={
                        {
                          color: log.logLevel === 'ERROR' ? theme.palette.buttons.red : theme.palette.primary.main,
                          padding: '0px',
                          margin: '0px',
                        }}>
                      {log.logLevel}
                    </TableCell>
                  </Hidden>
                  <TableCell className={classes.tableCell} colSpan={10}>
                    {log.logMessage}
                  </TableCell>
                </TableRow>
              );
            })
          }
        </TableBody>
      </Table>
    </Paper>
  );
};

Logs.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  botConfigLogs: PropTypes.array.isRequired,
  botConfigLogsLoaded: PropTypes.bool.isRequired,
};

export default withStyles(styles, { withTheme: true })(Logs);



// WEBPACK FOOTER //
// ./src/components/bots/output/logs.js