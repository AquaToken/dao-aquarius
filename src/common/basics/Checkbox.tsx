import * as React from 'react';
import styled from 'styled-components';
import { COLORS } from '../styles';
import { flexAllCenter } from '../mixins';
import Tick from '../assets/img/icon-checkbox-tick.svg';

const CheckboxContainer = styled.div<{ disabled?: boolean }>`
    display: flex;
    flex-direction: row;
    cursor: pointer;
    pointer-events: ${({ disabled }) => (disabled ? 'none' : 'unset')};
`;

const Label = styled.div`
    font-size: 1.6rem;
    line-height: 1.8rem;
    color: ${COLORS.grayText};
`;

const CheckboxInput = styled.div<{ checked: boolean; hasLabel: boolean; disabled?: boolean }>`
    ${flexAllCenter};
    height: 1.6rem;
    width: 1.6rem;
    min-width: 1.6rem;
    border-radius: 0.4rem;
    margin-right: ${({ hasLabel }) => (hasLabel ? '1.6rem' : '0')};
    background: ${({ checked }) => (checked ? COLORS.purple : COLORS.white)};
    border: ${({ checked, disabled }) =>
        checked
            ? `0.1rem solid ${COLORS.purple}`
            : disabled
            ? `0.1rem solid ${COLORS.gray}`
            : `0.1rem solid ${COLORS.grayText}`};

    &:hover {
        border: 0.1rem solid ${COLORS.purple};
    }
`;

const Checkbox = ({
    label,
    checked,
    onChange,
    disabled,
    ...props
}: {
    label?: string;
    checked: boolean;
    onChange: (boolean, event) => void;
    disabled?: boolean;
}) => {
    return (
        <CheckboxContainer
            onClick={(event) => onChange(!checked, event)}
            disabled={disabled}
            {...props}
        >
            <CheckboxInput checked={checked} disabled={disabled} hasLabel={Boolean(label)}>
                {checked && <Tick />}
            </CheckboxInput>
            {Boolean(label) && <Label>{label}</Label>}
        </CheckboxContainer>
    );
};

export default Checkbox;
