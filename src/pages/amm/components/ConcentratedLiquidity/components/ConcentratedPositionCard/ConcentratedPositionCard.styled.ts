import styled from 'styled-components';

import { flexColumn, flexRowSpaceBetween } from 'styles/mixins';
import { COLORS, FONT_SIZE, hexWithOpacity } from 'styles/style-constants';

export const PositionCard = styled.div<{ $compact?: boolean }>`
    ${flexColumn};
    gap: ${({ $compact }) => ($compact ? '1.2rem' : '1.6rem')};
    width: 100%;
    box-sizing: border-box;
    padding: 0;
    background: ${COLORS.transparent};
    border: none;
    border-radius: 0;
`;

export const PositionTokenRow = styled.div<{ $compact?: boolean }>`
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: ${({ $compact }) => ($compact ? '1.6rem' : '2.4rem')};
    width: 100%;
`;

export const PositionTokenItem = styled.div`
    display: inline-flex;
    align-items: center;
    flex: 0 0 auto;
    max-width: 100%;
    gap: 0.4rem;
    min-width: 0;
`;

export const PositionTokenValue = styled.span<{ $compact?: boolean }>`
    ${({ $compact }) => ($compact ? FONT_SIZE.sm : FONT_SIZE.md)};
    font-weight: 700;
    color: ${COLORS.textTertiary};
    line-height: ${({ $compact }) => ($compact ? '1.6rem' : '1.8rem')};
    white-space: nowrap;
`;

export const PositionLogoWrap = styled.div`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.6rem;
    height: 1.6rem;
    min-width: 1.6rem;
    border: 0.4rem solid ${COLORS.white};
    border-radius: 10rem;
    box-sizing: content-box;
`;

export const PositionInfoRows = styled.div<{ $compact?: boolean }>`
    ${flexColumn};
    gap: ${({ $compact }) => ($compact ? '0.8rem' : '1.6rem')};
    width: 100%;
`;

export const PositionInfoRow = styled.div<{ $compact?: boolean; $alignTop?: boolean }>`
    ${flexRowSpaceBetween};
    align-items: ${({ $alignTop }) => ($alignTop ? 'flex-start' : 'center')};
    gap: ${({ $compact }) => ($compact ? '1.6rem' : '2.4rem')};
    min-height: ${({ $compact }) => ($compact ? '1.6rem' : '2rem')};
`;

export const PositionInfoLabel = styled.span<{ $compact?: boolean }>`
    ${({ $compact }) => ($compact ? FONT_SIZE.xs : FONT_SIZE.sm)};
    color: ${hexWithOpacity(COLORS.textSecondary, 70)};
    line-height: ${({ $compact }) => ($compact ? '1.6rem' : '2rem')};
`;

export const PositionInfoValue = styled.div<{ $compact?: boolean; $allowWrap?: boolean }>`
    ${({ $compact }) => ($compact ? FONT_SIZE.sm : FONT_SIZE.md)};
    color: ${COLORS.textTertiary};
    line-height: ${({ $compact }) => ($compact ? '1.6rem' : '1.8rem')};
    text-align: right;
    white-space: ${({ $allowWrap }) => ($allowWrap ? 'normal' : 'nowrap')};
    overflow-wrap: ${({ $allowWrap }) => ($allowWrap ? 'anywhere' : 'normal')};
    max-width: ${({ $allowWrap }) => ($allowWrap ? '20rem' : 'none')};
`;
