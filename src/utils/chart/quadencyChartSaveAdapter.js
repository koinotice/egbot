import { getCharts, saveChart, deleteChart, getChartById } from '../../api/users/charts';

export default class QuadencyChartSaveAdapter {
  constructor(exchange, setExchangePairFn) {
    this.exchange = exchange;
    this.setExchangePairFn = setExchangePairFn;
  }
  updateExchange(exchange) {
    this.exchange = exchange;
  }
  getAllCharts() {
    return getCharts();
  }
  removeChart(chartId) {
    return deleteChart(chartId);
  }
  saveChart(chartData) {
    return saveChart(chartData, this.exchange, chartData.symbol);
  }
  getChartContent(chartId) {
    return new Promise((resolve, reject) => {
      getChartById(chartId).then((chartResponse) => {
        const { exchange, pair, chartData } = chartResponse;
        this.setExchangePairFn(exchange, pair, chartId, () => resolve(chartData.content));
      }).catch((err) => {
        reject(err);
      });
    });
  }

  getAllStudyTemplates() {
    console.log('getAllStudyTemplates');
  }
  removeStudyTemplate(studyTemplateInfo) {
    console.log('removeStudyTemplate', studyTemplateInfo);
  }
  saveStudyTemplate(studyTemplateData) {
    console.log('saveStudyTemplate', studyTemplateData);
  }
  getStudyTemplateContent(studyTemplateInfo) {
    console.log('getStudyTemplateContent', studyTemplateInfo);
  }
}



// WEBPACK FOOTER //
// ./src/utils/chart/quadencyChartSaveAdapter.js