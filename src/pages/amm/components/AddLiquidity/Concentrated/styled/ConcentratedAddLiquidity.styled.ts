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
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;

    ${respondDown(Breakpoints.sm)`
        grid-template-columns: 1fr;
    `}
`;

export const PresetButton = styled.button<{ $active?: boolean }>`
    width: 100%;
    border: 0.2rem solid ${({ $active }) => ($active ? COLORS.purple500 : COLORS.transparent)};
    background: ${({ $active }) => ($active ? COLORS.white : COLORS.gray50)};
    border-radius: 1rem;
    min-height: 9.2rem;
    padding: 1.8rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    gap: 0.8rem;
    font-size: 1.6rem;
    color: ${COLORS.textPrimary};
    cursor: pointer;
    transition:
        border-color 0.2s ease,
        background-color 0.2s ease;

    &:hover:not(:disabled) {
        background: ${COLORS.gray100};
        border-color: ${({ $active }) => ($active ? COLORS.purple500 : COLORS.gray100)};
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

export const RangeChartWrap = styled.div`
    margin: 4rem 0 2rem;
`;

export const PresetTitle = styled.span`
    font-size: 1.6rem;
    line-height: 2rem;
    font-weight: 700;
    white-space: nowrap;
`;

export const PresetRange = styled.span`
    font-size: 1.4rem;
    line-height: 1.8rem;
    color: ${COLORS.textGray};
`;

export const PresetTooltipText = styled.div`
    width: 100%;
    white-space: normal;
    text-align: center;
    font-size: 1.3rem;
    line-height: 1.6rem;
`;

export const RangeGrid = styled.div`
    margin-top: 6rem;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 2rem;

    ${respondDown(Breakpoints.sm)`
        grid-template-columns: 1fr;
    `}
`;

export const StepBtn = styled.button`
    width: 3.2rem;
    min-width: 3.2rem;
    height: 3.2rem;
    border: none;
    border-radius: 0.8rem;
    background: ${COLORS.gray50};
    color: ${COLORS.textPrimary};
    font-size: 1.8rem;
    line-height: 1;
    cursor: pointer;
`;

export const PriceControlButtons = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.8rem;
    margin-left: auto;
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
