// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
const Sentry = process.variable.SENTRY_CONTEXT
    ? // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('@sentry/react')
    : null;
export default class SentryService {
    static initSentry() {
        if (!Sentry) {
            return;
        }

        Sentry.init({
            dsn: 'https://32fb26b650c84652987395b2b0b2a01a@sentry.aqua.network/105',
            integrations: [Sentry.browserTracingIntegration()],
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            environment: process.variable.SENTRY_CONTEXT,
            tracesSampleRate: 0.1,
        });
    }

    static captureException({ error, prefix, extra }) {
        error = typeof error === 'string' ? new Error(error) : error;

        if (prefix) {
            error = new Error(`${prefix}: ${error.message}`, {
                cause: error,
            });
        }

        if (Sentry) {
            Sentry.captureException(error, { extra });
        } else {
            console.warn('Error boundary exception: ', error, extra);
        }
    }

    static setSentryContext({ publicKey, authType }) {
        if (!Sentry) {
            return;
        }

        const userKey = publicKey || 'No public key';
        const loginType = authType || 'No auth type';

        Sentry.setTag('user.publicKey', userKey);
        Sentry.setTag('user.authType', loginType);
        Sentry.setContext('additional user info', {
            publicKey: userKey,
            authType: loginType,
        });
    }
}
