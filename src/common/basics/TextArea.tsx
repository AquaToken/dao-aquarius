import * as React from 'react';
import styled from 'styled-components';

import { textEllipsis } from '../mixins';
import { COLORS } from '../styles';

const StyledArea = styled.textarea`
    height: 34.8rem;
    width: 100%;
    border: 0.1rem solid ${COLORS.gray};
    border-radius: 0.5rem;
    padding: 2.4rem 6.5rem 2.4rem 2.4rem;
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.paragraphText};
    box-sizing: border-box;
    ${textEllipsis};

    resize: none;

    /* Chrome, Safari, Edge, Opera */
    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }

    &::placeholder {
        color: ${COLORS.placeholder};
    }

    &:focus {
        border: 0.2rem solid ${COLORS.purple};
    }
`;

const TextArea = ({ ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>): JSX.Element => {
    return <StyledArea {...props} />;
};

export default TextArea;
