import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { LockerRoutes } from 'constants/routes';

import FreezeAqua from 'assets/locker/freeze-aqua-banner.svg';

import { Button } from 'basics/buttons';
import Label from 'basics/Label';

import { respondDown } from 'styles/mixins';
import { Breakpoints, COLORS } from 'styles/style-constants';

const Container = styled.div`
    display: flex;
    width: 100%;
    align-items: center;
    background: ${COLORS.white};
    margin-bottom: 2.6rem;
    border-radius: 0.5rem;

    ${respondDown(Breakpoints.md)`
        flex-direction: column;
        padding: 1.6rem;
    `}
`;

const FreezeAquaImg = styled(FreezeAqua)`
    ${respondDown(Breakpoints.md)`
        display: none;
    `}
`;

const Content = styled.div`
    display: flex;
    flex-direction: column;

    ${respondDown(Breakpoints.md)`
        align-items: center;
    `}
`;

const Title = styled.h5`
    font-weight: 700;
    font-size: 2rem;
    line-height: 2.8rem;
    display: flex;
    align-items: center;
    color: ${COLORS.textPrimary};

    div {
        margin: 0 1rem;
    }
`;

const Description = styled.span`
    font-size: 1.6rem;
    line-height: 2.4rem;
    color: ${COLORS.textGray};

    ${respondDown(Breakpoints.md)`
        text-align: center;
        margin: 1rem 0;
    `}
`;

const StyledLink = styled(Link)`
    margin-left: auto;
    margin-right: 4rem;
    text-decoration: none;

    ${respondDown(Breakpoints.md)`
        margin: 0;
        width: 100%;
    `}
`;

const BoostBanner = () => (
    <Container>
        <FreezeAquaImg />
        <Content>
            <Title>
                Get the <Label labelText="boost" background={COLORS.blue500} /> to your reward
            </Title>
            <Description>
                Freeze your AQUA into ICE and boost your rewards by up to 250%!
            </Description>
        </Content>
        <StyledLink to={LockerRoutes.main}>
            <Button fullWidth>GET THE BOOST</Button>
        </StyledLink>
    </Container>
);

export default BoostBanner;
