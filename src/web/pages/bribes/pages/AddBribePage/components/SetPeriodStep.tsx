import * as React from 'react';

import { getBribePeriodRange } from 'helpers/date';

import { DatePicker } from 'basics/inputs';
import Input from 'basics/inputs/Input';

import {
    FormSection,
    FormSectionDescription,
    FormSectionTitle,
    FormRow,
    DashIcon,
} from 'styles/sharedFormPage.styled';

import {
    NextButton,
    DurationButton,
    DurationInput,
    DateEndInput,
    MinusIcon,
    PlusIcon,
} from '../AddBribePage.styled';
import { UseBribeFormReturn } from '../hooks/useBribeForm';

type Props = Pick<
    UseBribeFormReturn,
    | 'startDate'
    | 'endDate'
    | 'selectedDate'
    | 'duration'
    | 'setStartDate'
    | 'setSelectedDate'
    | 'setDuration'
    | 'adjustDuration'
    | 'maxDuration'
    | 'minDate'
    | 'onSubmit'
    | 'base'
    | 'counter'
    | 'rewardAsset'
    | 'amount'
>;

export const SetPeriodStep: React.FC<Props> = ({
    startDate,
    endDate,
    selectedDate,
    duration,
    setStartDate,
    setSelectedDate,
    setDuration,
    adjustDuration,
    maxDuration,
    minDate,
    onSubmit,
    base,
    counter,
    rewardAsset,
    amount,
}) => (
    <FormSection>
        <FormSectionTitle>Set Period</FormSectionTitle>
        <FormSectionDescription>
            Bribe distribution starts on Mondays and happens every day until Sunday. You can plan
            bribes by choosing a start date in advance or selecting multiple weeks. Bribes must be
            submitted by the end of Saturday to be included in the next week’s cycle.
        </FormSectionDescription>

        <FormRow>
            <DurationInput
                label="Duration (weeks)"
                placeholder="1"
                prefixCustom={
                    <DurationButton onClick={() => adjustDuration(-1)}>
                        <MinusIcon />
                    </DurationButton>
                }
                postfix={
                    <DurationButton onClick={() => adjustDuration(1)}>
                        <PlusIcon />
                    </DurationButton>
                }
                value={duration}
                onChange={({ target }) => setDuration(target.value)}
                style={{ padding: '0rem 6rem' }}
                isCenterAligned
                required
                pattern={maxDuration === 5 ? '[1-5]' : '[0-9]$|^[1-9][0-9]$|^(100)$'}
            />

            <DatePicker
                customInput={<Input label="Start date" />}
                date={selectedDate || null}
                onChange={res => {
                    setSelectedDate(res as Date);
                    if (!res) return setStartDate(null);
                    const { start } = getBribePeriodRange(res, Number(duration));
                    setStartDate(start);
                }}
                calendarStartDay={1}
                filterDate={date => date.getDay() === 1}
                disabledKeyboardNavigation
                minDate={minDate}
                fullWidth
            />

            <DashIcon />
            <DatePicker
                customInput={<DateEndInput label="End date" />}
                disabled
                calendarStartDay={1}
                date={endDate || null}
                dateFormat="MM.dd.yyyy"
                fullWidth
            />
        </FormRow>

        <NextButton
            isBig
            fullWidth
            onClick={onSubmit}
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
    </FormSection>
);
