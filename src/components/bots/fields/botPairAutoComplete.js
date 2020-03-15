import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Icon from '@material-ui/core/Icon';
import ButtonBase from '@material-ui/core/ButtonBase';
import InputAdornment from '@material-ui/core/InputAdornment';
import AutocompleteSelect from '../../selects/autocompleteSelect';
import ChartModal from '../modals/chartModal';
import getMarketsFor from '../../../api/public/exchanges';
import { sentenceToCamelCase } from '../../../utils/strings';

const styles = {
  root: {
    marginTop: '1.0714rem'
  }
};

// some exchange active status are inaccurate, we need to ignore the status for these
const IGNORE_ACTIVES = new Set(['GDAX']);

class BotPairAutoComplete extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedPair: '',
      chartVisible: false
    };
    this.pairsForExchange = [];
  }

  async componentDidMount() {
    const { exchange, value } = this.props;
    this.pairsForExchange = await this.getPairs(exchange);
    this.setSelectedPair(value);
    this.validate(value);
  }

  async componentWillReceiveProps(nextProps) {
    const { onChange } = this.props;

    if (nextProps.exchange !== this.props.exchange) {
      this.pairsForExchange = await this.getPairs(nextProps.exchange);
      if (nextProps.value) {
        const pairExistsForExchange = this.checkPairValid(this.pairsForExchange, nextProps.value);
        if (!pairExistsForExchange) {
          onChange('');
          this.validate('');
          this.setSelectedPair('');
          return;
        }
        this.setSelectedPair(nextProps.value);
      }
    }
  }

  onChange = (value) => {
    this.props.onChange(value.toUpperCase());
  }

  onBlur = () => {
    const { onChange, value } = this.props;
    const pairExistsForExchange = this.checkPairValid(this.pairsForExchange, value);
    if (!pairExistsForExchange) {
      onChange('');
      this.setSelectedPair('');
      return;
    }
    this.validate(value);
    this.setSelectedPair(value);
  }

  async getPairs(exchange) {
    if (!exchange) {
      return [];
    }
    const res = await getMarketsFor(exchange.toUpperCase());
    if (res) {
      return Object.keys(res)
        .filter(key => ((res[key].active === true && res[key].info ? !res[key].info.IsRestricted : true)
          || IGNORE_ACTIVES.has(exchange ? exchange.toUpperCase() : exchange)
          || res[key].active !== undefined ? res[key].active : true));
    }
    return [];
  }

  getPairSuggestions() {
    return this.pairsForExchange.sort().map(pair => ({ label: pair }));
  }

  getAdornment() {
    const { selectedPair } = this.state;
    if (selectedPair) {
      return (
        <InputAdornment position="end">
          <ButtonBase onClick={this.showChart}>
            <Icon>show_chart</Icon>
          </ButtonBase>
        </InputAdornment>
      );
    }
    return null;
  }

  setSelectedPair(pair) {
    this.setState({
      selectedPair: pair.toUpperCase()
    });
  }

  validate = (value) => {
    const { validation, setError } = this.props;

    if (!validation) {
      return;
    }

    if (validation.isRequired && (!value || value === '')) {
      setError('Field is required');
      return;
    }
    setError('');
  }

  checkPairValid(pairsForExchange, value) {
    return pairsForExchange.some(pair => pair === value.toUpperCase());
  }

  showChart = () => {
    this.setState({
      chartVisible: true
    });
  }

  hideChart = () => {
    this.setState({
      chartVisible: false
    });
  }

  render() {
    const { selectedPair, chartVisible } = this.state;
    const {
      classes, value, disabled, name, exchange, indicator
    } = this.props;
    return (
      <Fragment>
        <div className={classes.root}>
          <AutocompleteSelect
            name={sentenceToCamelCase(name)}
            suggestions={this.getPairSuggestions()}
            initialSelected={value ? value.toUpperCase() : ''}
            onSuggestionChange={this.onChange}
            onSuggestionBlur={this.onBlur}
            adornment={this.getAdornment()}
            disabled={disabled} />
        </div>
        <ChartModal
          exchange={exchange}
          pair={selectedPair}
          isVisible={chartVisible}
          hide={this.hideChart}
          indicator={indicator} />
      </Fragment>
    );
  }
}

BotPairAutoComplete.defaultProps = {
  value: '',
  exchange: '',
  name: '',
  indicator: null,
  validation: {}
};

BotPairAutoComplete.propTypes = {
  classes: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string,
  disabled: PropTypes.bool.isRequired,
  exchange: PropTypes.string,
  name: PropTypes.string,
  indicator: PropTypes.object,
  validation: PropTypes.object,
  setError: PropTypes.func.isRequired
};

export default withStyles(styles, { withTheme: true })(BotPairAutoComplete);



// WEBPACK FOOTER //
// ./src/components/bots/fields/botPairAutoComplete.js