import * as React from 'react';
import { useState } from 'react';
import {
    ModalDescription,
    ModalProps,
    ModalTitle,
} from '../../../../common/modals/atoms/ModalAtoms';
import styled from 'styled-components';
import { flexAllCenter, flexRowSpaceBetween } from '../../../../common/mixins';
import { COLORS } from '../../../../common/styles';
import Aqua from '../../../../common/assets/img/aqua-logo-small.svg';
import useAuthStore from '../../../../common/store/authStore/useAuthStore';
import Input from '../../../../common/basics/Input';
import RangeInput from '../../../../common/basics/RangeInput';
import Button from '../../../../common/basics/Button';
import {
    ModalService,
    StellarService,
    ToastService,
} from '../../../../common/services/globalServices';
import { formatBalance, getDateString, roundToPrecision } from '../../../../common/helpers/helpers';
import ExternalLink from '../../../../common/basics/ExternalLink';
import GetAquaModal from '../../../../common/modals/GetAquaModal/GetAquaModal';
import CloseIcon from '../../../../common/assets/img/icon-close-small.svg';
import Pair from '../../common/Pair';
import { PairStats } from '../../../api/types';
import { SELECTED_PAIRS_ALIAS } from '../MainPage';
import Select, { Option } from '../../../../common/basics/Select';
import { useIsMounted } from '../../../../common/hooks/useIsMounted';
import { BuildSignAndSubmitStatuses } from '../../../../common/services/wallet-connect.service';

const ContentRow = styled.div`
    ${flexRowSpaceBetween};
    width: 52.8rem;
    margin-top: 3rem;
`;

const Label = styled.span`
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

const AmountInput = styled(Input)`
    margin-top: 1.2rem;
    margin-bottom: 3.3rem;
`;

const ClaimBack = styled.div`
    margin-top: 4.1rem;
    padding-bottom: 1.7rem;
    color: ${COLORS.grayText};
`;

const VotePeriodSelect = styled(Select)`
    margin-top: 1.2rem;
`;

const ClaimBackDate = styled.span`
    color: ${COLORS.paragraphText};
`;

const StyledButton = styled(Button)``;

const ButtonContainer = styled.div`
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
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

const AssetsInfo = styled.div`
    display: flex;
    align-items: center;
    span {
        margin-left: 0.8rem;
    }
`;

const CloseButton = styled.button`
    ${flexAllCenter};
    border: none;
    cursor: pointer;
    padding: 1.2rem;
    background-color: ${COLORS.lightGray};
    border-radius: 1rem;
`;

const StyledInput = styled(Input)`
    width: auto;
    margin: 0 1.2rem 0 auto;
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

const Scrollable = styled.div`
    overflow-y: auto;
    max-height: calc(80vh - 15rem);
    padding: 0 2rem;
    margin: 2rem 0 1rem;

    ::-webkit-scrollbar {
        width: 0.5rem;
    }

    /* Track */
    ::-webkit-scrollbar-track {
        background: ${COLORS.lightGray};
    }

    /* Handle */
    ::-webkit-scrollbar-thumb {
        background: ${COLORS.purple};
        border-radius: 0.25rem;
    }
