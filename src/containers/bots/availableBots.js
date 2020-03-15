import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { createNewConfig, setCurrentBotAndConfigChanging } from '../../store/ducks/algos/bots';
import BotItem from '../../components/bots/botItem';
import { getSessionToken } from '../../utils/token';

const styles = theme => ({
  root: {
    padding: '10px',
    paddingRight: '20%'
  },
  heading: {
    marginBottom: '15px'
  },
  para: {
    marginBottom: '30px',
    width: '85%'
  },
  [theme.breakpoints.down('sm')]: {
    root: {
      paddingRight: '10px'
    }
  },
});

class AvailableBots extends Component {
  constructor(props) {
    super(props);
    this.sessionToken = getSessionToken();
  }

  selectBot = (botId) => {
    const { actions, history } = this.props;
    actions.setCurrentBotAndConfigChanging(true);
    actions.createNewConfig(botId);
    history.push('/bots/my-bots/workspace');
  };

  requestBot = (quid) => {
    window.open(`https://quadency.typeform.com/to/KWQQUc?quid=${quid}`, '_blank');
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
      classes, bots, userLoaded, user
    } = this.props;
    const quid = this.sessionToken && userLoaded ? btoa(user.email) : 'visitor';

    const availableBots = Object.values(bots)
      .reverse()
      .map(bot => (
        <BotItem
          key={bot.id}
          botId={bot.id}
          name={bot.name}
          label={bot.label}
          description={bot.description}
          readMoreLink={bot.readmorelink}
          onClickSelectButton={this.selectBot} />
      ));

    availableBots.push(<BotItem
      borderDashed
      key="requestBot"
      selectButtonText="REQUEST A BOT"
      botId="requestBot"
      name="bot-request"
      label="Request a Custom Strategy"
      description="Have a strategy in mind that you’d like to see automated? Our team will code it for you and make it
       available within your account. Ask us for a quote!"
      onClickSelectButton={() => this.requestBot(quid)} />);

    return this.renderWithRoot((
      <Fragment>
        <Typography variant="h6" className={classes.heading}>Available Bots</Typography>
        <Typography variant="body1" className={classes.para}>
          The following are popular automated trading strategies that can be run on your connected exchange accounts. Select a strategy
          to learn more about it, tweak its parameters and run a backtest (where supported) before running it live.
        </Typography>
        {availableBots}
      </Fragment>
    ));
  }
}

AvailableBots.defaultProps = {
  bots: {}
};

AvailableBots.propTypes = {
  classes: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  bots: PropTypes.object,
  userLoaded: PropTypes.bool.isRequired,
  user: PropTypes.object.isRequired,
};

function mapStateToProps(state) {
  return {
    bots: state.algos.bots.bots,
    botsLoaded: state.algos.bots.botsLoaded,
    userLoaded: state.global.user.userLoaded,
    user: state.global.user.user,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      ...bindActionCreators({
        createNewConfig,
        setCurrentBotAndConfigChanging
      }, dispatch)
    }
  };
}

const base = withStyles(styles, { withTheme: true })(AvailableBots);
export default connect(mapStateToProps, mapDispatchToProps)(base);



// WEBPACK FOOTER //
// ./src/containers/bots/availableBots.js