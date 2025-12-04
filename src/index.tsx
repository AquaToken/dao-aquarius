import * as React from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';
import SentryService from './services/sentry.service';

SentryService.initSentry();

const rootEl = document.getElementById('root');

const root = createRoot(rootEl);

root.render(<App />);
