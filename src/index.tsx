import * as React from 'react';
import { render } from 'react-dom';
import '@babel/polyfill';
import App from './App';

const rootEl = document.getElementById('root');

render(<App />, rootEl);
