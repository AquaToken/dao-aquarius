import * as React from 'react';
import { render } from 'react-dom';
import '@babel/polyfill';
import App from './App';
import SentryService from './common/services/sentry.service';

SentryService.initSentry();

const rootEl = document.getElementById('root');

render(<App />, rootEl);
