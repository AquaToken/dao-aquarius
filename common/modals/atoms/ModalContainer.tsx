import * as React from 'react';
import { useEffect, useState } from 'react';
import { ModalService } from '../../services/globalServices';

const ModalContainer = (): JSX.Element => {
    const [modals, setModals] = useState(ModalService.modals);

    useEffect(() => {
        const unsub = ModalService.event.sub((modals) => {
            setModals(modals);
        });

        return () => unsub();
    }, []);

    return <div id="modals">{modals.map(({ modal }) => modal)}</div>;
};
export default ModalContainer;
