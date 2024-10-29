import { useEffect } from 'react';

import { setTestnetEnv } from 'helpers/env';

const TestnetSwitcher = (): JSX.Element => {
    useEffect(() => {
        window.history.back();
        setTestnetEnv();
    }, []);

    return null;
};

export default TestnetSwitcher;
