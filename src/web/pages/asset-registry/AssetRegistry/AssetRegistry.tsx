import * as React from 'react';
import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';

import { AppRoutes } from 'constants/routes';

import NotFoundPage from 'components/NotFoundPage';

const AssetRegistryMainPage = lazy(
    () => import('../pages/AssetRegistryMainPage/AssetRegistryMainPage'),
);
const AssetRegistryCreatePage = lazy(
    () => import('../pages/AssetRegistryCreatePage/AssetRegistryCreatePage'),
);
const AssetRegistryVotingPage = lazy(
    () => import('../pages/AssetRegistryVotingPage/AssetRegistryVotingPage'),
);

const AssetRegistry = () => (
    <Routes>
        <Route
            path={AppRoutes.section.assetRegistry.child.index}
            element={<AssetRegistryMainPage />}
        />
        <Route
            path={AppRoutes.section.assetRegistry.child.create}
            element={<AssetRegistryCreatePage />}
        />
        <Route
            path={AppRoutes.section.assetRegistry.child.voting}
            element={<AssetRegistryVotingPage />}
        />

        <Route path="*" element={<NotFoundPage />} />
    </Routes>
);

export default AssetRegistry;
