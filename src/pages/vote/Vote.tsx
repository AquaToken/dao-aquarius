import { lazy, useEffect } from 'react';
import { Route, Switch } from 'react-router-dom';
import styled from 'styled-components';

import { VoteRoutes } from 'constants/routes';

import { ModalService } from 'services/globalServices';

import VotingPurposeModal, { SHOW_PURPOSE_ALIAS } from 'web/modals/alerts/VotingPurposeModal';

import BG from 'assets/vote-page/purpose-modal-background.svg';

import NotFoundPage from 'components/NotFoundPage';

import { respondDown } from 'styles/mixins';
import { Breakpoints } from 'styles/style-constants';

const MainPage = lazy(() => import('./components/MainPage/MainPage'));

const ModalBG = styled(BG)`
    object-position: center center;
    width: 62.4rem;

    ${respondDown(Breakpoints.md)`
        width: 100%;
    `}
`;

const Vote = () => {
    useEffect(() => {
        const showPurpose = JSON.parse(localStorage.getItem(SHOW_PURPOSE_ALIAS) || 'true');
        if (showPurpose) {
            ModalService.openModal(VotingPurposeModal, {}, false, <ModalBG />);
        }
    }, []);

    return (
        <Switch>
            <Route exact path={VoteRoutes.main}>
                <MainPage />
            </Route>
            <Route component={NotFoundPage} />
        </Switch>
    );
};

export default Vote;
