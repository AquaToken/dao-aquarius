import styled from 'styled-components';

import Dash from 'assets/icons/objects/icon-dash-16.svg';
import Fail from 'assets/icons/status/fail-red.svg';
import Success from 'assets/icons/status/success.svg';

import Button from 'basics/buttons/Button';
import { Stepper } from 'basics/inputs';
import Input from 'basics/inputs/Input';
import { ExternalLink } from 'basics/links';

import { respondDown } from 'styles/mixins';
import { Breakpoints } from 'styles/style-constants';

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

export const TooltipInner = styled.span`
    width: 40rem;
    white-space: pre-line;

    ${respondDown(Breakpoints.md)`
        width: 15rem;
    `}
`;

export const DurationInput = styled(Stepper)`
    margin-right: 4.5rem;

    ${respondDown(Breakpoints.md)`
        margin-right: 0;
        margin-bottom: 5rem;
    `}
`;
