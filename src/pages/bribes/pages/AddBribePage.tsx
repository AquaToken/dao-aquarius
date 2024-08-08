import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { Breakpoints, COLORS, FONT_FAMILY } from '../../../common/styles';
import { flexAllCenter, respondDown } from '../../../common/mixins';
import ExternalLink from '../../../common/basics/ExternalLink';
import AssetDropdown from '../../vote/components/AssetDropdown/AssetDropdown';
import Dash from '../../../common/assets/img/icon-dash.svg';
import Success from '../../../common/assets/img/icon-success.svg';
import Fail from '../../../common/assets/img/icon-fail.svg';
import Loader from '../../../common/assets/img/loader.svg';
import Minus from '../../../common/assets/img/icon-minus.svg';
import Plus from '../../../common/assets/img/icon-plus.svg';
import Button from '../../../common/basics/Button';
import Input from '../../../common/basics/Input';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ModalService, StellarService } from '../../../common/services/globalServices';
import CreatePairModal from '../../vote/components/MainPage/CreatePairModal/CreatePairModal';
import ChooseLoginMethodModal from '../../../common/modals/ChooseLoginMethodModal';
import useAuthStore from '../../../store/authStore/useAuthStore';
import ConfirmBribeModal from '../components/AddBribePage/ConfirmBribeModal/ConfirmBribeModal';
import { useDebounce } from '../../../common/hooks/useDebounce';
import Tooltip, { TOOLTIP_POSITION } from '../../../common/basics/Tooltip';
import ArrowLeft from '../../../common/assets/img/icon-arrow-left.svg';
import { Link } from 'react-router-dom';
import {
    addWeeks,
    endOfWeek,
    isBefore,
    isSunday,
    nextMonday,
    nextSunday,
    setHours,
    startOfDay,
    startOfWeek,
} from 'date-fns';
import { formatBalance } from '../../../common/helpers/helpers';
import { BribesRoutes } from '../../../routes';
import { getMarketPair } from '../api/api';
import { LoginTypes } from '../../../store/authStore/types';
import CircleButton from '../../../common/basics/CircleButton';

export const MainBlock = styled.main`
    flex: 1 0 auto;
`;

export const Background = styled.div`
    width: 100%;
    background-color: ${COLORS.lightGray};
    padding: 7.7rem 0 14.3rem;
    ${flexAllCenter};
`;

export const Content = styled.div`
    display: flex;
    flex-direction: column;
    width: 79.2rem;

    ${respondDown(Breakpoints.md)`
        width: 100%;
    `}
`;

export const Back = styled(Link)`
    display: flex;
    align-items: center;
    margin-bottom: 3.2rem;
    text-decoration: none;
    color: ${COLORS.paragraphText};

    ${respondDown(Breakpoints.md)`
          padding: 0 1.6rem;
      `}
`;

export const Title = styled.span`
    font-weight: bold;
    font-size: 5.6rem;
    line-height: 6.4rem;
    color: ${COLORS.buttonBackground};
    margin-bottom: 1.2rem;

    ${respondDown(Breakpoints.md)`
        padding: 0 1.6rem;
    `}
`;

const Description = styled.div`
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.grayText};
    margin-bottom: 1.2rem;

    ${respondDown(Breakpoints.md)`
          padding: 0 1.6rem;
      `}
`;

const ExternalLinkStyled = styled(ExternalLink)`
    ${respondDown(Breakpoints.md)`
            padding: 0 1.6rem;
        `}
`;

export const FormWrap = styled.div`
    display: flex;
    flex-direction: column;
    margin-top: -7.7rem;
    ${flexAllCenter};
`;

export const Form = styled.form`
    width: 100%;
    background: ${COLORS.white};
    box-shadow: 0 2rem 3rem rgba(0, 6, 54, 0.06);
    border-radius: 0.5rem;
`;

export const FormSectionTitle = styled.span`
    font-size: 3.6rem;
    line-height: 4.2rem;
    color: ${COLORS.buttonBackground};
    margin-bottom: 0.8rem;
`;

export const FormSectionDescription = styled.span`
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.grayText};
    margin-bottom: 4.8rem;
`;

