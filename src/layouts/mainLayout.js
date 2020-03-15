import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Link, withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Grid from '@material-ui/core/Grid';
import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import { BounceLoader } from 'react-spinners';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Icon from '@material-ui/core/Icon';
import Button from '@material-ui/core/Button';
import ButtonBase from '@material-ui/core/ButtonBase';
import Popper from '@material-ui/core/Popper';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Hidden from '@material-ui/core/Hidden';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import { withStyles } from '@material-ui/core/styles';
import { fetchUser, setPrefCurrency, setTradeLayout } from '../store/ducks/global/user';
import { initPaywall, hidePaywallModal } from '../store/ducks/global/paywall';
import { fetchExchanges } from '../store/ducks/global/exchanges';
import { fetchForex } from '../store/ducks/global/forex';
import { fetchPrices } from '../store/ducks/global/prices';
import { logoutUser } from '../api/users/users';
import { getSessionToken, removeSessionToken } from '../utils/token';
import userPing from '../api/private/users';
import PlatformSnackbars from '../components/notifications/platformSnackbar';
import DesktopNotifications from '../components/notifications/desktopNotifications';
import ConnectionStatus from '../components/common/connectionStatus';
import SavePrompt from '../components/common/savePrompt';
import BadKeysNotification from '../components/common/badKeysNotification';
import PaywallModal from '../components/common/paywallModal';
import withPaywall from '../components/hocs/paywall';
import Disclaimer from '../components/common/disclaimer';
import PlanUsageBar from '../components/common/planUsageBar';
import { Consumer } from '../utils/appContext';
import { ellipsize } from '../utils/helpers';
import { MODES, STATUSES } from '../utils/botConstants';
import { IS_PRIVATE_INSTANCE } from '../config/globalConfig';
import { ROOT_URL } from '../config/apiConfig';

const styles = theme => ({
  appBar: {
    backgroundColor: theme.palette.type === 'dark' ? theme.palette.background.paper : '#30118A',
    zIndex: theme.zIndex.drawer + 1,
    boxShadow: 'none'
  },
  mobileMenu: {
    width: 240,
  },
  menuButton: {
    marginLeft: '10px',
  },
  mr10: {
    marginRight: '10px',
  },
  logo: {
    width: '20px',
    height: '20px',
    margin: '5px 15px 0 20px'
  },
  toolBar: {
    minHeight: '50px',
    borderBottom: '1px solid #222'
  },
  flex: {
    flex: 1
  },
  userMenuButton: {
    padding: '12px'
  },
  popperClose: {
    pointerEvents: 'none'
  },
  menuPaper: {
    zIndex: 2000
  },
  tab: {
    minWidth: '80px',
    textTransform: 'none',
    fontWeight: 'bold'
  },
  text: {
    color: '#FFF'
  },
  themeIcon: {
    color: theme.palette.text.secondary,
    marginRight: '1rem',
  },
  link: {
    textDecoration: 'none'
  },
  upgradeLinkItem: {
    color: theme.palette.icons.green
  },
  chatBubble: {
    color: theme.palette.text.secondary,
    cursor: 'pointer',
    marginRight: '1rem',
  },
  currencyMenu: {
    color: theme.palette.text.secondary,
    marginRight: '0.7rem',
    fontWeight: 'bold',
    fontSize: '1rem',
    '& svg': {
      fill: theme.palette.text.secondary
    },
    '& div div': {
      paddingRight: '24px'
    }
  },
  currencyMenuItem: {
    fontSize: '1rem',
  },
  layoutPrompt: {
    padding: '10px',
    background: 'rgba(0, 0, 0, 0.3)',
  },
  input: {
    paddingLeft: '1.071rem',
    // fix focus in firefox
    '&:focus': {
      background: 'none'
    }
  },
  footerContainer: {
    marginTop: '100px',
    marginBottom: '100px',
    alignContent: 'space-evenly',
  },
  footerGridItem: {
    padding: '8px'
  },
  footerHeader: {
    color: '#52B0B0',
    fontWeight: '300',
    fontFamily: 'futura',
    marginBottom: '16px'
  },
  footerListItem: {
    padding: '0',
    marginBottom: '5px'
  },
  footerLink: {
    color: theme.palette.text.secondary,
    fontSize: '16px',
    textDecoration: 'none'
  },
  socialList: {
    listStyle: 'none',
    paddingLeft: '0'
  },
  socialListItem: {
    display: 'inline-block',
    marginRight: '8px'
  },
  copyrightText: {
    color: theme.palette.text.muted,
    paddingBottom: '15px',
    fontSize: '11.2px'
  },
  socialIcon: {
    width: '44px',
    height: '44px'
  },
  [theme.breakpoints.down('sm')]: {
    footerContainer: {
      alignContent: 'initial'
    }
  }
});

