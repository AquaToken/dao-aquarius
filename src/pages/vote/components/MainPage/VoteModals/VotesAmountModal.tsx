import { Asset } from '@stellar/stellar-sdk';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { processIceTx } from 'api/ice';

import { AppRoutes } from 'constants/routes';

import ErrorHandler from 'helpers/error-handler';
import { formatBalance, roundToPrecision } from 'helpers/format-number';
import { createAsset } from 'helpers/token';
import { openCurrentWalletIfExist } from 'helpers/wallet-connect-helpers';

import { useIsMounted } from 'hooks/useIsMounted';

import { LoginTypes } from 'store/authStore/types';
import useAuthStore from 'store/authStore/useAuthStore';

import { BuildSignAndSubmitStatuses } from 'services/auth/wallet-connect/wallet-connect.service';
import { StellarService, ToastService } from 'services/globalServices';

import { ModalProps } from 'types/modal';
import { Option } from 'types/option';
import { ClassicToken } from 'types/token';

import CloseIcon from 'assets/icons/nav/icon-close-alt-16.svg';
import DIce from 'assets/tokens/dice-logo.svg';
import Ice from 'assets/tokens/ice-logo.svg';

import AssetLogo from 'basics/AssetLogo';
import Button from 'basics/buttons/Button';
import Input from 'basics/inputs/Input';
import RangeInput from 'basics/inputs/RangeInput';
import Select from 'basics/inputs/Select';
import { ExternalLink } from 'basics/links';
import Market from 'basics/Market';
import { ModalDescription, ModalTitle, ModalWrapper, StickyButtonWrapper } from 'basics/ModalAtoms';

import { flexAllCenter, flexRowSpaceBetween, respondDown } from 'styles/mixins';
import { Breakpoints, COLORS } from 'styles/style-constants';

import DelegateBlock from 'pages/vote/components/MainPage/VoteModals/DelegateBlock/DelegateBlock';

import { PairStats } from '../../../api/types';
import { DELEGATE_ICE, DOWN_ICE, SELECTED_PAIRS_ALIAS, UP_ICE } from '../MainPage';

export const ContentRow = styled.div`
    ${flexRowSpaceBetween};
    width: 100%;
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
    color: ${COLORS.textTertiary};
    ${flexAllCenter};
`;

const BalanceBlock = styled.span`
    font-size: 1.4rem;
    line-height: 1.6rem;
    color: ${COLORS.textGray};
`;

const Balance = styled.span`
    color: ${COLORS.purple400};
    cursor: pointer;
`;

const IceLogo = styled(Ice)`
    height: 3.2rem;
    width: 3.2rem;
`;

const DIceLogo = styled(DIce)`
    height: 3.2rem;
    width: 3.2rem;
`;

const AssetsInfoBlock = styled.div`
    ${flexAllCenter};
    padding: 3.5rem 0;
    background-color: ${COLORS.gray50};
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

const GetAquaBlock = styled.div`
    ${flexRowSpaceBetween};
    height: 6.8rem;
    border-radius: 1rem;
    background: ${COLORS.gray50};
    padding: 0 3.2rem;
    margin-top: 4.1rem;
`;

const GetAquaLabel = styled.span`
    color: ${COLORS.textGray};
`;

const PairsList = styled.div`
    padding-top: 1.6rem;
`;

const PairBlock = styled.div`
    padding: 0.4rem 0;
    margin-bottom: 0.8rem;
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.textTertiary};
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
        white-space: pre;
    }
    grid-area: Pair;
`;

const CloseButton = styled.button`
    ${flexAllCenter};
    border: none;
    cursor: pointer;
    height: 4rem;
    width: 4rem;
    background-color: ${COLORS.gray50};
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
    color: ${COLORS.textTertiary};
    display: flex;
    align-items: center;
    justify-content: space-between;
    ${Label} {
        color: ${COLORS.textGray};
    }
`;

const TotalAmount = styled.div`
    display: flex;
    align-items: center;
    word-break: break-word;
    width: 48rem;
    justify-content: flex-end;

    svg,
    img {
        margin-left: 0.8rem;
        min-width: 3.2rem;
    }
`;

const ResetValues = styled.div`
    color: ${COLORS.purple400};
    cursor: pointer;
