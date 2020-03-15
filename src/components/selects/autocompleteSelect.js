import React, { Component } from 'react';
import PropTypes from 'prop-types';
import deburr from 'lodash/deburr';
import Autosuggest from 'react-autosuggest';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import MenuItem from '@material-ui/core/MenuItem';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
  root: {
    flexGrow: 1,
  },
  container: {
    position: 'relative',
  },
  suggestionsContainerOpen: {
    position: 'absolute',
    zIndex: 1,
    marginTop: theme.spacing.unit,
    left: 0,
    right: 0,
  },
  suggestion: {
    display: 'block',
  },
  suggestionsList: {
    margin: 0,
    padding: 0,
    listStyleType: 'none',
  },
  divider: {
    height: theme.spacing.unit * 2,
  },
});

class AutocompleteSelect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedSuggestion: props.initialSelected,
      shownSuggestions: [],
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.initialSelected !== this.props.initialSelected) {
      this.setState({
        selectedSuggestion: nextProps.initialSelected
      });
    }
  }

  onBlur = (event) => {
    this.props.onSuggestionBlur(event.target.value);
  }

  getSuggestions = (suggestions, value) => {
    const inputValue = deburr(value.trim()).toLowerCase();
    const inputLength = inputValue.length;
    let count = 0;

    return inputLength === 0
      ? []
      : suggestions.filter((suggestion) => {
        const keep =
          count < 5 && suggestion.label.slice(0, inputLength).toLowerCase() === inputValue;

        if (keep) {
          count += 1;
        }

        return keep;
      });
  }

  getSuggestionValue =(suggestion) => {
    return suggestion.label;
  }

  handleSuggestionsFetchRequested = (suggestions, { value }) => {
    this.setState({
      shownSuggestions: this.getSuggestions(suggestions, value),
    });
  };

  handleSuggestionsClearRequested = () => {
    this.setState({
      shownSuggestions: [],
    });
  };

  handleChange = (event, { newValue }) => {
    this.props.onSuggestionChange(newValue);
    this.setState({
      selectedSuggestion: newValue,
    });
  };

  renderSuggestion =(suggestion, { query, isHighlighted }) => {
    const matches = match(suggestion.label, query);
    const parts = parse(suggestion.label, matches);

    return (
      <MenuItem selected={isHighlighted} component="div">
        <div>
          {parts.map((part, index) =>
            (part.highlight ? (
              <span key={String(index)} style={{ fontWeight: 600 }}>
                {part.text}
              </span>
            ) : (
              <strong key={String(index)} style={{ fontWeight: 100 }}>
                {part.text}
              </strong>
            )))}
        </div>
      </MenuItem>
    );
  }

  renderInputComponent = (inputProps) => {
    const {
      classes, inputRef = () => {}, ref, adornment, ...other
    } = inputProps;

    return (
      <TextField
        fullWidth
        InputProps={{
          inputRef: (node) => {
            ref(node);
            inputRef(node);
          },
          classes: {
            input: classes.input,
          },
          endAdornment: adornment
        }}
        {...other} />
    );
  }

  render() {
    const {
      classes, suggestions, label, placeholder, name, disabled, adornment
    } = this.props;

    const autosuggestProps = {
      renderInputComponent: this.renderInputComponent,
      suggestions: this.state.shownSuggestions,
      onSuggestionsFetchRequested: (obj) => { this.handleSuggestionsFetchRequested(suggestions, obj); },
      onSuggestionsClearRequested: this.handleSuggestionsClearRequested,
      getSuggestionValue: this.getSuggestionValue,
      renderSuggestion: this.renderSuggestion,
    };

    return (
      <div className={classes.root}>
        <Autosuggest
          {...autosuggestProps}
          inputProps={{
            name,
            classes,
            label,
            placeholder,
            value: this.state.selectedSuggestion,
            onChange: this.handleChange,
            onBlur: this.onBlur,
            adornment,
            disabled
          }}
          theme={{
            container: classes.container,
            suggestionsContainerOpen: classes.suggestionsContainerOpen,
            suggestionsList: classes.suggestionsList,
            suggestion: classes.suggestion,
          }}
          renderSuggestionsContainer={options => (
            <Paper {...options.containerProps} square>
              {options.children}
            </Paper>
          )} />
      </div>
    );
  }
}

AutocompleteSelect.defaultProps = {
  label: '',
  name: '',
  placeholder: '',
  initialSelected: '',
  onSuggestionChange: () => {},
  onSuggestionBlur: () => {},
  disabled: false,
  adornment: null
};

AutocompleteSelect.propTypes = {
  classes: PropTypes.object.isRequired,
  suggestions: PropTypes.array.isRequired,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  onSuggestionChange: PropTypes.func,
  onSuggestionBlur: PropTypes.func,
  initialSelected: PropTypes.string,
  name: PropTypes.string,
  disabled: PropTypes.bool,
  adornment: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ])
};

export default withStyles(styles)(AutocompleteSelect);



// WEBPACK FOOTER //
// ./src/components/selects/autocompleteSelect.js