`;

const MINIMUM_AMOUNT = 0.0000001;

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const MONTH = 30 * DAY;

const PeriodOptions: Option<number>[] = [
    { label: '1 Week', value: 7 * DAY },
    { label: '2 Weeks', value: 14 * DAY },
    { label: '3 Weeks', value: 21 * DAY },
    { label: '1 Month', value: MONTH },
    { label: '2 Month', value: 2 * MONTH },
    { label: '3 Month', value: 3 * MONTH },
    { label: '4 Month', value: 4 * MONTH },
    { label: '5 Month', value: 5 * MONTH },
    { label: '6 Month', value: 6 * MONTH },
];

const SelectedPairsForm = ({
    params,
    close,
}: ModalProps<{ pairs: PairStats[]; updatePairs: () => void }>) => {
    const { account } = useAuthStore();
    const { pairs, updatePairs } = params;

    const isMounted = useIsMounted();

    const [percent, setPercent] = useState(0);
    const [amount, setAmount] = useState('');
    const [pending, setPending] = useState(false);
    const [selectedPairs, setSelectedPairs] = useState(pairs);
    const [votePeriod, setVotePeriod] = useState(7 * DAY);
    const [pairsAmount, setPairsAmount] = useState(
        selectedPairs.reduce((acc, pair) => {
            acc[pair.market_key] = '';
            return acc;
        }, {}),
    );
    const [isHandleEdit, setIsHandleEdit] = useState(false);

    const aquaBalance = account.getAquaBalance();

    const hasTrustLine = aquaBalance !== null;
    const hasAqua = aquaBalance !== 0;

    const formattedAquaBalance = hasTrustLine && formatBalance(aquaBalance);

    const onRangeChange = (percent) => {
        setPercent(percent);

        const amountValue = (aquaBalance * percent) / 100;

        setAmount(roundToPrecision(amountValue, 7));

        setPairsAmount(
            selectedPairs.reduce((acc, pair) => {
                acc[pair.market_key] = roundToPrecision(amountValue / selectedPairs.length, 7);
                return acc;
            }, {}),
        );
    };

    const onInputChange = (value) => {
        if (Number.isNaN(Number(value))) {
            return;
        }
        setAmount(value);

        const percentValue = roundToPrecision((Number(value) / Number(aquaBalance)) * 100, 2);

        setPercent(+percentValue);

        setPairsAmount(
            selectedPairs.reduce((acc, pair) => {
                acc[pair.market_key] = roundToPrecision(value / selectedPairs.length, 7);
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

        const percentValue = roundToPrecision((Number(sum) / Number(aquaBalance)) * 100, 2);

        setPercent(+percentValue);
    };

    const deletePair = (deletedPair: PairStats) => {
        const updatedPairs = selectedPairs.filter(
            (pair) => pair.market_key !== deletedPair.market_key,
        );

        setSelectedPairs(updatedPairs);
        localStorage.setItem(SELECTED_PAIRS_ALIAS, JSON.stringify(updatedPairs));
        updatePairs();

        if (!updatedPairs.length) {
            close();
            return;
        }

        const pairsAmountCopy = { ...pairsAmount };
        delete pairsAmountCopy[deletedPair.market_key];

        if (isHandleEdit) {
            setPairsAmount(pairsAmountCopy);
            const sum = Object.values(pairsAmountCopy).reduce((acc: number, value: string) => {
                acc += Number(value);
                return acc;
            }, 0);

            setAmount(roundToPrecision(sum.toString(), 7));

            const percentValue = roundToPrecision((Number(sum) / Number(aquaBalance)) * 100, 2);

            setPercent(+percentValue);

            return;
        }

        setPairsAmount(
            updatedPairs.reduce((acc, pair) => {
                acc[pair.market_key] = roundToPrecision(Number(amount) / updatedPairs.length, 7);
                return acc;
            }, {}),
        );
    };

    const resetForm = () => {
        setAmount('');
        setPercent(0);
        setPairsAmount(
            selectedPairs.reduce((acc, pair) => {
                acc[pair.market_key] = '';
                return acc;
            }, {}),
        );
        setIsHandleEdit(false);
    };

    const onSubmit = async () => {
        if (pending) {
            return;
        }
        if (Number(amount) > Number(aquaBalance)) {
            ToastService.showErrorToast(
                `The value must be less or equal than ${formattedAquaBalance} AQUA`,
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

        try {
            setPending(true);

            const voteOps = Object.entries(pairsAmount).map(([marketKey, voteAmount]) =>
                StellarService.createVoteOperation(
                    account.accountId(),
                    marketKey,
                    voteAmount,
                    new Date(Date.now() + votePeriod).getTime(),
                ),
            );

            const tx = await StellarService.buildTx(account, voteOps);

            const result = await account.signAndSubmitTx(tx);
            if (isMounted.current) {
                setPending(false);
                close();
            }

            localStorage.setItem(SELECTED_PAIRS_ALIAS, JSON.stringify([]));

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
            console.log(e);
            ToastService.showErrorToast('Oops. Something went wrong.');
            if (isMounted.current) {
                setPending(false);
            }
        }
    };

    return (
        <>
            <Scrollable>
                <ModalTitle>Selected Pairs</ModalTitle>
                <ModalDescription>
                    Lock your AQUA in the network to complete your vote
                </ModalDescription>
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
                                    base={{ code: pair.asset1_code, issuer: pair.asset1_issuer }}
                                    counter={{
                                        code: pair.asset2_code,
                                        issuer: pair.asset2_issuer,
                                    }}
                                    withoutDomains
                                />
                            </AssetsInfo>
                            <StyledInput
                                value={pairsAmount[pair.market_key]}
                                onChange={(e) => {
                                    onPairInputChange(e.target.value, pair.market_key);
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

                <ContentRow>
                    <Label>Vote Period</Label>
                </ContentRow>

                <VotePeriodSelect
                    options={PeriodOptions}
                    value={votePeriod}
                    onChange={setVotePeriod}
                />

                {hasTrustLine && hasAqua ? (
                    <ClaimBack>
                        You can retrieve your AQUA on{' '}
                        <ClaimBackDate>
                            {getDateString(Date.now() + votePeriod, { withTime: true })}
                        </ClaimBackDate>
                    </ClaimBack>
                ) : (
                    <GetAquaBlock>
                        <GetAquaLabel>You don&apos;t have enough AQUA</GetAquaLabel>
                        <ExternalLink onClick={() => ModalService.openModal(GetAquaModal, {})}>
                            <GetAquaLink>Get AQUA</GetAquaLink>
                        </ExternalLink>
                    </GetAquaBlock>
                )}
            </Scrollable>

            <ButtonContainer>
                <StyledButton
                    fullWidth
                    onClick={() => onSubmit()}
                    disabled={!amount || !Number(amount)}
                    pending={pending}
                >
                    CONFIRM
                </StyledButton>
            </ButtonContainer>
        </>
    );
};

export default SelectedPairsForm;
