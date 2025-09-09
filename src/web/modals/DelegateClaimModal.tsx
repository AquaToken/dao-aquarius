import { useEffect, useState } from 'react';
import styled from 'styled-components';

import { getDateString } from 'helpers/date';
import ErrorHandler from 'helpers/error-handler';
import { formatBalance } from 'helpers/format-number';
import { openCurrentWalletIfExist } from 'helpers/wallet-connect-helpers';

import { useIsMounted } from 'hooks/useIsMounted';

import { LoginTypes } from 'store/authStore/types';
import useAuthStore from 'store/authStore/useAuthStore';

import { StellarService, ToastService } from 'services/globalServices';
import { StellarEvents } from 'services/stellar.service';
import { BuildSignAndSubmitStatuses } from 'services/wallet-connect.service';

import { Delegatee } from 'types/delegate';
import { ModalProps } from 'types/modal';
import { Vote } from 'types/voting-tool';

import { customScroll, flexAllCenter, flexColumnCenter, respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import { Button } from 'basics/buttons';
import Identicon from 'basics/Identicon';
import { Checkbox } from 'basics/inputs';
import { PageLoader } from 'basics/loaders';
import { ModalTitle, ModalWrapper, StickyButtonWrapper } from 'basics/ModalAtoms';
import PublicKeyWithIcon from 'basics/PublicKeyWithIcon';
import Table, { CellAlign } from 'basics/Table';

import { UP_ICE } from 'pages/vote/components/MainPage/MainPage';

const DelegateBlock = styled.div`
    ${flexColumnCenter};
    background-color: ${COLORS.lightGray};
    padding: 3.4rem 0;
    border-radius: 0.5rem;
    margin-top: 4rem;
    margin-bottom: 3.2rem;
`;

const IconWrapper = styled.div`
    height: 4.8rem;
    width: 4.8rem;
    border-radius: 50%;
    border: 0.2rem solid ${COLORS.lightGray};
    ${flexAllCenter};
    margin-right: 0.8rem;

    img {
        width: 3.2rem;
        border-radius: 50%;
    }
`;

const IdenticonStyled = styled(Identicon)`
    height: 4.8rem;
    width: 4.8rem;
    margin-right: 0.8rem;
`;

const Name = styled.span`
    margin-top: 1.2rem;
    font-weight: 700;
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.titleText};
`;

const List = styled.div`
    max-height: 75vh;
    margin-bottom: 3.2rem;
    ${customScroll};

    ${respondDown(Breakpoints.md)`
        max-height: unset;
    `}
`;

const SelectAllMobile = styled(Checkbox)`
    display: none;
    margin-bottom: 2.8rem;
    margin-left: 1.6rem;
    width: fit-content;

    ${respondDown(Breakpoints.md)`
        display: flex;
   `}
`;

interface Params {
    delegatee: Partial<Delegatee>;
}

const DelegateClaimModal = ({ params }: ModalProps<Params>) => {
    const [claims, setClaims] = useState(null);
    const [selectedClaims, setSelectedClaims] = useState(new Set<string>());
    const [pending, setPending] = useState(false);

    const { delegatee } = params;

    const { account } = useAuthStore();

    const isMounted = useIsMounted();

    useEffect(() => {
        if (!account) {
            return;
        }
        setClaims(
            StellarService.getDelegateLocks(account.accountId()).filter(cb =>
                cb.claimants.some(({ destination }) => destination === delegatee.account),
            ),
        );

        const unsub = StellarService.event.sub(({ type }) => {
            if (type === StellarEvents.claimableUpdate) {
                setClaims(
                    StellarService.getDelegateLocks(account.accountId()).filter(cb =>
                        cb.claimants.some(({ destination }) => destination === delegatee.account),
                    ),
                );
            }
        });
        return () => unsub();
    }, [account]);

    const selectClaim = claim => {
        if (selectedClaims.has(claim.id)) {
            selectedClaims.delete(claim.id);
        } else {
            selectedClaims.add(claim.id);
        }

        setSelectedClaims(new Set(selectedClaims));
    };

    const selectAll = () => {
        if (selectedClaims.size !== 0) {
            return setSelectedClaims(new Set());
        }
        const all = claims.reduce((acc, claim) => {
            if (new Date(claim.unlockDate) <= new Date()) {
                acc.add(claim.id);
            }
            return acc;
        }, new Set());

        setSelectedClaims(new Set(all));
    };

    const onSubmit = async (claim?: Vote) => {
        if (account.authType === LoginTypes.walletConnect) {
            openCurrentWalletIfExist();
        }
        try {
            setPending(true);

            const ops = [...selectedClaims].reduce(
                (acc, id, index) => [
                    ...acc,
                    ...StellarService.createClaimOperations(
                        id,
                        index === 1 && account.getAssetBalance(UP_ICE) === null,
                    ),
                ],
                [],
            );

            const tx = await StellarService.buildTx(account, ops);

            const processedTx = await StellarService.processIceTx(tx, UP_ICE);

            const result = await account.signAndSubmitTx(processedTx);

            if (
                (claim && claims.length === 1) ||
                (!claim && selectedClaims.size === claims.length)
            ) {
                close();
            }

            if (isMounted.current) {
                setPending(false);
                setClaims(
                    claims.filter(cb => (claim ? claim.id !== cb.id : !selectedClaims.has(cb.id))),
                );
                setSelectedClaims(new Set());
            }

            if (
                (result as { status: BuildSignAndSubmitStatuses }).status ===
                BuildSignAndSubmitStatuses.pending
            ) {
                ToastService.showSuccessToast('More signatures required to complete');
                return;
            }
            ToastService.showSuccessToast('Your delegates has been claimed back');
            StellarService.getClaimableBalances(account.accountId());
        } catch (e) {
            const errorText = ErrorHandler(e);
            ToastService.showErrorToast(errorText);
            if (isMounted.current) {
                setPending(false);
            }
        }
    };

    return (
        <ModalWrapper>
            <ModalTitle>Claim back delegated ICE</ModalTitle>
            <DelegateBlock>
                {delegatee.image ? (
                    <IconWrapper>
                        <img src={delegatee.image} alt={delegatee.name} width={32} />
                    </IconWrapper>
                ) : (
                    <IdenticonStyled pubKey={delegatee.account} />
                )}

                {delegatee.name ? (
                    <Name>{delegatee.name}</Name>
                ) : (
                    <Name>
                        {delegatee.account.slice(0, 4)}...{delegatee.account.slice(-4)}
                    </Name>
                )}
                {Boolean(delegatee.name) && (
                    <span>
                        <PublicKeyWithIcon pubKey={delegatee.account} lettersCount={4} />
                    </span>
                )}
            </DelegateBlock>
            <List>
                {!claims ? (
                    <PageLoader />
                ) : claims.length ? (
                    <>
                        {account.authType !== LoginTypes.ledger && (
                            <SelectAllMobile
                                checked={Boolean(selectedClaims.size)}
                                onChange={() => {
                                    selectAll();
                                }}
                                disabled={pending}
                                label="Select all"
                            />
                        )}
                        <Table
                            head={[
                                { children: 'Unlock time', flexSize: 1.5 },
                                { children: 'Amount' },
                                {
                                    children: (
                                        <Checkbox
                                            checked={!!selectedClaims.size}
                                            onChange={() => selectAll()}
                                            disabled={claims.every(
                                                claim => claim.unlockDate > Date.now(),
                                            )}
                                        />
                                    ),
                                    align: CellAlign.Right,
                                },
                            ]}
                            body={claims.map(claim => ({
                                key: claim.id,
                                isNarrow: true,
                                mobileBackground: COLORS.lightGray,
                                mobileFontSize: '1.4rem',
                                rowItems: [
                                    {
                                        children: getDateString(claim.unlockDate, {
                                            withTime: true,
                                        }),
                                        label: 'Unlock time',
                                        flexSize: 1.5,
                                    },
                                    {
                                        children: `${formatBalance(+claim.amount, true)} ${
                                            claim.asset.split(':')[0]
                                        }`,
                                        label: 'Amount',
                                    },
                                    {
                                        children: (
                                            <Checkbox
                                                checked={selectedClaims.has(claim.id)}
                                                onChange={() => selectClaim(claim)}
                                                disabled={claim.unlockDate > Date.now()}
                                            />
                                        ),
                                        align: CellAlign.Right,
                                        label: 'Select to claim',
                                    },
                                ],
                            }))}
                        />
                    </>
                ) : (
                    <span>All delegated ICE claimed back</span>
                )}
            </List>
            <StickyButtonWrapper>
                <Button
                    isBig
                    fullWidth
                    disabled={!selectedClaims.size}
                    pending={pending}
                    onClick={() => onSubmit()}
                >
                    claim selected
                </Button>
            </StickyButtonWrapper>
        </ModalWrapper>
    );
};

export default DelegateClaimModal;