export const FormSection = styled.section`
    display: flex;
    flex-direction: column;
    padding: 4.8rem;

    &:not(:last-child) {
        border-bottom: 0.1rem solid ${COLORS.gray};
    }

    ${respondDown(Breakpoints.md)`
          padding: 3.2rem 1.6rem;
    `}
`;

const FormRow = styled.div`
    display: flex;
    align-items: center;
    margin-top: 3rem;

    ${respondDown(Breakpoints.md)`
        flex-direction: column;
    `}
`;

const PairDivider = styled(Dash)`
    margin: 0 2.2rem;
    min-width: 1.6rem;
    min-height: 1.6rem;

    ${respondDown(Breakpoints.md)`
        margin: 2.4rem 0 3.8rem;
    `}
`;
const DashIcon = styled(Dash)`
    margin: 0 2rem;
    min-width: 1.6rem;
    min-height: 1.6rem;

    ${respondDown(Breakpoints.md)`
        display: none;
    `}
`;

const NextButton = styled(Button)`
    margin-top: 4.8rem;
`;

const AmountInput = styled(Input)`
    margin-left: 6rem;

    ${respondDown(Breakpoints.md)`
         margin-left: 0;
         margin-top: 5.2rem;
    `}
`;

const DateEndInput = styled(Input)`
    ${respondDown(Breakpoints.md)`
         margin-top: 5.2rem;
    `}
`;

const FailIcon = styled(Fail)`
    width: 1.6rem;
    height: 1.6rem;
`;

const SuccessIcon = styled(Success)`
    width: 1.6rem;
    height: 1.6rem;
`;

const MinusIcon = styled(Minus)`
    width: 1.6rem;
    height: 1.6rem;
    color: ${COLORS.purple};
`;

const PlusIcon = styled(Plus)`
    width: 1.6rem;
    height: 1.6rem;
    color: ${COLORS.purple};
`;

const LoaderStyled = styled(Loader)`
    width: 1.6rem;
    height: 1.6rem;
`;

const TooltipInner = styled.span`
    width: 40rem;
    white-space: pre-line;

    ${respondDown(Breakpoints.md)`
        width: 15rem;
    `}
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
    div.react-datepicker__day--selected {
        border-radius: 0;
        background-color: #8620B9;
        color: #fff;
        
        &:hover {
            background-color: #8620B9;
        }
    }
    div.react-datepicker__day--keyboard-selected {
        background-color: unset;
        color: unset;
        
        &:hover {
          background-color: #f0f0f0;
        }
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

const DurationInput = styled(Input)`
    margin-right: 4.5rem;

    ${respondDown(Breakpoints.md)`
        margin-right: 0;
        margin-bottom: 5rem;
    `}
`;

const DurationButton = styled.div`
    ${flexAllCenter};
    width: 3rem;
    height: 3rem;
    cursor: pointer;
    user-select: none;

    &:hover {
        background-color: ${COLORS.lightGray};
    }
