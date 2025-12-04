import * as React from 'react';
import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';

import { AppRoutes } from 'constants/routes';

const DelegateLazy = lazy(() => import('./pages/DelegateMain'));
const BecomeLazy = lazy(() => import('./pages/BecomeDelegate'));

const Delegate = () => (
    <Routes>
        <Route path={AppRoutes.section.delegate.child.index} element={<DelegateLazy />} />
        <Route path={AppRoutes.section.delegate.child.become} element={<BecomeLazy />} />
    </Routes>
);

export default Delegate;
