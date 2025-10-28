import * as React from 'react';
import { useRef } from 'react';
import ReactDatePicker from 'react-datepicker';
import styled from 'styled-components';

import ArrowLeft from 'assets/icons/arrows/arrow-left-16.svg';
import ArrowRight from 'assets/icons/arrows/arrow-right-16.svg';

import Input from 'basics/inputs/Input';

import { DatePickerStyles } from 'styles/date-picker-styles';

import 'react-datepicker/dist/react-datepicker.css';

const Container = styled.div<{ $fullWidth: boolean }>`
    display: flex;
    width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'fit-content')};
`;

type ReactDatePickerProps = React.ComponentProps<typeof ReactDatePicker>;

interface Props extends Omit<ReactDatePickerProps, 'selected' | 'onChange'> {
    customInput?: React.ReactNode;
    date: number | null;
    onChange?: (date: number | null) => void;
    fullWidth?: boolean;
}

const DatePicker = ({ customInput, date, onChange, fullWidth, ...props }: Props) => {
    const datepickerRef = useRef(null);

    return (
        <Container ref={datepickerRef} $fullWidth={fullWidth}>
            <ReactDatePicker
                customInput={customInput ?? <Input />}
                selected={date ? new Date(date) : null}
                onChange={res => {
                    onChange(res?.getTime() ?? null);
                }}
                dateFormat="MM.dd.yyyy"
                placeholderText="MM.DD.YYYY"
                fixedHeight
                popperModifiers={[
                    {
                        name: 'offset',
                        options: {
                            offset: [-50, -100],
                        },
                    },
                ]}
                onCalendarOpen={() => {
                    datepickerRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
                }}
                renderCustomHeader={({
                    date,
                    decreaseMonth,
                    increaseMonth,
                    prevMonthButtonDisabled,
                    nextMonthButtonDisabled,
                }) => (
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '24px',
                        }}
                    >
                        <button
                            onClick={decreaseMonth}
                            disabled={prevMonthButtonDisabled}
                            type="button"
                            style={{
                                cursor: 'pointer',
                                background: 'none',
                                border: 'none',
                            }}
                        >
                            <ArrowLeft />
                        </button>

                        <span>
                            {date.toLocaleString('en', { month: 'long' })} {date.getFullYear()}
                        </span>

                        <button
                            onClick={increaseMonth}
                            disabled={nextMonthButtonDisabled}
                            type="button"
                            style={{
                                cursor: 'pointer',
                                background: 'none',
                                border: 'none',
                            }}
                        >
                            <ArrowRight />
                        </button>
                    </div>
                )}
                {...props}
            />
            <DatePickerStyles />
        </Container>
    );
};

export default DatePicker;
