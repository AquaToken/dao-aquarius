import * as React from 'react';
import styled from 'styled-components';
import BackgroundImageLeft from '../../../common/assets/img/background-left.svg';
import BackgroundImageRight from '../../../common/assets/img/background-right.svg';
import { Breakpoints, COLORS } from '../../../common/styles';
import { commonMaxWidth, flexAllCenter, respondDown } from '../../../common/mixins';
import ToggleGroup from '../../../common/basics/ToggleGroup';
import { useState } from 'react';
import Table from './Table/Table';
import FloatingButton from './FloatingButton/FloatingButton';
import SelectedPairsForm from './SelectedPairsForm/SelectedPairsForm';
import { ModalService } from '../../../common/services/globalServices';
import ChooseLoginMethodModal from '../../../common/modals/ChooseLoginMethodModal';
import useAuthStore from '../../../common/store/authStore/useAuthStore';

const MainBlock = styled.main`
    flex: 1 0 auto;
`;

const Background = styled.div`
    padding: 10% 0;
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

const ExploreBlock = styled.div`
    position: relative;
    padding: 0 4rem;
    ${commonMaxWidth};
`;

const PairSearch = styled.div`
    //position: sticky;
    //top: 3.2rem;
    margin-top: -8.5rem;
    font-size: 5.2rem;
    height: 17rem;
    background: #ffffff;
    box-shadow: 0 20px 30px rgba(0, 6, 54, 0.06);
    border-radius: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    //z-index: 1;
`;

const Header = styled.header`
    display: flex;
    //justify-content: space-between;
    align-items: center;
    margin: 5.4rem 0;
`;

const TitleHeader = styled.h3`
    font-weight: bold;
    font-size: 5.6rem;
    line-height: 6.4rem;
    color: ${COLORS.titleText};
    margin-right: 3.6rem;
`;

const StatusUpdate = styled.div`
    margin-left: auto;
    font-size: 1.4rem;
    line-height: 2rem;
    color: ${COLORS.grayText};
    white-space: nowrap;
`;
// const options = ['Popular', 'Top 100', 'Top Volume'];

const MainPage = (): JSX.Element => {
    const [selectedOption, setSelectedOption] = useState(null);
    const [chosenPairs, setChosenPairs] = useState([0, 0]);
    const { isLogged } = useAuthStore();

    const handleClick = (option) => {
        if (isLogged) {
            ModalService.openModal(SelectedPairsForm, option);
            return;
        }
        setSelectedOption(option);
        ModalService.openModal(ChooseLoginMethodModal, {});
    };

    return (
        <MainBlock>
            <Background>
                <Title>Vote For Your Favorite Pairs</Title>
                <Description>
                    Lock your AQUA to create immutable and transparent votes direct on the Stellar
                    blockchain
                </Description>
                <BackgroundLeft />
                <BackgroundRight />
            </Background>
            <ExploreBlock>
                <PairSearch>undefined</PairSearch>
                <Header>
                    <TitleHeader>Explore</TitleHeader>
                    <ToggleGroup
                        onChange={(option) => setSelectedOption(option)}
                        defaultChecked={'Top 100'}
                        options={['Popular', 'Top 100', 'Top Volume']}
                    />
                    <StatusUpdate>Last updated 12 hours ago</StatusUpdate>
                </Header>
                <Table />
                {chosenPairs.length > 0 && (
                    <FloatingButton onClick={() => handleClick({})}>
                        {chosenPairs.length}
                    </FloatingButton>
                )}
            </ExploreBlock>
        </MainBlock>
    );
};

export default MainPage;
