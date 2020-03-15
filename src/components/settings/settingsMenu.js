import React, { Fragment } from 'react';
import { withStyles, withTheme } from '@material-ui/core/styles';
import MenuList from '@material-ui/core/MenuList';
import MenuItem from '@material-ui/core/MenuItem';
import PropTypes from 'prop-types';
import { Link, withRouter } from 'react-router-dom';
import { IS_PRIVATE_INSTANCE } from '../../config/globalConfig';

const styles = theme => ({
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

const SettingsMenu = ({ classes, active, match }) => (
  <Fragment>
    <MenuList>
      <Link to={`${match.url}/user`} className={classes.link}>
        <MenuItem
          className={classes.menuItem}
          classes={{ selected: classes.selected }}
          selected={active === 'user'}>
          User Settings
        </MenuItem>
      </Link>
      <Link to={`${match.url}/preferences`} className={classes.link}>
        <MenuItem
          className={classes.menuItem}
          classes={{ selected: classes.selected }}
          selected={active === 'preferences'}>
          Preferences
        </MenuItem>
      </Link>
      <Link to={`${match.url}/password`} className={classes.link}>
        <MenuItem
          className={classes.menuItem}
          classes={{ selected: classes.selected }}
          selected={active === 'password'}>
          Change Password
        </MenuItem>
      </Link>
      <Link to={`${match.url}/security`} className={classes.link}>
        <MenuItem
          className={classes.menuItem}
          classes={{ selected: classes.selected }}
          selected={active === 'security'}>
          Security (2FA)
        </MenuItem>
      </Link>
      <Link to={`${match.url}/accounts`} className={classes.link}>
        <MenuItem
          className={classes.menuItem}
          classes={{ selected: classes.selected }}
          selected={active === 'accounts'}>
          My Accounts
        </MenuItem>
      </Link>
      <Link to={`${match.url}/api`} className={classes.link}>
        <MenuItem
          className={classes.menuItem}
          classes={{ selected: classes.selected }}
          selected={active === 'api'}>
          Developer APIs
        </MenuItem>
      </Link>
      {!IS_PRIVATE_INSTANCE &&
      <Link to={`${match.url}/referrals`} className={classes.link}>
        <MenuItem
          className={classes.menuItem}
          classes={{ selected: classes.selected }}
          selected={active === 'referrals'}>
          Referrals
        </MenuItem>
      </Link>
      }
    </MenuList>
  </Fragment>
);

SettingsMenu.propTypes = {
  classes: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
  active: PropTypes.string.isRequired
};

export default withRouter(withTheme()(withStyles(styles)(SettingsMenu)));



// WEBPACK FOOTER //
// ./src/components/settings/settingsMenu.js