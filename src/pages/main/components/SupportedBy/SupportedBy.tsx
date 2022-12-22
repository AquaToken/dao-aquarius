import * as React from 'react';
import styled from 'styled-components';
import { respondDown } from '../../../../common/mixins';
import { Breakpoints, COLORS } from '../../../../common/styles';
import Lobstr from '../../../../common/assets/img/lobstr-name-logo.svg';
import StellarX from '../../../../common/assets/img/stellarx-logo.svg';
import Vault from '../../../../common/assets/img/vault-logo.svg';
import StellarTerm from '../../../../common/assets/img/stellarterm-logo.svg';

const Container = styled.section`
    display: flex;
    justify-content: center;
    flex: auto;
    position: relative;
    min-height: 0;
    margin-top: 15rem;

    ${respondDown(Breakpoints.md)`
        margin-top: 8rem;
    `}
`;

const Wrapper = styled.div`
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    max-width: 142rem;
    padding: 0 10rem;

    ${respondDown(Breakpoints.md)`
        padding: 0 1.6rem;
        max-width: 55rem;
        flex-direction: column;
        align-items: flex-start;
    `}
`;

const Title = styled.span`
    font-size: 1.6rem;
    line-height: 1.9rem;
    color: ${COLORS.placeholder};

    ${respondDown(Breakpoints.md)`
        margin-bottom: 2.3rem;
    `}
`;

const ImageBlock = styled.div`
    flex: 1;
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    max-width: 108rem;
    align-items: center;

    ${respondDown(Breakpoints.md)`
        width: 100%;
        justify-content: space-between;
        flex-wrap: wrap;
        
        svg {
            width: 12.4rem;
            margin-bottom: 2rem;
            margin-right: auto;
            margin-left: auto;
        }
    `}
`;

const SupportedBy = () => {
    return (
        <Container>
            <Wrapper>
                <Title>Supported by:</Title>

                <ImageBlock>
                    <a href="https://lobstr.co/" target="_blank">
                        <Lobstr />
                    </a>

                    <a href="https://www.stellarx.com/" target="_blank">
                        <StellarX />
                    </a>

                    <a href="https://vault.lobstr.co/" target="_blank">
                        <Vault />
                    </a>

                    <a href="https://stellarterm.com/" target="_blank">
                        <StellarTerm />
                    </a>
                </ImageBlock>
            </Wrapper>
        </Container>
    );
};

export default SupportedBy;