`;

export const convertUTCToLocalDateIgnoringTimezone = (utcDate: Date) => {
    return new Date(
        utcDate.getUTCFullYear(),
        utcDate.getUTCMonth(),
        utcDate.getUTCDate(),
        utcDate.getUTCHours(),
        utcDate.getUTCMinutes(),
        utcDate.getUTCSeconds(),
        utcDate.getUTCMilliseconds(),
    );
};

export function convertLocalDateToUTCIgnoringTimezone(date: Date) {
    const timestamp = Date.UTC(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        date.getHours(),
        date.getMinutes(),
        date.getSeconds(),
        date.getMilliseconds(),
    );

    return new Date(timestamp);
}

export const getWeekStartFromDay = (date: Date, duration: number) => {
    const startWeek = startOfWeek(date, { weekStartsOn: 1 });
    const endWeek = endOfWeek(date, { weekStartsOn: 1 });
    const endPeriod = addWeeks(endWeek, duration - 1);

    return {
        start: convertLocalDateToUTCIgnoringTimezone(startWeek),
        end: convertLocalDateToUTCIgnoringTimezone(endPeriod),
    };
};

const getMinDate = () => {
    const now = Date.now();
    const collectDate = convertLocalDateToUTCIgnoringTimezone(
        setHours(startOfDay(isSunday(now) ? now : nextSunday(now)), 18),
    );

    return isBefore(now, collectDate)
        ? startOfDay(nextMonday(now))
        : startOfDay(nextMonday(nextMonday(now)));
};

enum CreateStep {
    'pair',
    'bribeAmount',
    'period',
}

const MINIMUM_AQUA_EQUIVALENT = 100000;
const MAX_AMOUNT = 922337203685.4775807;

const AddBribePage = () => {
    const [step, setStep] = useState(CreateStep.pair);
    const [base, setBase] = useState(null);
    const [counter, setCounter] = useState(null);
    const [pairInfo, setPairInfo] = useState(undefined);

    const [rewardAsset, setRewardAsset] = useState(null);
    const [amount, setAmount] = useState('');
    const [isInvalidAmount, setIsInvalidAmount] = useState(false);
    const [aquaEquivalent, setAquaEquivalent] = useState(null);

    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);

    const [duration, setDuration] = useState('1');

    const { isLogged, account } = useAuthStore();

    const resetForm = () => {
        setStep(CreateStep.pair);
        setBase(null);
        setCounter(null);
        setPairInfo(undefined);
        setRewardAsset(null);
        setAmount('');
        setStartDate(null);
        setEndDate(null);
        setSelectedDate(null);
    };

    useEffect(() => {
        if (!base || !counter) {
            setPairInfo(undefined);
            return;
        }

        setPairInfo(undefined);

        getMarketPair(base, counter).then((res) => {
            setPairInfo(res);
        });
    }, [base, counter]);

    const debouncedAmount = useDebounce(amount, 700);

    useEffect(() => {
        setAquaEquivalent(null);
        if (!debouncedAmount.current || !rewardAsset) {
            return;
        }

        if (Number(debouncedAmount.current) > MAX_AMOUNT) {
            setAquaEquivalent('0');
            setIsInvalidAmount(true);
            return;
        }

        setIsInvalidAmount(false);

        StellarService.getAquaEquivalent(
            StellarService.createAsset(rewardAsset.code, rewardAsset.issuer),
            debouncedAmount.current,
        )
            .then((res) => {
                setAquaEquivalent(res);
            })
            .catch(() => {
                setAquaEquivalent('0');
            });
    }, [debouncedAmount, rewardAsset]);

    const createPair = () => {
        if (isLogged) {
            ModalService.openModal(CreatePairModal, {
                base,
                counter,
            });
            return;
        }
        ModalService.openModal(ChooseLoginMethodModal, {
            callback: () =>
                ModalService.openModal(CreatePairModal, {
                    base,
                    counter,
                }),
        });
    };

    const onSubmit = () => {
        if (!isLogged) {
            ModalService.openModal(ChooseLoginMethodModal, {
                callback: () =>
                    ModalService.openModal(ConfirmBribeModal, {
                        base,
                        counter,
                        rewardAsset,
                        amount,
                        startDate,
                        endDate,
                        duration,
                        marketKey: pairInfo?.account_id,
                        resetForm,
                    }),
            });
            return;
        }
        ModalService.openModal(ConfirmBribeModal, {
            base,
            counter,
            rewardAsset,
            amount,
            startDate,
            endDate,
            duration,
            marketKey: pairInfo?.account_id,
            resetForm,
        });
    };

    const maxDuration = useMemo(() => {
        if (isLogged && account.authType === LoginTypes.ledger) {
            return 5;
        }
        return 100;
    }, [isLogged]);

    const decrementDuration = useCallback(() => {
        if (Number(duration) - 1 > maxDuration) {
            setDuration(maxDuration.toString());
            return;
        }
        if (Number.isNaN(Number(duration)) || Number(duration) - 1 <= 1) {
            setDuration('1');
            return;
        }
        setDuration(Math.floor(Number(duration) - 1).toString());
    }, [duration]);

    const incrementDuration = useCallback(() => {
        if (Number(duration) + 1 > maxDuration) {
            setDuration(maxDuration.toString());
            return;
        }
        if (Number.isNaN(Number(duration)) || Number(duration) + 1 <= 1) {
            setDuration('1');
            return;
        }
        setDuration(Math.floor(Number(duration) + 1).toString());
    }, [duration]);

    useEffect(() => {
        if (!startDate || !Number(duration) || Number(duration) > maxDuration) {
            return;
        }
        const { end } = getWeekStartFromDay(
            convertUTCToLocalDateIgnoringTimezone(startDate),
            Number(duration),
        );

        setEndDate(end);
    }, [startDate, duration]);

    const minDate = getMinDate();

    const amountInputPostfix =
        debouncedAmount.current !== null && aquaEquivalent === null ? (
            <LoaderStyled />
        ) : Number(aquaEquivalent) >= MINIMUM_AQUA_EQUIVALENT ? (
            <SuccessIcon />
        ) : isInvalidAmount ? (
            <Tooltip
                content={<div>Value must be less or equal {formatBalance(MAX_AMOUNT)}</div>}
                position={+window.innerWidth > 992 ? TOOLTIP_POSITION.top : TOOLTIP_POSITION.left}
                isShow={true}
                isError
            >
                <FailIcon />
            </Tooltip>
        ) : (
            <Tooltip
                content={
                    <TooltipInner>
                        The bribe appears to be under 100,000 AQUA in value. Bribes below 100,000
                        AQUA will not be accepted and will be sent back by the bribe collector. Are
                        you sure you want to continue?
                    </TooltipInner>
                }
                position={+window.innerWidth > 992 ? TOOLTIP_POSITION.top : TOOLTIP_POSITION.left}
                isShow={true}
                isError
            >
                <FailIcon />
            </Tooltip>
        );

    return (
        <MainBlock>
            <Background>
                <Content>
                    <Back to={BribesRoutes.bribes}>
                        <CircleButton label="Bribes">
                            <ArrowLeft />
                        </CircleButton>
                    </Back>
                    <Title>Create Bribe</Title>
                    <Description>
                        You are creating a bribe using any Stellar asset to incentivize voting for a
                        specific market in Aquarius. Each bribe is distributed over 7 days to voters
                        of the chosen market. To ensure validity, a portion of the bribe will be
                        converted to 100,000 AQUA before distribution.
                    </Description>
                    <ExternalLinkStyled href="https://medium.com/aquarius-aqua/introducing-aquarius-bribes-6b0931dc3dd7">
                        Learn more
                    </ExternalLinkStyled>
                </Content>
            </Background>
            <FormWrap>
                <Content>
                    <Form
                        onSubmit={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            onSubmit();
                        }}
                        key={maxDuration}
                    >
                        <FormSection>
                            <FormSectionTitle>Select market</FormSectionTitle>
                            <FormSectionDescription>
                                Choose the assets to define a market pair for your bribe.
                            </FormSectionDescription>
                            <FormRow>
                                <AssetDropdown
                                    asset={base}
                                    onUpdate={setBase}
                                    exclude={counter}
                                    placeholder="Search or pick asset"
                                    label="Choose asset"
                                />
                                <PairDivider />
                                <AssetDropdown
                                    asset={counter}
                                    onUpdate={setCounter}
                                    exclude={base}
                                    placeholder="Search or pick asset"
                                    label="Choose asset"
                                />
                            </FormRow>
                            {base && counter && pairInfo === null && (
                                <NextButton
                                    isBig
                                    fullWidth
                                    onClick={(e) => {
                                        e.preventDefault();
                                        createPair();
                                    }}
                                >
                                    create pair
                                </NextButton>
                            )}
                            {step === CreateStep.pair && (
                                <NextButton
                                    isBig
                                    fullWidth
                                    onClick={() => {
                                        setStep(CreateStep.bribeAmount);
                                    }}
                                    disabled={!base || !counter || !pairInfo}
                                >
                                    next
                                </NextButton>
                            )}
                        </FormSection>
                        {step >= CreateStep.bribeAmount && (
                            <FormSection>
                                <FormSectionTitle>Set reward</FormSectionTitle>
                                <FormSectionDescription>
                                    Set the reward asset and amount that will be distributed during
                                    one week. Note, your bribe should be worth at least 100,000
                                    AQUA, otherwise it won't be accepted.
                                </FormSectionDescription>
                                <FormRow>
                                    <AssetDropdown
                                        asset={rewardAsset}
                                        onUpdate={setRewardAsset}
                                        placeholder="Search or pick asset"
                                        label="Reward asset"
                                    />

                                    <AmountInput
                                        placeholder="0"
                                        type="number"
                                        label="Weekly reward amount"
                                        value={amount}
                                        required
                                        onChange={({ target }) => {
                                            setAmount(target.value);
                                        }}
                                        postfix={
                                            debouncedAmount.current && rewardAsset
                                                ? amountInputPostfix
                                                : null
                                        }
                                    />
                                </FormRow>
                                {step === CreateStep.bribeAmount && (
                                    <NextButton
                                        isBig
                                        fullWidth
                                        disabled={
                                            !rewardAsset || !Number(amount) || Number(amount) <= 0
                                        }
                                        onClick={() => setStep(CreateStep.period)}
                                    >
                                        next
                                    </NextButton>
                                )}
                            </FormSection>
                        )}

                        {step === CreateStep.period && (
                            <FormSection>
                                <FormSectionTitle>Set period</FormSectionTitle>
                                <FormSectionDescription>
                                    Bribe distribution starts on Mondays and happens every day until
                                    Sunday. You can plan bribes by choosing a start date in advance
                                    or selecting multiple weeks.
                                </FormSectionDescription>
                                <FormRow>
                                    <DurationInput
                                        label="Duration (weeks)"
                                        placeholder="1"
                                        prefixCustom={
                                            <DurationButton onClick={() => decrementDuration()}>
                                                <MinusIcon />
                                            </DurationButton>
                                        }
                                        postfix={
                                            <DurationButton onClick={() => incrementDuration()}>
                                                <PlusIcon />
                                            </DurationButton>
                                        }
                                        value={duration}
                                        onChange={({ target }) => {
                                            setDuration(target.value);
                                        }}
                                        style={{ padding: '0rem 6rem' }}
                                        isCenterAligned
                                        required
                                        pattern={
                                            maxDuration === 5
                                                ? '[1-5]'
                                                : '[0-9]$|^[1-9][0-9]$|^(100)$'
                                        }
                                        onInvalid={(e) =>
                                            (e.target as HTMLInputElement).setCustomValidity(
                                                `Only integer less or equal ${maxDuration}`,
                                            )
                                        }
                                        onInput={(e) =>
                                            (e.target as HTMLInputElement).setCustomValidity('')
                                        }
                                    />
                                    <DatePicker
                                        customInput={<Input label="Start date" />}
                                        calendarStartDay={1}
                                        selected={selectedDate || null}
                                        onChange={(res) => {
                                            setSelectedDate(res);
                                            const { start } = getWeekStartFromDay(
                                                res,
                                                Number(duration),
                                            );
                                            setStartDate(start);
                                        }}
                                        filterDate={(date) => date.getDay() === 1}
                                        dateFormat="MM.dd.yyyy"
                                        placeholderText="MM.DD.YYYY"
                                        disabledKeyboardNavigation
                                        popperModifiers={[
                                            {
                                                name: 'offset',
                                                options: {
                                                    offset: [0, -10],
                                                },
                                            },
                                        ]}
                                        minDate={minDate}
                                    />
                                    <DashIcon />
                                    <DatePicker
                                        customInput={<DateEndInput label="End date" />}
                                        disabled
                                        calendarStartDay={1}
                                        selected={endDate || null}
                                        dateFormat="MM.dd.yyyy"
                                    />
                                </FormRow>

                                <NextButton
                                    isBig
                                    fullWidth
                                    disabled={
                                        !base ||
                                        !counter ||
                                        !rewardAsset ||
                                        !Number(amount) ||
                                        !startDate ||
                                        !Number(duration)
                                    }
                                >
                                    Create bribe
                                </NextButton>

                                <GlobalStyle />
                            </FormSection>
                        )}
                    </Form>
                </Content>
            </FormWrap>
        </MainBlock>
    );
};

export default AddBribePage;
