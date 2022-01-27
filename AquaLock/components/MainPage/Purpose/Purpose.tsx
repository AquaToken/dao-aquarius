import * as React from 'react';
import styled from 'styled-components';
import { Breakpoints, COLORS } from '../../../../common/styles';
import { respondDown } from '../../../../common/mixins';

const Container = styled.div`
    display: flex;
    flex-direction: column;
    max-width: 67.6rem;
    margin-right: 6.2rem;
    flex: 1;
    justify-content: center;
`;

const Title = styled.span`
    font-weight: bold;
    font-size: 5.6rem;
    line-height: 6.4rem;
    color: ${COLORS.titleText};
    margin-bottom: 1.6rem;

    ${respondDown(Breakpoints.md)`
        font-size: 4rem;
        line-height: 5rem;
    `}
`;

const Description = styled.span`
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.paragraphText};
`;

const Purpose = () => {
    return (
        <Container>
            <Title>Lock AQUA for additional benefits</Title>
            <Description>
                Lock your AQUA with this tool to get extra benefits in the future.
                <br />
                Perfect for those who are planning to hold AQUA long term. Stay tuned, details
                coming soon.
                <br />
            </Description>
        </Container>
    );
};

export default Purpose;
