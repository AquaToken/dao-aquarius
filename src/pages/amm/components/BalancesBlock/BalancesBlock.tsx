import * as React from 'react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

import ErrorHandler from 'helpers/error-handler';
import { formatBalance } from 'helpers/format-number';
import { openCurrentWalletIfExist } from 'helpers/wallet-connect-helpers';

import { LoginTypes } from 'store/authStore/types';
import useAuthStore from 'store/authStore/useAuthStore';

import { BuildSignAndSubmitStatuses } from 'services/auth/wallet-connect/wallet-connect.service';
import { StellarService, ToastService } from 'services/globalServices';

import Asset from 'basics/Asset';
import { Button } from 'basics/buttons';
import PageLoader from 'basics/loaders/PageLoader';
import Table, { CellAlign } from 'basics/Table';

import { respondDown } from 'styles/mixins';
import { Breakpoints } from 'styles/style-constants';

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
    const [pending, setPending] = useState(false);
    const [distributionComplete, setDistributionComplete] = useState(false);

    const { account } = useAuthStore();

    useEffect(() => {
        if (!account) {
            return;
        }
        account.getSortedBalances().then(res => {
            setBalances(res);
        });
    }, [account]);

    const addTestTokens = async () => {
        if (account.authType === LoginTypes.walletConnect) {
            openCurrentWalletIfExist();
        }

        try {
            setPending(true);

            const tx = await StellarService.tx.createTestnetAssetsDistributeTx(account);

            const result = await account.signAndSubmitTx(tx);

            // Handle pending multisig transactions
            if (
                (result as { status: BuildSignAndSubmitStatuses }).status ===
                BuildSignAndSubmitStatuses.pending
            ) {
                ToastService.showSuccessToast('More signatures required to complete');
                return;
            }

            ToastService.showSuccessToast('Testnet tokens added successfully!');
            setPending(false);
            setDistributionComplete(true);
        } catch (e) {
            const errorText = ErrorHandler(e);
            ToastService.showErrorToast(errorText);
            setPending(false);
        }
    };

    return (
        <StyledContainer>
            <Header>
                <Title>Balances</Title>
                {account.hasMissingTestnetTokenTrustlines() && !distributionComplete && (
                    <Button
                        withGradient
                        isRounded
                        onClick={() => addTestTokens()}
                        pending={pending}
                    >
                        Add Test Tokens
                    </Button>
                )}
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
                        body={balances.map(({ token, balance, nativeBalance }) => ({
                            key: token.contract,
                            isNarrow: true,
                            rowItems: [
                                {
                                    children: (
                                        <Asset asset={token} withMobileView hasAssetDetailsLink />
                                    ),
                                    label: 'Asset:',
                                },
                                {
                                    children: `${formatBalance(
                                        +balance,
                                        false,
                                        false,
                                        token.decimal,
                                    )} ${token.code}`,
                                    label: 'Balance:',
                                    align: CellAlign.Right,
                                    mobileStyle: { textAlign: 'right' },
                                },
                                {
                                    children:
                                        +nativeBalance > 1e-7
                                            ? `$${formatBalance(
                                                  nativeBalance *
                                                      StellarService.price.priceLumenUsd,
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