class MainLayout extends Component {
  constructor(props) {
    super(props);


    this.mainRoutes = ['dashboard', 'portfolio', 'trade', 'bots', 'market', 'news'];
    this.shouldShowFooter = {
      LOGGED_OUT: ['market', 'news'],
      HODLER: ['bots', 'portfolio', 'market', 'news', 'settings'],
      ESSENTIAL: ['bots', 'dashboard', 'portfolio', 'market', 'news', 'settings'],
      PRO: ['bots', 'dashboard', 'portfolio', 'market', 'news', 'settings'],
      GOD: ['bots', 'dashboard', 'portfolio', 'market', 'news', 'settings']
    };

    /* eslint-disable-next-line prefer-destructuring */
    this.currentRoute = window.location.pathname.split('/')[2];
    this.state = {
      tabsValue: this.isMainRoute(this.currentRoute),
      anchorEl: null,
      userMenuOpen: false,
      mobileMenuOpen: false,
    };
    this.USER_PING_INTERVAL = 300000;
    this.sessionToken = getSessionToken();

    this.props.history.listen((location) => {
      // always scroll to top when route changes
      const topLevelRoute = location.pathname.split('/')[1];
      if (topLevelRoute !== this.currentRoute) {
        window.scrollTo(0, 0);
      }
    });
  }

  componentDidMount() {
    const { actions } = this.props;
    actions.fetchExchanges();
    actions.fetchForex();
    actions.fetchPrices();

    this.initIntercom();

    if (this.sessionToken) {
      actions.fetchUser();
      actions.initPaywall();
      this.stopPingFn = this.startPing();
    }
  }

  componentWillReceiveProps(nextProps) {
    const newRoute = window.location.pathname.split('/')[2];
    if (this.state.tabsValue !== newRoute) {
      // update currentRoute for user ping
      this.currentRoute = newRoute;
      this.setState({
        tabsValue: this.isMainRoute(newRoute)
      });
    }

    const { user, userLoaded } = nextProps;
    if (this.sessionToken && userLoaded) {
      this.initIntercom(user);
    }
  }

  componentWillUnmount() {
    if (this.sessionToken) {
      this.stopPingFn();
    }
  }

  setTabsValue = (obj, val) => {
    this.setState({
      tabsValue: val
    });
  };

  setPrefCurrency = (event) => {
    this.props.actions.setPrefCurrency(event.target.value);
  };

  getTradeLimitAndUsage = () => {
    const { features } = this.props;
    const tradeFeature = Object.keys(features).find(feature => feature.startsWith('TRADE'));
    const tradeLimit = tradeFeature && tradeFeature.includes('-') ? tradeFeature.split('-')[1] : null;
    const tradeUsage = tradeFeature && features[tradeFeature].trade_limit ? features[tradeFeature].trade_limit : 0;

    return {
      tradeLimit,
      tradeUsage
    };
  };

  getBacktestLimitAndUsage = () => {
    const { features } = this.props;
    const backtestFeature = Object.keys(features).find(feature => feature.startsWith('BACKTEST'));
    const backtestLimit = backtestFeature && backtestFeature.includes('-') ? backtestFeature.split('-')[1] : null;
    const backtestUsage = backtestFeature && features[backtestFeature].completed_back_tests ? features[backtestFeature].completed_back_tests : 0;

    return {
      backtestLimit,
      backtestUsage
    };
  };

  getLiveLimitAndUsage = () => {
    const { features, botConfigs } = this.props;
    const liveFeature = Object.keys(features).find(feature => feature.startsWith('LIVE_BOTS'));
    const liveLimit = liveFeature && liveFeature.includes('-') ? liveFeature.split('-')[1] : null;

    const runningCount = Object.keys(botConfigs).reduce((acc, cur) => {
      const { status, mode } = botConfigs[cur];
      if (mode && status && mode.toLowerCase() === MODES.LIVE && status.toLowerCase() === STATUSES.RUNNING) {
        return ++acc;
      }
      return acc;
    }, 0);

    return {
      liveLimit,
      liveUsage: runningCount
    };
  };

