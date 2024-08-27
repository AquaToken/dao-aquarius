import * as React from 'react';
import { forwardRef, RefObject, useMemo, useRef, useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { Breakpoints, COLORS, FONT_FAMILY } from '../../../../../common/styles';
import { flexAllCenter, flexRowSpaceBetween, respondDown } from '../../../../../common/mixins';
import AccountService from '../../../../../common/services/account.service';
import Input from '../../../../../common/basics/Input';
import Aqua from '../../../../../common/assets/img/aqua-logo-small.svg';
import Ice from '../../../../../common/assets/img/ice-logo.svg';
import Info from '../../../../../common/assets/img/icon-info.svg';
import RangeInput from '../../../../../common/basics/RangeInput';
import {
    formatBalance,
    getDateString,
    roundToPrecision,
} from '../../../../../common/helpers/helpers';
import Button from '../../../../../common/basics/Button';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ModalService, ToastService } from '../../../../../common/services/globalServices';
import useAuthStore from '../../../../../store/authStore/useAuthStore';
import ChooseLoginMethodModal from '../../../../../common/modals/ChooseLoginMethodModal';
import LockAquaModal from '../LockAquaModal/LockAquaModal';
import {
    MAX_BOOST,
    MAX_BOOST_PERIOD,
    MAX_LOCK_PERIOD,
    MIN_BOOST_PERIOD,
    roundMsToDays,
} from '../IceBlock/IceBlock';
import Tooltip, { TOOLTIP_POSITION } from '../../../../../common/basics/Tooltip';

const Container = styled.div`
    background: ${COLORS.white};
    padding: 4.8rem;
    box-shadow: 0 2rem 3rem rgba(0, 6, 54, 0.06);
    border-radius: 1rem;
    display: flex;
    flex-direction: column;
    //position: sticky;
    //top: 1rem;

    ${respondDown(Breakpoints.md)`
        box-shadow: unset;
        padding: 3.2rem;
    `}
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
    margin-bottom: 3.2rem;
`;

const ClaimBackDate = styled.span`
    color: ${COLORS.paragraphText};
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

const YouWillGet = styled.div`
    display: flex;
    margin-bottom: 3.8rem;
    align-items: center;
    justify-content: space-between;
`;

const YouWillGetLabel = styled.span`
    font-weight: 400;
    font-size: 1.4rem;
    line-height: 2rem;
    color: ${COLORS.descriptionText};
    opacity: 0.7;
    white-space: nowrap;
    margin-right: 0.6rem;
`;

const YouWillGetAmount = styled.div`
    font-weight: 700;
    font-size: 2rem;
    line-height: 2.8rem;
    color: ${COLORS.titleText};
    display: flex;
    align-items: center;

    span {
        word-break: break-word;
    }
`;

const IceLogo = styled(Ice)`
    height: 3.2rem;
    width: 3.2rem;
    min-width: 3.2rem;
    margin-right: 0.8rem;
`;

const InfoIcon = styled(Info)`
    margin-left: 0.8rem;
`;

const TooltipInner = styled.div`
    display: flex;
    flex-direction: column;
    color: ${COLORS.titleText};
    width: fit-content;
`;

const TooltipRow = styled.div`
    ${flexRowSpaceBetween};
    gap: 2rem;
    padding: 0.4rem 0;
    font-weight: 400;

    span:first-child {
        font-size: 1.4rem;
        line-height: 2rem;
        color: ${COLORS.grayText};
    }

    span:last-child {
        display: flex;
        align-items: center;
        font-size: 1.6rem;
        line-height: 2.8rem;
        color: ${COLORS.paragraphText};
    }
`;

const IceLogoSmall = styled(Ice)`
    height: 1.8rem;
    width: 1.8rem;
    margin-right: 0.5rem;
