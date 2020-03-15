import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Typography from '@material-ui/core/Typography';

const styles = theme => ({
  checkBoxLabelRoot: {
    marginTop: '1.857rem',
    paddingLeft: '1.071rem',
  },
  termsText: {
    color: theme.palette.secondary.main,
    fontSize: '1rem',
  },
  termsLink: {
    textDecoration: 'none',
    color: theme.palette.primary.main,
  }
});

const BotTermsAgreement = ({ classes, botTermsAgreed, updateBotTermsCheck }) => (
  <Fragment>
    <FormControlLabel
      classes={{ root: classes.checkBoxLabelRoot }}
      control={
        <Checkbox
          checked={botTermsAgreed}
          onChange={updateBotTermsCheck}
          value="pairFilter"
          color="primary" />
      }
      label={
        <Typography className={classes.termsText}>
          I understand that past performance is not indicative of future results and I have read and agree
          to the <a className={classes.termsLink} href="https://quadency.com/terms-of-use" rel="noopener noreferrer" target="_blank">terms, conditions, and risk warning.</a>
        </Typography>
      } />
  </Fragment>
);

BotTermsAgreement.propTypes = {
  classes: PropTypes.object.isRequired,
  botTermsAgreed: PropTypes.bool.isRequired,
  updateBotTermsCheck: PropTypes.func.isRequired
};

export default withStyles(styles, { withTheme: true })(BotTermsAgreement);



// WEBPACK FOOTER //
// ./src/components/bots/modals/botTermsAgreement.js