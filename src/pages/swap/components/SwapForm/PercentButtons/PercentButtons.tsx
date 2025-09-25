import * as React from 'react';
import styled from 'styled-components';

import useAuthStore from 'store/authStore/useAuthStore';

import { respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

const Container = styled.div`
    display: flex;
`;

const Buttons = styled.div`
    display: flex;

    ${respondDown(Breakpoints.sm)`
        width: 100%;
    `}
`;

const PercentButton = styled.div`
    padding: 0 0.4rem;
    font-size: 1.4rem;
    line-height: 1.6rem;
    color: ${COLORS.textGray};
    cursor: pointer;
    flex: 1;

    &:not(:last-child) {
        margin-right: 1.2rem;
    }

    &:hover {
        color: ${COLORS.textPrimary};
    }

    ${respondDown(Breakpoints.sm)`
        padding: unset;
        text-align: center;
    `}
`;

interface PercentButtonsProps {
    setPercent: (percent: number) => void;
}

const PercentButtons = ({ setPercent }: PercentButtonsProps) => {
    const { account } = useAuthStore();

    if (!account) {
        return null;
    }
    return (
        <Container>
            <Buttons>
                <PercentButton onClick={() => setPercent(25)}>25%</PercentButton>
                <PercentButton onClick={() => setPercent(50)}>50%</PercentButton>
                <PercentButton onClick={() => setPercent(75)}>75%</PercentButton>
                <PercentButton onClick={() => setPercent(100)}>100%</PercentButton>
            </Buttons>
        </Container>
    );
};

export default PercentButtons;
