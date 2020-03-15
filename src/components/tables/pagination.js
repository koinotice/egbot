import React, { Component } from 'react';
import { TablePagination } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import Icon from '@material-ui/core/Icon';
import { withTheme, withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';

const styles = theme => ({
  root: {
    flexShrink: 0,
    color: theme.palette.text.secondary,
    marginLeft: theme.spacing.unit * 2.5,
  },
});

const ActionsComponent = (
  classes,
  page,
  count,
  rowsPerPage,
  prevPageHandler,
  nextPageHandler,
  firstPageHandler,
  lastPageHandler,
  onChangePageHandler
) => {
  return (
    <div className={classes.root}>
      { firstPageHandler &&
        <IconButton
          onClick={(e) => {
            firstPageHandler(e);
            onChangePageHandler();
          }}
          disabled={page === 0}
          name="firstPage" >
          <Icon>first_page</Icon>
        </IconButton>
      }
      <IconButton
        onClick={(e) => {
          prevPageHandler(e);
          onChangePageHandler();
        }}
        disabled={page === 0}
        name="prevPage">
        <Icon>keyboard_arrow_left</Icon>
      </IconButton>
      <IconButton
        onClick={(e) => {
          nextPageHandler(e);
          onChangePageHandler();
        }}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        name="nextPage">
        <Icon>keyboard_arrow_right</Icon>
      </IconButton>
      { lastPageHandler &&
        <IconButton
          onClick={(e) => {
            lastPageHandler(e);
            onChangePageHandler();
          }}
          disabled={page >= Math.ceil(count / rowsPerPage) - 1}
          name="lastPage" >
          <Icon>last_page</Icon>
        </IconButton>
      }
    </div>
  );
};

class Pagination extends Component {
  static propTypes = {
    classes: PropTypes.object.isRequired,
    count: PropTypes.number.isRequired,
    page: PropTypes.number.isRequired,
    rowsPerPage: PropTypes.number.isRequired,
    rowsPerPageOptions: PropTypes.array.isRequired,
    prevPageHandler: PropTypes.func.isRequired,
    nextPageHandler: PropTypes.func.isRequired,
    firstPageHandler: PropTypes.func,
    lastPageHandler: PropTypes.func,
    onChangePage: PropTypes.func
  };

  static defaultProps = {
    firstPageHandler: null,
    lastPageHandler: null,
    onChangePage: () => {}
  };

  render() {
    const {
      classes,
      count,
      page,
      rowsPerPage,
      rowsPerPageOptions,
      prevPageHandler,
      nextPageHandler,
      firstPageHandler,
      lastPageHandler,
      onChangePage
    } = this.props;
    return (
      <TablePagination
        count={count}
        page={page}
        onChangePage={onChangePage}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={rowsPerPageOptions}
        ActionsComponent={() =>
          ActionsComponent(classes, page, count, rowsPerPage, prevPageHandler, nextPageHandler, firstPageHandler, lastPageHandler, onChangePage)} />
    );
  }
}

export default withTheme()(withStyles(styles)(Pagination));



// WEBPACK FOOTER //
// ./src/components/tables/pagination.js