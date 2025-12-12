import * as React from 'react';
import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';

import { AppRoutes } from 'constants/routes';

import NotFoundPage from 'components/NotFoundPage';

const IncentivesPage = lazy(() => import('./pages/IncentivesMainPage'));
const AddIncentivePage = lazy(() => import('./pages/AddIncentivePage'));

const Incentives = () => (
    <Routes>
        <Route path={AppRoutes.section.incentive.child.index} element={<IncentivesPage />} />

        <Route
            path={AppRoutes.section.incentive.child.addIncentive}
            element={<AddIncentivePage />}
        />

        <Route path="*" element={<NotFoundPage />} />
    </Routes>
);

export default Incentives;
