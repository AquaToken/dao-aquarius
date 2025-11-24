import * as React from 'react';
import styled from 'styled-components';

import Minus from 'assets/icons/nav/icon-minus-16.svg';
import Plus from 'assets/icons/nav/icon-plus-16.svg';

import { Input } from 'basics/inputs';

import { flexAllCenter } from 'styles/mixins';
import { COLORS } from 'styles/style-constants';

const DurationButton = styled.div`
    ${flexAllCenter};
    width: 3rem;
    height: 3rem;
    cursor: pointer;
    user-select: none;

    &:hover {
        background-color: ${COLORS.gray50};
    }
`;

const MinusIcon = styled(Minus)`
    width: 1.6rem;
    height: 1.6rem;
    color: ${COLORS.purple500};
`;

const PlusIcon = styled(Plus)`
    width: 1.6rem;
    height: 1.6rem;
    color: ${COLORS.purple500};
`;

interface Props {
    label?: string;
    placeholder?: string;
    value: string;
    setValue: (value: string) => void;
    maxValue?: number;
    required?: boolean;
}

const Stepper = ({ value, setValue, maxValue, label, required, placeholder, ...props }: Props) => {
    const adjustDuration = (delta: number) => {
        const next = Math.floor(Number(value) + delta);
        if (Number.isNaN(next) || next <= 1) return setValue('1');
        if (maxValue && next > maxValue) return setValue(maxValue.toString());
        setValue(next.toString());
    };

    return (
        <Input
            {...props}
            type="number"
            label={label || 'Count'}
            placeholder={placeholder || '1'}
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
            value={value}
            onChange={({ target }) => setValue(target.value)}
            style={{ padding: '0rem 6rem' }}
            isCenterAligned
            required={required}
            max={maxValue}
            onInvalid={e =>
                (e.target as HTMLInputElement).setCustomValidity(
                    `Only integer less or equal ${maxValue}`,
                )
            }
            onInput={e => (e.target as HTMLInputElement).setCustomValidity('')}
        />
    );
};

export default Stepper;
