import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';
import PropTypes from 'prop-types';
import Article from './article';

class Articles extends Component {
  shouldComponentUpdate(nextProps) {
    return JSON.stringify(this.props) !== JSON.stringify(nextProps);
  }

  render() {
    const {
      newsItems,
      fullWidth
    } = this.props;

    return (
      <Grid item xs={12} md={fullWidth ? 12 : 8}>
        {newsItems.map((article) => {
          return (<Article
            key={article.title}
            title={article.title}
            summary={article.summary}
            author={article.author.names}
            publishTimestamp={article.publish_timestamp}
            sourceUrl={article.source_url}
            tags={article.tags.values} />);
        })}
      </Grid>
    );
  }
}

Articles.defaultProps = {
  fullWidth: false
};

Articles.propTypes = {
  newsItems: PropTypes.array.isRequired,
  fullWidth: PropTypes.bool
};

export default Articles;



// WEBPACK FOOTER //
// ./src/components/news/articles.js