`;

const MINIMUM_ICE_AMOUNT = 10;

const VotesAmountModal = ({
    params,
    close,
}: ModalProps<{
    pairs: PairStats[];
    updatePairs?: () => void;
    pairsAmounts?: Record<string, string>;
    isDownVoteModal?: boolean;
    isSingleVoteForModal?: boolean;
    asset: ClassicToken;
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
    const [targetAsset, setTargetAsset] = useState(asset ?? (isDownVoteModal ? DOWN_ICE : UP_ICE));
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
        const ICE_OPTION = {
            label: 'ICE',
            value: isDownVoteModal ? DOWN_ICE : UP_ICE,
            icon: <IceLogo />,
        };
        const D_ICE_OPTION = {
            label: 'dICE',
            value: DELEGATE_ICE,
            icon: <DIceLogo />,
        };

        if (!isDownVoteModal && account && account.getAssetBalance(DELEGATE_ICE) !== null) {
            return [ICE_OPTION, D_ICE_OPTION];
        }

        return [ICE_OPTION];
    }, [isDownVoteModal, account]);

    const targetBalance = useMemo(() => account?.getAssetBalance(targetAsset), [targetAsset]);

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

    useEffect(
        () => () => {
            resetForm();
        },
        [targetAsset],
    );

    const onRangeChange = percent => {
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

    const onInputChange = value => {
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
        const updatedPairs = selectedPairs.filter(pair => pair[keyType] !== deletedPair[keyType]);

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

    const confirmVotes = async () => {
        try {
            setPending(true);

            const voteOps = Object.entries(pairsAmount).map(([marketKey, voteAmount]) =>
                StellarService.op.createVoteOperation(
                    account.accountId(),
                    marketKey,
                    voteAmount as string,
                    new Date(Date.now() + 1.2 * 60 * 60 * 1000).getTime(),
                    targetAsset,
                ),
            );

            const tx = await StellarService.tx.buildTx(account, voteOps);

            const processedTx = await processIceTx(tx, targetAsset);

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
            StellarService.cb.getClaimableBalances(account.accountId());
        } catch (e) {
            const errorText = ErrorHandler(e);
            ToastService.showErrorToast(errorText);
            if (isMounted.current) {
                setPending(false);
            }
        }
    };

    const onSubmit = () => {
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
        if (Number(amount) < MINIMUM_ICE_AMOUNT) {
            ToastService.showErrorToast(
                `The value must be greater than ${MINIMUM_ICE_AMOUNT} ${targetAsset.code}`,
            );
            return;
        }

        if (
            Object.values(pairsAmount).some(
                value => !value || !Number(value) || +value < MINIMUM_ICE_AMOUNT,
            )
        ) {
            ToastService.showErrorToast(
                `The value of each vote must be greater than ${MINIMUM_ICE_AMOUNT} ${targetAsset.code}`,
            );
            return;
        }

        if (account.authType === LoginTypes.walletConnect) {
            openCurrentWalletIfExist();
        }

        confirmVotes();
    };

    return (
        <ModalWrapper $width="60rem">
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
                    : `Vote with ${targetAsset.code} to support markets and increase their AQUA rewards`}
            </ModalDescription>
            {(isDownVoteModal || isSingleVoteForModal) && (
                <AssetsInfoBlock>
                    <Market
                        verticalDirections
                        assets={[
                            createAsset(pairs[0].asset1_code, pairs[0].asset1_issuer),
                            createAsset(pairs[0].asset2_code, pairs[0].asset2_issuer),
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
                    onChange={e => {
                        onInputChange(e.target.value);
                    }}
                    placeholder="Enter voting power"
                    disabled={!hasTrustLine || !hasTargetBalance || isHandleEdit}
                    inputMode="decimal"
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
                        {selectedPairs.map(pair => (
                            <PairBlock key={pair.market_key}>
                                <AssetsInfo>
                                    <Market
                                        assets={[
                                            createAsset(pair.asset1_code, pair.asset1_issuer),
                                            createAsset(pair.asset2_code, pair.asset2_issuer),
                                        ]}
                                        withoutDomains
                                    />
                                </AssetsInfo>
                                <StyledInput
                                    value={pairsAmount[pair[keyType]]}
                                    onChange={e => {
                                        onPairInputChange(e.target.value, pair[keyType]);
                                    }}
                                    onFocus={() => {
                                        setIsHandleEdit(true);
                                    }}
                                    isMedium
                                    isRightAligned
                                    inputMode="decimal"
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
                            {amount ? formatBalance(+amount) : '0'} {targetAsset.code}{' '}
                            <AssetLogo asset={targetAsset} isCircle={false} />
                        </TotalAmount>
                    </TotalAmountRow>
                </>
            )}

            {hasTrustLine && hasTargetBalance ? null : (
                <GetAquaBlock>
                    <GetAquaLabel>You don&apos;t have enough {targetAsset.code}</GetAquaLabel>

                    <ExternalLink asDiv>
                        <Link to={AppRoutes.section.locker.link.index} onClick={() => close()}>
                            Get ICE
                        </Link>
                    </ExternalLink>
                </GetAquaBlock>
            )}

            {targetAsset.code === UP_ICE.code && <DelegateBlock />}

            <StickyButtonWrapper>
                <Button
                    fullWidth
                    onClick={() => onSubmit()}
                    disabled={!amount || !Number(amount)}
                    pending={pending}
                >
                    confirm
                </Button>
            </StickyButtonWrapper>
        </ModalWrapper>
    );
};

export default VotesAmountModal;
