import styled from 'styled-components';

import Button from 'basics/buttons/Button';

import {
    flexAllCenter,
    flexColumn,
    flexColumnCenter,
    flexRowSpaceBetween,
    respondDown,
} from 'styles/mixins';
import { Breakpoints, COLORS, FONT_SIZE, hexWithOpacity } from 'styles/style-constants';

export const Container = styled.div`
    padding-top: 2.4rem;
`;

export const Section = styled.div`
    ${flexColumn};
    gap: 2.4rem;
`;

export const CardStack = styled.div`
    ${flexColumn};
    gap: 2.4rem;
`;

export const FormRow = styled.div`
    width: 100%;
    margin-top: 5rem;
`;

export const Balance = styled.div`
    ${FONT_SIZE.sm};
    color: ${COLORS.textGray};
    white-space: nowrap;
`;

export const BalanceClickable = styled.span`
    color: ${COLORS.purple500};
    cursor: pointer;
`;

export const RangeBlock = styled.div`
    ${flexColumn};
    gap: 2.4rem;
`;

export const RangeTitleRow = styled.div`
    ${flexRowSpaceBetween};
    align-items: baseline;
    gap: 1.2rem;
`;

export const RangeTitle = styled.h6`
    margin: 0;
    ${FONT_SIZE.lg};
    color: ${COLORS.textPrimary};
    font-weight: 700;
`;

export const CurrentPrice = styled.div`
    ${FONT_SIZE.sm};
    color: ${COLORS.textGray};
    text-align: right;
    white-space: nowrap;
`;

export const Presets = styled.div`
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.8rem;

    ${respondDown(Breakpoints.sm)`
        grid-template-columns: 1fr;
    `}
`;

export const PresetButton = styled.button<{ $active?: boolean }>`
    width: 100%;
    background: ${({ $active }) => ($active ? COLORS.white : COLORS.gray50)};
    border: 0.4rem solid ${({ $active }) => ($active ? COLORS.purple500 : COLORS.transparent)};
    border-radius: 0.5rem;
    min-height: 6.8rem;
    color: ${COLORS.textPrimary};
    cursor: pointer;
    transition:
        background-color 0.2s ease,
        box-shadow 0.2s ease;

    &:hover:not(:disabled) {
        background: ${({ $active }) => ($active ? COLORS.white : COLORS.gray100)};
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

export const PresetButtonInner = styled.div<{ $active?: boolean }>`
    ${flexColumnCenter};
    min-height: 6rem;
    height: 100%;
    width: 100%;
    padding: 1.6rem;
    gap: 0.4rem;
    text-align: center;
`;

export const RangeChartWrap = styled.div`
    margin: 4rem 0 2rem;
`;

export const PresetTitle = styled.span`
    ${FONT_SIZE.sm};
    font-weight: 700;
    white-space: nowrap;
`;

export const PresetRange = styled.span`
    ${FONT_SIZE.sm};
    color: ${COLORS.textGray};
`;

export const PresetTooltipText = styled.div`
    width: 100%;
    white-space: normal;
    text-align: center;
    ${FONT_SIZE.xs};
`;

export const RangeGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 2.4rem;
    margin-top: 5rem;

    ${respondDown(Breakpoints.sm)`
        grid-template-columns: 1fr;
    `}
`;

export const StepBtn = styled.button`
    width: 2.4rem;
    min-width: 2.4rem;
    height: 2.4rem;
    border: none;
    border-radius: 0.7rem;
    background: ${COLORS.gray50};
    color: ${COLORS.textPrimary};
    ${FONT_SIZE.md};
    ${flexAllCenter};
    cursor: pointer;

    &:hover {
        background: ${COLORS.gray100};
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

export const PriceControlButtons = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.8rem;
    margin-left: auto;
`;

export const RangeSummary = styled.div`
    background: ${COLORS.gray50};
    border-radius: 1rem;
    padding: 2.4rem;
`;

export const SummaryRow = styled.div`
    ${flexRowSpaceBetween};
    gap: 2.4rem;
    min-height: 2rem;
`;

export const SummaryLabel = styled.span`
    ${FONT_SIZE.sm};
    color: ${hexWithOpacity(COLORS.textSecondary, 70)};
`;

export const SummaryValue = styled.div`
    display: inline-flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.8rem;
    flex-wrap: wrap;
    text-align: right;
    ${FONT_SIZE.md};
    color: ${COLORS.textPrimary};
`;

export const SummaryRows = styled.div`
    ${flexColumn};
    gap: 1.6rem;
`;

export const SummaryAmounts = styled.div`
    display: inline-flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.8rem 1.2rem;
    flex-wrap: wrap;
    ${FONT_SIZE.md};
    color: ${COLORS.textPrimary};
`;

export const SummaryAmountItem = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.8rem;
`;

export const DepositFooter = styled.div`
    position: sticky;
    bottom: 0;
    background: ${COLORS.white};
    padding: 4.8rem 0 0;
    z-index: 10;
`;
