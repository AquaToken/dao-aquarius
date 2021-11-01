import * as React from 'react';
import QRCode from 'react-qr-code';
import { ModalDescription, ModalProps, ModalTitle } from '../atoms/ModalAtoms';
import ExternalLink from '../../basics/ExternalLink';
import CopyButton from '../../basics/CopyButton';
import styled from 'styled-components';

const QRContainer = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 7.2rem;
`;

const CopyButtonContainer = styled.div`
    margin-top: 3.2rem;
    margin-bottom: 3.2rem;
`;

const QRModal = ({ params }: ModalProps<{ uri: string }>): JSX.Element => {
    const { uri } = params;

    return (
        <>
            <ModalTitle>Scan QR code</ModalTitle>
            <ModalDescription smallMarginBottom>
                Open your WalletConnect-compatible app with Stellar support, like
                <br />
                LOBSTR wallet, and scan the QR code to connect.
            </ModalDescription>
            <ExternalLink>How to connect LOBSTR wallet?</ExternalLink>

            <QRContainer>
                <QRCode value={uri} size={170} />

                <CopyButtonContainer>
                    <CopyButton text={uri}>
                        <span>Copy to clipboard</span>
                    </CopyButton>
                </CopyButtonContainer>
            </QRContainer>
        </>
    );
};

export default QRModal;
