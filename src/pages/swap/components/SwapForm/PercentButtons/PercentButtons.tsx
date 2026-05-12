import * as React from 'react';
import styled from 'styled-components';

import useAuthStore from 'store/authStore/useAuthStore';

import { respondDown } from 'styles/mixins';
import { Breakpoints, COLORS } from 'styles/style-constants';

const Container = styled.div`
    display: flex;
`;

const Buttons = styled.div<{ $compact?: boolean }>`
    display: flex;
    gap: ${({ $compact }) => ($compact ? '0.4rem' : '0')};

    ${respondDown(Breakpoints.sm)`
        width: 100%;
    `}
`;

const PercentButton = styled.button<{ $compact?: boolean }>`
    padding: ${({ $compact }) => ($compact ? '0.1rem 0.8rem' : '0 0.4rem')};
    font: inherit;
    font-size: 1.4rem;
    line-height: 1.6rem;
    color: ${COLORS.textGray};
    cursor: pointer;
    flex: ${({ $compact }) => ($compact ? '0 0 auto' : '1')};
    border: none;
    border-radius: 0.4rem;
    background-color: ${({ $compact }) => ($compact ? COLORS.gray50 : 'transparent')};

    &:not(:last-child) {
        margin-right: ${({ $compact }) => ($compact ? '0' : '1.2rem')};
    }

    &:hover {
        color: ${COLORS.textPrimary};
    }

    &:focus-visible {
        outline: 0.2rem solid ${COLORS.purple500};
        outline-offset: 0.2rem;
    }

    ${respondDown(Breakpoints.sm)`
        padding: unset;
        text-align: center;
    `}
`;

const PERCENT_OPTIONS = [25, 50, 75, 100] as const;

interface PercentButtonsProps {
    setPercent: (percent: number) => void;
    compact?: boolean;
}

const PercentButtons = ({ setPercent, compact }: PercentButtonsProps) => {
    const { account } = useAuthStore();

    if (!account) {
        return null;
    }
    return (
        <Container>
            <Buttons $compact={compact}>
                {PERCENT_OPTIONS.map(percent => (
                    <PercentButton
                        key={percent}
                        type="button"
                        $compact={compact}
                        onClick={() => setPercent(percent)}
                    >
                        {percent}%
                    </PercentButton>
                ))}
            </Buttons>
        </Container>
    );
};

export default PercentButtons;
