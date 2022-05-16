import * as React from 'react';
import { useEffect, useState } from 'react';
import {
    ModalDescription,
    ModalProps,
    ModalTitle,
} from '../../../../common/modals/atoms/ModalAtoms';
import styled from 'styled-components';
import { flexAllCenter, flexRowSpaceBetween, respondDown } from '../../../../common/mixins';
import { Breakpoints, COLORS } from '../../../../common/styles';
import Aqua from '../../../../common/assets/img/aqua-logo-small.svg';
import useAuthStore from '../../../../common/store/authStore/useAuthStore';
import Input from '../../../../common/basics/Input';
import RangeInput from '../../../../common/basics/RangeInput';
import Button from '../../../../common/basics/Button';
import { ModalService, ToastService } from '../../../../common/services/globalServices';
import { formatBalance, roundToPrecision } from '../../../../common/helpers/helpers';
import ExternalLink from '../../../../common/basics/ExternalLink';
import GetAquaModal from '../../../../common/modals/GetAquaModal/GetAquaModal';
import CloseIcon from '../../../../common/assets/img/icon-close-small.svg';
import Pair from '../../common/Pair';
import { PairStats } from '../../../api/types';
import { SELECTED_PAIRS_ALIAS } from '../MainPage';
import VotesDurationModal from './VotesDurationModal';

export const ContentRow = styled.div`
    ${flexRowSpaceBetween};
    width: 52.8rem;
    margin-top: 3rem;

    ${respondDown(Breakpoints.md)`
        width: 100%;
    `}
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

const InputPostfix = styled.div`
    height: min-content;
    ${flexAllCenter};
    color: ${COLORS.grayText};
    svg {
        margin-right: 0.8rem;
    }