  toggleUserMenu = (event) => {
    const { currentTarget } = event;
    this.setState(() => ({
      anchorEl: currentTarget,
      userMenuOpen: !this.state.userMenuOpen,
    }));
  };
  toggleMobileMenu = () => {
    this.setState({
      mobileMenuOpen: !this.state.mobileMenuOpen,
    });
  };
  closeUserMenu = (event) => {
    if (!event) return;
    if (this.userMenu && this.userMenu.contains(event.target)) return;
    this.setState({
      userMenuOpen: false,
    });
  };
  closeMobileMenu = () => {
    this.setState({
      mobileMenuOpen: false,
    });
  };
  logout = async (event) => {
    this.closeUserMenu(event); // close menu
    await logoutUser();
    removeSessionToken();
    location.replace('/login');
  };

  initIntercom = () => {
    if (IS_PRIVATE_INSTANCE) {
      return;
    }
    const { user, userLoaded } = this.props;

    const intercomConfig = {
      app_id: 'f72jrlya',
      hide_default_launcher: true,
      custom_launcher_selector: '#chat_bubble',
      name: userLoaded ? user.name : null,
      email: userLoaded ? user.email : null,
    };

    if (window.Intercom) {
      window.Intercom('boot', intercomConfig);
    } else {
      setTimeout(() => {
        if (window.Intercom) {
          window.Intercom('boot', intercomConfig);
        }
      }, 5000);
    }
  };
  handleResetLayout = () => {
    const { actions } = this.props;
    actions.setTradeLayout(true);
  };
  handleSaveLayout = () => {
    const { actions } = this.props;
    actions.setTradeLayout();
  };

  isFreeUser = () => {
    const { products } = this.props;
    if (!products || !products.length) {
      return true;
    }
    return products.every(p => p.productid === '3');
  };

  isTrialUser = () => {
    const { products } = this.props;
    if (!products || !products.length) {
      return false;
    }
    const proProduct = products.find(p => p.productid === '1');
    if (proProduct) {
      return proProduct.metadata.accessType === 'TRIAL';
    }
    return false;
  };

  startPing = () => {
    const { history } = this.props;
    userPing(this.currentRoute);

    // ping every 5 minutes
    setInterval(() => {
      if (document.hasFocus()) {
        userPing(this.currentRoute);
      }
    }, this.USER_PING_INTERVAL);

    // ping when window comes back into focus
    window.addEventListener('focus', () => userPing(this.currentRoute));

    // ping on route change
    const unlisten = history.listen((location) => {
      const topLevelRoute = location.pathname.split('/')[1];
      if (topLevelRoute !== this.currentRoute) {
        userPing(topLevelRoute);
      }
    });

    // cleanup function
    return () => {
      window.removeEventListener('focus', () => userPing(this.currentRoute));
      unlisten();
    };
  };

  isMainRoute = (route) => {
    if (this.mainRoutes.indexOf(route) === -1) return false;
    return route;
  };

