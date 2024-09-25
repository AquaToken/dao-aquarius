import * as React from 'react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

import ExternalLink from '../../../../common/basics/ExternalLink';
import PageLoader from '../../../../common/basics/PageLoader';
import { formatBalance } from '../../../../common/helpers/helpers';
import { respondDown } from '../../../../common/mixins';
import { Breakpoints, COLORS } from '../../../../common/styles';
import { getAirdropStats } from '../../api/api';

const Container = styled.section`
    position: relative;
    display: flex;
    justify-content: center;
    background: ${COLORS.paragraphText};
    font-family: Roboto, sans-serif;
    letter-spacing: 0;
    padding: 8rem 0;
    margin-top: 8rem;

    ${respondDown(Breakpoints.lg)`
        margin-bottom: 8rem;
    `}
`;

const Wrapper = styled.div`
    width: 100%;
    max-width: 142rem;
    padding: 0 10rem;

    ${respondDown(Breakpoints.sm)`
        padding: 0 1.6rem;
        max-width: 55rem;
    `}

    a {
        color: ${COLORS.white};

        svg {
            path {
                fill: ${COLORS.white};
            }
        }
    }
`;

const Title = styled.div`
    margin-bottom: 1.6rem;
    font-size: 3.6rem;
    line-height: 4.2rem;
    color: ${COLORS.white};

    ${respondDown(Breakpoints.lg)`
        margin-bottom: 0.8rem;
        font-size: 2.9rem;
        line-height: 3.3rem;
    `}
`;

const Date = styled.div`
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.placeholder};

    ${respondDown(Breakpoints.lg)`
       font-size: 1.4rem;
       line-height: 2.8rem;
       color: ${COLORS.white};
    `}
`;

const Table = styled.div`
    display: grid;
    width: 100%;
    grid-template-columns: 1fr 1fr 1fr;
    grid-row-gap: 4.6rem;
    margin-top: 5.2rem;
    margin-bottom: 4rem;

    & > div {
        margin-right: 1.5rem;
    }

    ${respondDown(Breakpoints.lg)`
        grid-row-gap: 4rem;
        margin-top: 3.8rem;
    `}

    ${respondDown(Breakpoints.sm)`
        grid-template-columns: 100%;
    `}
`;

const Count = styled.div`
    font-size: 3.6rem;
    line-height: 4.2rem;
    color: ${COLORS.white};

    ${respondDown(Breakpoints.lg)`
        font-size: 1.6rem;
        line-height: 2.3rem;
    `}
`;

const Description = styled.div`
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.placeholder};

    ${respondDown(Breakpoints.lg)`
        font-size: 1.4rem;
        line-height: 2.5rem;
    `}
`;

const AQUA_LIMIT = 10000000; // 10B AQUA

const SnapshotStats = () => {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        getAirdropStats().then(res => {
            setStats(res);
        });
    }, []);

    return (
        <Container>
            {!stats ? (
                <PageLoader />
            ) : (
                <Wrapper>
                    <Title>Snapshot stats</Title>
                    <Date>January 15, 2022 00:00:00 UTC</Date>
                    <Table>
                        <div>
                            <Count>{formatBalance(+stats.accounts)}</Count>
                            <Description>Eligible Accounts</Description>
                        </div>
                        <div>
                            <Count>
                                {formatBalance(AQUA_LIMIT / +stats.share_price, true)} XLM
                            </Count>
                            <Description>XLM to hit 10M AQUA limit</Description>
                        </div>
                        <div>
                            <Count>{formatBalance(+stats.share_price, true)} XLM</Count>
                            <Description>Projected AQUA per XLM</Description>
                        </div>
                        <div>
                            <Count>15B AQUA</Count>
                            <Description>Total AQUA for airdrop</Description>
                        </div>
                        <div>
                            <Count>{formatBalance(+stats.total_xlm, true)} XLM</Count>
                            <Description>Total XLM in eligible wallets</Description>
                        </div>
                        <div>
                            <Count>{formatBalance(+stats.share_price * 500, true)} XLM</Count>
                            <Description>Projected total reward with 500 XLM</Description>
                        </div>
                    </Table>
                    <ExternalLink href="https://medium.com/aquarius-aqua/announcing-aqua-airdrop-2-b338e21c2bf6">
                        Read more about Airdrop #2
                    </ExternalLink>
                </Wrapper>
            )}
        </Container>
    );
};

export default SnapshotStats;
