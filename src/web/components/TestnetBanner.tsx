import { useRef, useState, ReactElement } from 'react';
import styled from 'styled-components';

import { ENV_PRODUCTION, ENV_TESTNET } from 'constants/env';

import { getEnv, getIsTestnetEnv, setProductionEnv } from 'helpers/env';
import Timer from 'helpers/timer';

import useAssetsStore from 'store/assetsStore/useAssetsStore';

import { ToastService } from 'services/globalServices';

import { ToggleGroup } from 'basics/inputs';

import { flexAllCenter } from 'styles/mixins';
import { COLORS } from 'styles/style-constants';

const Container = styled.div`
    ${flexAllCenter};
    background-color: ${COLORS.white};
    border-bottom: 0.1rem solid ${COLORS.gray100};
    padding: 0 4rem;
`;

const OPTIONS = [
    { label: 'Testnet', value: ENV_TESTNET },
    { label: 'Production', value: ENV_PRODUCTION },
];

const SWITCH_TIMEOUT = 5000;

const TestnetBanner = (): ReactElement => {
    const [isTestnet, setIsTestnet] = useState(getIsTestnetEnv());
    const currentEnv = getEnv();
    const [toggleValue, setToggleValue] = useState(currentEnv);
    const { clearAssets } = useAssetsStore();

    const close = () => {
        clearAssets();
        setProductionEnv();
        setIsTestnet(false);
    };

    const timer = useRef(new Timer(close, SWITCH_TIMEOUT));

    const onClickSwitch = value => {
        timer.current.clear();
        setToggleValue(value);
        if (value === currentEnv) {
            return;
        }
        ToastService.showSuccessToast(
            `You will be switched to ${value} in ${SWITCH_TIMEOUT / 1000} sec`,
        );
        timer.current.start();
    };

    return isTestnet ? (
        <Container>
            <ToggleGroup value={toggleValue} options={OPTIONS} onChange={onClickSwitch} />
        </Container>
    ) : null;
};

export default TestnetBanner;
