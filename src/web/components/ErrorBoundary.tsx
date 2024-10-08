import * as React from 'react';
import { PropsWithChildren, ErrorInfo } from 'react';
import * as Router from 'react-router';
import { withRouter } from 'react-router-dom';
import styled from 'styled-components';

import SentryService from 'services/sentry.service';

import Button from 'basics/buttons/Button';

import { flexAllCenter } from '../mixins';
import { COLORS } from '../styles';

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
    color: ${COLORS.titleText};
    margin-bottom: 5rem;
`;

class ErrorBoundary extends React.Component<PropsWithChildren<Router.RouteComponentProps>, State> {
    public state = { isError: false };

    private unsubscribe: VoidFunction | null = null;

    public componentDidMount(): void {
        this.unsubscribe = this.props.history.listen(() => this.setState({ isError: false }));
    }

    public componentWillUnmount(): void {
        this.unsubscribe?.();
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

export default withRouter(ErrorBoundary);
