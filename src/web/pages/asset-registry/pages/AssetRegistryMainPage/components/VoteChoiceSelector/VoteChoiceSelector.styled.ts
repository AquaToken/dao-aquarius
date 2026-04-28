import styled from 'styled-components';

import { flexAllCenter } from 'styles/mixins';
import { COLORS } from 'styles/style-constants';

type Variant = 'against' | 'abstain' | 'for';

const getVariantColor = (variant: Variant) => {
    switch (variant) {
        case 'against':
            return COLORS.red500;
        case 'for':
            return COLORS.purple500;
        case 'abstain':
        default:
            return COLORS.gray100;
    }
};

const getTextColor = (variant: Variant) => {
    return variant === 'abstain' ? COLORS.textGray : COLORS.white;
};

export const ChoiceGroup = styled.div`
    display: flex;
    gap: 0.4rem;
`;

export const ChoiceButton = styled.button<{ $variant: Variant; $isActive: boolean }>`
    ${flexAllCenter};
    flex: 1 1 0;
    min-height: 4.8rem;
    border: none;
    border-radius: 1.2rem;
    background: ${({ $variant }) => getVariantColor($variant)};
    color: ${({ $variant }) => getTextColor($variant)};
    opacity: ${({ $isActive }) => ($isActive ? 1 : 0.8)};
    font-size: 2rem;
    line-height: 1;
    cursor: pointer;
`;
