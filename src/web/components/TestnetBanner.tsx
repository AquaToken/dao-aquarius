import { useRef, useState } from 'react';
import styled from 'styled-components';

import { ENV_PRODUCTION, ENV_TESTNET } from 'constants/env';

import { getEnv, getIsTestnetEnv, setProductionEnv } from 'helpers/env';
import Timer from 'helpers/timer';

import { ToastService } from 'services/globalServices';

import { cardBoxShadow, flexAllCenter } from 'web/mixins';
import { COLORS } from 'web/styles';

import { ToggleGroup } from 'basics/inputs';

const Container = styled.div`
    ${flexAllCenter};
    background-color: ${COLORS.gray50};
    padding: 0 4rem;
    ${cardBoxShadow};
`;

const OPTIONS = [
    { label: 'Testnet', value: ENV_TESTNET },
    { label: 'Production', value: ENV_PRODUCTION },
];

const SWITCH_TIMEOUT = 5000;

const TestnetBanner = (): JSX.Element => {
    const [isTestnet, setIsTestnet] = useState(getIsTestnetEnv());
    const currentEnv = getEnv();
    const [toggleValue, setToggleValue] = useState(currentEnv);

    const close = () => {
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
