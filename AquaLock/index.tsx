import * as React from 'react';
import { render } from 'react-dom';
import App from './components/App';
import '@babel/polyfill';

(window as any).global = window;
window.Buffer = window.Buffer || require('buffer').Buffer;

const rootEl = document.getElementById('root');

render(<App />, rootEl);
