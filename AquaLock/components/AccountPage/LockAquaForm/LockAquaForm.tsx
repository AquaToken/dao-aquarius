import * as React from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { COLORS, FONT_FAMILY } from '../../../../common/styles';
import { flexAllCenter, flexRowSpaceBetween } from '../../../../common/mixins';
import AccountService from '../../../../common/services/account.service';
import Input from '../../../../common/basics/Input';
import Aqua from '../../../../common/assets/img/aqua-logo-small.svg';
import RangeInput from '../../../../common/basics/RangeInput';
import { formatBalance, getDateString, roundToPrecision } from '../../../../common/helpers/helpers';
// import Info from '../../../../common/assets/img/icon-info.svg';
// import CloseIcon from '../../../../common/assets/img/icon-close-small.svg';
import ArrowRight from '../../../../common/assets/img/icon-arrow-right-white.svg';
import { useMemo, useState } from 'react';
import Button from '../../../../common/basics/Button';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
    START_AIRDROP2_TIMESTAMP,
    yXLM_CODE,
    yXLM_ISSUER,
} from '../../../../common/services/stellar.service';
import { ModalService, StellarService } from '../../../../common/services/globalServices';
import useAuthStore from '../../../../common/store/authStore/useAuthStore';
import ChooseLoginMethodModal from '../../../../common/modals/ChooseLoginMethodModal';
import LockAquaModal from '../LockAquaModal/LockAquaModal';
import { MAX_TIME_LOCK } from '../AccountPage';

const Container = styled.div`
    background: ${COLORS.white};
    padding: 4.8rem;
    box-shadow: 0 2rem 3rem rgba(0, 6, 54, 0.06);
    border-radius: 1rem;
    display: flex;
    flex-direction: column;
    //position: sticky;
    //top: 1rem;
`;

const Title = styled.span`
    font-size: 3.6rem;
    line-height: 4.2rem;
    color: ${COLORS.titleText};
    margin-bottom: 0.8rem;
`;

const Description = styled.span`
    font-size: 1.4rem;
    line-height: 2rem;
    color: ${COLORS.descriptionText};
    opacity: 0.7;
`;

const ContentRow = styled.div`
    margin-top: 3.2rem;
    ${flexRowSpaceBetween};
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
`;

const AquaLogo = styled(Aqua)`
    margin-right: 0.8rem;
    height: 3.2rem;
    width: 3.2rem;
`;

const StyledInput = styled(Input)`
    margin-top: 1.2rem;
    margin-bottom: 3.3rem;
`;

const ClaimBack = styled.div`
    margin-top: 1.7rem;
    padding-bottom: 3.2rem;
    color: ${COLORS.grayText};
    border-bottom: 0.1rem dashed ${COLORS.gray};
`;

const ClaimBackDate = styled.span`
    color: ${COLORS.paragraphText};
`;

// const PriceBlock = styled.div`
//     padding: 3.6rem 0 3.2rem;
//     border-bottom: 0.1rem dashed ${COLORS.gray};
// `;
//
// const PriceRow = styled.div`
//     ${flexRowSpaceBetween};
// `;
//
// const Price = styled.span`
//     color: ${COLORS.grayText};
//     font-size: 1.4rem;
//     line-height: 2rem;
// `;
//
// const EmulateButton = styled.div`
//     color: ${COLORS.purple};
//     font-size: 1.4rem;
//     line-height: 2rem;
//     border-bottom: 0.1rem dashed ${COLORS.purple};
//     margin-left: auto;
//     cursor: pointer;
// `;
//
// const InfoIcon = styled(Info)`
//     margin-left: 0.4rem;
// `;
//
// const PriceForm = styled.div`
//     display: flex;
//     flex-direction: column;
// `;
//
// const PriceFormHeader = styled.div`
//     ${flexRowSpaceBetween};
//     margin-bottom: 2rem;
// `;
//
// const PriceFormTitle = styled.span`
//     font-size: 1.6rem;
//     line-height: 1.8rem;
//     color: ${COLORS.paragraphText};
// `;
//
// const Close = styled.div`
//     font-size: 1.4rem;
//     line-height: 2rem;
//     color: ${COLORS.descriptionText};
//     opacity: 0.7;
//     ${flexAllCenter};
//     cursor: pointer;
//
//     svg {
//         margin-left: 0.8rem;
//     }
// `;
//
// const PriceFormDescription = styled.div`
//     font-size: 1.4rem;
//     line-height: 2rem;
//     color: ${COLORS.descriptionText};
//     opacity: 0.7;
//     margin-bottom: 1.6rem;
// `;
//
// const PriceFormInputBlock = styled.div`
//     display: flex;
//     flex-direction: row;
//     align-items: center;
//     margin-bottom: 0.8rem;
// `;
//
// const PriceFormInputLabel = styled.span`
//     font-size: 1.6rem;
//     line-height: 1.8rem;
//     margin-right: 1.6rem;
//     white-space: nowrap;
// `;
//
// const PriceFormInputPostfix = styled.span`
//     color: ${COLORS.grayText};
// `;
//
// const ResetCustomPrice = styled.div`
//     display: flex;
//     flex-direction: row;
//     justify-content: flex-end;
//     font-size: 1.4rem;
//     line-height: 2rem;
//     color: ${COLORS.descriptionText};
//     opacity: 0.7;
// `;
//
// const ResetCustomButton = styled.div`
//     color: ${COLORS.purple};
//     font-size: 1.4rem;
//     line-height: 2rem;
//     border-bottom: 0.1rem dashed ${COLORS.purple};
//     cursor: pointer;
//     margin-left: 0.8rem;
//     opacity: 1;
// `;

