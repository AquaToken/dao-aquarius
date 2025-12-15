import { ReactElement, useEffect } from 'react';
import { Navigate } from 'react-router';

import { AppRoutes } from 'constants/routes';

import { getIsProductionEnv, setTestnetEnv } from 'helpers/env';

const TestnetSwitcher = (): ReactElement => {
    useEffect(() => {
        if (getIsProductionEnv()) {
            setTestnetEnv();
        }
    }, []);

    return <Navigate to={AppRoutes.page.main} replace />;
};

export default TestnetSwitcher;
