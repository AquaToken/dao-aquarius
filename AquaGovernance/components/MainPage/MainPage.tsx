import * as React from 'react';
import styled from 'styled-components';
import BackgroundImageLeft from '../../../common/assets/img/background-left.svg';
import BackgroundImageRight from '../../../common/assets/img/background-right.svg';
import { Breakpoints, COLORS } from '../../../common/styles';
import { commonMaxWidth, flexAllCenter, respondDown } from '../../../common/mixins';
import ProposalLink from './ProposalLink/ProposalLink';
import useProposalsStore from '../../store/proposalsStore/useProposalsStore';
import Button from '../../../common/basics/Button';
import Plus from '../../../common/assets/img/icon-plus.svg';
import { useHistory } from 'react-router-dom';
import useAuthStore from '../../../common/store/authStore/useAuthStore';
import { ModalService } from '../../../common/services/globalServices';
import ChooseLoginMethodModal from '../../../common/modals/ChooseLoginMethodModal';
import { useEffect } from 'react';
import PageLoader from '../../../common/basics/PageLoader';
import ExternalLink from '../../../common/basics/ExternalLink';

export const CREATE_PROPOSAL_COST = 1000000;
export const MINIMUM_APPROVAL_PERCENT = 5;

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
    ${commonMaxWidth};
`;

const TitleBlock = styled.div`
    display: flex;
    justify-content: space-between;
    margin-bottom: 4.8rem;
    align-items: center;
`;

const ProposalsTitle = styled.h3`
    font-size: 5.6rem;
    line-height: 6.4rem;
    font-weight: bold;
    color: ${COLORS.titleText};
`;

const About = styled.div`
    padding: 4.8rem 6rem;
    background-color: ${COLORS.lightGray};
    border-radius: 0.5rem;
    margin-top: 4.8rem;

    font-size: 1.6rem;
    line-height: 2.8rem;
    ${flexAllCenter};
    flex-direction: column;
    text-align: center;

    color: ${COLORS.descriptionText};

    opacity: 0.7;
`;

const PlusIcon = styled(Plus)`
    margin-left: 1.7rem;
    & > path {
        fill: white;
    }
`;

const MainPage = (): JSX.Element => {
    const { proposals, getProposals } = useProposalsStore();
    const history = useHistory();
    const { isLogged } = useAuthStore();

    const handleClick = () => {
        if (!isLogged) {
            ModalService.openModal(ChooseLoginMethodModal, {});
            return;
        }

        history.push('/create');
    };

    useEffect(() => {
        getProposals();
    }, []);

    if (!proposals.length) {
        return <PageLoader />;
    }

    return (
        <MainBlock>
            <Background>
                <Title>Aquarius Governance</Title>
                <Description>
                    Aquarius protocol is governed by DAO voting with AQUA tokens. Vote and
                    participate in discussions to shape the future of Aquarius.
                </Description>
                <BackgroundLeft />
                <BackgroundRight />
            </Background>
            <ProposalsBlock>
                <TitleBlock>
                    <ProposalsTitle>Proposals</ProposalsTitle>
                    <Button onClick={() => handleClick()}>
                        <>
                            Create proposal <PlusIcon />
                        </>
                    </Button>
                </TitleBlock>
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
                Over time, users will create more proposals for you to vote on.
                <br />
                Participate in the discussion of governance proposals on Discord
                (#governance-voting).
                <ExternalLink href="https://discord.gg/sgzFscHp4C">View discussion</ExternalLink>
            </About>
        </MainBlock>
    );
};

export default MainPage;
