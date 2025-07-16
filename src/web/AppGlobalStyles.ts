import { createGlobalStyle } from 'styled-components';

import { COLORS, FONT_FAMILY } from './styles';

const AppGlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
  }
  
  html {
    height: 100%;
    font-size: 62.5%; // 1rem = 10px
    animation-timing-function: linear;
    width: 100vw !important;
    overflow-x: hidden;
  }

  body {
    height: 100%;
    padding: 0;
    margin: 0;
    background-color: ${COLORS.white};
    text-align: left;
    width: 100vw !important;
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -webkit-text-size-adjust: 100%;
  }

  body,
  input,
  textarea,
  button {
    font: 400 1.4rem ${FONT_FAMILY.roboto};
    line-height: 1.6rem;
    color: ${COLORS.paragraphText};
  }

  @media print {
      html, body, #root {
          height: auto !important;
          overflow: visible !important;
      }

      * {
          overflow: visible !important;
      }
  }
  
  h1, h2, h3, h4, h5, h6 {
  	margin: 0;
  }

  input, textarea, select, button, [role="button"] {
    outline: none !important;
    appearance: none;
  }

  ::placeholder {
    opacity: 1;
  }
  
  iframe {
    border: 0;
  }
  
  #root {
    display: flex;
    flex-direction: column;
    min-height: 100%;
    margin: 0 auto;
  }
`;

export default AppGlobalStyle;
