import * as React from 'react';
import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';

import { AppRoutes } from 'constants/routes';

import NotFoundPage from 'components/NotFoundPage';

const BribesPage = lazy(() => import('./pages/BribesPage/BribesPage'));
const AddBribePage = lazy(() => import('./pages/AddBribePage/AddBribePage'));

const Bribes = () => (
    <Routes>
        <Route path={AppRoutes.section.bribes.child.index} element={<BribesPage />} />

        <Route path={AppRoutes.section.bribes.child.addBribe} element={<AddBribePage />} />

        <Route path="*" element={<NotFoundPage />} />
    </Routes>
);

export default Bribes;
