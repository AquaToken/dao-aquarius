import * as React from 'react';
import { render } from 'react-dom';
import '@babel/polyfill';
import App from './App';

(window as any).global = window;
window.Buffer = window.Buffer || require('buffer').Buffer;

const rootEl = document.getElementById('root');

render(<App />, rootEl);
