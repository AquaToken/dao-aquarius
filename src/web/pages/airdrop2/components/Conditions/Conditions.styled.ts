import styled from 'styled-components';

import Button from 'basics/buttons/Button';

import { cardBoxShadow, respondDown } from 'styles/mixins';
import { Breakpoints, COLORS } from 'styles/style-constants';

export const Container = styled.section`
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 78rem;
    margin: -9rem auto 0;
    padding: 3.2rem 1.6rem 1.6rem;
    background: ${COLORS.white};
    border-radius: 0.5rem;
    letter-spacing: 0;
    ${cardBoxShadow};

    ${respondDown(Breakpoints.sm)`
        margin: 1rem auto 0;
        padding: 0 1.6rem;
        box-shadow: none;
        width: initial;
        background-color: transparent;
    `}
`;

export const Heading = styled.h2`
    font-size: 3.6rem;
    font-weight: 400;
    line-height: 4.2rem;
    color: ${COLORS.textPrimary};
    margin-bottom: 1.2rem;

    ${respondDown(Breakpoints.md)`
        font-size: 1.8rem;
        line-height: 3rem;
    `}
`;

export const LedgerLink = styled.p`
    display: flex;
    align-items: center;
    font-size: 1.8rem;
    line-height: 3.2rem;
    color: ${COLORS.textDark};
    margin-bottom: 1.5rem;

    span {
        margin-right: 0.6rem;
    }
`;

export const Cards = styled.div`
    position: relative;
    display: flex;
    align-items: center;

    ${respondDown(Breakpoints.sm)`
        flex-direction: column;
    `}
`;

export const Card = styled.div`
    flex: 1;
    min-width: 0;
    position: relative;
    padding: 3rem;
    text-align: center;

    ${respondDown(Breakpoints.sm)`
        max-width: 40rem;
        background: ${COLORS.white};
        border-radius: 0.5rem;
        margin-bottom: 1.6rem;
        ${cardBoxShadow};
    `}
`;

export const Divider = styled.div`
    flex: none;
    height: 13rem;
    width: 0.1rem;
    background-color: rgba(35, 2, 77, 0.1);

    ${respondDown(Breakpoints.sm)`
        display: none;
    `}
`;

export const Description = styled.div`
    font-size: 1.8rem;
    font-weight: 400;
    line-height: 3.2rem;
    color: ${COLORS.textDark};

    ${respondDown(Breakpoints.md)`
        font-size: 1.4rem;
        line-height: 2.5rem;
    `}
`;

export const FormBlock = styled.div`
    width: 100%;
    padding: 2.5rem 2.4rem 0;
    z-index: 10;

    ${respondDown(Breakpoints.sm)`
        padding: 2.4rem 3.2rem 3.2rem;
        max-width: 40rem;
        background: ${COLORS.white};
        ${cardBoxShadow};
    `}
`;

export const HorizontalDivider = styled.div`
    border-top: 1px solid ${COLORS.gray600};
    width: 100%;
    margin-bottom: 3rem;

    ${respondDown(Breakpoints.sm)`
        display: none;
    `}
`;

export const FormDescription = styled.div`
    color: ${COLORS.textTertiary};
    margin-bottom: 3rem;
    font-size: 1.6rem;
    line-height: 3rem;

    ${respondDown(Breakpoints.sm)`
        font-size: 1.4rem;
        line-height: 2.5rem;
        color: ${COLORS.textSecondary};
        margin-bottom: 1.3rem;
    `}
`;

export const Form = styled.form`
    display: flex;
    justify-content: space-around;
    align-items: center;
    width: 100%;
    margin-bottom: 2.6rem;

    ${respondDown(Breakpoints.sm)`
        margin-bottom: 0;
        flex-direction: column;
    `}
`;

export const StyledButton = styled(Button)`
    margin-left: 2.5rem;

    ${respondDown(Breakpoints.sm)`
        width: 100%;
        margin-top: 2.7rem;
        margin-left: 0;
    `}
`;
