import * as React from 'react';
import { lazy, useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { LS_AMM_EXPERIMENTAL_FEATURE_ACKNOWLEDGED } from 'constants/local-storage';
import { AppRoutes } from 'constants/routes';

import useAuthStore from 'store/authStore/useAuthStore';

import { ModalService } from 'services/globalServices';

import ExperimentalFeatureModalBackground from 'assets/experimental-feature-modal-bg.svg';

import ExperimentalFeatureModal from './components/ExperimentalFeatureModal/ExperimentalFeatureModal';

const AnalyticsPage = lazy(() => import('./pages/Analytics'));
const PoolPageLazy = lazy(() => import('./pages/PoolPage'));
const CreatePoolPage = lazy(() => import('./pages/CreatePool'));

const Amm = () => {
    const { isLogged } = useAuthStore();

    useEffect(() => {
        const isAcknowledged = JSON.parse(
            localStorage.getItem(LS_AMM_EXPERIMENTAL_FEATURE_ACKNOWLEDGED) || 'false',
        );

        if (!isAcknowledged) {
            ModalService.openModal(
                ExperimentalFeatureModal,
                {},
                true,
                <ExperimentalFeatureModalBackground />,
                true,
            );
        }
    }, []);

    return (
        <Routes>
            <Route path={AppRoutes.section.amm.child.index} element={<AnalyticsPage />} />

            <Route
                path={AppRoutes.section.amm.child.create}
                element={
                    isLogged ? (
                        <CreatePoolPage />
                    ) : (
                        <Navigate to={AppRoutes.section.amm.base} replace />
                    )
                }
            />

            <Route path={AppRoutes.section.amm.child.pool} element={<PoolPageLazy />} />

            {/* Fallback redirect */}
            <Route path="*" element={<Navigate to={AppRoutes.section.amm.child.index} replace />} />
        </Routes>
    );
};

export default Amm;
