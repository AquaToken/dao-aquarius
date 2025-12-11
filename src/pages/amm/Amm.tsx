import * as React from 'react';
import { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { AppRoutes } from 'constants/routes';

import useAuthStore from 'store/authStore/useAuthStore';

const AnalyticsPage = lazy(() => import('./pages/Analytics'));
const PoolPageLazy = lazy(() => import('./pages/PoolPage'));
const CreatePoolPage = lazy(() => import('./pages/CreatePool'));

const Amm = () => {
    const { isLogged } = useAuthStore();
    return (
        <Routes>
            <Route path={AppRoutes.section.amm.child.index} element={<AnalyticsPage />} />

            <Route
                path={AppRoutes.section.amm.child.create}
                element={
                    isLogged ? (
                        <CreatePoolPage />
                    ) : (
                        <Navigate to={AppRoutes.section.amm.child.index} replace />
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
