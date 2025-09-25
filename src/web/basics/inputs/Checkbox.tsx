import * as React from 'react';
import styled from 'styled-components';

import Tick from 'assets/small-icons/check/icon-checkbox-tick.svg';

import { flexAllCenter } from '../../mixins';
import { COLORS } from '../../styles';

const CheckboxContainer = styled.div<{ $disabled?: boolean }>`
    display: flex;
    flex-direction: row;
    cursor: pointer;
    pointer-events: ${({ $disabled }) => ($disabled ? 'none' : 'unset')};
`;

const Label = styled.div`
    font-size: 1.6rem;
    line-height: 1.8rem;
    color: ${COLORS.textGray};
`;

const CheckboxInput = styled.div<{ $checked: boolean; $hasLabel: boolean; $disabled?: boolean }>`
    ${flexAllCenter};
    height: 1.6rem;
    width: 1.6rem;
    min-width: 1.6rem;
    border-radius: 0.4rem;
    margin-right: ${({ $hasLabel }) => ($hasLabel ? '1.6rem' : '0')};
    background: ${({ $checked }) => ($checked ? COLORS.purple500 : COLORS.white)};
    border: ${({ $checked, $disabled }) =>
        $checked
            ? `0.1rem solid ${COLORS.purple500} `
            : $disabled
            ? `0.1rem solid ${COLORS.gray100}`
            : `0.1rem solid ${COLORS.textGray}`};

    &:hover {
        border: 0.1rem solid ${COLORS.purple500};
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
    onChange: (value: boolean, event: React.MouseEvent) => void;
    disabled?: boolean;
}): React.ReactNode => (
    <CheckboxContainer
        onClick={(event: React.MouseEvent) => onChange(!checked, event)}
        $disabled={disabled}
        {...props}
    >
        <CheckboxInput $checked={checked} $disabled={disabled} $hasLabel={Boolean(label)}>
            {checked && <Tick />}
        </CheckboxInput>
        {Boolean(label) && <Label>{label}</Label>}
    </CheckboxContainer>
);

export default Checkbox;
