import moment from 'moment';

function epochMsToLocalTime(epoch) {
  const time = moment.unix(Math.floor(epoch / 1000));
  return time.format('HH:mm:ss');
}

function epochMsToDateTime(epoch) {
  const time = moment.unix(Math.floor(epoch / 1000));
  return time.format('L LTS');
}


function epochMsToDate(epoch) {
  const time = moment.unix(Math.floor(epoch / 1000));
  return time.format('L');
}

function isoToTableDateTime(iso) {
  const time = moment(iso);
  return time.format('L LTS');
}

function isoToUnix(iso) {
  return moment(iso).unix();
}

function isoToDateTime(iso) {
  const time = moment(iso);
  return time.format('D MMM YYYY, hh:mm A');
}

function isoTimeFromNow(iso) {
  const time = moment(iso);
  return time.fromNow();
}

function nowUnix() {
  return moment().unix();
}

function timeDiff(ts1, ts2, unit) {
  const diff = moment(ts1).diff(moment(ts2), unit);
  return Math.abs(diff);
}

export {
  epochMsToLocalTime,
  epochMsToDateTime,
  epochMsToDate,
  isoToDateTime,
  isoToTableDateTime,
  isoToUnix,
  isoTimeFromNow,
  nowUnix,
  timeDiff
};



// WEBPACK FOOTER //
// ./src/utils/time.js