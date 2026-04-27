import { ReactElement, useEffect } from 'react';
import { Navigate } from 'react-router';

import { AppRoutes } from 'constants/routes';

import { getIsProductionEnv, setTestnetEnv } from 'helpers/env';

import useAssetsStore from 'store/assetsStore/useAssetsStore';

const TestnetSwitcher = (): ReactElement => {
    const { clearAssets } = useAssetsStore();

    useEffect(() => {
        if (getIsProductionEnv()) {
            clearAssets();
            setTestnetEnv();
        }
    }, [clearAssets]);

    return <Navigate to={AppRoutes.page.main} replace />;
};

export default TestnetSwitcher;
