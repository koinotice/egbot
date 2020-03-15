import React, { Component } from 'react';
import { withStyles } from '@material-ui/core';
import PropTypes from 'prop-types';
import MarketChart from '../output/marketChart';
import DraggableModal from '../../modals/draggableModal';


const styles = {


};

class ChartModal extends Component {
  getHeader() {
    const { exchange, pair } = this.props;
    if (exchange && pair) {
      return `${exchange.toUpperCase()} - ${pair.toUpperCase()}`;
    }
    return '';
  }

  renderChart() {
    const { exchange, pair, indicator } = this.props;
    return (
      <MarketChart
        exchange={exchange}
        pair={pair}
        candleTimeframe="60"
        indicator={indicator} />
    );
  }

  render() {
    const { isVisible, hide } = this.props;

    return (
      <DraggableModal
        width={120}
        header={this.getHeader()}
        isVisible={isVisible}
        hide={hide}
        form={this.renderChart()} />
    );
  }
}


ChartModal.defaultProps = {
  exchange: '',
  indicator: null
};

ChartModal.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  hide: PropTypes.func.isRequired,
  exchange: PropTypes.string,
  pair: PropTypes.string.isRequired,
  indicator: PropTypes.object
};

export default withStyles(styles)(ChartModal);



// WEBPACK FOOTER //
// ./src/components/bots/modals/chartModal.js