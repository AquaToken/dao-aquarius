import styled from 'styled-components';

import SorobanStars from 'assets/main-page/soroban-stars.svg';

import { flexAllCenter } from 'web/mixins';

import { Breakpoints, COLORS } from 'web/styles';

const Wrapper = styled.section`
    ${flexAllCenter};
    margin-top: 11rem;
`;

const InnerWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    max-width: 79rem;
    text-align: center;
`;

const Title = styled.span`
    font-size: 3.5rem;
    line-height: 5.2rem;
    color: ${COLORS.titleText};
`;

const TitleBold = styled(Title)`
    font-weight: 700;
    color: ${COLORS.purple};
`;

const SorobanStarsStyled = styled(SorobanStars)`
    margin-bottom: 2.4rem;
`;

const AquaSoroban = () => (
    <Wrapper>
        <InnerWrapper>
            <SorobanStarsStyled />
            <Title>
                Aquarius AMMs <TitleBold>run on Soroban smart contracts</TitleBold> — unlocking a
                new era of DeFi on Stellar
            </Title>
        </InnerWrapper>
    </Wrapper>
);

export default AquaSoroban;
