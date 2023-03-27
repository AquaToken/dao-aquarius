import * as React from 'react';
import PageLoader from '../../common/basics/PageLoader';
import { useEffect } from 'react';
import { WalletConnectService } from '../../common/services/globalServices';
import { WalletConnectEvents } from '../../common/services/wallet-connect.service';

const WalletConnect = () => {
    useEffect(() => {
        WalletConnectService.autoLogin();
    }, []);

    useEffect(() => {
        const unsub = WalletConnectService.event.sub((event) => {
            if (event.type === WalletConnectEvents.logout) {
                WalletConnectService.autoLogin();
            }
        });

        return () => unsub();
    }, []);

    return <PageLoader />;
};

export default WalletConnect;
