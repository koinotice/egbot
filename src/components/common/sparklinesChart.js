import React, { Component } from 'react';
import { Sparklines, SparklinesLine } from 'react-sparklines';
import Grid from '@material-ui/core/Grid';
import { PulseLoader } from 'react-spinners';
import PropTypes from 'prop-types';
import { getAvgPriceHistory } from '../../api/public/prices';
import { getChangeColor } from '../../utils/helpers';

class SparklinesChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      isLoaded: false
    };
  }

  componentDidMount() {
    const { pair } = this.props;
    this.fetchData(pair);
  }

  componentWillReceiveProps(nextProps) {
    const { pair } = this.props;

    if (pair !== nextProps.pair) {
      this.fetchData(nextProps.pair);
    }
  }

  async fetchData(pair) {
    const data = await getAvgPriceHistory(pair);
    if (data && data[pair] && data[pair].length) {
      const dataArray = data[pair].map((arr) => {
        return arr[1];
      }).reverse();
      this.setState({
        data: dataArray,
        isLoaded: true
      });
    } else {
      // straight line if not found.
      this.setState({
        data: [1, 1],
        isLoaded: true
      });
    }
  }

  render() {
    const { data, isLoaded } = this.state;
    const { change } = this.props;
    if (!isLoaded || !data || data.length === 0) {
      return (
        <Grid style={{ minHeight: 20 }} container alignItems="center" justify="center">
          <PulseLoader color="#52B0B0" size={2} loading />
        </Grid>
      );
    }
    const fillColor = getChangeColor(change);

    return (
      <Sparklines data={data} margin={10}>
        <SparklinesLine style={{ strokeWidth: 2, stroke: fillColor, fill: fillColor }} />
      </Sparklines>);
  }
}

SparklinesChart.defaultProps = {
  pair: 'BTC/BTC',
  change: 1,
};

SparklinesChart.propTypes = {
  pair: PropTypes.string,
  change: PropTypes.number,
};


export default SparklinesChart;




// WEBPACK FOOTER //
// ./src/components/common/sparklinesChart.js