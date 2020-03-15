import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { withStyles, withTheme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import SvgIcon from '@material-ui/core/SvgIcon';
import Tooltip from '@material-ui/core/Tooltip';
import Link from '@material-ui/core/Link';

function arrowGenerator(color) {
  return {
    '&[x-placement*="bottom"] $arrow': {
      top: 0,
      left: 0,
      marginTop: '-0.95em',
      width: '3em',
      height: '1em',
      '&::before': {
        borderWidth: '0 1em 1em 1em',
        borderColor: `transparent transparent ${color} transparent`,
      },
    },
    '&[x-placement*="top"] $arrow': {
      bottom: 0,
      left: 0,
      marginBottom: '-0.95em',
      width: '3em',
      height: '1em',
      '&::before': {
        borderWidth: '1em 1em 0 1em',
        borderColor: `${color} transparent transparent transparent`,
      },
    },
    '&[x-placement*="right"] $arrow': {
      left: 0,
      marginLeft: '-0.95em',
      height: '3em',
      width: '1em',
      '&::before': {
        borderWidth: '1em 1em 1em 0',
        borderColor: `transparent ${color} transparent transparent`,
      },
    },
    '&[x-placement*="left"] $arrow': {
      right: 0,
      marginRight: '-0.95em',
      height: '3em',
      width: '1em',
      '&::before': {
        borderWidth: '1em 0 1em 1em',
        borderColor: `transparent transparent transparent ${color}`,
      },
    },
  };
}

const styles = theme => ({
  tooltip: {
    backgroundColor: theme.palette.common.black,
    maxWidth: 220,
  },
  text: {
    fontSize: theme.typography.pxToRem(13),
    color: theme.palette.common.white,
  },
  popper: arrowGenerator(theme.palette.common.black),
  arrow: {
    position: 'absolute',
    fontSize: 6,
    width: '3em',
    height: '3em',
    '&::before': {
      content: '""',
      margin: 'auto',
      display: 'block',
      width: 0,
      height: 0,
      borderStyle: 'solid',
    },
  },
  defaultIcon: {
    verticalAlign: 'middle',
    marginLeft: '5px',
    color: theme.palette.text.secondary
  },
  iconLarge: {
    width: '20px',
    height: '20px'
  }
});

class TooltipIcon extends Component {
  state = {
    arrowRef: null,
  };

  handleArrowRef = (node) => {
    this.setState({
      arrowRef: node,
    });
  };

  renderIcon = () => {
    const { classes, Icon, large } = this.props;
    if (Icon) {
      return Icon;
    }
    return (
      <SvgIcon className={`${classes.defaultIcon} ${large ? classes.iconLarge : ''}`} viewBox="0,0,512,512" fontSize="inherit">
        <path d="M235.4 172.2c0-11.4 9.3-19.9 20.5-19.9 11.4 0 20.7 8.5 20.7 19.9s-9.3 20-20.7 20c-11.2 0-20.5-8.6-20.5-20zm1.4 35.7H275V352h-38.2V207.9z" />
        <path d="M256 76c48.1 0 93.3 18.7 127.3 52.7S436 207.9 436 256s-18.7 93.3-52.7 127.3S304.1 436 256 436c-48.1 0-93.3-18.7-127.3-52.7S76 304.1 76 256s18.7-93.3 52.7-127.3S207.9 76 256 76m0-28C141.1 48 48 141.1 48 256s93.1 208 208 208 208-93.1 208-208S370.9 48 256 48z" />
      </SvgIcon>
    );
  };

  render() {
    const {
      classes, style, title, learnMoreLink, placement
    } = this.props;
    return (
      <Tooltip interactive
        placement={placement}
        classes={{ tooltip: classes.tooltip, popper: classes.popper }}
        style={style}
        title={
          <Fragment>
            <Typography className={classes.text}>{title}</Typography>
            { learnMoreLink &&
              <Typography className={classes.text}>
                <Link href={learnMoreLink} target="_blank">Learn More</Link>
              </Typography>
            }
            <span className={classes.arrow} ref={this.handleArrowRef} />
          </Fragment>
        }

        PopperProps={{
          popperOptions: {
            modifiers: {
              arrow: {
                enabled: Boolean(this.state.arrowRef),
                element: this.state.arrowRef,
              },
            },
          }
        }}>
        {this.renderIcon()}
      </Tooltip>
    );
  }
}

TooltipIcon.defaultProps = {
  learnMoreLink: null,
  style: {},
  Icon: null,
  placement: 'right',
  large: false
};

TooltipIcon.propTypes = {
  classes: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  style: PropTypes.object,
  learnMoreLink: PropTypes.string,
  Icon: PropTypes.node,
  placement: PropTypes.string,
  large: PropTypes.bool
};

export default withTheme()(withStyles(styles)(TooltipIcon));



// WEBPACK FOOTER //
// ./src/components/common/tooltipIcon.js