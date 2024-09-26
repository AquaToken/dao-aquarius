import * as React from 'react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

import { ToastService } from 'services/globalServices';
import { respondDown } from 'web/mixins';
import { Breakpoints, Z_INDEX } from 'web/styles';

import { Toast } from './ToastBody';

const Container = styled.div`
    position: fixed;
    right: 0;
    bottom: 0;
    z-index: ${Z_INDEX.toast};

    ${respondDown(Breakpoints.md)`
        display: flex;
        flex-direction: column-reverse;
    `}
`;

const ToastContainer = (): JSX.Element => {
    const [toasts, setToasts] = useState(ToastService.toasts);

    useEffect(() => {
        const unsub = ToastService.event.sub(toasts => {
            setToasts(toasts);
        });

        return () => unsub();
    }, []);

    return (
        <Container>
            {toasts.map(toast => (
                <Toast {...toast} key={toast.id} />
            ))}
        </Container>
    );
};

export default ToastContainer;
