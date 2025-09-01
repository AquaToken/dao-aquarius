import * as React from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';

import { IncentivesRoutes } from 'constants/routes';

import FAQ from 'basics/FAQ';

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
                        <Title>LP Incentives</Title>
                        <Description>
                            LP incentives are an additional layer of rewards that complement the
                            AQUA distributions provided by the Aquarius protocol. Anyone can create
                            LP incentives for liquidity pools using any token traded on the Aquarius
                            AMM, encouraging liquidity providers to contribute and deepen market
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
