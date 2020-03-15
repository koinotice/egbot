import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles, withTheme } from '@material-ui/core/styles';

const styles = theme => ({
  container: {
    marginTop: '100px'
  },
  link: {
    color: theme.palette.primary.main,
  },
  muted: {
    color: theme.palette.text.muted,
    fontSize: '0.8rem',
    lineHeight: '1.5rem'
  }
});

class Disclaimer extends Component {
  render() {
    const {
      classes
    } = this.props;
    return (
      <div className={classes.container}>
        <p className={classes.muted}>Dust notice: Assets with total value under 0.00000260 BTC (~ $0.01) are hidden and omitted
          from portfolio calculations.
        </p>
        <p className={classes.muted}>
          Disclaimer: Information contained herein should not be construed as an investment advice, or investment recommendation, or an order of, or solicitation for, any transactions in financial instruments; We make no warranty or representation, whether express or implied, as to the completeness or accuracy of the information contained herein or fitness thereof for a particular purpose. Use of images and symbols is made for illustrative purposes only and does not constitute a recommendation to buy, sell or hold a particular financial instrument; Use of brand logos does not necessarily imply a contractual relationship between us and the entities owning the logos, nor does it represent an endorsement of any such entity by Quadency, or vice versa. Market information is made available to you only as a service, and we do not endorse or approve it. Quadency does not hold custody of client funds and is not liable to you for any (direct or indirect) damage you suffer as a result of the use of the Website or Software or the content provided thereon.
        </p>
        <p className={classes.muted}>
          Backtested or simulated performance results have inherent limitations and should not be interpreted as a
          recommendation to buy or sell any assets nor a guarantee of future returns. Actual results will vary from the
          analysis and Quadency makes no representation or warranty regarding future performance.
        </p>
      </div>
    );
  }
}

Disclaimer.propTypes = {
  classes: PropTypes.object.isRequired,
};


export default withTheme()(withStyles(styles)(Disclaimer));



// WEBPACK FOOTER //
// ./src/components/common/disclaimer.js