import { useEffect } from 'react';
import { Redirect, useLocation } from 'react-router-dom';

import { MainRoutes } from 'constants/routes';

import useAuthStore from 'store/authStore/useAuthStore';

import { WalletConnectService } from 'services/globalServices';

import PageLoader from 'basics/loaders/PageLoader';

// URL example: https://aqua.network/wallet-connect?redirect=vote

// This page is intended for auto-connection with the wallet (LOBSTR) via the WalletConnect inside the mobile WebView.
// On this page we generate a URI to connect and send it by the custom postMessage that listens by the wallet
const WalletConnect = () => {
    const { isLogged } = useAuthStore();

    const location = useLocation();

    useEffect(() => {
        WalletConnectService.autoLogin();
    }, []);

    // After login redirect to the page from the url params or to the main page
    if (isLogged) {
        const params = new URLSearchParams(location.search);
        const redirect = params.get('redirect');

        return <Redirect to={redirect ? `/${redirect}` : MainRoutes.main} />;
    }

    return <PageLoader />;
};

export default WalletConnect;
