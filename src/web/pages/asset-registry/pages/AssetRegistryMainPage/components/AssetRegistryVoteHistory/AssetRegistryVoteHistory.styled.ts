import styled from 'styled-components';

import { respondDown } from 'styles/mixins';
import { Breakpoints, COLORS, FONT_SIZE } from 'styles/style-constants';

export const Header = styled.div`
    margin-bottom: 2rem;
`;

export const VoteTitle = styled.h3`
    ${FONT_SIZE.lg};
    margin: 0;
    color: ${COLORS.textPrimary};
    font-weight: 700;

    ${respondDown(Breakpoints.md)`
        ${FONT_SIZE.md};
    `}
`;

export const HistoryTable = styled.div`
    width: 100%;
`;

export const Value = styled.div`
    ${FONT_SIZE.md};
    color: ${COLORS.textSecondary};
    font-weight: 400;
`;

export const SupportedByProgress = styled.div`
    width: 100%;
    min-width: 12rem;
`;

export const SupportedByOuter = styled.div`
    position: relative;
    height: 0.8rem;
    width: 100%;
    border-radius: 0.8rem;
    background: ${COLORS.red500};
`;

export const SupportedByInner = styled.div<{ $width: string; $color: string }>`
    position: absolute;
    top: 0;
    left: 0;
    height: 0.8rem;
    width: ${({ $width }) => $width};
    border-radius: ${({ $width }) => ($width === '100%' ? '0.8rem' : '0.8rem 0 0 0.8rem')};
    border-right: ${({ $width }) => ($width === '100%' ? 'none' : `0.1rem solid ${COLORS.white}`)};
    background: ${({ $color }) => $color};
`;
