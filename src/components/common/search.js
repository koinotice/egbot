import React from 'react';
import Hidden from '@material-ui/core/Hidden';
import Grid from '@material-ui/core/Grid';
import withWidth, { isWidthDown } from '@material-ui/core/withWidth';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import Icon from '@material-ui/core/Icon';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';

const styles = {
  headingTypography: {
    display: 'inline-block',
    fontSize: '1.5rem',
  },
  plusIcon: {
    marginRight: '0.625rem',
    transform: 'scale(.75)',
  },
};

const Search = ({
  width,
  classes,
  heading,
  placeholder,
  onChange,
  value
}) => (
  <Grid
    container
    direction={isWidthDown('xs', width) ? 'column' : 'row'}
    justify="space-between"
    alignItems={isWidthDown('xs', width) ? 'stretch' : 'center'} >
    <Hidden xsDown>
      <Grid item style={{ display: 'flex' }}>
        <Typography className={classes.headingTypography} variant="h5">
          {heading}
        </Typography>
      </Grid>
    </Hidden>
    <Grid item>
      <TextField
        placeholder={placeholder}
        fullWidth
        margin="normal"
        InputProps={{
          startAdornment:
            <InputAdornment position="start">
              <Icon className={classes.plusIcon}>search</Icon>
            </InputAdornment>
        }}
        onChange={event => onChange(event.target.value)}
        value={value} />
    </Grid>
  </Grid>
);

Search.propTypes = {
  width: PropTypes.string.isRequired,
  classes: PropTypes.object.isRequired,
  heading: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired
};

export default withWidth()(withStyles(styles)(Search));



// WEBPACK FOOTER //
// ./src/components/common/search.js