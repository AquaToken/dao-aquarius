import * as React from 'react';
import { PropsWithChildren, ErrorInfo } from 'react';
import { useLocation, type Location as RouterLocation } from 'react-router-dom';
import styled from 'styled-components';

import SentryService from 'services/sentry.service';

import Button from 'basics/buttons/Button';

import { flexAllCenter } from 'styles/mixins';
import { COLORS } from 'styles/style-constants';

interface State {
    isError: boolean;
}

const Container = styled.div`
    flex: 1 0 auto;
    ${flexAllCenter};
    flex-direction: column;
`;

const Title = styled.h3`
    font-size: 2rem;
    color: ${COLORS.textPrimary};
    margin-bottom: 5rem;
`;

type WithLocationProps = {
    location: RouterLocation;
};

export function withLocation<P extends object>(
    Component: React.ComponentType<P & WithLocationProps>,
) {
    return function Wrapper(props: P) {
        const location = useLocation();
        return <Component {...props} location={location} />;
    };
}

class ErrorBoundary extends React.Component<
    PropsWithChildren<{ location: RouterLocation }>,
    State
> {
    public state = { isError: false };

    public componentDidUpdate(prevProps: Readonly<{ location: RouterLocation }>) {
        if (this.props.location !== prevProps.location) {
            this.setState({ isError: false });
        }
    }

    public componentDidCatch(error: Error, extra: ErrorInfo) {
        this.setState({ isError: true });
        SentryService.captureException({ error, extra, prefix: '' });
    }

    render() {
        return this.state.isError ? (
            <Container>
                <Title>Oops, something went wrong</Title>

                <Button isBig onClick={() => window.location.reload()}>
                    Reload
                </Button>
            </Container>
        ) : (
            this.props.children
        );
    }
}

export default withLocation(ErrorBoundary);
