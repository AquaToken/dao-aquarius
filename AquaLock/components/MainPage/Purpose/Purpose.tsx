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
            <Title>Get an Airdrop #2 boost by locking AQUA tokens</Title>
            <Description>
                The airdrop locker tool is designed to increase rewards for those with belief in the Aquarius project.
                The more AQUA you lock, and the longer you lock, the higher the boost.
            </Description>
        </Container>
    );
};

export default Purpose;
