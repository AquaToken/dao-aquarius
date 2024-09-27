import * as React from 'react';
import styled from 'styled-components';

import { respondDown } from 'web/mixins';
import { Breakpoints } from 'web/styles';

import Button from 'basics/buttons/Button';
import ExternalLink from 'basics/ExternalLink';
import { ModalDescription } from 'basics/ModalAtoms';

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

const GetLobstrExtensionModal = () => (
    <Container>
        <Title>Install LOBSTR signer extension</Title>
        <ModalDescription>
            LOBSTR signer extension is not installed in your browser.
            <br />
            Signer extension allows you to sign in to Aquarius with your Stellar wallet from the
            LOBSTR app. You can install the LOBSTR signer extension from the Chrome Web Store.
        </ModalDescription>

        <ExternalLink href="https://lobstr.freshdesk.com/a/solutions/articles/151000183963?portalId=151000006220">
            How to sign in with LOBSTR signer extension?
        </ExternalLink>

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
            Install extension
        </StyledButton>
    </Container>
);

export default GetLobstrExtensionModal;
