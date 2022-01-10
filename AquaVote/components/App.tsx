import * as React from 'react';
import { lazy, Suspense, useEffect } from 'react';
import { hot } from 'react-hot-loader';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import Provider from '../store';
import { MainRoutes } from '../routes';
import Header from '../../common/components/Header/Header';
import Footer from '../../common/components/Footer/Footer';
import AppGlobalStyle from '../../common/components/AppGlobalStyles';
import ModalContainer from '../../common/modals/atoms/ModalContainer';
import useGlobalSubscriptions from '../../common/hooks/useGlobalSubscriptions';
import ToastContainer from '../../common/toasts/ToastContainer';
import PageLoader from '../../common/basics/PageLoader';
import useAssetsStore from '../store/assetsStore/useAssetsStore';
import useAuthStore from '../../common/store/authStore/useAuthStore';
import { ModalService, StellarService } from '../../common/services/globalServices';
import NotFoundPage from '../../common/components/NotFoundPage/NotFoundPage';
import ProjectPurposeModal, { SHOW_PURPOSE_ALIAS } from './common/ProjectPurposeModal';
import BG from '../../common/assets/img/purpose-modal-background.svg';
import styled, { createGlobalStyle } from 'styled-components';
import { respondDown } from '../../common/mixins';
import { Breakpoints, COLORS } from '../../common/styles';

const MainPage = lazy(() => import('./MainPage/MainPage'));
const AboutPage = lazy(() => import('./AboutPage/AboutPage'));

const ModalBG = styled(BG)`
    object-position: center center;
`;

const App = () => {
    useGlobalSubscriptions();

    const { getAssets, assets, processNewAssets } = useAssetsStore();

    const { isLogged, account } = useAuthStore();

    useEffect(() => {
        getAssets();
    }, []);

    useEffect(() => {
        const showPurpose = JSON.parse(localStorage.getItem(SHOW_PURPOSE_ALIAS) || 'true');
        if (showPurpose) {
            ModalService.openModal(ProjectPurposeModal, {}, false, <ModalBG />);
        }
    }, []);

    useEffect(() => {
        if (assets.length) {
            processNewAssets(assets);
        }
    }, [assets]);

    useEffect(() => {
        if (isLogged) {
            StellarService.startClaimableBalancesStream(account.accountId());
        } else {
            StellarService.closeClaimableBalancesStream();
        }
    }, [isLogged]);

    return (
        <Router>
            <Header>
                <>
                    <a
                        href="https://aqua.network/rewards"
                        target="_blank"
                        rel="noreferrer noopener"
                    >
                        Rewards
                    </a>
                </>
            </Header>
            <Suspense fallback={<PageLoader />}>
                <Switch>
                    <Route exact path={MainRoutes.main}>
                        <MainPage />
                    </Route>
                    <Route path={MainRoutes.about}>
                        <AboutPage />
                    </Route>
                    <Route component={NotFoundPage} />
                </Switch>
            </Suspense>
            <Footer />

            <ModalContainer />
            <ToastContainer />
        </Router>
    );
};

const BodyStyle = createGlobalStyle`
    ${respondDown(Breakpoints.md)`
        body {
            background-color: ${COLORS.lightGray};
        } 
    `}
`;

const ProvidedApp = () => {
    return (
        <Provider>
            <AppGlobalStyle />
            <BodyStyle />
            <App />
        </Provider>
    );
};

declare let module: Record<string, unknown>;

export default hot(module)(ProvidedApp);