`;

const AquaLogo = styled(Aqua)`
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
    svg {
        margin-left: 0.8rem;
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

const VotesAmountModal = ({
    params,
    close,
}: ModalProps<{
    pairs: PairStats[];
    updatePairs?: () => void;
    pairsAmounts?: {};
    isDownVoteModal?: boolean;
}>) => {
    const { account, isLogged } = useAuthStore();
    const { pairs, updatePairs, pairsAmounts, isDownVoteModal } = params;

    useEffect(() => {
        if (!isLogged) {
            close();
        }
    }, [isLogged]);

    const [percent, setPercent] = useState(0);
    const [amount, setAmount] = useState('');
    const [selectedPairs, setSelectedPairs] = useState(pairs);

    const keyType: keyof PairStats = isDownVoteModal ? 'downvote_account_id' : 'market_key';

    const [pairsAmount, setPairsAmount] = useState(
        pairsAmounts ||
            selectedPairs.reduce((acc, pair) => {
                acc[pair[keyType]] = '';
                return acc;
            }, {}),
    );
    const [isHandleEdit, setIsHandleEdit] = useState(false);

    const aquaBalance = account?.getAquaBalance();
    const nativeBalance = account?.getAvailableNativeBalance();
    const formattedNativeBalance = formatBalance(nativeBalance);

    const hasTrustLine = aquaBalance !== null;
    const hasAqua = aquaBalance !== 0;
    const formattedAquaBalance = hasTrustLine && formatBalance(aquaBalance);

    useEffect(() => {
        if (pairsAmounts) {
            const sum = Object.values(pairsAmounts).reduce((acc: number, value: string) => {
                acc += Number(value);
                return acc;
            }, 0);

            setAmount(roundToPrecision(sum.toString(), 7));

            const percentValue = roundToPrecision((Number(sum) / Number(aquaBalance)) * 100, 1);

            setPercent(+percentValue);
        }
    }, []);

    const onRangeChange = (percent) => {
        setPercent(percent);

        const amountValue = roundToPrecision((aquaBalance * percent) / 100, 7);

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

        const percentValue = roundToPrecision((Number(value) / Number(aquaBalance)) * 100, 1);

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

        const percentValue = roundToPrecision((Number(sum) / Number(aquaBalance)) * 100, 1);

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

            const percentValue = roundToPrecision((Number(sum) / Number(aquaBalance)) * 100, 1);

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

    const onSubmit = async () => {
        if (Number(amount) > Number(aquaBalance)) {
            ToastService.showErrorToast(
                `The value must be less or equal than ${formattedAquaBalance} AQUA`,
            );
            return;
        }
        if (Object.values(pairsAmount).length > Number(nativeBalance)) {
            ToastService.showErrorToast(
                `A vote for each pair requires a reserve of 1 XLM on your account. Your available balance of ${formattedNativeBalance} XLM is not enough to cover the votes for the pairs you selected.`,
                20000,
            );
            return;
        }
        if (Number(amount) < MINIMUM_AMOUNT) {
            ToastService.showErrorToast(
                `The value must be greater than ${MINIMUM_AMOUNT.toFixed(7)} AQUA`,
            );
            return;
        }

        if (
            Object.values(pairsAmount).some(
                (value) => !value || !Number(value) || value < MINIMUM_AMOUNT,
            )
        ) {
            ToastService.showErrorToast(
                `The value of each vote must be greater than ${MINIMUM_AMOUNT.toFixed(7)} AQUA`,
            );
            return;
        }

        close();
        ModalService.openModal(VotesDurationModal, {
            pairsAmounts: pairsAmount,
            pairs: selectedPairs,
            updatePairs,
            isDownVoteModal,
        });
    };

    return (
        <>
            <Scrollable scrollDisabled={isDownVoteModal}>
                <ModalTitle>{isDownVoteModal ? 'Downvote pair' : 'Selected Pairs'}</ModalTitle>
                <ModalDescription>
                    {isDownVoteModal
                        ? 'Submit AQUA against a pair if you think it has no place in the market'
                        : 'Lock your AQUA in the network to complete your vote'}
                </ModalDescription>
                {isDownVoteModal && (
                    <AssetsInfoBlock>
                        <Pair
                            verticalDirections
                            base={{
                                code: pairs[0].asset1_code,
                                issuer: pairs[0].asset1_issuer,
                            }}
                            counter={{
                                code: pairs[0].asset2_code,
                                issuer: pairs[0].asset2_issuer,
                            }}
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
                                {formattedAquaBalance} AQUA{' '}
                            </Balance>
                            available
                        </BalanceBlock>
                    ) : (
                        <BalanceBlock>You don’t have AQUA trustline</BalanceBlock>
                    )}
                </ContentRow>

                <AmountInput
                    value={amount}
                    onChange={(e) => {
                        onInputChange(e.target.value);
                    }}
                    placeholder="Enter voting power"
                    postfix={
                        <InputPostfix>
                            <AquaLogo />
                            <span>AQUA</span>
                        </InputPostfix>
                    }
                    disabled={!hasTrustLine || !hasAqua || isHandleEdit}
                />

                <RangeInput
                    onChange={onRangeChange}
                    value={percent}
                    disabled={!hasTrustLine || !hasAqua || isHandleEdit}
                />

                {!isDownVoteModal && (
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
                                        <Pair
                                            base={{
                                                code: pair.asset1_code,
                                                issuer: pair.asset1_issuer,
                                            }}
                                            counter={{
                                                code: pair.asset2_code,
                                                issuer: pair.asset2_issuer,
                                            }}
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
                                {amount || '0'} AQUA <AquaLogo />
                            </TotalAmount>
                        </TotalAmountRow>
                    </>
                )}

                {hasTrustLine && hasAqua ? null : (
                    <GetAquaBlock>
                        <GetAquaLabel>You don&apos;t have enough AQUA</GetAquaLabel>
                        <ExternalLink onClick={() => ModalService.openModal(GetAquaModal, {})}>
                            <GetAquaLink>Get AQUA</GetAquaLink>
                        </ExternalLink>
                    </GetAquaBlock>
                )}
            </Scrollable>

            <ButtonContainer>
                <Button fullWidth onClick={() => onSubmit()} disabled={!amount || !Number(amount)}>
                    NEXT
                </Button>
            </ButtonContainer>
        </>
    );
};

export default VotesAmountModal;
