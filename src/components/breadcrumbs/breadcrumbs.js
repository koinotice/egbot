import React, { Component, Fragment, Children } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import uuidv4 from '../../utils/uuid';

const styles = theme => ({
  ul: {
    margin: 0,
    padding: 0,
    listStyle: 'none',
    display: 'inline-flex'
  },
  delimiter: {
    margin: '0 1.0714rem',
    color: theme.palette.text.secondary
  }
});

class Breadcrumbs extends Component {
  render() {
    const { classes, children, delimiter } = this.props;
    const childrenArray = Children.toArray(children);
    const delimitedChildren = childrenArray.map((child, index) => (
      <Fragment key={uuidv4()}>
        <li>{child}</li>
        {index !== (childrenArray.length - 1) &&
          <li className={classes.delimiter}>{delimiter}</li>
        }
      </Fragment>
    ));

    return (
      <ul className={classes.ul}>
        {delimitedChildren}
      </ul>
    );
  }
}

Breadcrumbs.defaultProps = {
  delimiter: '>'
};

Breadcrumbs.propTypes = {
  classes: PropTypes.object.isRequired,
  children: PropTypes.any.isRequired,
  delimiter: PropTypes.string
};

export default withStyles(styles, { withTheme: true })(Breadcrumbs);



// WEBPACK FOOTER //
// ./src/components/breadcrumbs/breadcrumbs.js