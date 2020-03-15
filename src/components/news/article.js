import React, { Component } from 'react';
import Icon from '@material-ui/core/Icon';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ReactMarkdown from 'react-markdown';
import { withTheme, withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import { isoTimeFromNow } from '../../utils/time';
import { ellipsize } from '../../utils/helpers';


const styles = theme => ({
  article: {
    color: theme.palette.text.primary,
    marginTop: '2px',
    backgroundColor: theme.palette.background.paperDarker,
    '&:before': {
      backgroundColor: 'transparent'
    },
    boxShadow: 'none',
    borderBottom: 'none',
  },
  title: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: theme.palette.text.primary,
  },
  date: {
    textAlign: 'right',
  },
  summary: {
    lineHeight: '1.8rem',
  },
  summaryLink: {
    textDecoration: 'none',
    color: theme.palette.primary.main,
  },
  author: {
    marginTop: '0.7143rem',
    color: theme.palette.text.secondary,
  },
  source: {
    marginTop: '0.7143rem',
    textAlign: 'right',
    textDecoration: 'none',
  },
  sourceLink: {
    textDecoration: 'none',
    color: theme.palette.primary.main,
  },
  tags: {
    textDecoration: 'none',
  },
  details: {
    backgroundColor: theme.palette.background.default
  }
});

class Article extends Component {
  formatSummary(summary, classes) {
    function link(props) {
      return <a href={props.href} rel="noopener noreferrer" target="_blank" className={classes.summaryLink}>{props.children}</a>;
    }

    return (<ReactMarkdown
      linkTarget="_blank"
      renderers={{ link }}
      source={summary} />);
  }

  render() {
    const {
      classes, title, summary, author, sourceUrl, tags, publishTimestamp
    } = this.props;

    return (
      <ExpansionPanel className={classes.article}>
        <ExpansionPanelSummary expandIcon={<Icon>expand_more</Icon>}>
          <Grid container spacing={0} justify="center">
            <Grid className={classes.title} item xs={10}>{ellipsize(title, 110)}</Grid>
            <Grid className={classes.date} item xs={2}>{isoTimeFromNow(publishTimestamp)}</Grid>
          </Grid>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails className={classes.details}>
          <Grid container spacing={0} justify="center">
            <Grid className={classes.summary} item xs={12}>{this.formatSummary(ellipsize(summary, 1000), classes)}</Grid>
            <Grid className={classes.author} item xs={4}>By {author.join(', ')}</Grid>
            <Grid item xs={4} />
            <Grid className={classes.source} item xs={4}>
              <a className={classes.sourceLink} href={sourceUrl} rel="noopener noreferrer" target="_blank">
              Read More
              </a>
            </Grid>
            {tags.length > 0 && <Grid className={classes.tags} item xs={12}>Tags: {tags.join(', ')}</Grid>}
          </Grid>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    );
  }
}

Article.propTypes = {
  classes: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  summary: PropTypes.string.isRequired,
  author: PropTypes.array.isRequired,
  sourceUrl: PropTypes.string.isRequired,
  publishTimestamp: PropTypes.string.isRequired,
  tags: PropTypes.array.isRequired,
};


export default withTheme()(withStyles(styles)(Article));



// WEBPACK FOOTER //
// ./src/components/news/article.js