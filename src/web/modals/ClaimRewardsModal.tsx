import { useEffect, useState } from 'react';
import styled from 'styled-components';

import { getUserRewardsList } from 'api/amm';

import { formatBalance } from 'helpers/format-number';
import { openCurrentWalletIfExist } from 'helpers/wallet-connect-helpers';

import { LoginTypes } from 'store/authStore/types';
import useAuthStore from 'store/authStore/useAuthStore';

import { SorobanService, ToastService } from 'services/globalServices';
import { BuildSignAndSubmitStatuses } from 'services/wallet-connect.service';

import { ModalProps } from 'types/modal';
import { Int128Parts } from 'types/stellar';

import { customScroll, flexAllCenter, respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import Warning from 'assets/icon-warning-orange.svg';

import { Button } from 'basics/buttons';
import { Checkbox } from 'basics/inputs';
import { PageLoader } from 'basics/loaders';
import Market from 'basics/Market';
import { ModalDescription, ModalTitle, ModalWrapper } from 'basics/ModalAtoms';
import Table, { CellAlign } from 'basics/Table';

const CheckboxMobile = styled(Checkbox)`
    display: none;
    margin-left: auto;

    ${respondDown(Breakpoints.md)`
        display: block;
    `}
`;

const Scrollable = styled.div`
    ${customScroll};
    overflow: auto;
    max-height: 30rem;
    margin: 3.2rem 0;

    ${respondDown(Breakpoints.md)`
        max-height: calc(100vh - 25rem);
    `}
`;

const Container = styled.div`
    height: 20rem;
    ${flexAllCenter};
    flex-direction: column;

    span {
        color: ${COLORS.grayText};
        margin-top: 0.8rem;
        margin-bottom: auto;
    }
`;

const MAX_REWARDS_COUNT = 5;

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
            console.log(res);
            setRewards(res);

            setSelectedRewards(new Set(res.slice(0, MAX_REWARDS_COUNT).map(({ id }) => id)));
        });
    }, [account]);

    const claimAll = () => {
        if (account.authType === LoginTypes.walletConnect) {
            openCurrentWalletIfExist();
        }
        setPending(true);

        SorobanService.getClaimBatchTx(account.accountId(), [...selectedRewards] as string[])
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
            <ModalTitle>Claim rewards</ModalTitle>
            <ModalDescription>Claim up to 5 pools at a time</ModalDescription>

            <>
                {!rewards ? (
                    <Container>
                        <PageLoader />
                    </Container>
                ) : rewards.length ? (
                    <>
                        <Scrollable>
                            <Table
                                head={[
                                    {
                                        children: 'Pool',
                                        flexSize: 3,
                                    },
                                    {
                                        children: 'Amount',
                                        align: CellAlign.Right,
                                    },
                                    { children: '', flexSize: 0.3 },
                                ]}
                                body={rewards.map(item => ({
                                    key: item.id,
                                    style: { marginBottom: '1.6rem' },
                                    mobileBackground: COLORS.lightGray,
                                    rowItems: [
                                        {
                                            children: (
                                                <>
                                                    <Market
                                                        assets={item.assets}
                                                        withoutLink
                                                        poolType={item.type}
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
                                            children: `${formatBalance(item.amount, true)} AQUA`,
                                            align: CellAlign.Right,
                                            label: 'Amount',
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
                        </Scrollable>
                        <Button
                            isBig
                            fullWidth
                            disabled={
                                !selectedRewards.size || selectedRewards.size > MAX_REWARDS_COUNT
                            }
                            pending={pending}
                            onClick={() => claimAll()}
                        >
                            {!selectedRewards.size
                                ? 'select rewards'
                                : selectedRewards.size > MAX_REWARDS_COUNT
                                ? `maximum ${MAX_REWARDS_COUNT} pools at a time `
                                : `claim ${selectedRewards.size} reward${
                                      selectedRewards.size > 1 ? 's' : ''
                                  }`}
                        </Button>
                    </>
                ) : (
                    <Container>
                        <Warning />
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
