import * as React from 'react';
import PageLoader from '../../common/basics/PageLoader';
import { useEffect } from 'react';
import { WalletConnectService } from '../../common/services/globalServices';
import { WalletConnectEvents } from '../../common/services/wallet-connect.service';
import { Redirect, useLocation } from 'react-router-dom';
import { MainRoutes } from '../../routes';
import useAuthStore from '../../store/authStore/useAuthStore';

const WalletConnect = () => {
    const { isLogged } = useAuthStore();

    const location = useLocation();

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

    if (isLogged) {
        const params = new URLSearchParams(location.search);
        const redirect = params.get('redirect');

        return <Redirect to={redirect ? `/${redirect}` : MainRoutes.main} />;
    }

    return <PageLoader />;
};

export default WalletConnect;
