import * as React from 'react';
import styled from 'styled-components';
import { Breakpoints, COLORS } from '../../../../common/styles';
import { respondDown } from '../../../../common/mixins';
import Ice from 'assets/ice-logo.svg';
import Arrow from 'assets/icon-link-arrow.svg';
import Button from '../../../../common/basics/Button';
import { Link } from 'react-router-dom';
import { MainRoutes } from '../../../../routes';

const Container = styled.section`
    width: 100%;
    background-color: ${COLORS.blue};
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
    color: ${COLORS.blue};
`;

const IceLogo = styled(Ice)`
    height: 6.5rem;
    margin-bottom: 3.8rem;
`;

const StyledButton = styled(Button)`
    margin-top: 2.8rem;
    width: 100%;
    text-decoration: none;
    background-color: ${COLORS.blue};

    &:hover {
        background-color: ${COLORS.blue};
        opacity: 0.9;
    }
`;

const IceBlock = () => {
    return (
        <Container>
            <Wrapper>
                <div>
                    <Title>ICE tokens</Title>
                    <Description>
                        Freeze your AQUA to ICE tokens securely on the Stellar network with our AQUA
                        locker tool. ICE tokens bring a whole new dimension to Aquarius, creating a
                        way for AQUA holders to increase rewards earned from SDEX market making and
                        AMM liquidity provision and boost voting flexibility & power.
                    </Description>
                </div>
                <Column>
                    <FirstBlock>
                        <BlockColumn>
                            <IceLogo />
                            <BlockTitle>Turn AQUA into ICE with just a few clicks</BlockTitle>
                            <a
                                target="_blank"
                                href="https://medium.com/aquarius-aqua/ice-the-next-stage-of-aquarius-810edc7cf3bb"
                            >
                                <StyledButton isBig>Learn more</StyledButton>
                            </a>
                        </BlockColumn>
                    </FirstBlock>
                    <Link
                        onClick={() => setTimeout(() => window.scrollTo(0, 0))}
                        to={MainRoutes.locker}
                    >
                        <Block>
                            <BlockColumn>
                                <BlockTitle>Locker Tool</BlockTitle>
                                <BlockDescription>Click here to freeze AQUA</BlockDescription>
                            </BlockColumn>
                            <Arrow />
                        </Block>
                    </Link>
                </Column>
            </Wrapper>
        </Container>
    );
};

export default IceBlock;
