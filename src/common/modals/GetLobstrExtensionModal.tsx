import * as React from 'react';
import styled from 'styled-components';
import { respondDown } from '../mixins';
import { Breakpoints } from '../styles';
import { ModalDescription } from './atoms/ModalAtoms';
import ExternalLink from '../basics/ExternalLink';
import Button from '../basics/Button';

const Container = styled.div`
    width: 52.8rem;
    display: flex;
    flex-direction: column;

    ${respondDown(Breakpoints.md)`
          width: 100%;
      `}
`;

const Title = styled.h1`
    font-size: 3.6rem;
    line-height: 4.2rem;
    font-weight: 400;
    margin-bottom: 1.6rem;
`;

const StyledButton = styled(Button)`
    margin-top: 5.4rem;
`;

const GetLobstrExtensionModal = () => {
    return (
        <Container>
            <Title>Install LOBSTR signer extension</Title>
            <ModalDescription>
                Connect your Stellar wallet from the LOBSTR mobile app to the signer extension.
            </ModalDescription>

            <ExternalLink>How to connect LOBSTR wallet?</ExternalLink>

            <StyledButton
                isBig
                fullWidth
                onClick={() =>
                    window.open(
                        'https://chromewebstore.google.com/detail/lobstr-signer-extension/ldiagbjmlmjiieclmdkagofdjcgodjle',
                        '_blank',
                    )
                }
            >
                Download extension
            </StyledButton>
        </Container>
    );
};

export default GetLobstrExtensionModal;
