import * as React from 'react';
import styled from 'styled-components';
import { Breakpoints, COLORS } from '../../../../common/styles';
import { respondDown } from '../../../../common/mixins';
import Airdrop2 from '../../../../common/assets/img/airdrop2.svg';
import Success from '../../../../common/assets/img/icon-success-green.svg';
import Arrow from '../../../../common/assets/img/icon-link-arrow.svg';
import Button from '../../../../common/basics/Button';
import { Link } from 'react-router-dom';
import { MainRoutes } from '../../../../routes';

const Container = styled.section`
    width: 100%;
    background-color: ${COLORS.titleText};
    padding: 10rem 0;
    display: flex;
    justify-content: center;
    flex: auto;
    position: relative;
    min-height: 0;
`;

const Wrapper = styled.div`
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    max-width: 142rem;
    padding: 0 10rem;

    ${respondDown(Breakpoints.md)`
        padding: 0 1.6rem;
        max-width: 55rem;
    `}

    ${respondDown(Breakpoints.lg)`
        flex-direction: column;
    `}
`;

const Label = styled.div`
    display: flex;
    align-items: center;
    width: min-content;
    margin-bottom: 2.4rem;
    padding: 0.7rem 0.9rem 0.7rem 0.7rem;
    background-color: ${COLORS.tooltip};
    border-radius: 0.5rem;
    font-size: 1.2rem;
    font-weight: 700;
    line-height: 1.4rem;
    color: ${COLORS.white};
    white-space: nowrap;
`;

const Title = styled.div`
    font-weight: bold;
    font-size: 8rem;
    line-height: 9.4rem;
    color: ${COLORS.white};
    margin-bottom: 2.4rem;

    ${respondDown(Breakpoints.md)`
        font-size: 4rem;
        line-height: 4.6rem;
    `}
`;

const Description = styled.div`
    max-width: 67rem;
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.white};

    ${respondDown(Breakpoints.lg)`
        margin-bottom: 2.7rem;
    `}

    ${respondDown(Breakpoints.md)`
        font-size: 1.4rem;
            line-height: 2.5rem;
    `}
`;

const Column = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    max-width: 34.8rem;

    a {
        text-decoration: none;
        width: 100%;
    }
`;

const Block = styled.div`
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: space-between;
    background: ${COLORS.white};
    box-shadow: 0 2rem 3rem rgba(0, 6, 54, 0.06);
    border-radius: 0.5rem;
    padding: 2.4rem 3.3rem;
`;

const FirstBlock = styled(Block)`
    text-align: center;
    flex-direction: column;
    padding: 4.4rem 4rem;
    margin-bottom: 1.6rem;
`;

const BlockColumn = styled.div`
    display: flex;
    flex-direction: column;
`;

const BlockTitle = styled.div`
    font-weight: bold;
    font-size: 2rem;
    line-height: 3rem;
    color: ${COLORS.descriptionText};
    margin-bottom: 0.8rem;
`;

const BlockDescription = styled.div`
    display: flex;
    align-items: center;
    font-size: 1.8rem;
    line-height: 3.2rem;
    font-weight: 700;
    color: ${COLORS.descriptionText};
`;

const Airdrop2Logo = styled(Airdrop2)`
    height: 6.5rem;
    margin-bottom: 3.8rem;
`;

const SuccessLogo = styled(Success)`
    width: 1.5rem;
    height: 1.9rem;
    margin-right: 0.6rem;
`;

const StyledButton = styled(Button)`
    margin-top: 2.8rem;
    width: 100%;
    text-decoration: none;
`;

const Airdrop = () => {
    return (
        <Container>
            <Wrapper>
                <div>
                    <Label>⚡ Snapshot taken on January 15th, 2022!</Label>
                    <Title>Airdrop #2</Title>
                    <Description>
                        Airdrop #2 distribution is now complete. Rewards have been split into 36
                        payments with each one unlocking monthly. Users can see airdrop rewards
                        inside their eligible Stellar wallets as pending payments.
                    </Description>
                </div>
                <Column>
                    <FirstBlock>
                        <BlockColumn>
                            <Airdrop2Logo />
                            <BlockTitle>
                                Check your Stellar addresses to see if they are eligible
                            </BlockTitle>
                            <Link to={MainRoutes.airdrop2}>
                                <StyledButton isBig>Learn more</StyledButton>
                            </Link>
                        </BlockColumn>
                    </FirstBlock>
                    <a target="_blank" href="https://airdrop.aqua.network/">
                        <Block>
                            <BlockColumn>
                                <BlockTitle>Initial Airdrop</BlockTitle>
                                <BlockDescription>
                                    <SuccessLogo />
                                    Distribution completed
                                </BlockDescription>
                            </BlockColumn>
                            <Arrow />
                        </Block>
                    </a>
                </Column>
            </Wrapper>
        </Container>
    );
};

export default Airdrop;
