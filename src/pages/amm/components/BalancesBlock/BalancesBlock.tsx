import * as React from 'react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

import { getAssetString } from 'helpers/assets';
import { formatBalance } from 'helpers/format-number';

import useAuthStore from 'store/authStore/useAuthStore';

import { StellarService } from 'services/globalServices';
import { respondDown } from 'web/mixins';
import { Breakpoints } from 'web/styles';

import Asset from 'basics/Asset';
import PageLoader from 'basics/loaders/PageLoader';
import Table, { CellAlign } from 'basics/Table';

import { Container, Header, Section, Title } from 'pages/profile/AmmRewards/AmmRewards';

const StyledContainer = styled(Container)`
    width: 70%;
    margin: 0 auto;

    ${respondDown(Breakpoints.md)`
        width: 100%;
    `}
`;

const BalancesBlock = () => {
    const [balances, setBalances] = useState(null);

    const { account } = useAuthStore();

    useEffect(() => {
        if (!account) {
            return;
        }
        account.getSortedBalances().then(res => {
            setBalances(res);
        });
    }, [account]);
    return (
        <StyledContainer>
            <Header>
                <Title>Balances</Title>
            </Header>
            {!balances ? (
                <PageLoader />
            ) : (
                <Section>
                    <Table
                        head={[
                            { children: 'Asset' },
                            { children: 'Balance', align: CellAlign.Right },
                            { children: 'Balance(USD)', align: CellAlign.Right },
                        ]}
                        body={balances.map(({ asset, balance, nativeBalance, code }) => ({
                            key: getAssetString(asset),
                            isNarrow: true,
                            rowItems: [
                                {
                                    children: (
                                        <Asset asset={asset} withMobileView hasAssetDetailsLink />
                                    ),
                                    label: 'Asset:',
                                },
                                {
                                    children: `${formatBalance(+balance)} ${code}`,
                                    label: 'Balance:',
                                    align: CellAlign.Right,
                                    mobileStyle: { textAlign: 'right' },
                                },
                                {
                                    children: nativeBalance
                                        ? `$${formatBalance(
                                              nativeBalance * StellarService.priceLumenUsd,
                                              true,
                                          )}`
                                        : '$0.00',
                                    label: 'Balance(USD):',
                                    align: CellAlign.Right,
                                },
                            ],
                        }))}
                    />
                </Section>
            )}
        </StyledContainer>
    );
};

export default BalancesBlock;