const LockPreview = styled.div`
    margin-top: 3.2rem;
    margin-bottom: 3.2rem;
    background: ${COLORS.tooltip};
    border-radius: 0.5rem;
    padding: 3.2rem 2.1rem 3.2rem 3.2rem;
`;

const TotalPercent = styled.div`
    height: 3.5rem;
    ${flexAllCenter};
    padding: 0 1.5rem;
    background: ${COLORS.white};
    border-radius: 0.5rem;
    box-shadow: 0 2rem 3rem rgba(0, 6, 54, 0.06);
    width: min-content;
    white-space: nowrap;
`;

const LockPreviewRow = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin-bottom: 1.6rem;
`;

const TotalValues = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
`;

const ArrowRightIcon = styled(ArrowRight)`
    margin: 0 1.6rem;
`;

const PreviousValue = styled.span`
    font-weight: bold;
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.white};
    opacity: 0.5;
`;

const NewValue = styled.span`
    font-weight: bold;
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.white};
`;

const DatePickerContainer = styled.div`
    margin-top: 1.2rem;
    margin-bottom: 3.3rem;
`;

const EmptyDate = styled.div`
    height: 1.6rem;
`;

const GlobalStyle = createGlobalStyle`
    div.react-datepicker {
        font-family: ${FONT_FAMILY.roboto};
        font-size: 1.6rem;
        background-color: #fff;
        color: #000636;
        border: none;
        border-radius: 0.5rem;
        box-shadow: 0 20px 30px rgba(0, 6, 54, 0.06);
    }
    div.react-datepicker__triangle {
        display: none;
    }
    div.react-datepicker__header {
        background-color: white;
        border-bottom: none;
    }
    
    div.react-datepicker-popper {
      z-index: 200;
    }
    div.react-datepicker__day-name, .react-datepicker__day, .react-datepicker__time-name {
        display: inline-block;
        width: 4.6rem;
        line-height: 4.5rem;
        margin: 0;
    }
    div.react-datepicker__day--selected, div.react-datepicker__day--keyboard-selected {
        border-radius: 0;
        background-color: #8620B9;
        color: #fff;
    }
    div.react-datepicker__current-month  {
        color: #000;
        font-weight: normal;
        font-size: 1.6rem;
        line-height: 2.8rem;
    }
    div.react-datepicker__month {
        margin: 0;
        border-left: 1px solid #E8E8ED;
        border-top: 1px solid #E8E8ED;
    }
    div.react-datepicker__day {
        width: 4.6rem;
        line-height: 4.5rem;
        margin: 0;
        border-right: 1px solid #E8E8ED;
        border-bottom: 1px solid #E8E8ED;
  }
    div.react-datepicker__day--outside-month {
        color: #B3B4C3;
    }
`;

