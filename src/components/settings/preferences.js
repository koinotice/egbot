/* eslint-disable react/jsx-boolean-value */
import React, { Component, Fragment } from 'react';
import { withStyles } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import FormGroup from '@material-ui/core/FormGroup';
import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import PropTypes from 'prop-types';
import { IS_PRIVATE_INSTANCE } from '../../config/globalConfig';

const styles = theme => ({
  title: {
    marginBottom: '0.7142857142857143rem'
  },
  paper: {
    padding: '1.0714285714285714rem 2.142857142857143rem',
    marginBottom: '2.142857142857143rem'
  },
  paperTitle: {
    marginBottom: '1.0714rem'
  },
  formGroup: {
    marginBottom: '1.0714rem'
  },
  formControl: {
    marginRight: '1.0714rem',
    marginBottom: theme.spacing.unit * 2
  },
  text: {
    lineHeight: '1.2857142857142858rem',
  },
  radioGroup: {
    flexDirection: 'row'
  },
  indent2: {
    paddingLeft: theme.spacing.unit * 2
  },
  indent4: {
    paddingLeft: theme.spacing.unit * 4
  }
});

class Preferences extends Component {
  render() {
    const {
      classes, setWeeklySummaryEmail, setWeeklySummaryEmailPortfolio, setWeeklySummaryEmailBots, weeklySummaryEmail, weeklySummaryEmailPortfolio, weeklySummaryEmailBots, theme, setTheme, prefCurrency, setPrefCurrency
    } = this.props;
    return (
      <Fragment>
        <Typography variant="h5" className={classes.title}>Preferences</Typography>
        <Paper className={classes.paper}>
          {!IS_PRIVATE_INSTANCE &&
          <Fragment>
            <Typography variant="subtitle1"
              className={classes.paperTitle}>Email
            </Typography>
            <FormGroup className={`${classes.formGroup} ${classes.indent2}`}>
              <FormControlLabel
                className={classes.text}
                control={
                  <Checkbox
                    checked={weeklySummaryEmail}
                    onChange={() => setWeeklySummaryEmail(!weeklySummaryEmail)}
                    color="primary" />
                }
                label="Receive weekly Crypto Snapshot emails" />
              <FormControlLabel
                className={`${classes.text} ${classes.indent4}`}
                control={
                  <Checkbox
                    checked={weeklySummaryEmailPortfolio}
                    disabled={!weeklySummaryEmail}
                    onChange={() => setWeeklySummaryEmailPortfolio(!weeklySummaryEmailPortfolio)}
                    color="primary" />
                }
                label="Include my portfolio stats" />
              <FormControlLabel
                className={`${classes.text} ${classes.indent4}`}
                control={
                  <Checkbox
                    checked={weeklySummaryEmailBots}
                    disabled={!weeklySummaryEmail}
                    onChange={() => setWeeklySummaryEmailBots(!weeklySummaryEmailBots)}
                    color="primary" />
                }
                label="Include performance summary of my running bots" />
            </FormGroup>
          </Fragment>
          }
          <Typography variant="subtitle1" className={classes.paperTitle}>Interface</Typography>
          <FormGroup className={`${classes.formGroup} ${classes.indent2}`}>
            <FormControl className={classes.formControl}>
              <FormLabel component="legend">Theme</FormLabel>
              <RadioGroup
                className={classes.radioGroup}
                value={theme}
                onChange={e => setTheme(e.target.value)}>
                <FormControlLabel value="DARK" control={<Radio color="primary" />} label="Dark" />
                <FormControlLabel value="LIGHT" control={<Radio color="primary" />} label="Light" />
              </RadioGroup>
            </FormControl>
            <FormLabel component="legend" style={{ marginBottom: '8px' }}>Preferred Currency</FormLabel>
            <FormControl className={classes.formControl} style={{ width: '65px' }}>
              <Select
                value={prefCurrency}
                onChange={e => setPrefCurrency(e.target.value)}>
                <MenuItem value="BTC">BTC</MenuItem>
                <MenuItem value="AUD">AUD</MenuItem>
                <MenuItem value="CAD">CAD</MenuItem>
                <MenuItem value="EUR">EUR</MenuItem>
                <MenuItem value="GBP">GBP</MenuItem>
                <MenuItem value="HKD">HKD</MenuItem>
                <MenuItem value="JPY">JPY</MenuItem>
                <MenuItem value="NZD">NZD</MenuItem>
                <MenuItem value="USD">USD</MenuItem>
                <MenuItem value="ZAR">ZAR</MenuItem>
              </Select>
            </FormControl>
          </FormGroup>
        </Paper>
      </Fragment>
    );
  }
}

Preferences.propTypes = {
  classes: PropTypes.object.isRequired,
  weeklySummaryEmail: PropTypes.bool.isRequired,
  setWeeklySummaryEmail: PropTypes.func.isRequired,
  weeklySummaryEmailPortfolio: PropTypes.bool.isRequired,
  setWeeklySummaryEmailPortfolio: PropTypes.func.isRequired,
  weeklySummaryEmailBots: PropTypes.bool.isRequired,
  setWeeklySummaryEmailBots: PropTypes.func.isRequired,
  theme: PropTypes.string.isRequired,
  setTheme: PropTypes.func.isRequired,
  prefCurrency: PropTypes.string.isRequired,
  setPrefCurrency: PropTypes.func.isRequired
};

export default withStyles(styles, { withTheme: true })(Preferences);



// WEBPACK FOOTER //
// ./src/components/settings/preferences.js