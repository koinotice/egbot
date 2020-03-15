import React, { Fragment, Component } from 'react';
import { connect } from 'react-redux';
import Grid from '@material-ui/core/Grid';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import { withStyles, withTheme } from '@material-ui/core/styles';
import WidgetAssetAllocations from './widgets/widgetAssetAllocations';
import WidgetBalancesByAccount from './widgets/widgetBalancesByAccount';
import WidgetPerformance from './widgets/widgetPerformance';
import WidgetHistoricalAllocations from './widgets/widgetHistoricalAllocations';
import WidgetPortfolioStats from './widgets/widgetPortfolioStats';
import EmptyStateCover from '../common/emptyStateCover';
import TooltipIcon from '../common/tooltipIcon';
import TradesTable from '../tables/tradesTable';

const styles = theme => ({
  paper: {
    padding: theme.spacing.unit * 2,
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.background.paper,
  },
  title: {
    display: 'inline-block',
    fontSize: theme.custom.charts.title.fontSize,
    fontWeight: 'bold',
    marginBottom: '10px'
  },
  panelFixedContainer: {
    height: '400px',
    minHeight: '400px',
    maxHeight: '400px',
    overflowY: 'auto',
    overflowX: 'hidden',
  },
  panelScrollContainer: {
    minHeight: '400px',
    maxHeight: '400px',
    overflowY: 'auto',
    overflowX: 'hidden',
  },
  tooltipIcon: {
    padding: '5px 0 0 5px'
  }
});

class DashboardOverview extends Component {
  getViewLabel = () => {
    const { accounts, currentAccountId } = this.props;
    if (accounts.length && currentAccountId) {
      const currentAccount = accounts.find(account => account.id === currentAccountId);
      return currentAccount ? currentAccount.label : null;
    }
    return 'Portfolio';
  };

  filterViewBalances() {
    const { holdingsByAccount, holdingsByAsset, currentAccountId } = this.props;
    if (currentAccountId) {
      return holdingsByAccount.find(acct => acct.id === currentAccountId).assets;
    }
    return holdingsByAsset;
  }

  render() {
    const { classes, currentAccountId } = this.props;

    const currentViewBalances = this.filterViewBalances();

    if (currentViewBalances.length === 0) {
      return (
        <Fragment>
          <Grid item xs={12} md={12} lg={10}>
            <div className={classes.paper}>
              <EmptyStateCover
                icon="empty"
                title="No Assets"
                subheading="It appears that there are no assets in your accounts - begin by making a deposit."
                cta="Goto Trade"
                ctaButtonOverride={<div />}
                ctaPath="/platform/trade" />
            </div>
          </Grid>
        </Fragment>);
    }

    return (
      <Fragment>
        <Grid item xs={12} md={8} lg={7}>
          <div className={classes.paper}>
            <Typography className={classes.title}>
              {this.getViewLabel()} Performance
              <TooltipIcon
                className={classes.tooltipIcon}
                title="Historical value of your currently selected account(s). The graph is constructed based on your trading activity and deposit/withdrawal history."
                learnMoreLink="https://support.quadency.com/portfolio-and-performance-monitoring/dashboard-overview" />
            </Typography>
            <WidgetPerformance />
          </div>
        </Grid>
        <Grid item xs={12} md={4} lg={3}>
          <div className={classes.paper}>
            <Typography className={classes.title}>
              {this.getViewLabel()}  Stats
              <TooltipIcon
                className={classes.tooltipIcon}
                title="High level statistics of your currently selected account(s)"
                learnMoreLink="https://support.quadency.com/portfolio-and-performance-monitoring/dashboard-overview" />
            </Typography>
            <WidgetPortfolioStats />
          </div>
        </Grid>

        <Grid item xs={12} md={8} lg={7}>
          <div className={classes.paper}>
            <Typography className={classes.title}>
              {this.getViewLabel()} Historical Allocations
              <TooltipIcon
                className={classes.tooltipIcon}
                title="Historical snapshots of your asset allocations. Time frame is linked to the Performance chart above."
                learnMoreLink="https://support.quadency.com/portfolio-and-performance-monitoring/dashboard-overview" />
            </Typography>
            <WidgetHistoricalAllocations />
          </div>
        </Grid>
        <Grid item xs={12} md={4} lg={3}>
          <div className={classes.paper}>
            <Typography className={classes.title}>
              {this.getViewLabel()} Current Allocations
              <TooltipIcon
                className={classes.tooltipIcon}
                title="Current distribution of assets in your selected account(s)"
                learnMoreLink="https://support.quadency.com/portfolio-and-performance-monitoring/dashboard-overview" />
            </Typography>
            <WidgetAssetAllocations />
          </div>
        </Grid>

        <Grid item xs={12} md={8} lg={7}>
          <div className={classes.paper}>
            <Typography className={classes.title}>
              Recent {this.getViewLabel()} Trades
              <TooltipIcon className={classes.tooltipIcon} title="Most recent trades for your account(s)" />
            </Typography>
            <div className={classes.panelFixedContainer}>
              <TradesTable filterAccountId={currentAccountId} enableEdit={false} stickyHeader />
            </div>
          </div>
        </Grid>
        <Grid item xs={12} md={4} lg={3}>
          <div className={classes.paper}>
            <Typography className={classes.title}>
              Balances By Account
              <TooltipIcon
                className={classes.tooltipIcon}
                title="Overall value and distribution of balances by account(s)"
                learnMoreLink="https://support.quadency.com/portfolio-and-performance-monitoring/dashboard-overview" />
            </Typography>
            <WidgetBalancesByAccount />
          </div>
        </Grid>
      </Fragment>
    );
  }
}

DashboardOverview.propTypes = {
  classes: PropTypes.object.isRequired,
  currentAccountId: PropTypes.string.isRequired,
  accounts: PropTypes.array.isRequired,
  holdingsByAccount: PropTypes.array.isRequired,
  holdingsByAsset: PropTypes.array.isRequired,
};

function mapStateToProps(state) {
  return {
    currentAccountId: state.trade.interactions.currentAccountId,
    accounts: state.global.accounts.accounts,
    holdingsByAccount: state.holdings.holdings.byAccount,
    holdingsByAsset: state.holdings.holdings.byAsset,
  };
}

const base = withTheme()(withStyles(styles)(DashboardOverview));
export default connect(mapStateToProps)(base);



// WEBPACK FOOTER //
// ./src/components/dashboard/dashboardOverview.js