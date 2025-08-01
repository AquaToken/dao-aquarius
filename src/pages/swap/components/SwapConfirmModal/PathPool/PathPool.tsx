import * as React from 'react';
import styled from 'styled-components';

import { AmmRoutes } from 'constants/routes';

import { respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import RightIcon from 'assets/icon-arrow-right-long.svg';

const Container = styled.div`
    width: 25%;
    display: flex;

    ${respondDown(Breakpoints.md)`
        width: 100%;
        flex-direction: column;
    `}
`;

const Pool = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.6rem;

    ${respondDown(Breakpoints.md)`
        flex-direction: row;
        width: 100%;
        justify-content: space-between;
    `}
`;

const PoolAssets = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.8rem;
    border-radius: 2.1rem;
    border: 0.2rem solid ${COLORS.transparent};
    background: linear-gradient(to top, white, white),
        linear-gradient(to top, ${COLORS.gray}, ${COLORS.white} 50%);
    background-clip: padding-box, border-box;
    background-origin: padding-box, border-box;
    cursor: pointer;

    &:hover {
        background: linear-gradient(to top, ${COLORS.gray}, ${COLORS.gray}),
            linear-gradient(to top, ${COLORS.gray}, ${COLORS.white} 50%);
    }
`;

const ArrowRight = styled(RightIcon)`
    margin: 2rem auto 0;

    ${respondDown(Breakpoints.md)`
        margin: 0 auto;
        transform: rotate(90deg);
    `}
`;

const Fee = styled.div`
    font-size: 1.6rem;
    line-height: 1.8rem;
    color: ${COLORS.grayText};
`;

interface PathPoolProps {
    baseIcon: React.ReactNode;
    counterIcon: React.ReactNode;
    fee: string;
    address: string;
    isLastPool: boolean;
}

const PathPool = ({
    baseIcon,
    counterIcon,
    fee,
    address,
    isLastPool,
}: PathPoolProps): React.ReactNode => (
    <Container>
        <Pool onClick={() => window.open(`${AmmRoutes.analytics}${address}`)}>
            <PoolAssets>
                {baseIcon}
                {counterIcon}
            </PoolAssets>
            <Fee>{(Number(fee) * 100).toFixed(2)}%</Fee>
        </Pool>
        {!isLastPool && <ArrowRight />}
    </Container>
);

export default PathPool;
