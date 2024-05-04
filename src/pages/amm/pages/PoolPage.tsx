import * as React from 'react';
import { useParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { getPool } from '../api/api';
import PageLoader from '../../../common/basics/PageLoader';
import styled from 'styled-components';
import { isRewardsOn, MAX_REWARDS_PERCENT } from '../../vote/components/MainPage/Table/Table';
import Pair from '../../vote/components/common/Pair';
import { SorobanService } from '../../../common/services/globalServices';
import { Breakpoints, COLORS } from '../../../common/styles';
import { commonMaxWidth, respondDown } from '../../../common/mixins';
import Sidebar from '../components/Sidebar/Sidebar';

const Container = styled.main`
    height: 100%;
    position: relative;
    display: flex;
    flex: 1 0 auto;
    flex-direction: column;
    scroll-behavior: smooth;
    overflow: auto;
`;

const MainBlock = styled.main`
    flex: 1 0 auto;
    background-color: ${COLORS.lightGray};
    z-index: 1;
`;

const Background = styled.div`
    width: 100%;
    padding: 4rem 0 6rem;
    background-color: ${COLORS.lightGray};

    ${respondDown(Breakpoints.md)`
        padding: 1.6rem 0;
    `}
`;

const Section = styled.section<{ smallTopPadding?: boolean }>`
    ${commonMaxWidth};
    padding-top: ${({ smallTopPadding }) => (smallTopPadding ? '2rem' : '2.8rem')};
    padding-left: 4rem;
    padding-right: calc(10vw + 20rem);
    width: 100%;

    &:last-child {
        margin-bottom: 6.6rem;
    }

    ${respondDown(Breakpoints.xxxl)`
        padding-right: calc(10vw + 30rem);
    `}

    ${respondDown(Breakpoints.xxl)`
        padding-right: calc(10vw + 40rem);
    `}

    ${respondDown(Breakpoints.lg)`
        padding: 3.2rem 1.6rem 0;
    `}
`;

const SectionWrap = styled.div`
    display: flex;
    flex-direction: column;
    background-color: ${COLORS.white};
    padding: 4.2rem 3.2rem 2rem;
    border-radius: 0.5rem;
`;

const PoolPage = () => {
    const [pool, setPool] = useState(null);
    const { poolAddress } = useParams<{ poolAddress: string }>();

    const base = useMemo(() => {
        if (!pool) {
            return null;
        }
        return pool.assets[0];
    }, [pool]);

    const counter = useMemo(() => {
        if (!pool) {
            return null;
        }
        return pool.assets[1];
    }, [pool]);

    useEffect(() => {
        getPool(poolAddress).then((res) => {
            setPool(res);
        });
    }, [poolAddress]);

    console.log(pool);

    if (!pool) {
        return <PageLoader />;
    }

    return (
        <MainBlock>
            <Background>
                <Section>
                    <Pair
                        base={base}
                        counter={counter}
                        verticalDirections
                        leftAlign
                        bigCodes
                        bottomLabels
                        isBigLogo
                        isCircleLogos
                        withoutLink
                    />
                </Section>
                <Sidebar pool={pool} />
                <Section>
                    <SectionWrap>
                        <h3>Graphs</h3>
                        <div>Coming soon</div>
                    </SectionWrap>
                </Section>
                <Section>
                    <SectionWrap>
                        <h3>Transactions</h3>
                        <div>Coming soon</div>
                    </SectionWrap>
                </Section>
            </Background>
        </MainBlock>
    );
};

export default PoolPage;
