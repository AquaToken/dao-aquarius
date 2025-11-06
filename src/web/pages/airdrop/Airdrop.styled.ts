import styled from 'styled-components';

import { cardBoxShadow, respondDown } from 'styles/mixins';
import { Breakpoints, COLORS } from 'styles/style-constants';

export const Container = styled.div`
    height: 100%;
    position: relative;
    overflow: auto;
    scroll-behavior: smooth;
    flex: 1 0 auto;

    ${respondDown(Breakpoints.md)`
        background-color: ${COLORS.gray50};
        padding-bottom: 0;
    `}
`;

export const Socials = styled.aside`
    position: absolute;
    height: 100%;
    width: 100%;
    top: 0;
    left: 0;
    min-height: 70rem;
    max-height: 102rem;
`;

export const Main = styled.section`
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-family: Roboto, sans-serif;
    background-color: ${COLORS.gray50};
    padding-top: 13rem;
    padding-bottom: 16rem;
`;

export const Title = styled.h1`
    font-size: 8rem;
    font-weight: 700;
    line-height: 9.4rem;
    color: ${COLORS.textPrimary};

    ${respondDown(Breakpoints.xl)`font-size: 7rem;`}
    ${respondDown(Breakpoints.lg)`font-size: 4.5rem;`}
    ${respondDown(Breakpoints.sm)`
        font-size: 2.4rem;
        line-height: 2.5rem;
    `}
`;

export const Description = styled.div`
    margin: 3.2rem 0 10.2rem;
    max-width: 82rem;
    padding: 0 1rem;
    font-size: 1.8rem;
    line-height: 3.2rem;
    text-align: center;
    color: ${COLORS.textDark};

    ${respondDown(Breakpoints.xl)`
        max-width: 73rem;
        font-size: 1.6rem;
    `}

    ${respondDown(Breakpoints.lg)`
        max-width: 73rem;
        font-size: 1.6rem;
        line-height: 2.5rem;
        margin: 1.5rem 0 10.2rem;
    `}

    ${respondDown(Breakpoints.sm)`
        max-width: 50rem;
        margin: 1.5rem 0 4.2rem;
    `}
`;

export const Cards = styled.div`
    display: flex;
    justify-content: center;
    align-items: stretch;
    width: 100%;
    height: min-content;

    ${respondDown(Breakpoints.sm)`
        flex-direction: column;
        padding: 0 1rem;
        align-items: center;
    `}
`;

export const Card = styled.div`
    position: relative;
    width: 58rem;
    padding: 6rem;
    background: ${COLORS.white};
    border-radius: 0.5rem;
    ${cardBoxShadow};

    &:first-child {
        margin-right: 6rem;
    }

    ${respondDown(Breakpoints.xl)`
        width: 46rem;
        min-height: 32rem;
        padding: 4rem;
        &:first-child { margin-right: 4rem; }
    `}

    ${respondDown(Breakpoints.lg)`
        width: 37rem;
        min-height: 27rem;
        padding: 2.5rem;
        &:first-child { margin-right: 2.5rem; }
    `}

    ${respondDown(Breakpoints.sm)`
        width: 100%;
        max-width: 39rem;
        min-height: 27rem;
        padding: 2.5rem;
        &:first-child {
            margin-right: 0;
            margin-bottom: 1.6rem;
        }
    `}
`;

export const Heading = styled.div`
    font-size: 3.6rem;
    font-weight: 400;
    line-height: 4.2rem;
    margin-bottom: 0.4rem;
    color: ${COLORS.textPrimary};

    ${respondDown(Breakpoints.xl)`font-size: 3.4rem;`}
    ${respondDown(Breakpoints.lg)`font-size: 2.9rem; line-height: 3.3rem;`}
`;

export const Label = styled.div`
    display: flex;
    align-items: center;
    width: min-content;
    padding: 0.7rem 0.9rem 0.7rem 0.7rem;
    background-color: ${COLORS.purple400};
    border-radius: 0.5rem;
    font-size: 1.2rem;
    font-weight: 700;
    color: ${COLORS.white};
    white-space: nowrap;
`;

export const Text = styled.div`
    max-width: 36.6rem;
    margin: 2.4rem 0;
    font-size: 1.6rem;
    line-height: 2.9rem;
    color: ${COLORS.textDark};

    ${respondDown(Breakpoints.xl)`max-width: 32.6rem; font-size: 1.4rem;`}
    ${respondDown(Breakpoints.lg)`max-width: 22rem; font-size: 1.4rem; line-height: 2.5rem;`}
    ${respondDown(Breakpoints.sm)`margin: 0.4rem 0; max-width: 29rem;`}
`;

export const Phases = styled.div`
    display: flex;
    align-items: center;
    font-size: 1.8rem;
    line-height: 3.2rem;

    svg {
        width: 1.5rem;
        height: 1.9rem;
        margin-right: 0.6rem;
    }

    b {
        margin-right: 0.6rem;
    }

    ${respondDown(Breakpoints.lg)`font-size: 1.6rem;`}
`;
