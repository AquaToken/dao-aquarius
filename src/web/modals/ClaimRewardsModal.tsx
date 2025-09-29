import { useEffect, useState } from 'react';
import styled from 'styled-components';

import { getUserRewardsList } from 'api/amm';

import { CLAIM_ALL_COUNT } from 'constants/amm';

import { formatBalance } from 'helpers/format-number';
import { openCurrentWalletIfExist } from 'helpers/wallet-connect-helpers';

import { LoginTypes } from 'store/authStore/types';
import useAuthStore from 'store/authStore/useAuthStore';

import { BuildSignAndSubmitStatuses } from 'services/auth/wallet-connect/wallet-connect.service';
import { SorobanService, ToastService } from 'services/globalServices';

import { ModalProps } from 'types/modal';
import { Int128Parts } from 'types/stellar';

import { flexAllCenter, flexColumn, respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import Warning from 'assets/icons/status/warning-16.svg';

import { Button } from 'basics/buttons';
import { Checkbox } from 'basics/inputs';
import { PageLoader } from 'basics/loaders';
import Market from 'basics/Market';
import { ModalDescription, ModalTitle, ModalWrapper, StickyButtonWrapper } from 'basics/ModalAtoms';
import Table, { CellAlign } from 'basics/Table';

const CheckboxMobile = styled(Checkbox)`
    display: none;
    margin-left: auto;

    ${respondDown(Breakpoints.md)`
        display: block;
    `}
`;

const WarningOrange = styled(Warning)`
    path {
        fill: ${COLORS.orange500};
    }
`;

const Container = styled.div`
    height: 20rem;
    ${flexAllCenter};
    flex-direction: column;

    span {
        color: ${COLORS.textGray};
        margin-top: 0.8rem;
        margin-bottom: auto;
    }
`;

const Amounts = styled.div`
    ${flexColumn};
    text-align: right;
`;

const ClaimRewardsModal = ({ confirm, close }: ModalProps<never>) => {
    const [rewards, setRewards] = useState(null);
    const [selectedRewards, setSelectedRewards] = useState(new Set());
    const [pending, setPending] = useState(false);

    const selectClaim = (id: string) => {
        if (selectedRewards.has(id)) {
            selectedRewards.delete(id);
        } else {
            selectedRewards.add(id);
        }

        setSelectedRewards(new Set(selectedRewards));
    };

    const { account } = useAuthStore();

    useEffect(() => {
        if (!account) {
            return;
        }
        getUserRewardsList(account.accountId()).then(res => {
            setRewards(res);

            setSelectedRewards(new Set(res.slice(0, CLAIM_ALL_COUNT).map(({ id }) => id)));
        });
    }, [account]);

    const claimAll = () => {
        if (account.authType === LoginTypes.walletConnect) {
            openCurrentWalletIfExist();
        }
        setPending(true);

        SorobanService.amm
            .getClaimBatchTx(account.accountId(), [...selectedRewards] as string[])
            .then(tx => account.signAndSubmitTx(tx, true))
            .then((res: { status?: BuildSignAndSubmitStatuses; value: () => Int128Parts }) => {
                if (!res) {
                    return;
                }

                if (
                    (res as { status: BuildSignAndSubmitStatuses }).status ===
                    BuildSignAndSubmitStatuses.pending
                ) {
                    ToastService.showSuccessToast('More signatures required to complete');
                    return;
                }

                ToastService.showSuccessToast('Claimed successfully');
                setPending(false);
                confirm();
            })
            .catch(err => {
                ToastService.showErrorToast(err.message ?? err.toString());
                setPending(false);
            });
    };

    return (
        <ModalWrapper $isWide>
            <ModalTitle>Claim Rewards</ModalTitle>
            <ModalDescription>Claim up to 5 pools at a time</ModalDescription>

            <>
                {!rewards ? (
                    <Container>
                        <PageLoader />
                    </Container>
                ) : rewards.length ? (
                    <>
                        <Table
                            head={[
                                {
                                    children: 'Pool',
                                    flexSize: 3,
                                },
                                {
                                    children: 'Type',
                                    align: CellAlign.Right,
                                },
                                {
                                    children: 'Amount',
                                    align: CellAlign.Right,
                                    flexSize: 2,
                                },
                                { children: '', flexSize: 0.3 },
                            ]}
                            body={rewards.map(item => ({
                                key: item.id,
                                style: { marginBottom: '1.6rem' },
                                mobileBackground: COLORS.gray50,
                                rowItems: [
                                    {
                                        children: (
                                            <>
                                                <Market
                                                    assets={item.tokens}
                                                    withoutLink
                                                    poolType={item.poolType}
                                                    fee={item.fee}
                                                    mobileVerticalDirections
                                                />

                                                <CheckboxMobile
                                                    checked={selectedRewards.has(item.id)}
                                                    onChange={() => {
                                                        selectClaim(item.id);
                                                    }}
                                                />
                                            </>
                                        ),
                                        flexSize: 3,
                                        mobileStyle: { width: '100%' },
                                    },
                                    {
                                        children: item.amount ? 'Reward' : 'Incentive',
                                        label: 'Type',
                                        align: CellAlign.Right,
                                    },
                                    {
                                        children: item.amount ? (
                                            `${formatBalance(item.amount, true)} AQUA`
                                        ) : (
                                            <Amounts>
                                                {item.incentives
                                                    .filter(
                                                        incentive =>
                                                            !!Number(incentive.info.user_reward),
                                                    )
                                                    .map(incentive => (
                                                        <span key={incentive.token.contract}>
                                                            {formatBalance(
                                                                incentive.info.user_reward,
                                                                true,
                                                            )}{' '}
                                                            {incentive.token.code}
                                                        </span>
                                                    ))}
                                            </Amounts>
                                        ),
                                        align: CellAlign.Right,
                                        label: 'Amount',
                                        flexSize: 2,
                                    },
                                    {
                                        children: (
                                            <Checkbox
                                                checked={selectedRewards.has(item.id)}
                                                onChange={() => {
                                                    selectClaim(item.id);
                                                }}
                                            />
                                        ),
                                        flexSize: 0.3,
                                        align: CellAlign.Right,
                                        hideOnMobile: true,
                                    },
                                ],
                                isNarrow: true,
                            }))}
                        />

                        <StickyButtonWrapper>
                            <Button
                                isBig
                                fullWidth
                                disabled={
                                    !selectedRewards.size || selectedRewards.size > CLAIM_ALL_COUNT
                                }
                                pending={pending}
                                onClick={() => claimAll()}
                            >
                                {!selectedRewards.size
                                    ? 'select rewards'
                                    : selectedRewards.size > CLAIM_ALL_COUNT
                                    ? `maximum ${CLAIM_ALL_COUNT} rewards at a time `
                                    : `claim ${selectedRewards.size} reward${
                                          selectedRewards.size > 1 ? 's' : ''
                                      }`}
                            </Button>
                        </StickyButtonWrapper>
                    </>
                ) : (
                    <Container>
                        <WarningOrange />
                        <span>Nothing to claim</span>
                        <Button fullWidth isBig onClick={() => close()}>
                            close
                        </Button>
                    </Container>
                )}
            </>
        </ModalWrapper>
    );
};

export default ClaimRewardsModal;
