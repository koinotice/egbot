import React from 'react';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { sentenceToCamelCase } from '../../utils/strings';
import BotIcon from './botIcon';

export const styles = theme => ({
  botIcon: {
    margin: 10,
    width: 60,
    height: 60
  },
  botLabel: {
    fontWeight: 600
  },
  listItemBodyText: {
    paddingTop: '5px'
  },
  selectButtonContainer: {
    margin: 'auto'
  },
  link: {
    color: '#30B0E4',
    textDecoration: 'none'
  },
  primaryContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '40%',
    alignItems: 'baseline'
  },
  item: {
    marginBottom: '1.357rem',
    paddingRight: '5px',
    paddingLeft: '5px',
  },
  dottedItem: {
    marginBottom: '1.357rem',
    border: `5px dashed ${theme.palette.background.paper}`,
    backgroundColor: theme.palette.background.paperDarker,
  },
});

const BotItem = ({
  classes,
  botId,
  name,
  label,
  description,
  readMoreLink,
  onClickSelectButton,
  borderDashed,
  selectButtonText,
}) => (
  <Paper className={borderDashed ? classes.dottedItem : classes.item} elevation={0} square>
    <ListItem alignItems="flex-start">
      <ListItemAvatar>
        <BotIcon className={classes.botIcon} icon={name} />
      </ListItemAvatar>
      <ListItemText
        primary={
          <div className={classes.primaryContainer}>
            <Typography className={classes.botLabel} variant="h6">{label}</Typography>
          </div>
        }
        secondary={
          <Typography className={classes.listItemBodyText}>
            {description}&nbsp;
            {readMoreLink && <a className={classes.link} href={readMoreLink} target="_blank" rel="noopener noreferrer">Read More</a>}
          </Typography>
        } />
      <div className={classes.selectButtonContainer}>
        <Button
          style={{ minWidth: '111px' }}
          name={sentenceToCamelCase(`select ${label}`)}
          color="primary"
          variant="contained"
          onClick={() => onClickSelectButton(botId)}>
          {selectButtonText}
        </Button>
      </div>
    </ListItem>
  </Paper>
);

BotItem.defaultProps = {
  readMoreLink: '',
  borderDashed: false,
  selectButtonText: 'SELECT',
};

BotItem.propTypes = {
  classes: PropTypes.object.isRequired,
  borderDashed: PropTypes.bool,
  botId: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  readMoreLink: PropTypes.string,
  selectButtonText: PropTypes.string,
  onClickSelectButton: PropTypes.func.isRequired
};

export default withStyles(styles)(BotItem);



// WEBPACK FOOTER //
// ./src/components/bots/botItem.js