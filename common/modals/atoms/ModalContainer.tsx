import * as React from 'react';
import { useEffect, useState } from 'react';
import { ModalService } from '../../services/globalServices';

const ModalContainer = (): JSX.Element => {
    const [modals, setModals] = useState(ModalService.modals);

    useEffect(() => {
        const unsub = ModalService.event.sub((modals) => {
            setModals(modals);

            const scrollable = document.getElementById('scrollable');

            if (modals.length) {
                const { y } = scrollable.getBoundingClientRect();
                scrollable.style.position = 'fixed';
                scrollable.style.top = `${y}px`;
                scrollable.style.left = '0';
                scrollable.style.right = '0';
                console.log(scrollable);
            } else {
                const scrollY = scrollable.style.top;
                scrollable.style.position = '';
                scrollable.style.top = '';
                scrollable.style.left = '';
                scrollable.style.right = '';
                window.scrollTo(0, parseInt(scrollY || '0') * -1);
            }
        });

        return () => unsub();
    }, []);

    return <div id="modals">{modals.map(({ modal }) => modal)}</div>;
};
export default ModalContainer;
