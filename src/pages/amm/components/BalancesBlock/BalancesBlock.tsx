import * as React from 'react';
import { useEffect, useState } from 'react';
import { Container, Header, Section, Title } from '../../../profile/AmmRewards/AmmRewards';
import PageLoader from '../../../../common/basics/PageLoader';
import Asset from '../../../vote/components/AssetDropdown/Asset';
import { formatBalance, getAssetString } from '../../../../common/helpers/helpers';
import useAuthStore from '../../../../store/authStore/useAuthStore';
import Table, { CellAlign } from '../../../../common/basics/Table';
import { StellarService } from '../../../../common/services/globalServices';
import styled from 'styled-components';
import { respondDown } from '../../../../common/mixins';
import { Breakpoints } from '../../../../common/styles';

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
        account.getSortedBalances().then((res) => {
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
                                    children: <Asset asset={asset} withMobileView />,
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
