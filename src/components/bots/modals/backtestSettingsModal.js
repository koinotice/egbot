import React, { Component } from 'react';
import { PulseLoader } from 'react-spinners';
import moment from 'moment';
import { withStyles } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import RadioGroup from '@material-ui/core/RadioGroup';
import Radio from '@material-ui/core/Radio';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { MuiPickersUtilsProvider, InlineDatePicker } from 'material-ui-pickers';
import MomentUtils from '@date-io/moment';
import PropTypes from 'prop-types';
import FormModal from '../../modals/formModal';
import { DATA_FREQUENCY } from '../../../utils/botConstants';
import logger from '../../../utils/logger';
import { getPriceTimeFrame } from '../../../api/public/prices';

const styles = () => ({
  form: {
    marginTop: '2.286rem'
  },
  group: {
    marginTop: '1.429rem',
  },
  groupHeading: {
    textAlign: 'left',
    fontSize: '1rem',
    fontWeight: '600',
  },
  timeFrame: {
    marginTop: '.3rem',
  },
  timeFrameRadio: {
    paddingBottom: '0.1429rem',
  },
  datePickers: {
    marginTop: '.3rem',
  },
  buttonArea: {
    textAlign: 'right',
    marginTop: '3.571rem',
  },
});

const RANGE = {
  ONE_DAY: {
    label: '1 Day',
    frequency: new Set([DATA_FREQUENCY.MINUTE]),
    daysAgo: 1,
  },
  ONE_WEEK: {
    label: '1 Week',
    frequency: new Set([DATA_FREQUENCY.MINUTE]),
    daysAgo: 7,
  },
  TWO_WEEK: {
    label: '2 Weeks',
    frequency: new Set([DATA_FREQUENCY.MINUTE, DATA_FREQUENCY.DAILY]),
    daysAgo: 14,
  },
  ONE_MONTH: {
    label: '1 Month',
    frequency: new Set([DATA_FREQUENCY.MINUTE, DATA_FREQUENCY.DAILY]),
    daysAgo: 30,
  },
  THREE_MONTH: {
    label: '3 Months',
    frequency: new Set([DATA_FREQUENCY.DAILY]),
    daysAgo: 90,
  },
  ONE_YEAR: {
    label: '1 Year',
    frequency: new Set([DATA_FREQUENCY.DAILY]),
    daysAgo: 365,
  },
  CUSTOM: {
    label: 'Custom',
    frequency: new Set([DATA_FREQUENCY.MINUTE, DATA_FREQUENCY.DAILY]),
    daysAgo: null,
  },
};

const DATE_FORMAT = 'YYYY-MM-DD';

class BacktestSettingsModal extends Component {
  static initialState = {
    selectedTimeFrame: '',
    startDate: null,
    endDate: null,
    priceTimeFrame: undefined,
  };

  constructor(props) {
    super(props);

    this.state = BacktestSettingsModal.initialState;
  }

  componentDidMount() {
    const { pair, exchange, dataFrequency } = this.props;
    this.getPriceTimeFrameForPairAndExchange(pair, exchange, dataFrequency);
  }

  componentWillReceiveProps(nextProps) {
    const { exchange, pair, dataFrequency } = this.props;

    if (nextProps.exchange !== exchange || nextProps.pair !== pair || nextProps.dataFrequency !== dataFrequency) {
      this.setState({
        ...BacktestSettingsModal.initialState
      });
      this.getPriceTimeFrameForPairAndExchange(nextProps.pair, nextProps.exchange, nextProps.dataFrequency);
    }
  }

  onRadioSelect = (event) => {
    const selectedTimeFrame = event.target.value;
    let startDate = null;
    let endDate = null;
    if (RANGE[selectedTimeFrame].daysAgo) {
      endDate = moment().subtract(1, 'd').format(DATE_FORMAT);
      startDate = moment().subtract(RANGE[selectedTimeFrame].daysAgo + 1, 'd').format(DATE_FORMAT);
    }

    this.setState({
      selectedTimeFrame,
      startDate,
      endDate,
    });
  };

  async getPriceTimeFrameForPairAndExchange(pair, exchange, dataFrequency) {
    if (!exchange || !pair || !dataFrequency) {
      return;
    }

    const res = await getPriceTimeFrame(exchange, pair, dataFrequency);
    if (res.error) {
      logger.error(`error getting price timeframe for ${exchange} and ${pair}`);
      this.setState({
        priceTimeFrame: { startDate: null, endDate: null },
      });
    }
    this.setState({
      priceTimeFrame: { startDate: res.startDate, endDate: res.endDate },
    });
  }