  renderHeader() {
    const {
      classes,
      user,
      accounts,
      showSaveLayoutPrompt,
      match,
      paywallLoaded
    } = this.props;
    const {
      mobileMenuOpen,
      userMenuOpen,
      anchorEl
    } = this.state;

    const { pref_currency: prefCurrency } = user.preferences;
    const id = open ? 'usermenu-popper' : null;

    const SaveLayoutPrompt = withPaywall('LAYOUTS')(({
      isFeatureEnabled,
      showPaywallModal
    }) => {
      return (
        <SavePrompt
          show={showSaveLayoutPrompt}
          promptText="Layout changed"
          save={isFeatureEnabled.LAYOUTS ? this.handleSaveLayout : () => {
            showPaywallModal();
            this.handleResetLayout();
          }}
          reset={this.handleResetLayout} />
      );
    });

    return (
      <Fragment>
        <AppBar className={classes.appBar} elevation={1}>
          <Toolbar disableGutters className={classes.toolBar}>
            <Hidden mdUp>
              <IconButton onClick={this.toggleMobileMenu} className={classes.menuButton} color="inherit" aria-label="Menu">
                <Icon>menu</Icon>
              </IconButton>
            </Hidden>
            <Hidden mdUp>
              <Typography className={classes.flex}>&nbsp;</Typography>
            </Hidden>
            <Hidden smDown>
              <a href={ROOT_URL} rel="noopener noreferrer" target="_blank">
                <img className={classes.logo}
                  src="/platform/static/images/quad-logo-white.svg"
                  alt="Quadency Logo" />
              </a>
            </Hidden>
            <Hidden smDown>
              <Tabs indicatorColor="primary" value={this.state.tabsValue} onChange={this.setTabsValue}>
                <Tab className={classes.tab} label="Dashboard" value="dashboard" component={Link} to="/dashboard" />
                <Tab className={classes.tab} label="Portfolio" value="portfolio" component={Link} to="/portfolio" />
                <Tab className={classes.tab} label="Trade" value="trade" component={Link} to="/trade" />
                <Tab className={classes.tab} label="Bots" value="bots" component={Link} to="/bots" />
                <Tab className={classes.tab} label="Research" value="market" component={Link} to="/market" />
                <Tab className={classes.tab} label="News" value="news" component={Link} to="/news" />
              </Tabs>
            </Hidden>
            <Typography className={classes.flex}>&nbsp;</Typography>
            { this.sessionToken && <SaveLayoutPrompt /> }
            <BadKeysNotification />
            <ConnectionStatus checkPrivateConnection={Boolean(accounts.length)} />
            <Select className={classes.currencyMenu}
              inputProps={{ name: 'currencyMenu', className: classes.input }}
              value={prefCurrency}
              onChange={this.setPrefCurrency}
              disableUnderline>
              <MenuItem className={classes.currencyMenuItem} value="BTC">BTC</MenuItem>
              <MenuItem className={classes.currencyMenuItem} value="AUD">AUD</MenuItem>
              <MenuItem className={classes.currencyMenuItem} value="CAD">CAD</MenuItem>
              <MenuItem className={classes.currencyMenuItem} value="EUR">EUR</MenuItem>
              <MenuItem className={classes.currencyMenuItem} value="GBP">GBP</MenuItem>
              <MenuItem className={classes.currencyMenuItem} value="HKD">HKD</MenuItem>
              <MenuItem className={classes.currencyMenuItem} value="JPY">JPY</MenuItem>
              <MenuItem className={classes.currencyMenuItem} value="NZD">NZD</MenuItem>
              <MenuItem className={classes.currencyMenuItem} value="USD">USD</MenuItem>
              <MenuItem className={classes.currencyMenuItem} value="ZAR">ZAR</MenuItem>
            </Select>
            <Consumer>
              {(value) => {
                const { toggleTheme, themeType } = value;
                return (
                  <ButtonBase className={classes.themeIcon} onClick={toggleTheme}>
                    <Icon>{ themeType === 'dark' ? 'wb_sunny' : 'brightness_3' }</Icon>
                  </ButtonBase>
                );
              }}
            </Consumer>
            {!IS_PRIVATE_INSTANCE &&
            <Hidden smDown>
              <Tooltip title="Support Chat" placement="bottom">
                <Icon id="chat_bubble"
                  className={classes.chatBubble}>live_help
                </Icon>
              </Tooltip>
            </Hidden>
            }
            {!this.sessionToken &&
            <span>
              <Button size="small" color="primary" className={classes.mr10} href="/login">Log In</Button>
              <Button size="small" name="signUp" variant="contained" color="primary" className={classes.mr10} href="/signup">Sign Up</Button>
            </span>
            }
            {this.sessionToken &&
            <Hidden smDown>
              <div ref={(node) => {
                this.userMenu = node;
              }}>
                <ButtonBase
                  className={classes.userMenuButton}
                  aria-describedby={id}
                  aria-haspopup="true"
                  onClick={this.toggleUserMenu}>
                  <Typography className={classes.text} name="globalName">{ellipsize(user.name, 10)}</Typography>
                  <Icon>arrow_drop_down</Icon>
                </ButtonBase>
              </div>
            </Hidden>
            }
            {this.sessionToken &&
            <Popper
              open={userMenuOpen}
              id={id}
              anchorEl={anchorEl}
              placement="bottom-end">
              <ClickAwayListener onClickAway={this.closeUserMenu}>
                <Grow in={userMenuOpen} id="user-menu" style={{ transformOrigin: '0 0 0' }}>
                  <Paper className={classes.menuPaper}>
                    <MenuList role="menu">
                      {!IS_PRIVATE_INSTANCE && (paywallLoaded && (this.isFreeUser() || this.isTrialUser())) &&
                      <a className={classes.link} href={`${window.location.protocol}//${window.location.host}/pricing`}>
                        <MenuItem className={classes.upgradeLinkItem} name="upgradeToPro" onClick={this.closeUserMenu()}>Upgrade To Pro</MenuItem>
                      </a>}
                      <Link className={classes.link} to={`${match.url}settings/user`}>
                        <MenuItem name="userSettings" onClick={this.closeUserMenu}>User Settings</MenuItem>
                      </Link>
                      <Link className={classes.link} to={`${match.url}settings/preferences`}>
                        <MenuItem name="preferences" onClick={this.closeUserMenu}>Preferences</MenuItem>
                      </Link>
                      <Link className={classes.link} to={`${match.url}settings/password`}>
                        <MenuItem name="changePassword" onClick={this.closeUserMenu}>Change Password</MenuItem>
                      </Link>
                      <Link className={classes.link} to={`${match.url}settings/security`}>
                        <MenuItem name="security2Fa" onClick={this.closeUserMenu}>Security (2FA)</MenuItem>
                      </Link>
                      <Link className={classes.link} to={`${match.url}settings/accounts`}>
                        <MenuItem name="linkedAccounts" onClick={this.closeUserMenu}>My Accounts</MenuItem>
                      </Link>
                      <Link className={classes.link} to={`${match.url}settings/api`}>
                        <MenuItem name="developerApis" onClick={this.closeUserMenu}>Developer APIs</MenuItem>
                      </Link>
                      {!IS_PRIVATE_INSTANCE &&
                      <Link className={classes.link} to={`${match.url}settings/referrals`}>
                        <MenuItem name="referrals" onClick={this.closeUserMenu}>Referrals</MenuItem>
                      </Link>
                      }
                      <a
                        className={classes.link}
                        href="https://support.quadency.com/"
                        rel="noopener noreferrer"
                        target="_blank">
                        <MenuItem name="supportCenter">Support Center</MenuItem>
                      </a>
                      <MenuItem name="logOut" onClick={this.logout}>Log Out</MenuItem>
                    </MenuList>
                  </Paper>
                </Grow>
              </ClickAwayListener>
            </Popper>
            }
          </Toolbar>
        </AppBar>
        <Drawer open={mobileMenuOpen} onClose={this.closeMobileMenu}>
          <div className={ classes.mobileMenu }>
            <List component="nav" onClick={this.closeMobileMenu}>
              <ListItem button component={Link} to="/dashboard">
                <Icon color={this.currentRoute === 'dashboard' ? 'primary' : 'secondary'}>dashboard</Icon>
                <ListItemText>Dashboard</ListItemText>
              </ListItem>
              <ListItem button component={Link} to="/portfolio">
                <Icon color={this.currentRoute === 'portfolio' ? 'primary' : 'secondary'}>account_balance_wallet</Icon>
                <ListItemText>Portfolio</ListItemText>
              </ListItem>
              <ListItem button component={Link} to="/trade">
                <Icon color={this.currentRoute === 'trade' ? 'primary' : 'secondary'}>swap_horizontal_circle</Icon>
                <ListItemText>Trade</ListItemText>
              </ListItem>
              <ListItem button component={Link} to="/bots">
                <Icon color={this.currentRoute === 'bots' ? 'primary' : 'secondary'}>trending_up</Icon>
                <ListItemText>Bots</ListItemText>
              </ListItem>
              <ListItem button component={Link} to="/market">
                <Icon color={this.currentRoute === 'coins' ? 'primary' : 'secondary'}>view_list</Icon>
                <ListItemText>Research</ListItemText>
              </ListItem>
              <ListItem button component={Link} to="/news">
                <Icon color={this.currentRoute === 'news' ? 'primary' : 'secondary'}>library_books</Icon>
                <ListItemText>News</ListItemText>
              </ListItem>
            </List>
            <Divider />
            {this.sessionToken &&
            <List component="nav" onClick={this.closeMobileMenu}>
              <ListItem button component={Link} to="/settings/user">
                <Icon color="secondary">settings</Icon>
                <ListItemText>User Settings</ListItemText>
              </ListItem>
              <ListItem button component={Link} to="/settings/preferences">
                <Icon color="secondary">settings</Icon>
                <ListItemText>Preferences</ListItemText>
              </ListItem>
              <ListItem button component={Link} to="/settings/password">
                <Icon color="secondary">more_horiz</Icon>
                <ListItemText>Change Password</ListItemText>
              </ListItem>
              <ListItem button component={Link} to="/settings/security">
                <Icon color="secondary">lock</Icon>
                <ListItemText>Security (2FA)</ListItemText>
              </ListItem>
              <ListItem button component={Link} to="/settings/accounts">
                <Icon color="secondary">settings_input_component</Icon>
                <ListItemText>My Accounts</ListItemText>
              </ListItem>
              <ListItem button component={Link} to="/settings/api">
                <Icon color="secondary">link</Icon>
                <ListItemText>Developer APIs</ListItemText>
              </ListItem>
              {!IS_PRIVATE_INSTANCE &&
              <ListItem button component={Link} to="settings/referrals">
                <Icon color="secondary">people</Icon>
                <ListItemText>Referrals</ListItemText>
              </ListItem>
              }
              <ListItem button component="a" href="https://support.quadency.com">
                <Icon color="secondary">help</Icon>
                <ListItemText>Support Center</ListItemText>
              </ListItem>
              <ListItem button onClick={this.logout}>
                <Icon color="secondary">power_settings_new</Icon>
                <ListItemText>Log Out</ListItemText>
              </ListItem>
            </List>
            }
            {!this.sessionToken &&
            <List component="nav" onClick={this.closeMobileMenu}>
              <ListItem button component="a" href="/">
                <ListItemText>Home</ListItemText>
              </ListItem>
              <ListItem button component="a" href="https://blog.quadency.com">
                <ListItemText>Blog</ListItemText>
              </ListItem>
              <ListItem button component="a" href="https://support.quadency.com">
                <ListItemText>Support</ListItemText>
              </ListItem>
            </List>
            }
          </div>
        </Drawer>
      </Fragment>
    );
  }

