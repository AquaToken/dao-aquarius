import * as React from 'react';
import { Link } from 'react-router-dom';

import { AppRoutes } from 'constants/routes';

import Success from 'assets/icons/status/success-alt.svg';

import { ExternalLink } from 'basics/links';

import SocialLinks from 'components/SocialLinks';

import {
    Container,
    Socials,
    Main,
    Title,
    Description,
    Cards,
    Card,
    Heading,
    Label,
    Text,
    Phases,
} from './Airdrop.styled';

const Airdrop = () => (
    <Container>
        <Socials>
            <SocialLinks />
        </Socials>
        <Main>
            <Title>Airdrop distributions complete</Title>
            <Description>
                Both the Initial Airdrop & Airdrop #2 have been distributed in full. Eligible users
                can claim their airdrop rewards monthly until March 2025.
            </Description>
            <Cards>
                <Card>
                    <Heading>AQUA Airdrop #2</Heading>
                    <Label>⚡ Snapshot & distribution complete!</Label>
                    <Text>
                        XLM, yXLM & AQUA holders got a share of <b>15,000,000,000 AQUA</b> based on
                        their balances at the time of the January 15th 2022 snapshot. Rewards have
                        been distributed and can be claimed monthly inside of eligible Stellar
                        wallets.
                    </Text>
                    <ExternalLink asDiv>
                        <Link to={AppRoutes.page.airdrop2}>Read more</Link>
                    </ExternalLink>
                </Card>
                <Card>
                    <Heading>Initial Airdrop</Heading>
                    <Phases>
                        <Success />
                        <b>All 5</b> phases were completed!
                    </Phases>
                    <Text>
                        The initial 5 billion AQUA airdrop was successfully distributed. All
                        unclaimed funds were sent to the Aquarius DAO fund.
                    </Text>
                </Card>
            </Cards>
        </Main>
    </Container>
);

export default Airdrop;
