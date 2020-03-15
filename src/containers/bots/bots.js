import React, { Component } from 'react';
import { Switch, Route, Link, Redirect, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withStyles } from '@material-ui/core/styles';
import { PulseLoader } from 'react-spinners';
import Grid from '@material-ui/core/Grid';
import MenuList from '@material-ui/core/MenuList';
import MenuItem from '@material-ui/core/MenuItem';
import Hidden from '@material-ui/core/Hidden';
import PropTypes from 'prop-types';
import EmptyStateCover from '../../components/common/emptyStateCover';
import BotsFaq from '../../components/bots/botsFaq';
import { initialize } from '../../store/ducks/algos/bots';
import { getSessionToken } from '../../utils/token';
import AvailableBots from './availableBots';
import BotConfigs from './botConfigs';
import Workspace from './workspace';


const styles = theme => ({
  root: {
    flexGrow: 1,
    padding: '8px',
    marginTop: '60px'
  },
  ul: {
    padding: 0,
    textAlign: 'left',
    listStyleImage: 'url(/platform/static/images/bullet.svg)',
  },
  menuList: {
    marginBottom: '2.8rem'
  },
  menuItem: {
    paddingTop: '0.375rem',
    paddingBottom: '0.375rem',
    borderRadius: '0.1875rem',
    fontSize: '1rem'
  },
  link: {
    textDecoration: 'none',
    color: theme.palette.text.secondary,
    fontWeight: '600'
  },
  selected: {
    backgroundColor: `${theme.palette.primary.main} !important`,
    color: '#fff'
  }
});

class Bots extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentRoute: this.props.location.pathname.split('/')[2],
      showMenu: !(this.props.location.pathname.split('/')[3])
    };
  }

  componentDidMount() {
    const { actions } = this.props;
    if (getSessionToken()) {
      actions.initialize();
    }
  }

  componentWillReceiveProps(nextProps) {
    const { currentRoute } = this.state;
    const nextRoute = nextProps.location.pathname.split('/')[2] || '';

    this.setState({
      showMenu: !(nextProps.location.pathname.split('/')[3])
    });

    if (currentRoute !== nextRoute) {
      this.setState({
        currentRoute: nextRoute
      });
    }
  }

  renderWithRoot(component) {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        {component}
      </div>
    );
  }

  renderEmptyState = classes => (
    <EmptyStateCover
      background="bots"
      icon="robot"
      title="Trading Bots"
      subheading={
        <ul className={classes.ul}>
          <li>Customize, backtest and run popular strategies</li>
          <li>Benchmark performance against buy-and-hold</li>
          <li>Completely automated - start/stop a bot anytime</li>
        </ul>
      }
      cta="Create your free account"
      ctaPath="/a/signup" />
  );

  renderLoader = () => (
    <Grid container alignItems="center" justify="center">
      <PulseLoader color="#52B0B0" size={6} loading />
    </Grid>
  )

  renderRoute = () => {
    return (
      <Switch>
        <Route exact path="/bots/select" component={AvailableBots} />
        <Route exact path="/bots/my-bots" component={BotConfigs} />
        <Route path="/bots/my-bots/workspace" component={Workspace} />
        <Route render={() => <Redirect to="/bots/my-bots" />} />
      </Switch>
    );
  }

  renderWithMenu = (classes, match, currentRoute) => {
    return this.renderWithRoot((
      <Grid container spacing={24}>
        <Grid item xs={12} sm={3} md={2}>
          <MenuList className={classes.menuList}>
            <Link to={`${match.url}/my-bots`} className={classes.link}>
              <MenuItem
                className={classes.menuItem}
                classes={{ selected: classes.selected }}
                selected={currentRoute === 'my-bots'}>
                My Bots
              </MenuItem>
            </Link>
            <Link to={`${match.url}/select`} className={classes.link}>
              <MenuItem
                className={classes.menuItem}
                classes={{ selected: classes.selected }}
                selected={currentRoute === 'select'}>
                Available Bots
              </MenuItem>
            </Link>
          </MenuList>
          <Hidden xsDown>
            <BotsFaq />
          </Hidden>
        </Grid>
        <Grid item xs={12} sm={9} md={10}>
          {this.renderRoute()}
        </Grid>
        <Grid item xs={12} sm={3} md={2} />
      </Grid>
    ));
  };

  renderWithoutMenu = () => {
    return this.renderWithRoot((
      <Grid container spacing={24}>
        <Grid item xs={12}>
          {this.renderRoute()}
        </Grid>
      </Grid>
    ));
  };

  render() {
    const { classes, match, botsLoaded } = this.props;
    const { currentRoute, showMenu } = this.state;

    if (!getSessionToken()) {
      return this.renderEmptyState(classes);
    }

    if (!botsLoaded) {
      return this.renderLoader();
    }

    return showMenu ? this.renderWithMenu(classes, match, currentRoute) : this.renderWithoutMenu();
  }
}

Bots.propTypes = {
  classes: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  botsLoaded: PropTypes.bool.isRequired,
  match: PropTypes.object.isRequired,
};

function mapStateToProps(state) {
  return {
    botsLoaded: state.algos.bots.botsLoaded,
  };
}

function mapDispatchToProps(dispatcher) {
  return {
    actions: {
      ...bindActionCreators({
        initialize
      }, dispatcher)
    }
  };
}

const base = withRouter(withStyles(styles, { withTheme: true })(Bots));
export default connect(mapStateToProps, mapDispatchToProps)(base);



// WEBPACK FOOTER //
// ./src/containers/bots/bots.js