  renderFooter() {
    const {
      classes, theme, products, features, user
    } = this.props;

    const plan = products && products.length ? products[0].name : 'LOGGED_OUT';

    return (
      <Grid justify="center" className={classes.footerContainer} container>
        { !!products.length && features &&
          <Grid xs={10} className={classes.footerGridItem} style={{ marginBottom: '100px' }} item>
            <PlanUsageBar
              plan={plan}
              product={products[0]}
              trade={this.getTradeLimitAndUsage()}
              backtest={this.getBacktestLimitAndUsage()}
              live={this.getLiveLimitAndUsage()} />
          </Grid>
        }
        {!IS_PRIVATE_INSTANCE &&
        <Fragment>
          <Grid xs={10} className={classes.footerGridItem} item>
            <Grid container>
              <Grid xs={12} md={3} item>
                <Typography className={classes.footerHeader}
                  variant="h6">PLATFORM
                </Typography>
                <List>
                  <ListItem className={classes.footerListItem}>
                    <Link to="/dashboard"
                      className={classes.footerLink}
                      variant="subtitle2">Dashboard
                    </Link>
                  </ListItem>
                  <ListItem className={classes.footerListItem}>
                    <Link to="/portfolio"
                      className={classes.footerLink}
                      variant="subtitle2">Portfolio
                    </Link>
                  </ListItem>
                  <ListItem className={classes.footerListItem}>
                    <Link to="/trade"
                      className={classes.footerLink}
                      variant="subtitle2">Trade
                    </Link>
                  </ListItem>
                  <ListItem className={classes.footerListItem}>
                    <Link to="/bots"
                      className={classes.footerLink}
                      variant="subtitle2">Bots
                    </Link>
                  </ListItem>
                  <ListItem className={classes.footerListItem}>
                    <Link to="/market"
                      className={classes.footerLink}
                      variant="subtitle2">Research
                    </Link>
                  </ListItem>
                  <ListItem className={classes.footerListItem}>
                    <Link to="/news"
                      className={classes.footerLink}
                      variant="subtitle2">News
                    </Link>
                  </ListItem>
                  <ListItem className={classes.footerListItem}>&nbsp;</ListItem>
                  <ListItem className={classes.footerListItem}>
                    <a href="/pricing"
                      className={classes.footerLink}
                      variant="subtitle2"
                      target="__blank">Plans &amp; Pricing
                    </a>
                  </ListItem>
                  <ListItem className={classes.footerListItem}>
                    <a href="/institutional"
                      className={classes.footerLink}
                      variant="subtitle2"
                      target="__blank">Institutional
                      Tools
                    </a>
                  </ListItem>
                </List>
              </Grid>
              <Grid xs={12} md={3} item>
                <Typography className={classes.footerHeader} variant="h6">
                  RESOURCES
                </Typography>
                <List>
                  {user.email &&
                  <Fragment>
                    <ListItem className={classes.footerListItem}>
                      <a
                        href={`https://quadency.typeform.com/to/XkKqZR?quid=${btoa(user.email)}`}
                        className={classes.footerLink}
                        variant="subtitle2"
                        target="__blank">Report a Bug
                      </a>
                    </ListItem>
                    <ListItem className={classes.footerListItem}>
                      <a
                        href={`https://quadency.typeform.com/to/o5hBwX?quid=${btoa(user.email)}`}
                        className={classes.footerLink}
                        variant="subtitle2"
                        target="__blank">Request a Feature
                      </a>
                    </ListItem>
                  </Fragment>
                  }
                  <ListItem className={classes.footerListItem}>
                    <a href="https://support.quadency.com"
                      className={classes.footerLink}
                      variant="subtitle2"
                      target="__blank">Support Center
                    </a>
                  </ListItem>
                  <ListItem className={classes.footerListItem}>
                    <a href="/api"
                      className={classes.footerLink}
                      variant="subtitle2"
                      target="__blank">APIs &amp; Market Data
                    </a>
                  </ListItem>
                  <ListItem className={classes.footerListItem}>
                    <a href="/developer"
                      className={classes.footerLink}
                      variant="subtitle2"
                      target="__blank">Developers
                    </a>
                  </ListItem>
                  <ListItem className={classes.footerListItem}>
                    <a href="/referrals"
                      className={classes.footerLink}
                      variant="subtitle2"
                      target="__blank">Referral Program
                    </a>
                  </ListItem>
                  <ListItem className={classes.footerListItem}>&nbsp;</ListItem>
                  <ListItem className={classes.footerListItem}>
                    <a
                      href="https://support.quadency.com/account-and-security/is-quadency-secure"
                      className={classes.footerLink}
                      variant="subtitle2"
                      target="__blank">Security
                    </a>
                  </ListItem>
                  <ListItem className={classes.footerListItem}>
                    <a href="/terms-of-use"
                      className={classes.footerLink}
                      variant="subtitle2"
                      target="__blank">Terms of Use
                    </a>
                  </ListItem>
                  <ListItem className={classes.footerListItem}>
                    <a href="/privacy-policy"
                      className={classes.footerLink}
                      variant="subtitle2"
                      target="__blank">Privacy Policy
                    </a>
                  </ListItem>
                </List>
              </Grid>
              <Grid xs={12} md={3} item>
                <Typography className={classes.footerHeader} variant="h6">THE
                  COMPANY
                </Typography>
                <List>
                  <ListItem className={classes.footerListItem}>
                    <a href="/about"
                      className={classes.footerLink}
                      variant="subtitle2"
                      target="__blank">About
                    </a>
                  </ListItem>
                  <ListItem className={classes.footerListItem}>
                    <a href="https://blog.quadency.com"
                      className={classes.footerLink}
                      variant="subtitle2"
                      target="__blank">Blog
                    </a>
                  </ListItem>
                  <ListItem className={classes.footerListItem}>
                    <a href="mailto:support@quadency.com"
                      className={classes.footerLink}
                      variant="subtitle2">Contact
                      Us
                    </a>
                  </ListItem>
                  <ListItem className={classes.footerListItem}>
                    <a href="https://quadency.typeform.com/to/Y8DTou"
                      target="__blank"
                      className={classes.footerLink}
                      variant="subtitle2">Partnerships
                    </a>
                  </ListItem>
                  <ListItem className={classes.footerListItem}>
                    <a href="https://quadency.typeform.com/to/ggDbaZ"
                      target="__blank"
                      className={classes.footerLink}
                      variant="subtitle2">Advertise
                    </a>
                  </ListItem>
                </List>
              </Grid>
              <Grid xs={12} md={3} item>
                <Typography className={classes.footerHeader} variant="h6">CONNECT
                  / FOLLOW
                </Typography>
                <ul className={classes.socialList}>
                  <li className={classes.socialListItem}>
                    <a href="https://twitter.com/quadency" target="__blank">
                      <img
                        src={`/platform/static/images/twitter-${theme.palette.type}.svg`}
                        className={classes.socialIcon}
                        alt="twitter" />
                    </a>
                  </li>
                  <li className={classes.socialListItem}>
                    <a href="https://t.me/joinchat/Fbj0HRHlGePeT8QeV-4uBg"
                      target="__blank">
                      <img
                        src={`/platform/static/images/telegram-${theme.palette.type}.svg`}
                        className={classes.socialIcon}
                        alt="telegram" />
                    </a>
                  </li>
                  <li className={classes.socialListItem}>
                    <a href="https://www.linkedin.com/company/quadency"
                      target="__blank">
                      <img
                        src={`/platform/static/images/linkedin-${theme.palette.type}.svg`}
                        className={classes.socialIcon}
                        alt="linkedin" />
                    </a>
                  </li>
                  <li className={classes.socialListItem}>
                    <a
                      href="https://www.youtube.com/channel/UCREIcRdNIjzrUHMqDQs4Vuw"
                      target="__blank">
                      <img
                        src={`/platform/static/images/youtube-${theme.palette.type}.svg`}
                        className={classes.socialIcon}
                        alt="youtube" />
                    </a>
                  </li>
                </ul>
              </Grid>
            </Grid>
          </Grid>
        </Fragment>
        }
        <Grid xs={10} className={classes.footerGridItem} item>
          <Disclaimer />
        </Grid>
        <Grid xs={10}
          className={classes.footerGridItem}
          style={{ textAlign: 'center' }}
          item>
          <Typography className={classes.copyrightText}>Copyright &copy; 2020
              Quadency &middot; 79 Madison Ave, New York, NY
          </Typography>
        </Grid>

      </Grid>
    );
  }

