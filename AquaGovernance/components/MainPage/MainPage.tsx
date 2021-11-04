import * as React from 'react';
import styled from 'styled-components';
import BackgroundImageLeft from '../../../common/assets/img/background-left.svg';
import BackgroundImageRight from '../../../common/assets/img/background-right.svg';
import { Breakpoints, COLORS } from '../../../common/styles';
import { flexAllCenter, respondDown } from '../../../common/mixins';
import ProposalLink from './ProposalLink/ProposalLink';
import useProposalsStore from '../../store/proposalsStore/useProposalsStore';

const MainBlock = styled.main`
    flex: 1 0 auto;
`;

const Background = styled.div`
    padding: 10% 4rem;
    ${flexAllCenter};
    flex-direction: column;
    background-color: ${COLORS.darkPurple};
    min-height: 10rem;
    max-height: 40vh;
    overflow: hidden;
    position: relative;
`;

const BackgroundLeft = styled(BackgroundImageLeft)`
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
`;

const BackgroundRight = styled(BackgroundImageRight)`
    position: absolute;
    top: 0;
    right: 0;
    height: 100%;
`;

const Title = styled.h2`
    font-size: 8rem;
    line-height: 9.4rem;
    font-weight: bold;
    color: ${COLORS.white};
    z-index: 1;
    margin-bottom: 1.6rem;
    text-align: center;

    ${respondDown(Breakpoints.lg)`
      font-size: 7rem;
      line-height: 8rem;
      margin-bottom: 1.2rem;
    `}

    ${respondDown(Breakpoints.md)`
        font-size: 5.5rem;
        line-height: 6rem;
        margin-bottom: 1rem;
    `}
    
    ${respondDown(Breakpoints.sm)`
        font-size: 4rem;
        line-height: 5rem;
        margin-bottom: 0.8rem;
    `}
`;

const Description = styled.div`
    max-width: 79.2rem;
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.white};
    text-align: center;
    opacity: 0.7;
    z-index: 1;
`;

const ProposalsBlock = styled.div`
    padding: 8.5rem 4rem 0;
`;

const ProposalsTitle = styled.h3`
    font-size: 5.6rem;
    line-height: 6.4rem;
    font-weight: bold;
    color: ${COLORS.titleText};
    margin-bottom: 4.8rem;
`;

const About = styled.div`
    padding: 4.8rem 6rem;
    background-color: ${COLORS.lightGray};
    border-radius: 0.5rem;
    margin-top: 4.8rem;

    font-size: 1.6rem;
    line-height: 2.8rem;
    text-align: center;

    color: ${COLORS.descriptionText};

    opacity: 0.7;
`;

const MainPage = (): JSX.Element => {
    const { proposals } = useProposalsStore();

    return (
        <MainBlock>
            <Background>
                <Title>Aquarius Governance</Title>
                <Description>
                    AQUA tokens represent voting shares in Aquarius governance. You can vote on each
                    proposal yourself or delegate your votes to a third party.
                </Description>
                <BackgroundLeft />
                <BackgroundRight />
            </Background>
            <ProposalsBlock>
                <ProposalsTitle>Proposals</ProposalsTitle>
                {proposals.map((proposal) => {
                    return (
                        <ProposalLink
                            key={proposal.id}
                            proposal={proposal}
                            to={`/proposal/${proposal.id}/`}
                        />
                    );
                })}
            </ProposalsBlock>
            <About>
                &#9757;️
                <br />
                This is an early version of Aquarius Governance. <br />
                Over time, there will be more proposals and the ability to create custom propose.
            </About>
        </MainBlock>
    );
};

export default MainPage;
