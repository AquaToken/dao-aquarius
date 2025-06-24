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
                The minimum requirement to qualify is completing the first two tasks:{' '}
                <b>Swap AQUA</b> and <b>Freeze AQUA into ICE for at least 3 months</b>
            </span>
        </Detail>
        <Detail>
            <Star>*</Star>
            <span>
                Tasks #3 and #4 are optional, but we highly recommend completing them to maximize
                your potential rewards.
            </span>
        </Detail>
        <Detail>
            <Star>*</Star>
            <span>
                All participating wallets will be reviewed by the Aquarius team, and rewards will be
                distributed manually.
            </span>
        </Detail>
    </Container>
);

export default Details;
