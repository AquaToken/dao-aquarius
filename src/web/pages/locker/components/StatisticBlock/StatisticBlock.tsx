import * as React from 'react';
import { useEffect, useState } from 'react';

import { getIceStatistics } from 'api/ice-locker';

import { formatBalance } from 'helpers/format-number';

import { useScrollAnimation } from 'hooks/useScrollAnimation';

import DotsLoader from 'basics/loaders/DotsLoader';

import {
    Container,
    StatisticItem,
    IconsBlock,
    AquaLogo,
    IceLogo,
    Amount,
    Description,
} from './StatisticBlock.styled';

const UPDATE_INTERVAL = 60 * 1000;

const StatisticBlock: React.FC = () => {
    const [statistics, setStatistics] = useState(null);
    const [updateIndex, setUpdateIndex] = useState(0);
    const { ref, visible } = useScrollAnimation(0.5, true);

    // Periodically refresh ICE statistics
    useEffect(() => {
        const interval = setInterval(() => {
            setUpdateIndex(prev => prev + 1);
        }, UPDATE_INTERVAL);

        return () => clearInterval(interval);
    }, []);

    // Fetch new data whenever updateIndex changes
    useEffect(() => {
        getIceStatistics().then(res => setStatistics(res));
    }, [updateIndex]);

    return (
        <Container ref={ref as React.RefObject<HTMLDivElement>} $visible={visible}>
            <StatisticItem $visible={visible} $delay={0}>
                <IconsBlock>
                    <AquaLogo />
                </IconsBlock>
                <Amount>
                    {statistics ? formatBalance(statistics.aqua_lock_amount, true) : <DotsLoader />}
                </Amount>
                <Description>Total AQUA Locked</Description>
            </StatisticItem>

            <StatisticItem $visible={visible} $delay={0.15}>
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

            <StatisticItem $visible={visible} $delay={0.3}>
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
