import * as React from 'react';
import { lazy, useEffect } from 'react';
import { Route, Switch } from 'react-router-dom';
import styled from 'styled-components';

import { ModalService } from 'services/globalServices';
import { respondDown } from 'web/mixins';
import VotingPurposeModal, { SHOW_PURPOSE_ALIAS } from 'web/modals/alerts/VotingPurposeModal';
import { Breakpoints } from 'web/styles';

import BG from 'assets/purpose-modal-background.svg';

import NotFoundPage from 'components/NotFoundPage';

import { VoteRoutes } from '../../routes';

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
