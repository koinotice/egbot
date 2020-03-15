import React from 'react';
import PropTypes from 'prop-types';
import { PulseLoader } from 'react-spinners';
import ConfigItemBacktestOutput from './configItemBacktestOutput';
import ConfigItemLiveOutput from './configItemLiveOutput';
import ConfigItemLiveStarted from './configItemLiveStarted';
import { MODES, STATUSES } from '../../utils/botConstants';

const filterOrders = (openOrders, status, outputSummary) => {
  const hasNoRunIds = openOrders ? openOrders.some(order => !order.runId) : true;
  if (status === STATUSES.RUNNING.toUpperCase() || hasNoRunIds) {
    const { openOrders: outputOpenOrders } = outputSummary;
    if (!outputOpenOrders) {
      return [];
    }
    const outputOpenOrdersSet = new Set(outputOpenOrders);
    return openOrders.filter(order => outputOpenOrdersSet.has(order.e_orderId));
  }
  return openOrders.filter(order => order.runId === outputSummary.runId);
};

const ConfigItemOutput = ({
  mode, status, outputSummary, openOrders
}) => {
  if (mode && outputSummary) {
    if (mode.toLowerCase() === MODES.BACKTEST) {
      return (<ConfigItemBacktestOutput
        returnOnInvestment={outputSummary.algorithmPeriodReturn ? outputSummary.algorithmPeriodReturn.toString() : undefined}
        marketReturn={outputSummary.benchmarkPeriodReturn ? outputSummary.benchmarkPeriodReturn.toString() : undefined}
        numTrades={outputSummary.numTrades}
        exchange={outputSummary.exchangeName}
        market={outputSummary.market}
        periodStart={outputSummary.periodStart ? outputSummary.periodStart.toString() : undefined}
        periodEnd={outputSummary.periodEnd ? outputSummary.periodEnd.toString() : undefined}
        completed={outputSummary.backtestCompleted ? outputSummary.backtestCompleted.toString() : undefined}
        quoteCurrency={outputSummary.quoteCurrency}
        capitalBase={outputSummary.capitalBase} />);
    } else if (mode.toLowerCase() === MODES.LIVE && !outputSummary.hasShownOutput) {
      return (<ConfigItemLiveStarted />);
    } else if (mode.toLowerCase() === MODES.LIVE && outputSummary.hasShownOutput) {
      const filteredOrders = filterOrders(openOrders, status, outputSummary);

      return (<ConfigItemLiveOutput
        status={status}
        returnOnInvestment={outputSummary.algorithmPeriodReturn ? (outputSummary.algorithmPeriodReturn).toString() : ''}
        openOrders={filteredOrders.length}
        numTrades={outputSummary.numTrades}
        exchange={outputSummary.exchangeName}
        market={outputSummary.market}
        started={parseInt(outputSummary.periodStart, 10)}
        stopped={parseInt(outputSummary.periodEnd, 10)}
        profitAndLoss={parseFloat(outputSummary.portfolioValue) - parseFloat(outputSummary.capitalBase)}
        quoteCurrency={outputSummary.quoteCurrency}
        capitalBase={outputSummary.capitalBase} />);
    }
  }
  return <PulseLoader size={6} loading />;
};

ConfigItemOutput.propTypes = {
  mode: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
  outputSummary: PropTypes.object.isRequired,
  openOrders: PropTypes.array.isRequired,
};

export default ConfigItemOutput;



// WEBPACK FOOTER //
// ./src/components/bots/configItemOutput.js