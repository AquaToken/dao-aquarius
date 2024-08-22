import * as React from 'react';
import PoolsList from '../../../pages/amm/components/PoolsList/PoolsList';
import { ModalContainer, ModalTitle } from '../atoms/ModalAtoms';
import { Stepper } from './MigrateLiquidityStep1';
import styled from 'styled-components';
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
const MigrateLiquidityStep2 = ({ params }) => {
    const { poolsToMigrate, baseAmount, counterAmount, base, counter } = params;

    return (
        <ModalContainer isWide>
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
                    onUpdate={() => {}}
                />
            </Content>
        </ModalContainer>
    );
};

export default MigrateLiquidityStep2;
