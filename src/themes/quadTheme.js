import { createMuiTheme } from '@material-ui/core/styles';

function generateTheme(type) {
  return createMuiTheme({
    palette: {
      type,
      background: {
        default: type === 'dark' ? '#1B2431' : '#f5f6fa',
        paper: type === 'dark' ? '#273142' : '#FFF',
        paperDarker: type === 'dark' ? '#202939' : '#f5f6fa',
        paperLighter: type === 'dark' ? '#313D4F' : '#f5f6fa',
        btnGroup: type === 'dark' ? '#313D4F' : '#f5f6fa',
      },
      text: {
        primary: type === 'dark' ? '#c7d0dc' : '#4c535c',
        secondary: type === 'dark' ? '#7F8FA4' : '#878D98',
        muted: type === 'dark' ? '#707e97' : '#878D98',
      },
      tabButtons: type === 'dark' ? '#9FA9BA' : '',
      icons: {
        green: type === 'dark' ? '#7ED321' : '#63a81b',
        red: type === 'dark' ? '#D35847' : '#D35847',
      },
      buttons: {
        green: type === 'dark' ? '#6B8637' : '#6B8637',
        greenHover: type === 'dark' ? '#566d2c' : '#566d2c',
        red: type === 'dark' ? '#a9473f' : '#a9473f',
        redHover: type === 'dark' ? '#8d3b29' : '#8d3b29',
      },
      primary: {
        main: '#52B0B0', // https://material-ui.com/style/color/
        contrastText: '#FFF'
      },
      secondary: {
        main: type === 'dark' ? '#c7d0dc' : '#354052'
      }
    },
    typography: {
      useNextVariants: true,
      htmlFontSize: 14,
      fontFamily: '"Source Sans Pro", sans-serif'
    },
    custom: {
      charts: {
        title: {
          fontSize: 14
        }
      }
    },
    props: {
      MuiButtonBase: {
        disableRipple: true
      }
    },
    transitions: {
      // So we have `transition: none;` everywhere
      create: () => 'none',
    },
    overrides: {
      MuiButton: {
        flatPrimary: {
          borderRadius: '4px',
        },
        sizeSmall: {
          minHeight: '26px',
          padding: '5px'
        }
      }
    }
  });
}

export default generateTheme;



// WEBPACK FOOTER //
// ./src/themes/quadTheme.js