  render() {
    const {
      children,
      userLoaded,
      forexLoaded,
      pricesLoaded,
      accountsLoaded,
      notifications,
      paywallModalVisible,
      actions,
      paywallTitle,
    } = this.props;

    if (
      (!forexLoaded || !pricesLoaded) ||
      (this.sessionToken && (!userLoaded || !accountsLoaded))) {
      return (
        <Grid style={{ height: '100vh' }} container alignItems="center" justify="center">
          <BounceLoader color="#52B0B0" loading />
        </Grid>
      );
    }

    return (
      <div>
        <PlatformSnackbars notifications={notifications} />
        <DesktopNotifications notifications={notifications} />
        {this.renderHeader()}
        <PaywallModal title={paywallTitle} visible={paywallModalVisible} hide={actions.hidePaywallModal} />
        {children}
        {this.renderFooter()}
      </div>
    );
  }
}

MainLayout.defaultProps = {
  notifications: [],
  products: [],
  features: {},
  paywallTitle: undefined,
  botConfigs: {}
};

MainLayout.propTypes = {
  children: PropTypes.any.isRequired,
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
  actions: PropTypes.objectOf(PropTypes.func).isRequired,
  user: PropTypes.object.isRequired,
  userLoaded: PropTypes.bool.isRequired,
  accounts: PropTypes.array.isRequired,
  forexLoaded: PropTypes.bool.isRequired,
  pricesLoaded: PropTypes.bool.isRequired,
  accountsLoaded: PropTypes.bool.isRequired,
  notifications: PropTypes.array,
  paywallModalVisible: PropTypes.bool.isRequired,
  showSaveLayoutPrompt: PropTypes.bool.isRequired,
  products: PropTypes.array,
  features: PropTypes.object,
  paywallLoaded: PropTypes.bool.isRequired,
  paywallTitle: PropTypes.string,
  history: PropTypes.object.isRequired,
  botConfigs: PropTypes.object
};

