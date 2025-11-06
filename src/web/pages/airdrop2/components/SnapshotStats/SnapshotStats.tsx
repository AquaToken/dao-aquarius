import * as React from 'react';
import { useEffect, useState } from 'react';

import { getAirdropStats } from 'api/airdrop2';

import { formatBalance } from 'helpers/format-number';

import { ExternalLink } from 'basics/links';
import PageLoader from 'basics/loaders/PageLoader';

import { Container, Wrapper, Title, Date, Table, Count, Description } from './SnapshotStats.styled';

const AQUA_LIMIT = 10_000_000; // 10B AQUA

interface AirdropStats {
    accounts: string | number;
    share_price: string | number;
    total_xlm: string | number;
}

const SnapshotStats: React.FC = () => {
    const [stats, setStats] = useState<AirdropStats | null>(null);

    useEffect(() => {
        getAirdropStats().then(res => setStats(res));
    }, []);

    if (!stats) {
        return (
            <Container>
                <PageLoader />
            </Container>
        );
    }

    const sharePrice = Number(stats.share_price);

    return (
        <Container>
            <Wrapper>
                <Title>Snapshot stats</Title>
                <Date>January 15, 2022 00:00:00 UTC</Date>

                <Table>
                    <div>
                        <Count>{formatBalance(+stats.accounts)}</Count>
                        <Description>Eligible Accounts</Description>
                    </div>

                    <div>
                        <Count>{formatBalance(AQUA_LIMIT / sharePrice, true)} XLM</Count>
                        <Description>XLM to hit 10M AQUA limit</Description>
                    </div>

                    <div>
                        <Count>{formatBalance(sharePrice, true)} XLM</Count>
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
                        <Count>{formatBalance(sharePrice * 500, true)} XLM</Count>
                        <Description>Projected total reward with 500 XLM</Description>
                    </div>
                </Table>

                <ExternalLink href="https://medium.com/aquarius-aqua/announcing-aqua-airdrop-2-b338e21c2bf6">
                    Read more about Airdrop #2
                </ExternalLink>
            </Wrapper>
        </Container>
    );
};

export default SnapshotStats;
