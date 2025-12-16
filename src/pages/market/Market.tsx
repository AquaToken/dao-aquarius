import { lazy } from 'react';
import * as React from 'react';
import { Route, Routes } from 'react-router-dom';

import { AppRoutes } from 'constants/routes';

import NotFoundPage from 'components/NotFoundPage';

const MarketPage = lazy(() => import('./pages/MarketPage'));

const Market = () => (
    <Routes>
        <Route path={AppRoutes.section.market.child.market} element={<MarketPage />} />

        <Route path="*" element={<NotFoundPage />} />
    </Routes>
);

export default Market;
