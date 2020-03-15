import React, { Component, Fragment } from 'react';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { withStyles, withTheme } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import PropTypes from 'prop-types';

const styles = {
  wrapper: {
    marginTop: '3.5714285714285716rem',
    height: '100vh',
    backgroundColor: '#131A24',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    backgroundSize: 'cover !important' // background size not being set inline, need important because it's being overridden
  },
  paper: {
    minHeight: '28.357142857142858rem',
    width: '35.714285714285715rem',
    padding: '2.142857142857143rem',
    display: 'flex',
    flexFlow: 'column',
    justifyContent: 'space-around',
    alignItems: 'center',
    textAlign: 'center',
  },
  container: {
    padding: '0.5rem',
    display: 'flex',
    flexFlow: 'column',
    justifyContent: 'space-around',
    alignItems: 'center',
    textAlign: 'center',
    '&>*': {
      marginTop: '20px'
    }
  },
  title: {
    fontWeight: 'bold',
  },
  subheading: {
    marginBottom: '10px',
  },
  img: {
    width: '100px',
    height: '100px',
    marginBottom: '10px',
  },
  imgSmall: {
    width: '70px',
    height: '70px',
  },
  link: {
    color: 'inherit',
    textDecoration: 'none'
  }
};

class EmptyStateCover extends Component {
  render() {
    const {
      classes,
      theme,
      background,
      icon,
      iconSmall,
      title,
      subheading,
      cta,
      ctaVariant,
      ctaColor,
      ctaPath,
      cta2,
      cta2Variant,
      cta2Color,
      cta2Path,
      ctaButtonOverride,
    } = this.props;
    const { hostname } = window.location;

    const component = (
      <Fragment >
        {icon &&
          <img className={ iconSmall ? classes.imgSmall : classes.img } src={`/platform/static/images/flat-${icon}.svg`} alt={icon} />
        }
        {title &&
          <Typography className={classes.title} variant="h6">{title}</Typography>
        }
        {subheading &&
          <Typography className={classes.subheading} variant="subtitle1">{subheading}</Typography>
        }
        {ctaButtonOverride}
        {!ctaButtonOverride && cta &&
        <Button
          color={ctaColor}
          variant={ctaVariant}
          onClick={() => { location.href = `//${hostname}${ctaPath}`; } }>
          {cta}
        </Button>}
        { cta2 &&
        <Button
          color={cta2Color}
          variant={cta2Variant}
          onClick={() => { location.href = `//${hostname}${cta2Path}`; } }>
          {cta2}
        </Button>
        }
      </Fragment>);

    if (background) {
      return (
        <div
          className={classes.wrapper}
          style={{
            background: `linear-gradient( rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.6) ),
                    url(/platform/static/images/${background}-bg-${theme.palette.type}.jpg) no-repeat center 50px fixed`
          }}>
          <Paper className={classes.paper}>
            {component}
          </Paper>
        </div>
      );
    }

    return (
      <div className={classes.container}>
        {component}
      </div>
    );
  }
}

EmptyStateCover.defaultProps = {
  iconSmall: false,
  background: '',
  ctaVariant: 'contained',
  ctaColor: 'primary',
  cta: '',
  cta2: '',
  cta2Variant: 'outlined',
  cta2Color: 'secondary',
  ctaPath: '',
  cta2Path: '',
  ctaButtonOverride: null,
  title: '',
};

EmptyStateCover.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  background: PropTypes.string,
  icon: PropTypes.string.isRequired,
  iconSmall: PropTypes.bool,
  title: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element
  ]),
  subheading: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
  ]).isRequired,
  cta: PropTypes.string,
  ctaVariant: PropTypes.string,
  ctaColor: PropTypes.string,
  ctaPath: PropTypes.string,
  cta2: PropTypes.string,
  cta2Variant: PropTypes.string,
  cta2Color: PropTypes.string,
  cta2Path: PropTypes.string,
  ctaButtonOverride: PropTypes.element,
};

export default withTheme()(withStyles(styles)(EmptyStateCover));



// WEBPACK FOOTER //
// ./src/components/common/emptyStateCover.js