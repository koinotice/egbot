

function sentenceCase(str) {
  if (str) {
    return str.toLowerCase().replace(/[a-z]/i, letter => letter.toUpperCase()).trim();
  }
  return str;
}

function sentenceToCamelCase(str) {
  return str.replace('-', ' ').split(' ')
    .reduce((finalWord, word, index) => {
      if (index > 0) {
        return `${finalWord}${word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()}`;
      }
      return `${finalWord}${word.toLowerCase()}`;
    }, '');
}

export { sentenceCase, sentenceToCamelCase };



// WEBPACK FOOTER //
// ./src/utils/strings.js