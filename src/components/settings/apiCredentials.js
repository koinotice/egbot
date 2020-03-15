import React, { Fragment } from 'react';
import Grid from '@material-ui/core/Grid';
import ButtonBase from '@material-ui/core/ButtonBase';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import ReadOnlyTextField from '../common/readOnlyTextField';
import { IS_PRIVATE_INSTANCE } from '../../config/globalConfig';

const styles = theme => ({
  keysContainer: {
    marginBottom: '4rem',
  },
  textField: {
    cursor: 'text'
  },
  button: {
    marginTop: '0.7149rem',
    fontSize: '0.8571rem',
    color: theme.palette.error.main
  },
  typography: {
    color: theme.palette.text.secondary
  },
  link: {
    textDecoration: 'none',
    color: theme.palette.primary.main,
  },
  linkText: {
    paddingTop: '2rem',
    paddingBottom: '1rem',
  }
});

const ApiCredentials = ({ classes, userApiCredentials: { apiKey, secretKey }, onClickDeleteKeys }) => {
  return (
    <Fragment>
      <Grid className={classes.keysContainer} container>
        <Grid xs={12} sm={8} item>
          <ReadOnlyTextField label="API Key" value={apiKey} name="apiKey" />
          { secretKey && <ReadOnlyTextField label="Secret Key" value={secretKey} name="secretKey" /> }
          <ButtonBase onClick={onClickDeleteKeys} className={classes.button}>Delete Keys</ButtonBase>
        </Grid>
      </Grid>
      <Grid container>
        <Grid xs={12} sm={10} item>
          <Typography className={classes.linkText}>
            <a
              href={IS_PRIVATE_INSTANCE ? 'https://quadency.com/developer/#quadency-unified-api' : '/developer/#quadency-unified-api'}
              className={classes.link}
              target="__blank">
              Read API Documentation
            </a>
          </Typography>
          <Typography variant="subtitle2">
            Important: Keep your API keys safe and do not share with anyone. These keys grant access to all connected accounts. Some actions allowed are only limited by permissions set on your exchange API keys.
          </Typography>
        </Grid>
      </Grid>
    </Fragment>
  );
};

ApiCredentials.propTypes = {
  classes: PropTypes.object.isRequired,
  userApiCredentials: PropTypes.object.isRequired,
  onClickDeleteKeys: PropTypes.func.isRequired
};

export default withStyles(styles, { withTheme: true })(ApiCredentials);



// WEBPACK FOOTER //
// ./src/components/settings/apiCredentials.js