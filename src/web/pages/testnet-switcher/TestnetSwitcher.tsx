import { useEffect } from 'react';
import { Redirect } from 'react-router';

import { MainRoutes } from 'constants/routes';

import { getIsProductionEnv, setTestnetEnv } from 'helpers/env';

const TestnetSwitcher = (): JSX.Element => {
    useEffect(() => {
        if (getIsProductionEnv()) {
            setTestnetEnv();
        }
    }, []);

    return <Redirect to={MainRoutes.main} />;
};

export default TestnetSwitcher;
