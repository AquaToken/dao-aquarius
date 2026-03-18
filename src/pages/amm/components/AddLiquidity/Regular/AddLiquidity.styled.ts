import styled from 'styled-components';

import Revert from 'assets/icons/actions/icon-revert-16x17.svg';

import { Checkbox } from 'basics/inputs';

import { customScroll, flexRowSpaceBetween, noSelect, respondDown } from 'styles/mixins';
import { Breakpoints, COLORS } from 'styles/style-constants';

export const Container = styled.div<{ $isModal: boolean }>`
    width: 100%;
    max-height: ${({ $isModal }) => ($isModal ? 'none' : '82vh')};
    overflow: ${({ $isModal }) => ($isModal ? 'visible' : 'auto')};
    padding-top: 4rem;

    ${({ $isModal }) => !$isModal && customScroll};

    ${respondDown(Breakpoints.md)`
        width: 100%;
        max-height: ${({ $isModal }) => ($isModal ? 'none' : '100vh')};
    `}

    Button {
        width: fit-content;
        margin-left: auto;
    }
`;

export const Form = styled.div`
    display: flex;
    flex-direction: column;
    margin-top: 3rem;

    ${respondDown(Breakpoints.sm)`
        Button {
            width: 100%;
        }
    `}
`;

export const FormRow = styled.div`
    display: flex;
    margin: 3rem 0;
    position: relative;
`;

export const DescriptionRow = styled.div`
    ${flexRowSpaceBetween};

    color: ${COLORS.textGray};

    &:not(:last-child) {
        margin-bottom: 1.6rem;
    }

    span {
        display: flex;
        align-items: center;
        gap: 0.8rem;
    }

    span:last-child {
        color: ${COLORS.textTertiary};
    }
`;

export const PoolRates = styled.span`
    cursor: pointer;
    ${noSelect};
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

    svg {
        margin-left: 0.4rem;
    }

    ${respondDown(Breakpoints.sm)`
        font-size: 1.2rem;
    `}
`;

export const BalanceClickable = styled.span`
    color: ${COLORS.purple500};
    cursor: pointer;
    margin-left: 0.4rem;
`;

export const PoolInfo = styled.div<{ $withCardSpacing: boolean }>`
    display: flex;
    flex-direction: column;
    background-color: ${COLORS.gray50};
    border-radius: 0.6rem;
    padding: ${({ $withCardSpacing }) => ($withCardSpacing ? '2.4rem;' : '0')};
    margin-top: ${({ $withCardSpacing }) => ($withCardSpacing ? '2.4rem;' : '0')};
    margin-bottom: ${({ $withCardSpacing }) => ($withCardSpacing ? '4.8rem;' : '0')};

    ${respondDown(Breakpoints.sm)`
        margin-bottom: 2rem;
    `}
`;

export const TooltipInnerBalance = styled.div`
    display: flex;
    flex-direction: column;
    color: ${COLORS.white};
    font-size: 1.3rem;
    line-height: 1.3rem;
`;

export const TooltipRow = styled.div`
    display: flex;
    justify-content: space-between;
    gap: 1.2rem;

    &:last-child:not(:first-child) {
        font-weight: 700;
    }
`;

export const CheckboxStyled = styled(Checkbox)`
    margin-bottom: 2.4rem;
`;

export const RevertIcon = styled(Revert)`
    margin-left: 0.4rem;
`;
