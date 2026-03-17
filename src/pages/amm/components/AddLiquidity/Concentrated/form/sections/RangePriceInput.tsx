import * as React from 'react';
import { NumericFormat } from 'react-number-format';

import { Input } from 'basics/inputs';

import { PriceControlButtons, StepBtn } from '../../styled/ConcentratedAddLiquidity.styled';

type RangePriceInputProps = {
    label: string;
    value: string;
    disabled: boolean;
    isScientific: boolean;
    isFullRange: boolean;
    fullRangeValue: string;
    decrementDisabled?: boolean;
    incrementDisabled?: boolean;
    onChange: (value: string) => void;
    onStepDown: () => void;
    onStepUp: () => void;
};

const RangePriceInput = ({
    label,
    value,
    disabled,
    isScientific,
    isFullRange,
    fullRangeValue,
    decrementDisabled = false,
    incrementDisabled = false,
    onChange,
    onStepDown,
    onStepUp,
}: RangePriceInputProps): React.ReactNode => {
    if (isFullRange) {
        return <Input value={fullRangeValue} readOnly disabled={disabled} label={label} />;
    }

    const postfix = (
        <PriceControlButtons>
            <StepBtn onClick={onStepDown} disabled={disabled || decrementDisabled}>
                -
            </StepBtn>
            <StepBtn onClick={onStepUp} disabled={disabled || incrementDisabled}>
                +
            </StepBtn>
        </PriceControlButtons>
    );

    if (isScientific) {
        return (
            <Input
                value={value}
                onChange={event => onChange(event.target.value)}
                inputMode="decimal"
                disabled={disabled}
                label={label}
                postfix={postfix}
            />
        );
    }

    return (
        <NumericFormat
            value={value}
            onValueChange={(values, sourceInfo) => {
                if (sourceInfo.source === 'event') {
                    onChange(values.value);
                }
            }}
            customInput={Input}
            inputMode="decimal"
            thousandSeparator=","
            decimalScale={7}
            allowNegative={false}
            allowedDecimalSeparators={[',']}
            disabled={disabled}
            label={label}
            postfix={postfix}
        />
    );
};

export default RangePriceInput;
