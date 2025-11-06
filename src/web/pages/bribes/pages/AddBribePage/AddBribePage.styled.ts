import styled from 'styled-components';

import Minus from 'assets/icons/nav/icon-minus-16.svg';
import Plus from 'assets/icons/nav/icon-plus-16.svg';
import Dash from 'assets/icons/objects/icon-dash-16.svg';
import Fail from 'assets/icons/status/fail-red.svg';
import Success from 'assets/icons/status/success.svg';

import Button from 'basics/buttons/Button';
import Input from 'basics/inputs/Input';
import { ExternalLink } from 'basics/links';

import { flexAllCenter, respondDown } from 'styles/mixins';
import { Breakpoints, COLORS } from 'styles/style-constants';

export const ExternalLinkStyled = styled(ExternalLink)`
    ${respondDown(Breakpoints.md)`
         padding: 0 1.6rem;
    `}
`;

export const PairDivider = styled(Dash)`
    margin: 0 2.2rem;
    min-width: 1.6rem;
    min-height: 1.6rem;

    ${respondDown(Breakpoints.md)`
        margin: 2.4rem 0 3.8rem;
    `}
`;

export const NextButton = styled(Button)`
    margin-top: 4.8rem;
`;

export const AmountInput = styled(Input)`
    margin-left: 6rem;

    ${respondDown(Breakpoints.md)`
         margin-left: 0;
         margin-top: 5.2rem;
    `}
`;

export const DateEndInput = styled(Input)`
    ${respondDown(Breakpoints.md)`
         margin-top: 5.2rem;
    `}
`;

export const FailIcon = styled(Fail)`
    width: 1.6rem;
    height: 1.6rem;
`;

export const SuccessIcon = styled(Success)`
    width: 1.6rem;
    height: 1.6rem;
`;

export const MinusIcon = styled(Minus)`
    width: 1.6rem;
    height: 1.6rem;
    color: ${COLORS.purple500};
`;

export const PlusIcon = styled(Plus)`
    width: 1.6rem;
    height: 1.6rem;
    color: ${COLORS.purple500};
`;

export const TooltipInner = styled.span`
    width: 40rem;
    white-space: pre-line;

    ${respondDown(Breakpoints.md)`
        width: 15rem;
    `}
`;

export const DurationInput = styled(Input)`
    margin-right: 4.5rem;

    ${respondDown(Breakpoints.md)`
        margin-right: 0;
        margin-bottom: 5rem;
    `}
`;

export const DurationButton = styled.div`
    ${flexAllCenter};
    width: 3rem;
    height: 3rem;
    cursor: pointer;
    user-select: none;

    &:hover {
        background-color: ${COLORS.gray50};
    }
`;
