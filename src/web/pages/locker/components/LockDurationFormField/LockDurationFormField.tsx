import { addDays } from 'date-fns';
import * as React from 'react';
import styled from 'styled-components';

import { formatDuration } from 'helpers/date';

import { respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import ArrowDownIcon from 'assets/icons/arrows/arrow-down-16.svg';
import IconClose from 'assets/icons/nav/icon-close-alt-16.svg';
import IconCalendar from 'assets/icons/objects/icon-calendar-16.svg';

import { BlankInput, DatePicker } from 'basics/inputs';
import RangeInput from 'basics/inputs/RangeInput';

const Container = styled.div`
    display: flex;
    flex-direction: column;
    position: relative;
    padding: 3.2rem 4rem;
    background-color: ${COLORS.gray50};
    border-radius: 4rem;
    justify-content: space-between;

    ${respondDown(Breakpoints.sm)`
        padding: 3.2rem 1.6rem;
    `}
`;

const DateInputsWrapper = styled.div`
    display: flex;
    margin-bottom: 3.2rem;
`;

const DateInputWrapper = styled.div`
    display: flex;
    flex-direction: column;
    width: 70%;

    span {
        font-size: 1.6rem;
    }
`;

const DatePickerWrapper = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 30%;
    align-items: flex-end;
`;

const CalendarButton = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1.6rem;
    border-radius: 3.8rem;
    height: 4.8rem;
    width: 8rem;
    border: 0.1rem solid ${COLORS.gray100};
    background-color: ${COLORS.white};
    cursor: pointer;

    &:hover {
        border: 0.1rem solid ${COLORS.purple500};
    }
`;

interface Props {
    lockPercent: number;
    onLockPercentChange: (percent: number) => void;
    lockPeriod: number;
    onLockPeriodChange: (duration: number) => void;
}

const LockDurationFormField = ({
    lockPercent,
    onLockPercentChange,
    lockPeriod,
    onLockPeriodChange,
}: Props) => {
    const [isOpen, setIsOpen] = React.useState(false);

    const toggleCalendar = () => {
        setIsOpen(prev => !prev);
    };

    return (
        <Container>
            <DateInputsWrapper>
                <DateInputWrapper>
                    <span>Lock period till</span>

                    <DatePicker
                        date={lockPeriod}
                        onChange={ts => {
                            onLockPeriodChange(ts);
                            setIsOpen(false);
                        }}
                        customInput={<BlankInput />}
                        minDate={addDays(Date.now(), 1)}
                        open={isOpen}
                        onClickOutside={() => setIsOpen(false)}
                    />
                </DateInputWrapper>
                <DatePickerWrapper>
                    <CalendarButton
                        onMouseDown={e => {
                            e.preventDefault();
                            e.stopPropagation();
                        }}
                        onTouchStart={e => {
                            e.preventDefault();
                            e.stopPropagation();
                        }}
                        onClick={() => toggleCalendar()}
                    >
                        <IconCalendar />
                        {isOpen ? <IconClose /> : <ArrowDownIcon />}
                    </CalendarButton>
                </DatePickerWrapper>
            </DateInputsWrapper>

            <RangeInput
                onChange={onLockPercentChange}
                value={lockPercent}
                marks={5}
                labels="y"
                size="large"
                highlight={{
                    range: [60, 100],
                    label: 'Max.rewards',
                    color: lockPercent >= 60 ? COLORS.purple500 : COLORS.gray200,
                }}
                customCurrentValue={formatDuration(lockPeriod - Date.now())}
            />
        </Container>
    );
};

export default LockDurationFormField;
