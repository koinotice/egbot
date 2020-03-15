import React, { Component, Fragment } from 'react';
import Hidden from '@material-ui/core/Hidden';
import TextField from '@material-ui/core/TextField';
import Icon from '@material-ui/core/Icon';
import InputAdornment from '@material-ui/core/InputAdornment';
import Typography from '@material-ui/core/Typography';
import { PulseLoader } from 'react-spinners';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import { withStyles, withTheme } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import { fetchNews } from '../../store/ducks/news/news';
import Articles from '../../components/news/articles';


const styles = theme => ({
  root: {
    flexGrow: 1,
    padding: '8px',
    marginTop: '60px',
  },
  footer: {
    fontSize: '0.8rem',
    marginTop: '7.143rem',
    marginBottom: '1.143rem',
    lineHeight: '1.5rem',
    color: theme.palette.text.muted,
  },
  paper: {
    padding: '12px 24px',
    color: theme.palette.text.secondary,
    boxShadow: 'none',
  },
  search: {
    marginBottom: '20px',
  },
  searchContent: {
    paddingLeft: '24px',
    paddingRight: '24px',
  },
  headingTypography: {
    display: 'inline-block',
    fontSize: '1.7rem',
  },
  plusIcon: {
    marginRight: '0.625rem',
    transform: 'scale(.75)',
  },
  messariLink: {
    color: theme.palette.text.secondary
  }
});

class News extends Component {
  constructor(props) {
    super(props);

    this.state = {
      search: ''
    };
  }

  componentDidMount() {
    const { actions } = this.props;
    actions.fetchNews();
  }

  setSearch = (event) => {
    this.setState({
      search: event.target.value
    });
  };

  renderWithRoot(component) {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        {component}
      </div>
    );
  }

  render() {
    const {
      classes, newsItems, newItemsLoaded,
    } = this.props;
    const { search } = this.state;

    if (!newItemsLoaded) {
      return this.renderWithRoot((
        <Grid style={{ minHeight: 59 }} container alignItems="center" justify="center">
          <PulseLoader color="#52B0B0" size={6} loading />
        </Grid>
      ));
    }

    const filteredNewsItems = search ? newsItems.filter(item => ((item.title).toLowerCase()).includes(search.toLowerCase())) : newsItems;

    return this.renderWithRoot((
      <Fragment>
        <Grid className={classes.search} container justify="space-between">
          <Grid item md={2} />
          <Grid className={classes.searchContent} item xs={12} md={8}>
            <Grid
              container
              direction="row"
              alignItems="center"
              justify="space-between">
              <Hidden xsDown>
                <Grid item style={{ display: 'flex' }} md={4}>
                  <Typography className={classes.headingTypography} variant="h5">
                      Latest News
                  </Typography>
                </Grid>
              </Hidden>
              <Grid item xs={12} md={4}>
                <TextField
                  placeholder="Search News"
                  fullWidth
                  margin="normal"
                  InputProps={{
                    startAdornment:
                            <InputAdornment position="start">
                              <Icon className={classes.plusIcon}>search</Icon>
                            </InputAdornment>,
                  }}
                  onChange={this.setSearch}
                  value={search} />
              </Grid>
              <Hidden xsDown>
                <Grid item style={{ display: 'flex', justifyContent: 'flex-end' }} xs={12} md={4}>
                  <a href="https://messari.io" target="__blank">
                    <img src="/platform/static/images/sponsored-by-messari.svg" alt="Sponsored by Messari" />
                  </a>
                </Grid>
              </Hidden>
            </Grid>
          </Grid>
          <Grid item md={2} />
        </Grid>
        <Grid container spacing={0} justify="center" alignItems="center" direction="column">
          <Articles newsItems={filteredNewsItems} />
        </Grid>
      </Fragment>
    ));
  }
}

News.propTypes = {
  classes: PropTypes.object.isRequired,
  newsItems: PropTypes.array.isRequired,
  newItemsLoaded: PropTypes.bool.isRequired,
  actions: PropTypes.objectOf(PropTypes.func).isRequired,
};

function mapStateToProps(state) {
  return {
    newsItems: state.news.news.newItems,
    newItemsLoaded: state.news.news.newItemsLoaded,
  };
}

function mapDispatchToProps(dispatcher) {
  return {
    actions: {
      ...bindActionCreators({
        fetchNews,
      }, dispatcher)
    }
  };
}

const base = (withTheme()(withStyles(styles)(News)));
export default connect(mapStateToProps, mapDispatchToProps)(base);



// WEBPACK FOOTER //
// ./src/containers/news/news.js