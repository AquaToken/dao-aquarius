import * as React from 'react';
import styled from 'styled-components';
import { commonMaxWidth, respondDown } from '../../../common/mixins';
import { Breakpoints, COLORS } from '../../../common/styles';
import Bribes from '../../../common/assets/img/bribes.svg';
import Plus from '../../../common/assets/img/icon-plus.svg';
import Button from '../../../common/basics/Button';
import ExternalLink from '../../../common/basics/ExternalLink';
import BribesTable from './BribesTable/BribesTable';
import FAQ from './FAQ/FAQ';
import { useHistory } from 'react-router-dom';
import { MainRoutes } from '../../routes';

const MainBlock = styled.main`
    flex: 1 0 auto;
`;

const Background = styled.div`
    display: flex;
    align-items: center;
    background-color: ${COLORS.lightGray};
    min-height: 10rem;
    overflow: hidden;
    position: relative;

    ${respondDown(Breakpoints.md)`
        padding: 0;
        flex-direction: column-reverse;
    `}
`;

const MainContentWrap = styled.div`
    ${commonMaxWidth};
    display: flex;
    flex-direction: column;
    width: 100%;
    z-index: 1;
`;

const MainContent = styled.div`
    max-width: 60rem;
    padding: 10% 4rem;

    ${respondDown(Breakpoints.md)`
        max-width: unset;
        background: ${COLORS.white};
        padding: 1.6rem;
    `}
`;

const BribesLogo = styled(Bribes)`
    height: 100%;
    position: absolute;
    right: 5%;
    max-width: 40%;

    ${respondDown(Breakpoints.md)`
        position: relative;
        right: unset;
        max-width: unset;
    `}
`;

const Title = styled.span`
    font-weight: bold;
    font-size: 8rem;
    line-height: 9.4rem;
    color: ${COLORS.buttonBackground};
    white-space: nowrap;
    z-index: 1;
    margin-bottom: 1.6rem;

    ${respondDown(Breakpoints.lg)`
        font-size: 7rem;
        line-height: 8rem;
        margin-bottom: 1.2rem;
    `}

    ${respondDown(Breakpoints.md)`
          font-size: 5.5rem;
          line-height: 6rem;
          margin-bottom: 1rem;
          display: block;
          text-align: center;
      `}
      
      ${respondDown(Breakpoints.sm)`
          font-size: 4rem;
          line-height: 5rem;
          margin-bottom: 0.8rem;
      `}
`;

const Description = styled.p`
    font-size: 1.6rem;
    line-height: 2.4rem;
    color: ${COLORS.grayText};
    margin-bottom: 2.4rem;
`;

const MainContentFooter = styled.div`
    display: flex;
    justify-content: space-between;

    ${respondDown(Breakpoints.md)`
        flex-direction: column;
    `}
`;

const PlusIcon = styled(Plus)`
    margin-left: 1.6rem;
`;

const AddBribeButton = styled(Button)`
    flex: 1;
    max-width: 22.2rem;
    margin-right: 1.6rem;

    ${respondDown(Breakpoints.md)`
         max-width: unset;
         width: 100%;
         flex: unset;
         margin-bottom: 1.6rem;
    `}
`;

const TableContainer = styled.div`
    position: relative;
    padding: 0 4rem;
    ${commonMaxWidth};
    margin-bottom: 10rem;

    ${respondDown(Breakpoints.md)`
        padding: 0 1.6rem;
        background: ${COLORS.lightGray};
        margin-bottom: 3rem;
    `}
`;

const BribesPage = () => {
    const history = useHistory();

    return (
        <MainBlock>
            <Background>
                <MainContentWrap>
                    <MainContent>
                        <Title>Aquarius Bribes</Title>
                        <Description>
                            Aquarius bribes aim to bring bribes native to the protocol, allowing
                            everyone to view voting incentives all in one place. At the same time,
                            through a simple interface, anyone can quickly set up and distribute
                            bribe rewards on desired markets.
                        </Description>
                        <MainContentFooter>
                            <AddBribeButton onClick={() => history.push(MainRoutes.addBribe)}>
                                <span>add bribe</span>
                                <PlusIcon />
                            </AddBribeButton>

                            <ExternalLink>Learn more about Aquarius Bribes</ExternalLink>
                        </MainContentFooter>
                    </MainContent>
                </MainContentWrap>

                <BribesLogo />
            </Background>

            <TableContainer>
                <BribesTable />
            </TableContainer>

            <FAQ />
        </MainBlock>
    );
};

export default BribesPage;
