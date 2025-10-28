import styled from 'styled-components';

import { respondDown } from 'styles/mixins';
import { Breakpoints, COLORS } from 'styles/style-constants';

export const Container = styled.section`
    width: 100%;
    position: relative;
    display: grid;
    padding: 8rem 10rem 11.6rem;
    font-family: Roboto, sans-serif;
    font-style: normal;
    font-weight: 400;
    letter-spacing: 0;
    grid-template-areas: 'a b' 'c d';
    grid-column-gap: 6rem;
    grid-row-gap: 8rem;
    grid-template-columns: 1fr 1fr;
    align-items: center;
    margin: auto;

    ${respondDown(Breakpoints.md)`
        grid-template-areas: 'a' 'b' 'd' 'c';
        grid-row-gap: 3.8rem;
        grid-template-columns: 1fr;
        padding: 2.1rem 1.6rem 1.6rem;
    `}
`;

export const Text = styled.div`
    max-width: 36.6rem;
    font-size: 1.6rem;
    line-height: 2.9rem;
    color: ${COLORS.textSecondary};

    h4 {
        font-size: 3.5rem;
        line-height: 4.1rem;
        margin-bottom: 1.7rem;
        font-weight: normal;
        color: ${COLORS.textPrimary};
    }

    ${respondDown(Breakpoints.md)`
        justify-self: flex-start !important;
        max-width: initial;
        font-size: 1.4rem;
        line-height: 2.5rem;

        h4 {
            font-size: 2.9rem;
            line-height: 3.3rem;
        }
    `}
`;

export const TextWallets = styled(Text)`
    grid-area: a;
    justify-self: flex-end;
`;

export const TextExchanges = styled(Text)`
    grid-area: d;
`;

export const Icons = styled.div`
    position: relative;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-column-gap: 1.6rem;
    grid-row-gap: 1.6rem;

    ${respondDown(Breakpoints.sm)`
        grid-template-columns: 1fr 1fr;
    `}
`;

export const IconsWallets = styled(Icons)`
    grid-area: b;
`;

export const IconsExchanges = styled(Icons)`
    grid-area: c;
`;

export const Link = styled.a`
    display: flex;
    flex-direction: column;
    align-content: center;
    justify-content: center;
    height: 13rem;
    background: ${COLORS.gray50};
    border-radius: 0.5rem;
    cursor: pointer;
    transition: 0.3s;
    padding: 1rem;

    &:hover {
        transform: scale(1.07);
    }

    svg,
    img {
        margin: auto;
    }
`;
