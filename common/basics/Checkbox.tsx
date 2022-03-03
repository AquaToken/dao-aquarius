import * as React from 'react';
import styled from 'styled-components';
import { COLORS } from '../styles';
import { flexAllCenter } from '../mixins';
import Tick from '../assets/img/icon-checkbox-tick.svg';

const CheckboxContainer = styled.div`
    display: flex;
    flex-direction: row;
    cursor: pointer;
`;

const Label = styled.div`
    font-size: 1.6rem;
    line-height: 1.8rem;
    color: ${COLORS.grayText};
`;

const CheckboxInput = styled.div<{ checked: boolean }>`
    height: 1.6rem;
    width: 1.6rem;
    min-width: 1.6rem;
    border-radius: 0.4rem;
    margin-right: 1.6rem;
    background: ${({ checked }) => (checked ? COLORS.purple : COLORS.white)};
    border: ${({ checked }) =>
        checked ? `0.1rem solid ${COLORS.purple}` : `0.1rem solid ${COLORS.gray}`};
    ${flexAllCenter};

    &:hover {
        border: 0.1rem solid ${COLORS.purple};
    }
`;

const Checkbox = ({
    label,
    checked,
    onChange,
    ...props
}: {
    label: string;
    checked: boolean;
    onChange: (boolean) => void;
}) => {
    return (
        <CheckboxContainer onClick={() => onChange(!checked)} {...props}>
            <CheckboxInput checked={checked}>{checked && <Tick />}</CheckboxInput>
            <Label>{label}</Label>
        </CheckboxContainer>
    );
};

export default Checkbox;
