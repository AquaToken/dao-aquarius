import styled from 'styled-components';

import { respondDown } from 'styles/mixins';
import { Breakpoints, COLORS } from 'styles/style-constants';

export const Container = styled.section`
    width: 100%;
    position: relative;
    display: flex;
    justify-content: center;
    background: ${COLORS.textTertiary};
    font-family: Roboto, sans-serif;
    letter-spacing: 0;
    padding: 8rem 0;
    margin-top: 8rem;

    ${respondDown(Breakpoints.lg)`
        margin-bottom: 8rem;
    `}
`;

export const Wrapper = styled.div`
    width: 100%;
    max-width: 142rem;
    padding: 0 10rem;

    ${respondDown(Breakpoints.sm)`
        padding: 0 1.6rem;
        max-width: 55rem;
    `}

    a {
        color: ${COLORS.white};

        svg {
            path {
                fill: ${COLORS.white};
            }
        }
    }
`;

export const Title = styled.div`
    margin-bottom: 1.6rem;
    font-size: 3.6rem;
    line-height: 4.2rem;
    color: ${COLORS.white};

    ${respondDown(Breakpoints.lg)`
        margin-bottom: 0.8rem;
        font-size: 2.9rem;
        line-height: 3.3rem;
    `}
`;

export const Date = styled.div`
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.gray200};

    ${respondDown(Breakpoints.lg)`
        font-size: 1.4rem;
        line-height: 2.8rem;
        color: ${COLORS.white};
    `}
`;

export const Table = styled.div`
    display: grid;
    width: 100%;
    grid-template-columns: 1fr 1fr 1fr;
    grid-row-gap: 4.6rem;
    margin-top: 5.2rem;
    margin-bottom: 4rem;

    & > div {
        margin-right: 1.5rem;
    }

    ${respondDown(Breakpoints.lg)`
        grid-row-gap: 4rem;
        margin-top: 3.8rem;
    `}

    ${respondDown(Breakpoints.sm)`
        grid-template-columns: 100%;
    `}
`;

export const Count = styled.div`
    font-size: 3.6rem;
    line-height: 4.2rem;
    color: ${COLORS.white};

    ${respondDown(Breakpoints.lg)`
        font-size: 1.6rem;
        line-height: 2.3rem;
    `}
`;

export const Description = styled.div`
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.gray200};

    ${respondDown(Breakpoints.lg)`
        font-size: 1.4rem;
        line-height: 2.5rem;
    `}
`;
