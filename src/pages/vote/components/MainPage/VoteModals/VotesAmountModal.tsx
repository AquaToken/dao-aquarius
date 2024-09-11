import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import {
    ModalDescription,
    ModalProps,
    ModalTitle,
} from '../../../../../common/modals/atoms/ModalAtoms';
import styled from 'styled-components';
import { flexAllCenter, flexRowSpaceBetween, respondDown } from '../../../../../common/mixins';
import { Breakpoints, COLORS } from '../../../../../common/styles';
import Aqua from '../../../../../common/assets/img/aqua-logo-small.svg';
import Ice from '../../../../../common/assets/img/ice-logo.svg';
import useAuthStore from '../../../../../store/authStore/useAuthStore';
import Input from '../../../../../common/basics/Input';
import RangeInput from '../../../../../common/basics/RangeInput';
import Button from '../../../../../common/basics/Button';
import {
    ModalService,
    StellarService,
    ToastService,
} from '../../../../../common/services/globalServices';
import { formatBalance, roundToPrecision } from '../../../../../common/helpers/helpers';
import ExternalLink from '../../../../../common/basics/ExternalLink';
import GetAquaModal from '../../../../../common/modals/GetAquaModal/GetAquaModal';
import CloseIcon from '../../../../../common/assets/img/icon-close-small.svg';
import Market from '../../common/Market';
import { PairStats } from '../../../api/types';
import { AQUA, DOWN_ICE, SELECTED_PAIRS_ALIAS, UP_ICE } from '../MainPage';
import VotesDurationModal from './VotesDurationModal';
import Select, { Option } from '../../../../../common/basics/Select';
import { Asset } from '@stellar/stellar-sdk';
import { LoginTypes } from '../../../../../store/authStore/types';
import { BuildSignAndSubmitStatuses } from '../../../../../common/services/wallet-connect.service';
import ErrorHandler from '../../../../../common/helpers/error-handler';
import { useIsMounted } from '../../../../../common/hooks/useIsMounted';
import { Link } from 'react-router-dom';
import { LockerRoutes } from '../../../../../routes';
import { openCurrentWalletIfExist } from '../../../../../common/helpers/wallet-connect-helpers';

export const ContentRow = styled.div`
    ${flexRowSpaceBetween};
    width: 52.8rem;
    margin-top: 3rem;

    ${respondDown(Breakpoints.md)`
        width: 100%;
    `}
`;

const AmountRow = styled.div`
    display: flex;
`;

export const Label = styled.span`
    font-size: 1.6rem;
    line-height: 1.8rem;
    color: ${COLORS.paragraphText};
    ${flexAllCenter};
`;

const BalanceBlock = styled.span`
    font-size: 1.4rem;
    line-height: 1.6rem;
    color: ${COLORS.grayText};
`;

const Balance = styled.span`
    color: ${COLORS.tooltip};
    cursor: pointer;
`;

const AquaLogo = styled(Aqua)`
    height: 3.2rem;
    width: 3.2rem;
`;

const IceLogo = styled(Ice)`
    height: 3.2rem;
    width: 3.2rem;
`;

const AssetsInfoBlock = styled.div`
    ${flexAllCenter};
    padding: 3.5rem 0;
    background-color: ${COLORS.lightGray};
    border-radius: 0.5rem;
`;

const AmountInput = styled(Input)`
    margin-top: 1.2rem;
    margin-bottom: 3.3rem;
    flex: 2;

    ${respondDown(Breakpoints.md)`
        input {
            padding-right: 0;
        }
    `}
`;

const AssetSelect = styled(Select)`
    margin-top: 1.2rem;
    margin-bottom: 3.3rem;
    flex: 1;

    ${respondDown(Breakpoints.md)`
        flex: 1.6;
    `}
`;

const ButtonContainer = styled.div`
    margin-top: 2.5rem;
    padding-top: 3.2rem;
    border-top: 0.1rem dashed ${COLORS.gray};
`;

const GetAquaBlock = styled.div`
    ${flexRowSpaceBetween};
    height: 6.8rem;
    border-radius: 1rem;
    background: ${COLORS.lightGray};
    padding: 0 3.2rem;
    margin-top: 4.1rem;
`;

