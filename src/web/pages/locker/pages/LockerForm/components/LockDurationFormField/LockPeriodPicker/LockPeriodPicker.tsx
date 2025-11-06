import { addDays } from 'date-fns';
import * as React from 'react';

import { DatePicker, BlankInput, withDateMask } from 'basics/inputs';

import { DateInputsWrapper, DateInputWrapper, DatePickerWrapper } from './LockPeriodPicker.styled';

import { CalendarToggleButton } from '../CalendarToggleButton/CalendarToggleButton';

interface Props {
    lockPeriod: number;
    onChange: (ts: number) => void;
}

export const LockPeriodPicker: React.FC<Props> = ({ lockPeriod, onChange }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const MaskedInput = React.useMemo(() => withDateMask(BlankInput), []);

    return (
        <DateInputsWrapper>
            <DateInputWrapper>
                <span>Lock period till</span>

                <DatePicker
                    date={lockPeriod}
                    onChange={ts => {
                        onChange(ts);
                        setIsOpen(false);
                    }}
                    customInput={<MaskedInput />}
                    minDate={addDays(Date.now(), 1)}
                    open={isOpen}
                    onClickOutside={() => setIsOpen(false)}
                />
            </DateInputWrapper>

            <DatePickerWrapper>
                <CalendarToggleButton isOpen={isOpen} onClick={() => setIsOpen(prev => !prev)} />
            </DatePickerWrapper>
        </DateInputsWrapper>
    );
};
