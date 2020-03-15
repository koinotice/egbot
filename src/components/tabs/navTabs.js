import React, { Component, Children, cloneElement } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';


const styles = () => ({
  paper: {
    display: 'flex',
    paddingTop: '2px',
  },
  inline: {
    display: 'inline-block',
    alignSelf: 'flex-end'
  },
  drag: {
    flexGrow: 1,
  }
});

class NavTabs extends Component {
  handleChange = (val) => {
    this.props.onChange(val);
  };

  render() {
    const {
      classes,
      children,
      value,
      inline,
      justify,
      large,
      disableUnderline
    } = this.props;

    const childrenArray = Children.toArray(children);
    const childrenWithProps = childrenArray.filter(o => o).map(child =>
      cloneElement(child, {
        value: child.props.value,
        activeVal: value || childrenArray[0].props.value,
        large,
        disableUnderline,
        handleChange: this.handleChange,
      }));

    return (
      <div className={`${classes.paper} ${inline ? classes.inline : ''}`}
        style={{ justifyContent: justify }}
        elevation={0}>
        {childrenWithProps}
        <div className={`${classes.drag} dragHandle`} />
      </div>
    );
  }
}

NavTabs.defaultProps = {
  value: '',
  inline: false,
  justify: 'flex-start',
  large: false,
  disableUnderline: false
};

NavTabs.propTypes = {
  onChange: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
  children: PropTypes.any.isRequired,
  value: PropTypes.string,
  justify: PropTypes.string,
  inline: PropTypes.bool,
  large: PropTypes.bool,
  disableUnderline: PropTypes.bool
};

export default withStyles(styles)(NavTabs);



// WEBPACK FOOTER //
// ./src/components/tabs/navTabs.js