`;

const LockAquaForm = forwardRef(
    (
        {
            account,
        }: {
            account: AccountService;
        },
        ref: RefObject<HTMLDivElement>,
    ) => {
        const [lockPeriod, setLockPeriod] = useState(null);
        const [lockPeriodPercent, setLockPeriodPercent] = useState(0);
        const [lockAmount, setLockAmount] = useState('');
        const [lockPercent, setLockPercent] = useState(0);

        const { isLogged } = useAuthStore();

        const datePicker = useRef(null);

        const aquaBalance = account.getAquaBalance();

        const onLockPeriodPercentChange = (value) => {
            setLockPeriodPercent(value);
            const period = (MAX_BOOST_PERIOD * value) / 100;

            setLockPeriod(period + Date.now());
        };

        const onLockPeriodChange = (value) => {
            setLockPeriod(value);
            if (value < Date.now()) {
                setLockPeriodPercent(0);
                return;
            }
            const period = value - Date.now();

            if (period > MAX_BOOST_PERIOD) {
                setLockPeriodPercent(100);
                return;
            }

            const percent = roundToPrecision((period / MAX_BOOST_PERIOD) * 100, 2);

            setLockPeriodPercent(+percent);
        };

        const onAmountChange = (value) => {
            if (Number.isNaN(Number(value))) {
                return;
            }
            setLockAmount(value);

            if (!Number(value)) {
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

        const iceAmount = useMemo(() => {
            const remainingPeriod = Math.max(
                roundMsToDays(lockPeriod) - roundMsToDays(Date.now()),
                0,
            );

            const boost =
                Math.min(remainingPeriod / roundMsToDays(MAX_BOOST_PERIOD), 1) * MAX_BOOST;
            return Number(lockAmount) * (1 + boost);
        }, [lockAmount, lockPeriod]);

        const resetForm = () => {
            setLockPeriod(null);
            setLockAmount('');
            setLockPercent(0);
            setLockPeriodPercent(0);
        };

        const onSubmit = () => {
            if (lockPeriod - Date.now() > MAX_LOCK_PERIOD) {
                ToastService.showErrorToast('The maximum allowed lock period is 10 years');
                return;
            }
            if (!isLogged) {
                ModalService.openModal(ChooseLoginMethodModal, {
                    callback: () =>
                        ModalService.openModal(LockAquaModal, {
                            amount: lockAmount,
                            period: lockPeriod,
                            iceAmount,
                        }).then(({ isConfirmed }) => {
                            if (isConfirmed) {
                                resetForm();
                            }
                        }),
                });
                return;
            }
            ModalService.openModal(LockAquaModal, {
                amount: lockAmount,
                period: lockPeriod,
                iceAmount,
            }).then(({ isConfirmed }) => {
                if (isConfirmed) {
                    resetForm();
                }
            });
        };

        return (
            <Container ref={ref}>
                <Title>Freeze your AQUA</Title>
                <Description>Turn your AQUA into ICE tokens!</Description>
                <ContentRow>
                    <Label>Amount</Label>
                    <BalanceBlock>
                        <Balance onClick={() => onAmountChange(aquaBalance.toString())}>
                            {formatBalance(aquaBalance)} AQUA{' '}
                        </Balance>
                        available
                    </BalanceBlock>
                </ContentRow>

                <StyledInput
                    value={lockAmount}
                    onChange={(e) => onAmountChange(e.target.value)}
                    placeholder="Enter lock amount"
                    style={{ paddingRight: '11rem' }}
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

                <DatePickerContainer ref={datePicker}>
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
                        onCalendarOpen={() => {
                            datePicker.current.scrollIntoView({
                                behavior: 'smooth',
                                block: 'start',
                            });
                        }}
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

                <YouWillGet>
                    <YouWillGetLabel>You will get:</YouWillGetLabel>
                    <YouWillGetAmount>
                        <IceLogo />
                        <Tooltip
                            content={
                                <TooltipInner>
                                    <TooltipRow>
                                        <span>upvoteICE:</span>
                                        <span>
                                            <IceLogoSmall />
                                            {formatBalance(iceAmount * 0.8, true)}
                                        </span>
                                    </TooltipRow>
                                    <TooltipRow>
                                        <span>downvoteICE:</span>
                                        <span>
                                            <IceLogoSmall />
                                            {formatBalance(iceAmount * 0.2, true)}
                                        </span>
                                    </TooltipRow>
                                    <TooltipRow>
                                        <span>governICE:</span>
                                        <span>
                                            <IceLogoSmall />
                                            {formatBalance(iceAmount, true)}
                                        </span>
                                    </TooltipRow>
                                </TooltipInner>
                            }
                            position={TOOLTIP_POSITION.left}
                            background={COLORS.white}
                            showOnHover
                        >
                            <span>
                                {formatBalance(iceAmount, true)} ICE <InfoIcon />
                            </span>
                        </Tooltip>
                    </YouWillGetAmount>
                </YouWillGet>

                <Button
                    isBig
                    onClick={() => onSubmit()}
                    disabled={
                        !lockAmount || !lockPeriod || lockPeriod - Date.now() < MIN_BOOST_PERIOD
                    }
                >
                    FREEZE AQUA
                </Button>
            </Container>
        );
    },
);

export default LockAquaForm;
