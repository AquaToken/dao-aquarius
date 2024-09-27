import * as React from 'react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

import { ToastService } from 'services/globalServices';
import { Toast as ToastType } from 'services/toast.service';

import { Toast } from './ToastBody';

import { respondDown } from '../mixins';
import { Breakpoints, Z_INDEX } from '../styles';

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

const ToastContainer = (): React.ReactNode => {
    const [toasts, setToasts] = useState<ToastType[]>(ToastService.toasts);

    useEffect(() => {
        const unsub = ToastService.event.sub((toasts: ToastType[]) => {
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
