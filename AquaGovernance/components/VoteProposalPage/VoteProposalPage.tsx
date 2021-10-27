import * as React from 'react';
import styled from 'styled-components';
import SideBar from './SideBar/SideBar';
import ArrowLeft from '../../../common/assets/img/icon-arrow-left.svg';
import CopyButton from '../../../common/basics/CopyButton';
import AccountViewer from './AccountViewer/AccountViewer';
import { flexAllCenter, respondDown } from '../../../common/mixins';
import { Breakpoints, COLORS } from '../../../common/styles';
import { Link } from 'react-router-dom';
import CurrentResults from './CurrentResults/CurrentResults';

const Container = styled.div`
    max-width: 78.2rem;

    ${respondDown(Breakpoints.lg)`
      max-width: 58.2rem;
    `}
`;

const ProposalQuestion = styled.div`
    width: 100%;
    padding: 10rem 4rem 11.7rem;
    background-color: ${COLORS.lightGray};
`;

const BackToProposals = styled.div`
    display: flex;
    column-gap: 1.6rem;
    align-items: center;
`;

const BackButton = styled(Link)`
    ${flexAllCenter};
    width: 4.8rem;
    height: 4.8rem;
    background-color: ${COLORS.white};
    box-shadow: 0 2rem 3rem rgba(0, 6, 54, 0.06);
    border-radius: 50%;
    text-decoration: none;
    cursor: pointer;
`;

const QuestionText = styled.h3`
    font-size: 5.6rem;
    line-height: 6.4rem;
    margin-top: 2.3rem;
    color: ${COLORS.titleText};
`;

const ProposalSection = styled(Container)`
    padding: 6rem 0 0 4rem;
`;

const Title = styled.h5`
    font-size: 2rem;
    line-height: 2.8rem;
    color: ${COLORS.titleText};
`;

const DescriptionText = styled.div`
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.descriptionText};
    opacity: 0.7;
`;

const DataDetails = styled.div`
    display: flex;
    justify-content: space-between;
    margin-top: 3.2rem;
`;

const Column = styled.div`
    display: flex;
    flex-direction: column;
`;

const DetailsTitle = styled.div`
    font-size: 1.4rem;
    line-height: 1.6rem;
    color: ${COLORS.grayText};
`;

const DetailsDescription = styled.div`
    margin-top: 0.8rem;
    font-size: 1.6rem;
    line-height: 2.4rem;
    color: ${COLORS.paragraphText};
`;

const VoteProposalPage = (): JSX.Element => {
    return (
        <main>
            <SideBar />
            <ProposalQuestion>
                <Container>
                    <BackToProposals>
                        <BackButton to="/">
                            <ArrowLeft />
                        </BackButton>
                        <span>Proposals</span>
                    </BackToProposals>
                    <QuestionText>
                        Should AQUA be allocated from the general pool to finance ambitious
                        projects?
                    </QuestionText>
                </Container>
            </ProposalQuestion>
            <ProposalSection>
                <Title>Proposal</Title>
                <DescriptionText>
                    <p>
                        The question is, should AQUA be allocated from the general pool to finance
                        ambitious projects. Aqua will stand out from the general pool.
                    </p>
                    <p>
                        Next fishy text for volume In a standard payment on the Stellar Network, you
                        will need to ensure the recipient of your transaction has a trustline
                        enabled for the asset you’re sending. Just one asset on the network doesn’t
                        follow this, which is the native token XLM, as it’s the only trustless asset
                        on the network.
                    </p>
                    <p>
                        When a standard payment is made, but no trustline is enabled, the sender
                        will receive an error as the network won’t allow them to send the payment.
                        This can be frustrating, as you would need to find out every potential
                        receiver of an asset and ask each one to enable the assets trustline, all
                        before a payment can be made. As frustrating as this is for the sender, this
                        means Stellar users aren’t being forced to accept assets they don’t want.
                    </p>
                    <p>
                        Trustlines are an important security feature, as it means your wallet won’t
                        get flooded with random assets that you don’t trust, unlike other
                        blockchains where you can be sent tokens you didn’t ask to have. The best
                        example would be the Shiba Inu token, where the founder sent Vitalik
                        Buterin, a co-founder of Ethereum, 50% of the SHIB (ERC-20) token supply,
                        without his consent.
                    </p>
                </DescriptionText>
            </ProposalSection>
            <ProposalSection>
                <Title>Details</Title>
                <DataDetails>
                    <Column>
                        <DetailsTitle>Voting start:</DetailsTitle>
                        <DetailsDescription>Dec. 16, 2021, 13:00</DetailsDescription>
                    </Column>
                    <Column>
                        <DetailsTitle>Voting end:</DetailsTitle>
                        <DetailsDescription>Jan. 15, 2022, 3:00</DetailsDescription>
                    </Column>
                    <Column>
                        <DetailsTitle>Proposed by:</DetailsTitle>
                        <DetailsDescription>
                            <CopyButton
                                text={'GARDNV3Q7YGT4AKSDF25LT32YSCCW4EV22Y2TV3I2PU2MMXJTEDL5T55'}
                            >
                                <AccountViewer
                                    pubKey={
                                        'GARDNV3Q7YGT4AKSDF25LT32YSCCW4EV22Y2TV3I2PU2MMXJTEDL5T55'
                                    }
                                />
                            </CopyButton>
                        </DetailsDescription>
                    </Column>
                </DataDetails>
            </ProposalSection>
            <ProposalSection>
                <CurrentResults />
            </ProposalSection>
        </main>
    );
};

export default VoteProposalPage;