  getForm() {
    const { classes, dataFrequency } = this.props;
    const { selectedTimeFrame, startDate, endDate } = this.state;

    const disableSubmit = (!selectedTimeFrame || !startDate || !endDate);
    return (
      <form onSubmit={ this.submitForm } className={classes.form}>
        <div className={classes.group}>
          <Typography variant="h6" className={classes.groupHeading}>
            Time Frame
          </Typography>
          <div className={classes.timeFrame}>
            <RadioGroup aria-label="timeFrames" name="timeFrames" value={selectedTimeFrame} onChange={this.onRadioSelect} row >
              {
                Object.keys(RANGE)
                  .filter(key => RANGE[key].frequency.has(dataFrequency))
                  .map((key) => {
                    return (
                      <FormControlLabel
                        name={RANGE[key].label}
                        key={key}
                        value={key}
                        control={<Radio color="primary" className={classes.timeFrameRadio} /> }
                        label={RANGE[key].label}
                        labelPlacement="bottom" />
                    );
                  })
              }
            </RadioGroup>
          </div>
          <div className={classes.datePickers}>
            { selectedTimeFrame === 'CUSTOM' && this.renderDatePickers() }
          </div>
        </div>
        <div className={classes.buttonArea}>
          <Button
            name="startBacktest"
            color="primary"
            variant="contained"
            disabled={disableSubmit}
            type="submit">
            Start Backtest
          </Button>
        </div>
      </form>
    );
  }

  getMinStartDate() {
    const { priceTimeFrame } = this.state;
    return priceTimeFrame.startDate;
  }

  getMaxStartDate() {
    const { priceTimeFrame } = this.state;
    return moment(priceTimeFrame.endDate).subtract(2, 'd').format(DATE_FORMAT);
  }

  getMinEndDate() {
    const { startDate } = this.state;
    return moment(startDate).add(1, 'd').format(DATE_FORMAT);
  }

  getMaxEndDate() {
    const { dataFrequency } = this.props;
    const { startDate, priceTimeFrame } = this.state;
    return dataFrequency === DATA_FREQUENCY.MINUTE
      ? moment(startDate).add(30, 'd').format(DATE_FORMAT)
      : priceTimeFrame.endDate;
  }

  setStartDate = (date) => {
    this.setState({
      startDate: date.format(DATE_FORMAT),
      endDate: null,
    });
  };

  setEndDate = (date) => {
    this.setState({
      endDate: date.format(DATE_FORMAT),
    });
  };

  submitForm = (event) => {
    event.preventDefault();

    const { startDate, endDate } = this.state;
    const { submit, dataFrequency } = this.props;
    logger.debug(`backtest startDate=${startDate} endDate=${endDate}`);

    submit(startDate, endDate, dataFrequency);
    this.setState({
      selectedTimeFrame: '',
      startDate: null,
      endDate: null,
    });
  };

  renderDatePickers() {
    const { startDate, endDate } = this.state;

    return (
      <MuiPickersUtilsProvider utils={MomentUtils}>
        <Grid container justify="space-between">
          <InlineDatePicker
            format="YYYY-MM-DD 00:00 UTC"
            margin="normal"
            label="Start Date"
            value={startDate}
            onChange={this.setStartDate}
            minDate={this.getMinStartDate()}
            maxDate={this.getMaxStartDate()}
            disableFuture />
          <InlineDatePicker
            format="YYYY-MM-DD 00:00 UTC"
            margin="normal"
            label="End Date"
            value={endDate}
            onChange={this.setEndDate}
            minDate={this.getMinEndDate()}
            maxDate={this.getMaxEndDate()}
            disabled={!startDate}
            disableFuture />
        </Grid>
      </MuiPickersUtilsProvider>
    );
  }

  render() {
    const { isVisible, hide } = this.props;
    const { priceTimeFrame } = this.state;

    if (!priceTimeFrame && isVisible) {
      return (
        <Grid container alignItems="center" justify="center">
          <PulseLoader size={6} color="#52B0B0" loading />
        </Grid>
      );
    }

    return (
      <FormModal
        header="Backtest Settings"
        isVisible={isVisible}
        hide={hide}
        form={this.getForm()} />
    );
  }
}

BacktestSettingsModal.defaultProps = {
  dataFrequency: DATA_FREQUENCY.MINUTE,
  pair: '',
  exchange: '',
};

BacktestSettingsModal.propTypes = {
  classes: PropTypes.object.isRequired,
  isVisible: PropTypes.bool.isRequired,
  hide: PropTypes.func.isRequired,
  submit: PropTypes.func.isRequired,
  pair: PropTypes.string,
  exchange: PropTypes.string,
  dataFrequency: PropTypes.string,
};

export default withStyles(styles)(BacktestSettingsModal);



// WEBPACK FOOTER //
// ./src/components/bots/modals/backtestSettingsModal.js