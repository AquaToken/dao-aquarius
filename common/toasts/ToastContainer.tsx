import * as React from 'react';
import styled from 'styled-components';
import { useEffect, useState } from 'react';
import { Toast } from './ToastBody';
import { Z_INDEX } from '../styles';
import { ToastService } from '../services/globalServices';

const Container = styled.div`
    position: fixed;
    right: 0;
    top: 0;
    z-index: ${Z_INDEX.toast};
`;

const ToastContainer = (): JSX.Element => {
    const [toasts, setToasts] = useState(ToastService.toasts);

    useEffect(() => {
        const unsub = ToastService.event.sub((toasts) => {
            setToasts(toasts);
        });

        return () => unsub();
    }, []);

    console.log(toasts);

    return (
        <Container>
            {toasts.map((toast) => (
                <Toast {...toast} key={toast.id} />
            ))}
        </Container>
    );
};

export default ToastContainer;
