import * as React from 'react';
import styled from 'styled-components';

import { cardBoxShadow, respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import Icon from 'assets/icons/status/success.svg';

const Container = styled.section`
    display: flex;
    flex-direction: column;
    ${cardBoxShadow};
    padding: 3.6rem;
    border-radius: 4.4rem;
    gap: 2.4rem;
    background-color: ${COLORS.white};
    z-index: 100;
    position: relative;
`;

const Title = styled.h2`
    font-weight: 700;
    font-size: 2rem;
    line-height: 2.8rem;
    color: ${COLORS.textPrimary};
`;

const Success = styled(Icon)`
    height: 3.2rem;
    width: 3.2rem;
    rect {
        fill: ${COLORS.gray200};
    }
`;

const Rules = styled.div`
    display: flex;
    justify-content: space-between;

    ${respondDown(Breakpoints.sm)`
        flex-direction: column;
        gap: 1.6rem;
    `}
`;

const Rule = styled.div`
    display: flex;
    gap: 1.6rem;
    color: ${COLORS.textTertiary};
    align-items: center;
    width: 25%;

    svg {
        min-width: 3.2rem;
    }

    ${respondDown(Breakpoints.sm)`
        width: 100%;
    `}
`;

const ParticipateRules = () => (
    <Container>
        <Title>Who can participate?</Title>
        <Rules>
            <Rule>
                <Success />
                <span>Any new Stellar wallet that has never interacted with Aquarius.</span>
            </Rule>
            <Rule>
                <Success />
                <span>Individuals from all countries except the United States.</span>
            </Rule>
            <Rule>
                <Success />
                <span>One IP address can participate only once</span>
            </Rule>
        </Rules>
    </Container>
);

export default ParticipateRules;
