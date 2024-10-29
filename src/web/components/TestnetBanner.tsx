import { useState } from 'react';
import styled from 'styled-components';

import { getIsTestnetEnv, setProductionEnv } from 'helpers/env';

import { flexAllCenter } from 'web/mixins';
import { COLORS } from 'web/styles';

import { Button } from 'basics/buttons';

const Container = styled.div`
    ${flexAllCenter};
    background-color: ${COLORS.lightGray};
`;

const TestnetBanner = (): JSX.Element => {
    const [isTestnet, setIsTestnet] = useState(getIsTestnetEnv());

    const onClickSwitch = () => {
        setProductionEnv();
        setIsTestnet(false);
    };

    return isTestnet ? (
        <Container>
            Running on Testnet
            <Button isSmall onClick={onClickSwitch}>
                Switch to main network
            </Button>
        </Container>
    ) : null;
};

export default TestnetBanner;
