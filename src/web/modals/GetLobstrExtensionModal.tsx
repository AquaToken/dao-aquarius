import styled from 'styled-components';

import Button from 'basics/buttons/Button';
import { ExternalLink } from 'basics/links';
import { ModalDescription, ModalTitle, ModalWrapper } from 'basics/ModalAtoms';

const StyledButton = styled(Button)`
    margin-top: 5.4rem;
`;

const GetLobstrExtensionModal = () => (
    <ModalWrapper $width="55rem">
        <ModalTitle>Install LOBSTR signer extension</ModalTitle>
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
    </ModalWrapper>
);

export default GetLobstrExtensionModal;
