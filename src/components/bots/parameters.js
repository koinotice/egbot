import React, { Component } from 'react';
import { withStyles } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import PropTypes from 'prop-types';
import BotFieldComponent from './fields/botFieldComponent';


const styles = theme => ({
  root: {
    padding: '1.0714rem'
  },
  title: {
    marginBottom: '0.7143rem'
  },
  gridContainer: {
    marginBottom: '2.1429rem'
  },
  gridItem: {
    paddingLeft: theme.spacing.unit * 3,
    paddingRight: theme.spacing.unit * 3
  }
});

class Parameters extends Component {
  constructor(props) {
    super(props);

    // serialize template for presentation
    this.serializedConfigTemplate = this.serializeConfigTemplate(props.configTemplate);
    this.state = this.buildState(props);
  }

  componentDidUpdate(prevProps) {
    if (this.props.botConfig && this.props.botConfig.id !== prevProps.botConfig.id) {
      this.populateConfigs();
    }
  }

  getPropsForField(field) {
    const { indicator } = this.props;
    if (!field.props) {
      field.props = {};
    }
    const { dependsOn } = field;
    if (dependsOn) {
      const dependsOnFields = dependsOn.split(',');
      field.props = dependsOnFields.reduce((p, f) => {
        const dependency = this.state[f];
        return Object.assign(p, { [f]: dependency });
      }, field.props);
    }
    if (field.component === 'BotPairAutoComplete') {
      field.props = Object.assign(field.props, { indicator });
    }
    return field.props;
  }

  shouldDisableField(field, botRunning) {
    if (field.fieldName === 'name') {
      return false;
    }

    if (botRunning) {
      return true;
    }

    let shouldDisable = false;
    const { dependsOn } = field;
    if (dependsOn) {
      const dependsOnFields = dependsOn.split(',');
      dependsOnFields.forEach((f) => {
        if (!this.state[f]) {
          shouldDisable = true;
        }
      });
    }
    return shouldDisable;
  }

  buildState(props) {
    const { config, name } = props.botConfig;
    return Object.assign(config, { name });
  }

  populateConfigs = () => {
    this.serializedConfigTemplate = this.serializeConfigTemplate(this.props.configTemplate);
    const state = this.buildState(this.props);
    this.setState(state);
  }

  serializeConfigTemplate(configTemplate) {
    const fields = Object.keys(configTemplate).filter(field => configTemplate[field].component !== 'Hidden');
    const uniqueGroups = fields.reduce((set, field) => {
      set.add(configTemplate[field].group);
      return set;
    }, new Set());
    const groups = Array.from(uniqueGroups);

    const serializedConfigTemplate = groups.map((group) => {
      const fieldsFilteredForGroup = Object.keys(configTemplate).filter(field => configTemplate[field].group === group);
      const fieldsArr = fieldsFilteredForGroup.map((field) => {
        return Object.assign(configTemplate[field], { fieldName: field });
      });
      // build group object
      const groupObject = {
        group,
        groupIndex: fieldsArr[0].groupIndex,
        fields: fieldsArr
      };
      // sort fields
      groupObject.fields.sort((a, b) => a.fieldIndex - b.fieldIndex);
      return groupObject;
    });
    // sort groups and return
    return serializedConfigTemplate.sort((a, b) => a.groupIndex - b.groupIndex);
  }

  updateField = (fieldName, value) => {
    const { updateConfig } = this.props;
    this.setState({
      [fieldName]: value
    }, () => {
      // update redux
      const { name, ...rest } = this.state;
      const formattedConfig = {
        name,
        config: { ...rest }
      };
      updateConfig(formattedConfig);
    });
  }

  renderGroup(groupTemplate) {
    const {
      classes, errors, showErrors, botConfig, setErrors,
    } = this.props;

    return (
      <div key={groupTemplate.group}>
        <Typography color="textSecondary">{groupTemplate.group}</Typography>
        <Grid className={classes.gridContainer} container>
          {groupTemplate.fields.map((field) => {
            const botRunning = botConfig ? botConfig.status === 'RUNNING' : false;
            const fieldDisabled = this.shouldDisableField(field, botRunning);
            const fieldWidth = (field.display && field.display.fullWidth) ? 12 : 6;
            const error = errors[field.fieldName];
            return (
              <Grid xs={12} md={fieldWidth} className={classes.gridItem} key={field.fieldName} item>
                <BotFieldComponent
                  component={field.component}
                  label={field.label}
                  name={field.fieldName}
                  value={this.state[field.fieldName]}
                  tooltip={field.tooltip}
                  tooltipURL={field.tooltipURL}
                  onChange={val => this.updateField(field.fieldName, val)}
                  validation={field.validation}
                  fieldProps={this.getPropsForField(field)}
                  error={error}
                  setErrors={setErrors}
                  showError={showErrors}
                  disabled={fieldDisabled} />
              </Grid>
            );
          })}
        </Grid>
      </div>
    );
  }

  render() {
    const { classes, } = this.props;

    return (
      <div className={classes.root}>
        {this.serializedConfigTemplate.map(groupTemplate => (this.renderGroup(groupTemplate)))}
      </div>
    );
  }
}

Parameters.defaultProps = {
  botConfig: null,
  indicator: null
};

Parameters.propTypes = {
  classes: PropTypes.object.isRequired,
  configTemplate: PropTypes.object.isRequired,
  botConfig: PropTypes.object,
  updateConfig: PropTypes.func.isRequired,
  errors: PropTypes.object.isRequired,
  setErrors: PropTypes.func.isRequired,
  showErrors: PropTypes.bool.isRequired,
  indicator: PropTypes.object
};

export default withStyles(styles, { withTheme: true })(Parameters);



// WEBPACK FOOTER //
// ./src/components/bots/parameters.js