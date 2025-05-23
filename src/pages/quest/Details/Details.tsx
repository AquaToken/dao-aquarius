import * as React from 'react';
import styled from 'styled-components';

import { respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

const Container = styled.div`
    display: flex;
    gap: 3.2rem;
    border-radius: 2.4rem;
    padding: 2.4rem;
    background-color: ${COLORS.lightGray};

    ${respondDown(Breakpoints.md)`
        flex-direction: column;
    `}
`;

const Star = styled.span`
    font-weight: 700;
    font-size: 2.4rem;
    line-height: 2.4rem;
    color: ${COLORS.purple};
`;

const Detail = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    font-weight: 400;
    font-size: 1.4rem;
    line-height: 2.4rem;
    color: ${COLORS.darkGrayText};
`;

const Details = () => (
    <Container>
        <Detail>
            <Star>*</Star>
            <span>
                Minimum number of completed tasks are the first 2 - you must buy AQUA and freeze
                AQUA into ICE for at least 3 months
            </span>
        </Detail>
        <Detail>
            <Star>*</Star>
            <span>
                You can skip the tasks #3 and #4 but we suggest you complete them as well to
                maximize your returns!
            </span>
        </Detail>
        <Detail>
            <Star>*</Star>
            <span>
                Participating wallets will be checked by Aquarius team and rewards will be
                distributed manually
            </span>
        </Detail>
    </Container>
);

export default Details;
