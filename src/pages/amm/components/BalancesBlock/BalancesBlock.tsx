import * as React from 'react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

import { getAssetsList } from 'api/amm';

import { getAssetString } from 'helpers/assets';
import { formatBalance } from 'helpers/format-number';

import useAuthStore from 'store/authStore/useAuthStore';

import { SorobanService, StellarService } from 'services/globalServices';

import { TokenType } from 'types/token';

import { respondDown } from 'web/mixins';
import { Breakpoints } from 'web/styles';

import Asset from 'basics/Asset';
import PageLoader from 'basics/loaders/PageLoader';
import Table, { CellAlign } from 'basics/Table';

import { Container, Header, Section, Title } from 'pages/profile/SdexRewards/SdexRewards';

const StyledContainer = styled(Container)`
    width: 70%;
    margin: 0 auto;

    ${respondDown(Breakpoints.md)`
        width: 100%;
    `}
`;

const BalancesBlock = () => {
    const [balances, setBalances] = useState(null);
    const [customTokensBalances, setCustomTokensBalances] = useState(null);

    const { account } = useAuthStore();

    useEffect(() => {
        if (!account) {
            return;
        }
        account.getSortedBalances().then(res => {
            setBalances(res);
        });
    }, [account]);

    const getCustomTokensBalances = async () => {
        const list = await getAssetsList();
        const sorobanTokens = list.filter(({ type }) => type === TokenType.soroban);

        if (!sorobanTokens.length) {
            return;
        }
        const balances = await Promise.all(
            sorobanTokens.map(({ contract }) =>
                SorobanService.getTokenBalance(contract, account.accountId()),
            ),
        );

        setCustomTokensBalances(
            sorobanTokens.map((token, index) => ({
                ...token,
                ...{ balance: balances[index] },
            })),
        );
    };

    useEffect(() => {
        getCustomTokensBalances();
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

            {Boolean(customTokensBalances) && (
                <Section>
                    <h3>Custom Soroban Tokens</h3>
                    <Table
                        head={[
                            { children: 'Asset' },
                            { children: 'Balance', align: CellAlign.Right },
                        ]}
                        body={customTokensBalances.map(balance => ({
                            key: balance.cotract,
                            isNarrow: true,
                            rowItems: [
                                {
                                    children: (
                                        <Asset asset={balance} withMobileView hasAssetDetailsLink />
                                    ),
                                    label: 'Asset:',
                                },
                                {
                                    children: `${formatBalance(+balance.balance)} ${balance.code}`,
                                    label: 'Balance:',
                                    align: CellAlign.Right,
                                    mobileStyle: { textAlign: 'right' },
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
