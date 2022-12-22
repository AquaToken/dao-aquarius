import * as React from 'react';
import { lazy, useEffect } from 'react';
import { Route, Switch } from 'react-router-dom';
import { ModalService } from '../../common/services/globalServices';
import NotFoundPage from '../../common/components/NotFoundPage/NotFoundPage';
import ProjectPurposeModal, { SHOW_PURPOSE_ALIAS } from './components/common/ProjectPurposeModal';
import BG from '../../common/assets/img/purpose-modal-background.svg';
import styled from 'styled-components';
import { respondDown } from '../../common/mixins';
import { Breakpoints } from '../../common/styles';
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
            ModalService.openModal(ProjectPurposeModal, {}, false, <ModalBG />);
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