const GetAquaLabel = styled.span`
    color: ${COLORS.grayText};
`;

const GetAquaLink = styled.div`
    font-size: 1.4rem;
`;
const PairsList = styled.div`
    padding-top: 1.6rem;
`;
const PairBlock = styled.div`
    padding: 0.4rem 0;
    margin-bottom: 0.8rem;
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.paragraphText};
    display: grid;
    grid-template-areas: 'Pair Input Close';
    grid-template-columns: 1fr 1fr 0.1fr;

    ${respondDown(Breakpoints.md)`
         grid-template-areas: 'Pair Close' 'Input Input';
         grid-row-gap: 1.6rem;
         grid-template-columns: 1fr 0.1fr;
    `}
`;

const AssetsInfo = styled.div`
    display: flex;
    align-items: center;
    span {
        margin-left: 0.8rem;
    }
    grid-area: Pair;
`;

const CloseButton = styled.button`
    ${flexAllCenter};
    border: none;
    cursor: pointer;
    height: 4rem;
    width: 4rem;
    background-color: ${COLORS.lightGray};
    border-radius: 1rem;
    grid-area: Close;
    justify-self: end;
`;

const StyledInput = styled(Input)`
    width: auto;
    margin: 0 1.2rem 0 auto;
    grid-area: Input;
    justify-self: end;

    ${respondDown(Breakpoints.md)`
          width: 100%;
          margin: 0;
    `}
`;

const TotalAmountRow = styled.div`
    padding: 0.8rem 0;
    margin-top: 0.8rem;
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.paragraphText};
    display: flex;
    align-items: center;
    justify-content: space-between;
    ${Label} {
        color: ${COLORS.grayText};
    }
`;

const TotalAmount = styled.div`
    display: flex;
    align-items: center;
    word-break: break-word;
    width: 48rem;
    justify-content: flex-end;

    svg {
        margin-left: 0.8rem;
        min-width: 3.2rem;
    }
`;

const ResetValues = styled.div`
    color: ${COLORS.tooltip};
    cursor: pointer;
`;

const Scrollable = styled.div<{ scrollDisabled: boolean }>`
    overflow-y: ${({ scrollDisabled }) => (scrollDisabled ? 'unset' : 'scroll')};
    padding: 0 1rem;
    max-height: calc(100vh - 20rem);
    min-height: 47rem;

    ${respondDown(Breakpoints.md)`
        max-height: calc(100vh - 16rem);
    `};

    &::-webkit-scrollbar {
        width: 0.5rem;
    }

    /* Track */
    &::-webkit-scrollbar-track {
        background: ${COLORS.white};
    }

    /* Handle */
    &::-webkit-scrollbar-thumb {
        background: ${COLORS.purple};
        border-radius: 0.25rem;
    }
`;

const MINIMUM_AMOUNT = 0.0000001;
const MINIMUM_ICE_AMOUNT = 10;

