import * as React from 'react';
import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';

import { AppRoutes } from 'constants/routes';

import NotFoundPage from 'components/NotFoundPage';

const LockerAboutPage = lazy(() => import('./pages/LockerAbout/LockerAbout'));
const LockerFormPage = lazy(() => import('./pages/LockerForm/LockerForm'));

const Locker = () => (
    <Routes>
        <Route path={AppRoutes.section.locker.child.index} element={<LockerAboutPage />} />

        <Route path={AppRoutes.section.locker.child.about} element={<LockerFormPage />} />

        <Route path="*" element={<NotFoundPage />} />
    </Routes>
);

export default Locker;
