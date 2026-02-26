import styled from 'styled-components';

import { respondDown } from 'styles/mixins';
import { Breakpoints, COLORS } from 'styles/style-constants';

export const Container = styled.div`
    padding-top: 2.4rem;
`;

export const Section = styled.div`
    &:not(:last-child) {
        margin-bottom: 3.2rem;
        padding-bottom: 3.2rem;
        border-bottom: 0.1rem solid ${COLORS.gray100};
    }
`;

export const CardStack = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2rem;
`;

export const FormRow = styled.div`
    display: flex;
    margin: 3rem 0;
    position: relative;
`;

export const Balance = styled.div`
    position: absolute;
    bottom: calc(100% + 1.2rem);
    right: 0;
    font-size: 1.6rem;
    line-height: 1.8rem;
    color: ${COLORS.textTertiary};
    display: flex;
    align-items: center;
`;

export const BalanceClickable = styled.span`
    color: ${COLORS.purple500};
    cursor: pointer;
    margin-left: 0.4rem;
`;

export const RangeBlock = styled.div``;

export const RangeTitleRow = styled.div`
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 1.2rem;
    margin-bottom: 2rem;
`;

export const RangeTitle = styled.h6`
    margin: 0;
    font-size: 2.4rem;
    line-height: 2.8rem;
    color: ${COLORS.textPrimary};
`;

export const CurrentPrice = styled.div`
    font-size: 1.4rem;
    color: ${COLORS.textGray};
`;

export const Presets = styled.div`
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;

    ${respondDown(Breakpoints.sm)`
        grid-template-columns: 1fr 1fr;
    `}
`;

export const PresetButton = styled.button<{ $active?: boolean }>`
    border: none;
    background: ${({ $active }) => ($active ? COLORS.purple100 : COLORS.gray50)};
    border-radius: 1rem;
    height: 4.4rem;
    font-size: 1.6rem;
    color: ${({ $active }) => ($active ? COLORS.purple500 : COLORS.textPrimary)};
    cursor: pointer;
    font-weight: ${({ $active }) => ($active ? 700 : 400)};
`;

export const RangeGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
`;

export const PriceControl = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
`;

export const Label = styled.div`
    font-size: 1.4rem;
    color: ${COLORS.textGray};
    margin-bottom: 1rem;
`;

export const StepBtn = styled.button`
    width: 4.4rem;
    min-width: 4.4rem;
    height: 4.4rem;
    border: none;
    border-radius: 1rem;
    background: ${COLORS.gray50};
    color: ${COLORS.textPrimary};
    font-size: 2rem;
    cursor: pointer;
`;

export const PriceInput = styled.input`
    flex: 1;
    height: 4.4rem;
    border: none;
    border-radius: 1rem;
    background: ${COLORS.gray50};
    padding: 0 1.2rem;
    font-size: 2.4rem;
    color: ${COLORS.textPrimary};
    text-align: center;
`;

export const RangeSummary = styled.div`
    margin-top: 2rem;
    background: ${COLORS.gray50};
    border: 0.1rem solid ${COLORS.gray100};
    border-radius: 1.2rem;
    padding: 1.6rem;
`;

export const SummaryMain = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
    font-size: 1.4rem;
    color: ${COLORS.textGray};

    span:first-child {
        color: ${COLORS.textGray};
    }

    span:last-child {
        text-align: right;
        color: ${COLORS.textTertiary};
    }
`;

export const SummarySub = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
    margin-top: 1rem;
    font-size: 1.4rem;
    color: ${COLORS.textGray};

    span:last-child {
        text-align: right;
        color: ${COLORS.textTertiary};
    }
`;

export const SummaryRows = styled.div`
    margin-top: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

export const SummaryValueRow = styled.div`
    display: flex;
    justify-content: space-between;
    font-size: 1.4rem;
    color: ${COLORS.textGray};

    span:first-child {
        color: ${COLORS.textGray};
    }

    span:last-child {
        display: inline-flex;
        align-items: center;
        gap: 0.6rem;
        color: ${COLORS.textTertiary};
    }
`;
