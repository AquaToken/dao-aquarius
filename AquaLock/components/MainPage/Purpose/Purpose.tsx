import * as React from 'react';
import styled from 'styled-components';
import { COLORS } from '../../../../common/styles';

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
`;

const Description = styled.span`
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.paragraphText};
`;

const Purpose = () => {
    return (
        <Container>
            <Title>Lock AQUA and get a boost for Airdrop #2</Title>
            <Description>
                Time lock your AQUA with this tool to increase rewards if you plan to hold AQUA long term.
                The more AQUA you lock, and the longer you lock, the higher the boost.
            </Description>
        </Container>
    );
};

export default Purpose;
