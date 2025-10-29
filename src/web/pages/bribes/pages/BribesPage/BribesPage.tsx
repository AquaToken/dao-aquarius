import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { BribesRoutes } from 'constants/routes';

import DelegateBlockSmall from 'components/DelegateBlockSmall';
import FAQ from 'components/FAQ';

import { PageContainer } from 'styles/commonPageStyles';

import {
    Background,
    MainContentWrap,
    MainContent,
    Title,
    Description,
    MainContentFooter,
    AddBribeButton,
    PlusIcon,
    BribesLogo,
    Banner,
    TableContainer,
} from './BribesPage.styled';
import BribesList from './components/BribesList/BribesList';
import { BribeQuestions } from './components/FAQ/Questions';

const BribesPage = () => {
    const history = useHistory();

    return (
        <PageContainer>
            <Background>
                <MainContentWrap>
                    <MainContent>
                        <Title>Aquarius Bribes</Title>
                        <Description>
                            Bribes are on-chain rewards for voting on specific Stellar markets.
                            Aquarius supports two types: protocol bribes, funded by trading fees and
                            directed to high-volume markets, and external bribes, submitted by users
                            or projects to attract votes.
                        </Description>
                        <MainContentFooter>
                            <AddBribeButton onClick={() => history.push(BribesRoutes.addBribe)}>
                                <span>create bribe</span>
                                <PlusIcon />
                            </AddBribeButton>
                        </MainContentFooter>
                    </MainContent>
                </MainContentWrap>

                <BribesLogo />
            </Background>

            <Banner>
                <DelegateBlockSmall />
            </Banner>

            <TableContainer>
                <BribesList />
            </TableContainer>

            <FAQ questions={BribeQuestions} />
        </PageContainer>
    );
};

export default BribesPage;
