import * as React from 'react';
import styled from 'styled-components';

import Input, { InputProps } from 'basics/inputs/Input';

import { respondDown } from '../../mixins';
import { Breakpoints, COLORS } from '../../styles';

const BlankInputComponent = styled(Input)<{ $length: number }>`
    input {
        background: none;
        border: none;
        padding: 0;
        border-radius: 0;
        width: 100%;
        outline: none;
        transition: font-size 0.2s ease;
        font-size: ${({ $length }) =>
            $length < 10 ? '3.6rem' : $length < 14 ? '2.5rem' : $length < 20 ? '1.8rem' : '1.6rem'};

        &:focus {
            border: none;
        }

        ${respondDown(Breakpoints.sm)`
            font-size: ${({ $length }) =>
                +$length < 8
                    ? '3.6rem'
                    : +$length < 12
                    ? '2.5rem'
                    : +$length < 16
                    ? '1.8rem'
                    : +$length < 19
                    ? '1.6rem'
                    : '1.4rem'};
        `}

        &:disabled {
            color: ${COLORS.darkGrayText};
        }
    }
`;
const BlankInput = ({ ...props }: InputProps) => (
    <BlankInputComponent {...props} $length={(props.value as string)?.length ?? 0} />
);

export default BlankInput;