const LockAquaForm = ({
    account,
    averageAquaPrice,
    locks,
    airdropAmount,
    ammReserves,
    updateAccount,
}: {
    account: AccountService;
    averageAquaPrice: number;
    locks: any[];
    airdropAmount: number;
    ammReserves: { AQUA: number; XLM: number; yXLM: number };
    updateAccount: () => void;
}) => {
    // const [showCustomPriceForm, setShowCustomPriceForm] = useState(false);
    const [lockPeriod, setLockPeriod] = useState(null);
    const [lockPeriodPercent, setLockPeriodPercent] = useState(0);
    const [lockAmount, setLockAmount] = useState('');
    const [lockPercent, setLockPercent] = useState(0);
    // const [emulatedAquaPrice, setEmulatedAquaPrice] = useState('');

    const { isLogged } = useAuthStore();

    const aquaBalance = Math.max(account.getAquaBalance() - 1, 0);

    const onLockPeriodPercentChange = (value) => {
        setLockPeriodPercent(value);
        const period = (MAX_TIME_LOCK * value) / 100;

        setLockPeriod(period + START_AIRDROP2_TIMESTAMP);
    };

    const onLockPeriodChange = (value) => {
        setLockPeriod(value);
        if (value < START_AIRDROP2_TIMESTAMP) {
            setLockPeriodPercent(0);
            return;
        }
        const period = value - START_AIRDROP2_TIMESTAMP;

        if (period > MAX_TIME_LOCK) {
            setLockPeriodPercent(100);
            return;
        }

        const percent = roundToPrecision((period / MAX_TIME_LOCK) * 100, 2);

        setLockPeriodPercent(+percent);
    };

    const onAmountChange = (value) => {
        setLockAmount(value);
        if (!value || Number.isNaN(Number(value))) {
            setLockPercent(0);
            return;
        }
        if (Number(value) > Number(aquaBalance)) {
            setLockPercent(100);
            return;
        }
        const percent = roundToPrecision((Number(value) / Number(aquaBalance)) * 100, 2);
        setLockPercent(+percent);
    };

    const onLockPercentChange = (value) => {
        setLockPercent(value);

        const newAmount = (value * aquaBalance) / 100;
        setLockAmount(roundToPrecision(newAmount, 7));
    };

    const boostPercent = useMemo(() => {
        if (!averageAquaPrice || !ammReserves || !account || !locks) {
            return 0;
        }

        const updatedLocks = [...locks];

        if (lockAmount && lockPeriod) {
            updatedLocks.push({
                claimants: [
                    {
                        predicate: {
                            not: {
                                abs_before: lockPeriod,
                            },
                        },
                    },
                ],
                amount: lockAmount.toString(),
            });
        }

        if (!updatedLocks.length) {
            return 0;
        }

        const maxTimeStamp = new Date('2025-01-15T00:00:00Z').getTime();

        const { amountSum, weightedAverageTime } = updatedLocks.reduce(
            (acc, lock) => {
                acc.amountSum += Number(lock.amount);
                const lockEndTimestamp = new Date(
                    lock?.claimants?.[0].predicate?.not?.abs_before,
                ).getTime();
                const period = Math.min(lockEndTimestamp, maxTimeStamp) - START_AIRDROP2_TIMESTAMP;
                acc.weightedAverageTime += Math.max(period, 0) * Number(lock.amount);
                return acc;
            },
            { amountSum: 0, weightedAverageTime: 0 },
        );

        if (!weightedAverageTime) {
            return 0;
        }

        const averageLockTime = weightedAverageTime / amountSum;

        const timeLockMultiplier = Math.min(MAX_TIME_LOCK, averageLockTime) / MAX_TIME_LOCK;

        const lockedValue = amountSum * +averageAquaPrice;

        const xlmBalance = account.getAssetBalance(StellarService.createLumen());
        const yXlmBalance = account.getAssetBalance(
            StellarService.createAsset(yXLM_CODE, yXLM_ISSUER),
        );
        const aquaBalance = account.getAquaBalance();

        const airdropShares =
            xlmBalance +
            ammReserves.XLM +
            yXlmBalance +
            ammReserves.yXLM +
            ((lockAmount && lockPeriod ? aquaBalance - Number(lockAmount) : aquaBalance) +
                ammReserves.AQUA +
                amountSum) *
                +averageAquaPrice;

        const unlockedValue = airdropShares - lockedValue;

        const valueLockMultiplier = Math.min(lockedValue, unlockedValue) / unlockedValue;

        const totalMultiplier = timeLockMultiplier * valueLockMultiplier;

        const maxBoost = 3;

        const boost = totalMultiplier * maxBoost;

        return +roundToPrecision(boost * 100, 3);
    }, [locks, averageAquaPrice, ammReserves, account, lockAmount, lockPeriod]);

    const MAX_AIRDROP_AMOUNT = 10000000;
    const expectedAirdropWithBoost = Math.min(
        (airdropAmount * (100 + boostPercent)) / 100,
        MAX_AIRDROP_AMOUNT,
    );

    const onSubmit = () => {
        if (!isLogged) {
            ModalService.openModal(ChooseLoginMethodModal, {});
            return;
        }
        ModalService.openModal(LockAquaModal, { amount: lockAmount, period: lockPeriod }).then(
            ({ isConfirmed }) => {
                if (isConfirmed) {
                    updateAccount();
                }
            },
        );
    };

    return (
        <Container>
            <Title>Lock your AQUA</Title>
            <Description>Lock your AQUA token to get Airdrop #2 boost</Description>
            <ContentRow>
                <Label>Amount</Label>
                <BalanceBlock>
                    <Balance onClick={() => onAmountChange(aquaBalance.toString())}>
                        {aquaBalance} AQUA{' '}
                    </Balance>
                    available
                </BalanceBlock>
            </ContentRow>

            <StyledInput
                value={lockAmount}
                onChange={(e) => onAmountChange(e.target.value)}
                placeholder="Enter lock amount"
                postfix={
                    <InputPostfix>
                        <AquaLogo />
                        <span>AQUA</span>
                    </InputPostfix>
                }
            />

            <RangeInput onChange={onLockPercentChange} value={lockPercent} />

            <ContentRow>
                <Label>Lock Period</Label>
            </ContentRow>

            <DatePickerContainer>
                <DatePicker
                    customInput={<Input />}
                    selected={lockPeriod ? new Date(lockPeriod) : null}
                    onChange={(res) => {
                        onLockPeriodChange(res?.getTime() ?? null);
                    }}
                    dateFormat="MM.dd.yyyy"
                    placeholderText="MM.DD.YYYY"
                    popperModifiers={[
                        {
                            name: 'offset',
                            options: {
                                offset: [0, -10],
                            },
                        },
                    ]}
                />

                <GlobalStyle />
            </DatePickerContainer>

            <RangeInput
                onChange={onLockPeriodPercentChange}
                value={lockPeriodPercent}
                withoutPercent
            />

            <ClaimBack>
                {lockPeriod ? (
                    <>
                        <span>You will get your AQUA back on </span>
                        <ClaimBackDate>{getDateString(lockPeriod)}</ClaimBackDate>
                    </>
                ) : (
                    <EmptyDate />
                )}
            </ClaimBack>

            {/*<PriceBlock>*/}
            {/*    {showCustomPriceForm ? (*/}
            {/*        <PriceForm>*/}
            {/*            <PriceFormHeader>*/}
            {/*                <PriceFormTitle>Emulate AQUA price</PriceFormTitle>*/}
            {/*                <Close*/}
            {/*                    onClick={() => {*/}
            {/*                        setShowCustomPriceForm(false);*/}
            {/*                        setEmulatedAquaPrice('');*/}
            {/*                    }}*/}
            {/*                >*/}
            {/*                    Close <CloseIcon />*/}
            {/*                </Close>*/}
            {/*            </PriceFormHeader>*/}

            {/*            <PriceFormDescription>*/}
            {/*                AQUA price affects the size of the airdrop.*/}
            {/*                <br />*/}
            {/*                You can emulate price changes to predict your reward.*/}
            {/*            </PriceFormDescription>*/}
            {/*            <PriceFormInputBlock>*/}
            {/*                <PriceFormInputLabel>Emulated price:</PriceFormInputLabel>*/}
            {/*                <Input*/}
            {/*                    value={emulatedAquaPrice}*/}
            {/*                    onChange={(e) => {*/}
            {/*                        setEmulatedAquaPrice(e.target.value);*/}
            {/*                    }}*/}
            {/*                    isMedium*/}
            {/*                    postfix={<PriceFormInputPostfix>XLM</PriceFormInputPostfix>}*/}
            {/*                />*/}
            {/*            </PriceFormInputBlock>*/}
            {/*            <ResetCustomPrice>*/}
            {/*                <span>Market:</span>*/}
            {/*                <ResetCustomButton*/}
            {/*                    onClick={() => setEmulatedAquaPrice(averageAquaPrice.toString())}*/}
            {/*                >*/}
            {/*                    {averageAquaPrice} XLM*/}
            {/*                </ResetCustomButton>*/}
            {/*            </ResetCustomPrice>*/}
            {/*        </PriceForm>*/}
            {/*    ) : (*/}
            {/*        <PriceRow>*/}
            {/*            <Price>1 AQUA = {averageAquaPrice} XLM</Price>*/}
            {/*            <EmulateButton onClick={() => setShowCustomPriceForm(true)}>*/}
            {/*                Emulate other price*/}
            {/*            </EmulateButton>*/}
            {/*            <InfoIcon />*/}
            {/*        </PriceRow>*/}
            {/*    )}*/}
            {/*</PriceBlock>*/}
            <LockPreview>
                <LockPreviewRow>
                    <TotalPercent>⚡ {boostPercent}% Airdrop #2 boost</TotalPercent>
                </LockPreviewRow>
                <TotalValues>
                    <PreviousValue>{formatBalance(airdropAmount, true)} AQUA</PreviousValue>
                    <ArrowRightIcon />
                    <NewValue>{formatBalance(expectedAirdropWithBoost, true)} AQUA</NewValue>
                </TotalValues>
            </LockPreview>

            <Button
                isBig
                onClick={() => onSubmit()}
                disabled={!lockAmount || lockPeriod <= START_AIRDROP2_TIMESTAMP}
            >
                LOCK AQUA
            </Button>
        </Container>
    );
};

export default LockAquaForm;
