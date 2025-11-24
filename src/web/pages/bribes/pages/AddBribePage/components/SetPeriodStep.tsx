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

import { NextButton, DateEndInput, DurationInput } from '../AddBribePage.styled';
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
    | 'maxDuration'
    | 'minDate'
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
    maxDuration,
    minDate,
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
                value={duration}
                setValue={setDuration}
                label="Duration (weeks)"
                required={true}
                maxValue={maxDuration}
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
            type="submit"
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
    </FormSection>
);
