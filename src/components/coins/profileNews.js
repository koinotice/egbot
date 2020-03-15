import React from 'react';
import { GridLoader } from 'react-spinners';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import PropTypes from 'prop-types';
import Articles from '../news/articles';

const styles = theme => ({
  placeholderContainer: {
    height: '21.4286rem'
  },
  textSecondary: {
    color: theme.palette.text.secondary
  }
});

const ProfileNews = ({
  classes, news, newsLoaded
}) => {
  const renderLoader = () => (
    <Grid container spacing={0} justify="center" alignItems="center" direction="column" className={classes.placeholderContainer}>
      <GridLoader color="#52B0B0" size={6} loading />
    </Grid>
  );

  const renderEmptyState = () => (
    <Grid container spacing={0} justify="center" alignItems="center" direction="column" className={classes.placeholderContainer}>
      <Typography variant="h5" className={classes.textSecondary}>No News</Typography>
    </Grid>
  );

  if (!newsLoaded) {
    return renderLoader();
  }

  if (!news.length) {
    return renderEmptyState();
  }

  return (
    <Grid container spacing={0} justify="center" alignItems="center" direction="column">
      <Articles newsItems={news} fullWidth />
    </Grid>
  );
};

ProfileNews.propTypes = {
  classes: PropTypes.object.isRequired,
  news: PropTypes.array.isRequired,
  newsLoaded: PropTypes.bool.isRequired
};

export default withStyles(styles, { withTheme: true })(ProfileNews);



// WEBPACK FOOTER //
// ./src/components/coins/profileNews.js