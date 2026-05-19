import styled from 'styled-components';

import ArrowDown from 'assets/icons/arrows/arrow-down-16.svg';

import BlankButton from 'basics/buttons/BlankButton';

import { respondDown } from 'styles/mixins';
import { Breakpoints, COLORS } from 'styles/style-constants';

export const DateFilterContainer = styled.div`
    position: relative;
`;

export const DateFilterButton = styled.div<{ $isOpen: boolean }>`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.2rem;
    width: 100%;
    height: 4.8rem;
    padding: 0 1.6rem;
    border: 0.1rem solid ${({ $isOpen }) => ($isOpen ? COLORS.purple500 : COLORS.gray100)};
    border-radius: 0.5rem;
    color: ${COLORS.textTertiary};
    background: ${COLORS.white};
    font-size: 1.6rem;
    line-height: 1.8rem;
    text-align: left;
    cursor: pointer;
    user-select: none;

    &:hover {
        border-color: ${COLORS.purple500};
    }

    &:focus-visible {
        outline: 0.2rem solid ${COLORS.purple500};
        outline-offset: 0.1rem;
    }
`;

export const DateFilterLabel = styled.span`
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

export const DateFilterActions = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 1.2rem;
    flex: 0 0 auto;
`;

export const ArrowIcon = styled(ArrowDown)<{ $isOpen: boolean }>`
    transform: ${({ $isOpen }) => ($isOpen ? 'rotate(180deg)' : 'none')};
    transition: transform 0.2s ease;
`;

export const DateDropdown = styled.div`
    position: absolute;
    z-index: 20;
    top: calc(100% + 0.8rem);
    left: 0;
    width: 100%;
    min-width: 30.6rem;
    padding: 2.4rem;
    border-radius: 0.5rem;
    background: ${COLORS.white};
    box-shadow: 0 2rem 1.5rem rgba(0, 6, 54, 0.06);

    div.react-datepicker {
        display: flex;
        flex-direction: row;
        align-items: flex-start;
    }

    div.react-datepicker__month-container,
    div.react-datepicker__time-container {
        float: none;
        flex: 0 0 auto;
    }

    ${respondDown(Breakpoints.sm)`
        min-width: 100%;

        div.react-datepicker {
            flex-direction: column;
            align-items: stretch;
        }
    `}
`;

export const DateFields = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1.6rem;
`;

export const DateField = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
    color: ${COLORS.textPrimary};
    font-size: 1.6rem;
    line-height: 2.4rem;
`;

export const DateDropdownDivider = styled.div`
    height: 0.1rem;
    margin: 2.4rem 0;
    background: ${COLORS.gray100};
`;

export const QuickRanges = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 0.8rem;
`;

export const QuickRangeButton = styled(BlankButton)<{ $isActive: boolean }>`
    padding: 0.8rem 1.2rem;
    border: 0;
    border-radius: 0.5rem;
    color: ${COLORS.textPrimary};
    background: ${({ $isActive }) => ($isActive ? COLORS.purple50 : COLORS.gray100)};
    font-size: 1.4rem;
    line-height: 2rem;

    &:hover {
        background: ${COLORS.purple50};
    }
`;
