import { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { AppRoutes } from 'constants/routes';

import { getAssetString, getEnvClassicAssetData } from 'helpers/assets';
import { createLumen } from 'helpers/token';

const SwapPageLazy = lazy(() => import('./pages/SwapPage'));

const Swap = () => {
    const { assetString: aquaAssetString } = getEnvClassicAssetData('aqua');

    return (
        <Routes>
            <Route path={AppRoutes.section.swap.child.index} element={<SwapPageLazy />} />

            <Route
                path="*"
                element={
                    <Navigate
                        to={AppRoutes.section.swap.to.index({
                            source: getAssetString(createLumen()),
                            destination: aquaAssetString,
                        })}
                        replace
                    />
                }
            />
        </Routes>
    );
};

export default Swap;
