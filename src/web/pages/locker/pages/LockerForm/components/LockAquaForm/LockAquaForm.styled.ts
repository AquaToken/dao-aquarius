import styled from 'styled-components';

import DelegateLogo from 'assets/delegate/delegate-promo.svg';
import Info from 'assets/icons/status/icon-info-16.svg';
import Ice from 'assets/tokens/ice-logo.svg';

import TokenAmountFormField from 'basics/form/TokenAmountFormField';

import { flexRowSpaceBetween, respondDown } from 'styles/mixins';
import { Breakpoints, COLORS } from 'styles/style-constants';

/* ------------------------------ Form Fields ------------------------------ */

export const TokenAmountFormFieldStyled = styled(TokenAmountFormField)`
    margin-bottom: 0.8rem;
`;

/* ------------------------------ Layout ------------------------------ */

export const YouWillGet = styled.div`
    display: flex;
    padding: 0 0.8rem;
    margin: 3.2rem 0;
    align-items: center;
    justify-content: space-between;
`;

export const YouWillGetLabel = styled.span`
    font-weight: 400;
    font-size: 1.4rem;
    line-height: 2rem;
    color: ${COLORS.textSecondary};
    opacity: 0.7;
    white-space: nowrap;
    margin-right: 0.6rem;
`;

export const YouWillGetAmount = styled.div`
    font-weight: 700;
    font-size: 2rem;
    line-height: 2.8rem;
    color: ${COLORS.textPrimary};
    display: flex;
    align-items: center;

    span {
        word-break: break-word;
    }
`;

/* ------------------------------ Icons ------------------------------ */

export const IceLogo = styled(Ice)`
    height: 3.2rem;
    width: 3.2rem;
    min-width: 3.2rem;
    margin-right: 0.8rem;
`;

export const IceLogoSmall = styled(Ice)`
    height: 1.8rem;
    width: 1.8rem;
    margin-right: 0.5rem;
`;

export const InfoIcon = styled(Info)`
    margin-left: 0.8rem;
`;

/* ------------------------------ Tooltip ------------------------------ */

export const TooltipInner = styled.div`
    display: flex;
    flex-direction: column;
    color: ${COLORS.textPrimary};
    width: fit-content;
`;

export const TooltipRow = styled.div`
    ${flexRowSpaceBetween};
    gap: 2rem;
    padding: 0.4rem 0;
    font-weight: 400;

    span:first-child {
        font-size: 1.4rem;
        line-height: 2rem;
        color: ${COLORS.textGray};
    }

    span:last-child {
        display: flex;
        align-items: center;
        font-size: 1.6rem;
        line-height: 2.8rem;
        color: ${COLORS.textTertiary};
    }
`;

/* ------------------------------ Modal Background ------------------------------ */

export const ModalBG = styled(DelegateLogo)`
    object-position: center center;
    height: 28.2rem;
    width: 100%;

    ${respondDown(Breakpoints.md)`
    width: 100%;
  `}
`;
