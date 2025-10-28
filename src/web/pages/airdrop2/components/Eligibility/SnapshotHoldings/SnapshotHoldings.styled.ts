import styled from 'styled-components';

import { respondDown } from 'styles/mixins';
import { Breakpoints, COLORS } from 'styles/style-constants';

export const Container = styled.div`
    display: block;
    padding: 3rem 3rem 2rem;
    background: ${COLORS.gray50};
    border-radius: 0.5rem;
    margin-top: 2rem;
`;

export const Title = styled.div`
    font-size: 2rem;
    font-weight: 700;
    line-height: 2.8rem;
    color: ${COLORS.textPrimary};
    margin-bottom: 0.8rem;
`;

export const Date = styled.div`
    font-size: 1.4rem;
    line-height: 2rem;
    color: ${COLORS.textGray};
    margin-bottom: 3.2rem;
`;

export const Balances = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    padding-bottom: 4.4rem;

    ${respondDown(Breakpoints.sm)`
        grid-template-columns: 1fr;
        grid-row-gap: 3rem;
    `}
`;

export const Asset = styled.div`
    display: flex;
    align-items: center;
    font-size: 1.4rem;
    line-height: 2rem;
    color: ${COLORS.textSecondary};

    svg {
        margin-right: 0.8rem;
        height: 2.4rem;
        width: 2.4rem;
    }
`;

export const Amount = styled.div`
    font-size: 2rem;
    font-weight: 700;
    line-height: 2.8rem;
    color: ${COLORS.textPrimary};
    margin-top: 1.6rem;

    ${respondDown(Breakpoints.sm)`
        margin-top: 0.6rem;
    `}
`;

export const AmmAmount = styled.div`
    display: flex;
    align-items: center;
    font-size: 1.4rem;
    line-height: 2rem;
    color: ${COLORS.textPrimary};
    margin-top: 1.6rem;

    ${respondDown(Breakpoints.sm)`
        margin-top: 0.6rem;
    `}
`;

export const LockAmount = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-top: 0.1rem dashed ${COLORS.gray100};
    padding-top: 3.2rem;
    margin-bottom: 1rem;
    font-size: 1.6rem;
    line-height: 2.9rem;
    color: ${COLORS.textDark};

    ${respondDown(Breakpoints.sm)`
       display: block;
    `}
`;

export const BalanceLabel = styled.div<{ $color: string; $textColor: string }>`
    width: min-content;
    height: 1.9rem;
    border-radius: 0.3rem;
    text-align: center;
    line-height: 1.9rem;
    font-size: 1rem;
    font-weight: bold;
    background: ${({ $color }) => $color};
    color: ${({ $textColor }) => $textColor};
    margin-right: 0.7rem;
    padding: 0 0.8rem;
    white-space: nowrap;
`;
