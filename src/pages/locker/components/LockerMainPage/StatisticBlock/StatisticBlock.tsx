import * as React from 'react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

import { getIceStatistics } from 'api/ice-locker';

import { formatBalance } from 'helpers/format-number';

import { respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import Aqua from 'assets/aqua-logo-small.svg';
import Ice from 'assets/ice-logo.svg';

import DotsLoader from 'basics/loaders/DotsLoader';

const Container = styled.div`
    display: flex;
    padding: 0 4rem;
    margin-top: 6rem;
    gap: 6rem;
    width: 100%;

    ${respondDown(Breakpoints.md)`
        padding: 4rem 1.6rem;
        flex-direction: column;
        margin-top: 0;
        gap: 2rem;
    `};
`;

const StatisticItem = styled.div`
    display: flex;
    flex-direction: column;
    padding: 3.6rem 3.9rem;
    background: ${COLORS.lightGray};
    flex: 1;

    ${respondDown(Breakpoints.md)`
        padding: 3.2rem 1.6rem;
    `};
`;

const IconsBlock = styled.div`
    display: flex;
    margin-bottom: 1.6rem;

    svg:nth-child(2) {
        margin-left: -1.2rem;
    }
`;

const AquaLogo = styled(Aqua)`
    width: 5rem;
    height: 5rem;
    z-index: 1;
`;

const IceLogo = styled(Ice)`
    width: 5rem;
    height: 5rem;
`;

const Amount = styled.span`
    font-size: 3.6rem;
    line-height: 4.2rem;
    color: ${COLORS.titleText};
    margin-bottom: 0.6rem;
`;

const Description = styled.span`
    font-size: 1.8rem;
    line-height: 3.2rem;
    color: ${COLORS.darkGrayText};
`;

const UPDATE_INTERVAL = 60 * 1000;

const StatisticBlock = () => {
    const [statistics, setStatistics] = useState(null);
    const [updateIndex, setUpdateIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setUpdateIndex(prev => prev + 1);
        }, UPDATE_INTERVAL);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        getIceStatistics().then(res => {
            setStatistics(res);
        });
    }, [updateIndex]);

    return (
        <Container>
            <StatisticItem>
                <IconsBlock>
                    <AquaLogo />
                </IconsBlock>
                <Amount>
                    {statistics ? formatBalance(statistics.aqua_lock_amount, true) : <DotsLoader />}
                </Amount>
                <Description>Total AQUA Locked</Description>
            </StatisticItem>
            <StatisticItem>
                <IconsBlock>
                    <IceLogo />
                </IconsBlock>
                <Amount>
                    {statistics ? (
                        formatBalance(statistics.ice_supply_amount, true)
                    ) : (
                        <DotsLoader />
                    )}
                </Amount>
                <Description>Total ICE Issued</Description>
            </StatisticItem>
            <StatisticItem>
                <IconsBlock>
                    <AquaLogo />
                    <IceLogo />
                </IconsBlock>
                <Amount>
                    {statistics ? formatBalance(statistics.aqua_lock_accounts) : <DotsLoader />}
                </Amount>
                <Description>Wallets with ICE</Description>
            </StatisticItem>
        </Container>
    );
};

export default StatisticBlock;
