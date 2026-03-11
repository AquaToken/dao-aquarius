import * as React from 'react';
import styled from 'styled-components';

import { Option } from 'types/option';

import { respondDown } from 'styles/mixins';
import { Breakpoints, COLORS, hexWithOpacity } from 'styles/style-constants';

const Container = styled.div`
    display: flex;
    font-size: 3.6rem;
    font-weight: 400;
    line-height: 4.2rem;

    ${respondDown(Breakpoints.sm)`
        font-size: 2.4rem;
        flex-direction: column;
        align-items: center;
    `}
`;

const Tab = styled.div<{ $isActive: boolean }>`
    cursor: pointer;
    color: ${({ $isActive }) =>
        $isActive ? COLORS.textPrimary : `${hexWithOpacity(COLORS.textPrimary, 30)}`};
    white-space: nowrap;

    &:hover {
        color: ${({ $isActive }) => ($isActive ? COLORS.textPrimary : COLORS.gray200)};
    }

    &:not(:last-child) {
        border-right: 0.1rem solid ${COLORS.gray100};
        padding-right: 2.4rem;
        margin-right: 2.4rem;
    }

    ${respondDown(Breakpoints.sm)`
        &:not(:last-child) {
            border-right: none;
            padding-right: 0;
            margin-right: 0;
            border-bottom: 0.1rem solid ${COLORS.gray100};
            padding-bottom: 2.4rem;
            margin-bottom: 2.4rem;
        }
    `}
`;

interface Props<T> {
    options: Option<T>[];
    onChange: (option: T) => void;
    value: T;
}

const SectionPicker = <T,>({ options, onChange, value, ...props }: Props<T>) => (
    <Container {...props}>
        {options.map(option => (
            <Tab
                key={option.value}
                $isActive={value === option.value}
                onClick={() => onChange(option.value)}
            >
                {option.label}
            </Tab>
        ))}
    </Container>
);

export default SectionPicker;
