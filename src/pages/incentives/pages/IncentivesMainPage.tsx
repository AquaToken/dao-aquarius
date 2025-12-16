import * as React from 'react';
import { useNavigate } from 'react-router-dom';

import { AppRoutes } from 'constants/routes';

import {
    Background,
    MainContent,
    MainContentWrap,
    Title,
    Description,
    MainContentFooter,
    AddBribeButton,
    PlusIcon,
    BribesLogo,
    TableContainer,
} from 'web/pages/bribes/pages/BribesPage/BribesPage.styled';

import FAQ from 'components/FAQ';

import { PageContainer } from 'styles/commonPageStyles';

import IncentivesList from 'pages/incentives/components/IncentivesList/IncentivesList';
import { lpIncentivesQuestions } from 'pages/incentives/components/Questions/Questions';

const IncentivesMainPage = () => {
    const navigate = useNavigate();
    return (
        <PageContainer>
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
                                onClick={() =>
                                    navigate(AppRoutes.section.incentive.link.addIncentive)
                                }
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
        </PageContainer>
    );
};

export default IncentivesMainPage;
