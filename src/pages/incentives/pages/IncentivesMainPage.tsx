import * as React from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';

import { IncentivesRoutes } from 'constants/routes';

import FAQ from 'components/FAQ';

import {
    AddBribeButton,
    Background,
    BribesLogo,
    Description,
    MainContent,
    MainContentFooter,
    MainContentWrap,
    PlusIcon,
    TableContainer,
    Title,
} from 'pages/bribes/pages/BribesPage';
import IncentivesList from 'pages/incentives/components/IncentivesList/IncentivesList';
import { lpIncentivesQuestions } from 'pages/incentives/components/Questions/Questions';

const Main = styled.main`
    flex: 1 0 auto;
`;

const IncentivesMainPage = () => {
    const history = useHistory();
    return (
        <Main>
            <Background>
                <MainContentWrap>
                    <MainContent>
                        <Title>Pool Incentives</Title>
                        <Description>
                            Pool Incentives let anyone add custom rewards — in any token — to
                            Aquarius pools. Rewards are streamed directly to LPs to attract
                            liquidity.
                        </Description>
                        <MainContentFooter>
                            <AddBribeButton
                                onClick={() => history.push(IncentivesRoutes.addIncentive)}
                            >
                                <span>add incentive</span>
                                <PlusIcon />
                            </AddBribeButton>
                        </MainContentFooter>
                    </MainContent>
                </MainContentWrap>

                <BribesLogo />
            </Background>

            <TableContainer>
                <IncentivesList />
            </TableContainer>

            <FAQ questions={lpIncentivesQuestions} />
        </Main>
    );
};

export default IncentivesMainPage;
