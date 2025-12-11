import reactQuillCSS from 'quill/dist/quill.snow.css';
import { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { AppRoutes } from 'constants/routes';

import useAuthStore from 'store/authStore/useAuthStore';

import NotFoundPage from 'components/NotFoundPage';

export const ReactQuillCSS = reactQuillCSS;

const MainPage = lazy(() => import('./pages/GovernanceMainPage'));
const VoteProposalPage = lazy(() => import('./pages/GovernanceVoteProposalPage'));
const ProposalCreationPage = lazy(() => import('./pages/GovernanceProposalCreationPage'));

const Governance = () => {
    const { isLogged } = useAuthStore();

    return (
        <Routes>
            <Route path={AppRoutes.section.governance.child.index} element={<MainPage />} />

            <Route
                path={AppRoutes.section.governance.child.proposal}
                element={<VoteProposalPage />}
            />

            <Route
                path={AppRoutes.section.governance.child.create}
                element={
                    isLogged ? (
                        <ProposalCreationPage />
                    ) : (
                        <Navigate
                            to={AppRoutes.section.governance.child.index}
                            replace
                            state={{ from: location }}
                        />
                    )
                }
            />

            <Route
                path={AppRoutes.section.governance.child.edit}
                element={
                    isLogged ? (
                        <ProposalCreationPage isEdit />
                    ) : (
                        <Navigate
                            to={AppRoutes.section.governance.child.index}
                            replace
                            state={{ from: location }}
                        />
                    )
                }
            />

            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
};

export default Governance;
