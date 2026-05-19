import styled from 'styled-components';

import { Input } from 'basics/inputs';
import BlankButton from 'basics/buttons/BlankButton';

import { COLORS } from 'styles/style-constants';

export const AccountInput = styled(Input)<{
    $hasLargePostfix: boolean;
    $hasAccountPrefix: boolean;
}>`
    & > div:first-of-type {
        left: 1.6rem;
        display: flex;
        align-items: center;
    }

    input {
        padding-left: ${({ $hasAccountPrefix }) => ($hasAccountPrefix ? '3.6rem' : '1.6rem')};
        padding-right: ${({ $hasLargePostfix }) => ($hasLargePostfix ? '18.4rem' : '4.8rem')};
    }

    input + div {
        right: 1.6rem;
        display: flex;
        align-items: center;
    }

    ${({ $hasLargePostfix }) =>
        $hasLargePostfix
            ? `
                input + div {
                    top: 0;
                    right: 0;
                    height: 100%;
                    transform: none;
                }
            `
            : ''}
`;

export const PastePostfixButton = styled(BlankButton)`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 17.6rem;
    height: 100%;
    padding: 0.8rem 1.2rem;
    border: 0;
    border-radius: 0 0.5rem 0.5rem 0;
    color: ${COLORS.textPrimary};
    background: ${COLORS.gray100};
    white-space: nowrap;

    &:hover {
        background: ${COLORS.gray50};
    }
`;

export const PastePostfixContent = styled.span`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.8rem;
    width: 100%;
    height: 100%;
`;

export const PastePostfixLabel = styled.span`
    display: flex;
    align-items: center;
    height: 100%;
    color: ${COLORS.textPrimary};
    font-size: 1.6rem;
    line-height: 2.4rem;
`;
