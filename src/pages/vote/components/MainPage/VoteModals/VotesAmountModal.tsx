import { Asset } from '@stellar/stellar-sdk';
import { useEffect, useMemo, useState } from 'react';
import * as React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { LockerRoutes } from 'constants/routes';

import { getAquaAssetData } from 'helpers/assets';
import ErrorHandler from 'helpers/error-handler';
import { formatBalance, roundToPrecision } from 'helpers/format-number';
import { openCurrentWalletIfExist } from 'helpers/wallet-connect-helpers';

import { useIsMounted } from 'hooks/useIsMounted';

import { LoginTypes } from 'store/authStore/types';
import useAuthStore from 'store/authStore/useAuthStore';

import { ModalService, StellarService, ToastService } from 'services/globalServices';
import { BuildSignAndSubmitStatuses } from 'services/wallet-connect.service';

import { ModalProps } from 'types/modal';

import { flexAllCenter, flexRowSpaceBetween, respondDown } from 'web/mixins';
import GetAquaModal from 'web/modals/GetAquaModal';
import { Breakpoints, COLORS } from 'web/styles';

import Aqua from 'assets/aqua-logo-small.svg';
import DIce from 'assets/dice-logo.svg';
import Ice from 'assets/ice-logo.svg';
import CloseIcon from 'assets/icon-close-small.svg';

import Alert from 'basics/Alert';
import AssetLogo from 'basics/AssetLogo';
import Button from 'basics/buttons/Button';
import ExternalLink from 'basics/ExternalLink';
import Input from 'basics/inputs/Input';
import RangeInput from 'basics/inputs/RangeInput';
import Select, { Option } from 'basics/inputs/Select';
import Market from 'basics/Market';
import { ModalDescription, ModalTitle, ModalWrapper } from 'basics/ModalAtoms';

import DelegateBlock from 'pages/vote/components/MainPage/VoteModals/DelegateBlock/DelegateBlock';

import VotesDurationModal from './VotesDurationModal';

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

const DIceLogo = styled(DIce)`
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

    svg,
    img {
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
    max-height: 15rem;

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
    pairsAmounts?: { [key: string]: string };
    isDownVoteModal?: boolean;
    isSingleVoteForModal?: boolean;
    asset: Asset;
}>) => {
    const { account, isLogged } = useAuthStore();
    const { pairs, updatePairs, pairsAmounts, isDownVoteModal, asset, isSingleVoteForModal } =
        params;
    const { aquaStellarAsset } = getAquaAssetData();

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
        const AQUA_OPTION = { label: 'AQUA', value: aquaStellarAsset, icon: <AquaLogo /> };
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
            return [ICE_OPTION, D_ICE_OPTION, AQUA_OPTION];
        }

        return [ICE_OPTION, AQUA_OPTION];
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
        if (Number(amount) < MINIMUM_AMOUNT) {
            ToastService.showErrorToast(
                `The value must be greater than ${MINIMUM_AMOUNT.toFixed(7)} ${targetAsset.code}`,
            );
            return;
        }

        if (
            Object.values(pairsAmount).some(
                value =>
                    !value ||
                    !Number(value) ||
                    +value < MINIMUM_AMOUNT ||
                    (targetAsset.code !== aquaStellarAsset.code && +value < MINIMUM_ICE_AMOUNT),
            )
        ) {
            ToastService.showErrorToast(
                `The value of each vote must be greater than ${
                    targetAsset !== aquaStellarAsset
                        ? MINIMUM_ICE_AMOUNT
                        : MINIMUM_AMOUNT.toFixed(7)
                } ${targetAsset.code}`,
            );
            return;
        }

        if (
            targetAsset.code !== aquaStellarAsset.code &&
            account.authType === LoginTypes.walletConnect
        ) {
            openCurrentWalletIfExist();
        }

        if (targetAsset.code !== aquaStellarAsset.code) {
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

            {targetAsset.code === aquaStellarAsset.code && (
                <Alert text="ICE has more voting power than AQUA and ICE votes can be withdrawn from the market at any time" />
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
                    <Scrollable scrollDisabled={isDownVoteModal || isSingleVoteForModal}>
                        <PairsList>
                            {selectedPairs.map(pair => (
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
                    </Scrollable>
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
                    {targetAsset.code === aquaStellarAsset.code ? (
                        <ExternalLink onClick={() => ModalService.openModal(GetAquaModal, {})}>
                            <GetAquaLink>Get {targetAsset.code}</GetAquaLink>
                        </ExternalLink>
                    ) : (
                        <ExternalLink asDiv>
                            <Link to={LockerRoutes.main} onClick={() => close()}>
                                Get ICE
                            </Link>
                        </ExternalLink>
                    )}
                </GetAquaBlock>
            )}

            {targetAsset.code === UP_ICE.code && <DelegateBlock />}

            <ButtonContainer>
                <Button
                    fullWidth
                    onClick={() => onSubmit()}
                    disabled={!amount || !Number(amount)}
                    pending={pending}
                >
                    {targetAsset.code === aquaStellarAsset.code ? 'NEXT' : 'confirm'}
                </Button>
            </ButtonContainer>
        </ModalWrapper>
    );
};

export default VotesAmountModal;
