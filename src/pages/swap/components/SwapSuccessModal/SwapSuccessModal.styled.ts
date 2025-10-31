import styled from 'styled-components';

import { flexAllCenter, flexColumnCenter, respondDown } from 'web/mixins';
import { Breakpoints, COLORS, FONT_SIZE, hexWithOpacity } from 'web/styles';

import ArrowRight from 'assets/icons/arrows/arrow-alt2-16.svg';
import Success from 'assets/icons/status/success.svg';

import { Button } from 'basics/buttons';
import { BlankExternalLink } from 'basics/links';

export const Wrapper = styled.div`
    ${flexColumnCenter};
`;

export const SuccessIcon = styled(Success)`
    height: 8.2rem;
    width: 8.2rem;
    border-radius: 50%;
    box-shadow: 0 1.5rem 3rem 0 ${hexWithOpacity(COLORS.purple500, 30)};
    margin-bottom: 3.2rem;
`;

export const DarkArrow = styled(ArrowRight)`
    path {
        fill: ${COLORS.purple950};
    }

    ${respondDown(Breakpoints.sm)`
        transform: rotate(90deg);
    `}
`;

export const Title = styled.h3`
    margin-bottom: 0.8rem;
    ${FONT_SIZE.lg};
`;

export const Description = styled.p`
    all: unset;
    color: ${COLORS.textGray};
    ${FONT_SIZE.md};
    margin-bottom: 3.2rem;
`;

export const Amounts = styled.div`
    display: flex;
    align-items: center;
    gap: 1.6rem;
    margin-bottom: 3.2rem;

    ${respondDown(Breakpoints.sm)`
        flex-direction: column;
        margin: 3.2rem 0;
    `}
`;

export const Amount = styled.div`
    display: flex;
    align-items: center;
    ${FONT_SIZE.md};
    gap: 0.8rem;
`;

export const Buttons = styled.div`
    display: flex;
    width: 100%;
    gap: 1.6rem;

    ${respondDown(Breakpoints.sm)`
        flex-direction: column;
    `}
`;

export const ExplorerLink = styled(BlankExternalLink)`
    height: 6.6rem;
    border-radius: 2.4rem;
    border: 0.1rem solid ${COLORS.gray100};
    ${flexAllCenter};
    flex: 1;

    ${respondDown(Breakpoints.sm)`
        flex: unset;
        width: 100%;
    `}
`;

export const StyledButton = styled(Button)`
    flex: 1;
    height: 6.6rem !important;
    padding-left: 0;
    padding-right: 0;

    ${respondDown(Breakpoints.sm)`
        flex: unset;
    `}
`;