const VotesAmountModal = ({
    params,
    close,
}: ModalProps<{
    pairs: PairStats[];
    updatePairs?: () => void;
    pairsAmounts?: {};
    isDownVoteModal?: boolean;
    isSingleVoteForModal?: boolean;
    asset: Asset;
}>) => {
    const { account, isLogged } = useAuthStore();
    const { pairs, updatePairs, pairsAmounts, isDownVoteModal, asset, isSingleVoteForModal } =
        params;

    useEffect(() => {
        if (!isLogged) {
            close();
        }
    }, [isLogged]);

    const [percent, setPercent] = useState(0);
    const [amount, setAmount] = useState('');
    const [targetAsset, setTargetAsset] = useState(asset ?? AQUA);
    const [selectedPairs, setSelectedPairs] = useState(pairs);
    const [pending, setPending] = useState(false);

    const isMounted = useIsMounted();

    const keyType: keyof PairStats = isDownVoteModal ? 'downvote_account_id' : 'market_key';

    const [pairsAmount, setPairsAmount] = useState(
        pairsAmounts ||
            selectedPairs.reduce((acc, pair) => {
                acc[pair[keyType]] = '';
                return acc;
            }, {}),
    );
    const [isHandleEdit, setIsHandleEdit] = useState(false);

    const OPTIONS: Option<Asset>[] = useMemo(() => {
        return [
            { label: 'AQUA', value: AQUA, icon: <AquaLogo /> },
            { label: 'ICE', value: isDownVoteModal ? DOWN_ICE : UP_ICE, icon: <IceLogo /> },
        ];
    }, [isDownVoteModal]);

    const targetBalance = useMemo(() => {
        return account?.getAssetBalance(targetAsset);
    }, [targetAsset]);

    const nativeBalance = account?.getAvailableNativeBalance();
    const formattedNativeBalance = formatBalance(nativeBalance);

    const hasTrustLine = targetBalance !== null;
    const hasTargetBalance = targetBalance !== 0;
    const formattedTargetBalance = hasTrustLine && formatBalance(targetBalance);

    useEffect(() => {
        if (pairsAmounts) {
            const sum = Object.values(pairsAmounts).reduce((acc: number, value: string) => {
                acc += Number(value);
                return acc;
            }, 0);

            setAmount(roundToPrecision(sum.toString(), 7));

            const percentValue = roundToPrecision((Number(sum) / Number(targetBalance)) * 100, 1);

            setPercent(+percentValue);
        }
    }, []);

    useEffect(() => {
        return () => {
            resetForm();
        };
    }, [targetAsset]);

    const onRangeChange = (percent) => {
        setPercent(percent);

        const amountValue = roundToPrecision((targetBalance * percent) / 100, 7);

        setAmount(amountValue);

        setPairsAmount(
            selectedPairs.reduce((acc, pair) => {
                acc[pair[keyType]] = roundToPrecision(
                    Number(amountValue) / selectedPairs.length,
                    7,
                );
                return acc;
            }, {}),
        );
    };

    const onInputChange = (value) => {
        if (Number.isNaN(Number(value))) {
            return;
        }
        setAmount(value);

        const percentValue = roundToPrecision((Number(value) / Number(targetBalance)) * 100, 1);

        setPercent(+percentValue);

        setPairsAmount(
            selectedPairs.reduce((acc, pair) => {
                acc[pair[keyType]] = roundToPrecision(value / selectedPairs.length, 7);
                return acc;
            }, {}),
        );
    };

    const onPairInputChange = (value, marketKey) => {
        if (Number.isNaN(Number(value))) {
            return;
        }

        const newValue = {
            ...pairsAmount,
            ...{ [marketKey]: value },
        };
        setPairsAmount(newValue);

        const sum = Object.values(newValue).reduce((acc: number, value: string) => {
            acc += Number(value);
            return acc;
        }, 0);

        setAmount(roundToPrecision(sum.toString(), 7));

        const percentValue = roundToPrecision((Number(sum) / Number(targetBalance)) * 100, 1);

        setPercent(+percentValue);
    };

    const deletePair = (deletedPair: PairStats) => {
        const updatedPairs = selectedPairs.filter((pair) => pair[keyType] !== deletedPair[keyType]);

        setSelectedPairs(updatedPairs);
        localStorage.setItem(SELECTED_PAIRS_ALIAS, JSON.stringify(updatedPairs));
        updatePairs();

        if (!updatedPairs.length) {
            close();
            return;
        }

        const pairsAmountCopy = { ...pairsAmount };
        delete pairsAmountCopy[deletedPair[keyType]];

        if (isHandleEdit) {
            setPairsAmount(pairsAmountCopy);
            const sum = Object.values(pairsAmountCopy).reduce((acc: number, value: string) => {
                acc += Number(value);
                return acc;
            }, 0);

            setAmount(roundToPrecision(sum.toString(), 7));

            const percentValue = roundToPrecision((Number(sum) / Number(targetBalance)) * 100, 1);

            setPercent(+percentValue);

            return;
        }

        setPairsAmount(
            updatedPairs.reduce((acc, pair) => {
                acc[pair[keyType]] = roundToPrecision(Number(amount) / updatedPairs.length, 7);
                return acc;
            }, {}),
        );
    };

    const resetForm = () => {
        setAmount('');
        setPercent(0);
        setPairsAmount(
            selectedPairs.reduce((acc, pair) => {
                acc[pair[keyType]] = '';
                return acc;
            }, {}),
        );
        setIsHandleEdit(false);
    };

    const confirmVotes = async () => {
        try {
            setPending(true);

            const voteOps = Object.entries(pairsAmount).map(([marketKey, voteAmount]) =>
                StellarService.createVoteOperation(
                    account.accountId(),
                    marketKey,
                    voteAmount,
                    new Date(Date.now() + 1.2 * 60 * 60 * 1000).getTime(),
                    targetAsset,
                ),
            );

            const tx = await StellarService.buildTx(account, voteOps);

            const processedTx = await StellarService.processIceTx(tx, targetAsset);

            const result = await account.signAndSubmitTx(processedTx);

            if (isMounted.current) {
                setPending(false);
                close();
            }

            localStorage.setItem(SELECTED_PAIRS_ALIAS, JSON.stringify([]));
            updatePairs();

            if (
                (result as { status: BuildSignAndSubmitStatuses }).status ===
                BuildSignAndSubmitStatuses.pending
            ) {
                ToastService.showSuccessToast('More signatures required to complete');
                return;
            }
            ToastService.showSuccessToast(
                'Your vote has been cast! You will be able to see your vote in the list within 10 minutes',
            );
            StellarService.getClaimableBalances(account.accountId());
        } catch (e) {
            const errorText = ErrorHandler(e);
            ToastService.showErrorToast(errorText);
            if (isMounted.current) {
                setPending(false);
            }
        }
    };

    const onSubmit = async () => {
        if (Number(amount) > Number(targetBalance)) {
            ToastService.showErrorToast(
                `The value must be less or equal than ${formattedTargetBalance} ${targetAsset.code}`,
            );
            return;
        }
        if (Object.values(pairsAmount).length > Number(nativeBalance)) {
            ToastService.showErrorToast(
                `A vote for each market requires a reserve of 1 XLM on your account. Your available balance of ${formattedNativeBalance} XLM is not enough to cover the votes for the markets you selected.`,
                20000,
            );
            return;
        }
        if (Number(amount) < MINIMUM_AMOUNT) {
            ToastService.showErrorToast(
                `The value must be greater than ${MINIMUM_AMOUNT.toFixed(7)} ${targetAsset.code}`,
            );
            return;
        }

        if (
            Object.values(pairsAmount).some(
                (value) =>
                    !value ||
                    !Number(value) ||
                    value < MINIMUM_AMOUNT ||
                    (targetAsset !== AQUA && value < MINIMUM_ICE_AMOUNT),
            )
        ) {
            ToastService.showErrorToast(
                `The value of each vote must be greater than ${
                    targetAsset !== AQUA ? MINIMUM_ICE_AMOUNT : MINIMUM_AMOUNT.toFixed(7)
                } ${targetAsset.code}`,
            );
            return;
        }

        if (targetAsset !== AQUA && account.authType === LoginTypes.walletConnect) {
            openCurrentWalletIfExist();
        }

        if (targetAsset !== AQUA) {
            confirmVotes();
            return;
        }

        close();
        ModalService.openModal(VotesDurationModal, {
            pairsAmounts: pairsAmount,
            pairs: selectedPairs,
            updatePairs,
            isDownVoteModal,
            asset: targetAsset,
        });
    };

    return (
        <>
            <Scrollable scrollDisabled={isDownVoteModal || isSingleVoteForModal}>
                <ModalTitle>
                    {isDownVoteModal
                        ? 'Downvote market'
                        : isSingleVoteForModal
                        ? 'Upvote market'
                        : 'Selected Markets'}
                </ModalTitle>
                <ModalDescription>
                    {isDownVoteModal
                        ? `Submit ${targetAsset.code} against a market if you think it has no place in the reward zone`
                        : `Lock your ${targetAsset.code} in the network to complete your vote`}
                </ModalDescription>
                {(isDownVoteModal || isSingleVoteForModal) && (
                    <AssetsInfoBlock>
                        <Market
                            verticalDirections
                            assets={[
                                {
                                    code: pairs[0].asset1_code,
                                    issuer: pairs[0].asset1_issuer,
                                },
                                {
                                    code: pairs[0].asset2_code,
                                    issuer: pairs[0].asset2_issuer,
                                },
                            ]}
                        />
                    </AssetsInfoBlock>
                )}

                <ContentRow>
                    <Label>Amount</Label>

                    {hasTrustLine ? (
                        <BalanceBlock>
                            <Balance
                                onClick={() => {
                                    if (!isHandleEdit) {
                                        onRangeChange(100);
                                    }
                                }}
                            >
                                {formattedTargetBalance} {targetAsset.code}{' '}
                            </Balance>
                            available
                        </BalanceBlock>
                    ) : (
                        <BalanceBlock>You don’t have {targetAsset.code} trustline</BalanceBlock>
                    )}
                </ContentRow>

                <AmountRow>
                    <AmountInput
                        value={amount}
                        onChange={(e) => {
                            onInputChange(e.target.value);
                        }}
                        placeholder="Enter voting power"
                        disabled={!hasTrustLine || !hasTargetBalance || isHandleEdit}
                    />

                    <AssetSelect options={OPTIONS} value={targetAsset} onChange={setTargetAsset} />
                </AmountRow>

                <RangeInput
                    onChange={onRangeChange}
                    value={percent}
                    disabled={!hasTrustLine || !hasTargetBalance || isHandleEdit}
                />

                {!isDownVoteModal && !isSingleVoteForModal && (
                    <>
                        <ContentRow>
                            <Label>Pairs ({selectedPairs.length})</Label>
                            {isHandleEdit && (
                                <ResetValues
                                    onClick={() => {
                                        resetForm();
                                    }}
                                >
                                    Reset values
                                </ResetValues>
                            )}
                        </ContentRow>
                        <PairsList>
                            {selectedPairs.map((pair) => (
                                <PairBlock key={pair.market_key}>
                                    <AssetsInfo>
                                        <Market
                                            assets={[
                                                {
                                                    code: pair.asset1_code,
                                                    issuer: pair.asset1_issuer,
                                                },
                                                {
                                                    code: pair.asset2_code,
                                                    issuer: pair.asset2_issuer,
                                                },
                                            ]}
                                            withoutDomains
                                        />
                                    </AssetsInfo>
                                    <StyledInput
                                        value={pairsAmount[pair[keyType]]}
                                        onChange={(e) => {
                                            onPairInputChange(e.target.value, pair[keyType]);
                                        }}
                                        onFocus={() => {
                                            setIsHandleEdit(true);
                                        }}
                                        isMedium
                                        isRightAligned
                                    />
                                    <CloseButton
                                        onClick={() => {
                                            deletePair(pair);
                                        }}
                                    >
                                        <CloseIcon />
                                    </CloseButton>
                                </PairBlock>
                            ))}
                        </PairsList>
                        <TotalAmountRow>
                            <Label>Total:</Label>
                            <TotalAmount>
                                {amount || '0'} {targetAsset.code}{' '}
                                {targetAsset === AQUA ? <AquaLogo /> : <IceLogo />}
                            </TotalAmount>
                        </TotalAmountRow>
                    </>
                )}

                {hasTrustLine && hasTargetBalance ? null : (
                    <GetAquaBlock>
                        <GetAquaLabel>You don&apos;t have enough {targetAsset.code}</GetAquaLabel>
                        {targetAsset === AQUA ? (
                            <ExternalLink onClick={() => ModalService.openModal(GetAquaModal, {})}>
                                <GetAquaLink>Get {targetAsset.code}</GetAquaLink>
                            </ExternalLink>
                        ) : (
                            <ExternalLink asDiv>
                                <Link to={LockerRoutes.main}>Get ICE</Link>
                            </ExternalLink>
                        )}
                    </GetAquaBlock>
                )}
            </Scrollable>

            <ButtonContainer>
                <Button
                    fullWidth
                    onClick={() => onSubmit()}
                    disabled={!amount || !Number(amount)}
                    pending={pending}
                >
                    {targetAsset === AQUA ? 'NEXT' : 'confirm'}
                </Button>
            </ButtonContainer>
        </>
    );
};

export default VotesAmountModal;
