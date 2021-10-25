import { createGlobalStyle } from 'styled-components';
import { COLORS, FONT_FAMILY } from '../styles';

const AppGlobalStyle = createGlobalStyle`
  html {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    font-size: 62.5%; // 1rem = 10px
    animation-timing-function: linear;
  }

  body {
    min-height: 100vh;
    padding: 0;
    margin: 0;
    width: 100vw !important;
    overflow-x: hidden;
    background-color: ${COLORS.white};
    text-align: left;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body,
  input,
  textarea,
  button {
    font: 400 1.4rem ${FONT_FAMILY.roboto};
    line-height: 1.6rem;
    color: ${COLORS.paragraphText};
  }
  
  h1, h2, h3, h4, h5, h6 {
  	margin: 0;
  }

  input, textarea, select, button, [role="button"] {
    outline: none !important;
    appearance: none;
  }

  ul {
    margin: 0;
    padding: 0;
    list-style-type: none;
  }

  ::placeholder {
    opacity: 1;
  }
  
  #root {
    max-width: 144rem;
    margin: 0 auto;
  }
`;

export default AppGlobalStyle;
