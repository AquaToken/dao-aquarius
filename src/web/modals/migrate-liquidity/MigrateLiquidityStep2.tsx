import * as React from 'react';
import styled from 'styled-components';

import { PoolProcessed } from 'types/amm';
import { ModalProps } from 'types/modal';
import { Asset } from 'types/stellar';

import { ModalTitle, ModalWrapper } from 'basics/ModalAtoms';

import PoolsList from 'pages/amm/components/PoolsList/PoolsList';

import { Stepper } from './MigrateLiquidityStep1';

import { customScroll, respondDown } from '../../mixins';
import { Breakpoints } from '../../styles';

const Content = styled.div`
    max-height: 60vh;
    ${customScroll};
    overflow-y: auto;

    ${respondDown(Breakpoints.md)`
        max-height: unset;
    `}
`;
interface MigrateLiquidityStep2Params {
    poolsToMigrate: PoolProcessed[];
    baseAmount: string;
    counterAmount: string;
    base: Asset;
    counter: Asset;
    onUpdate: () => void;
}

const MigrateLiquidityStep2 = ({ params }: ModalProps<MigrateLiquidityStep2Params>) => {
    const { poolsToMigrate, baseAmount, counterAmount, base, counter, onUpdate } = params;

    return (
        <ModalWrapper $isWide>
            <Stepper>STEP 2/2</Stepper>
            <ModalTitle>Deposit to Soroban pool</ModalTitle>
            <Content>
                <PoolsList
                    pools={poolsToMigrate}
                    withDeposit
                    baseAmount={baseAmount}
                    counterAmount={counterAmount}
                    base={base}
                    counter={counter}
                    onUpdate={() => onUpdate()}
                />
            </Content>
        </ModalWrapper>
    );
};

export default MigrateLiquidityStep2;