function mapStateToProps(state) {
  return {
    user: state.global.user.user,
    showSaveLayoutPrompt: state.global.user.showSaveLayoutPrompt,
    accountsLoaded: state.global.accounts.accountsLoaded,
    accounts: state.global.accounts.accounts,
    userLoaded: state.global.user.userLoaded,
    forexLoaded: state.global.forex.forexLoaded,
    pricesLoaded: state.global.prices.pricesLoaded,
    notifications: state.global.notifications.notifications,
    paywallModalVisible: state.global.paywall.paywallModalVisible,
    products: state.global.paywall.products,
    features: state.global.paywall.features,
    paywallLoaded: state.global.paywall.paywallLoaded,
    paywallTitle: state.global.paywall.paywallTitle,
    botConfigs: state.algos.bots.botConfigs,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      ...bindActionCreators({
        fetchExchanges,
        fetchForex,
        fetchUser,
        initPaywall,
        hidePaywallModal,
        fetchPrices,
        setPrefCurrency,
        setTradeLayout
      }, dispatch)
    }
  };
}

const base = (withStyles(styles, { withTheme: true })((MainLayout)));
export default (withRouter(connect(mapStateToProps, mapDispatchToProps)(base)));




// WEBPACK FOOTER //
// ./src/layouts/mainLayout.js