import * as React from 'react';
import QRCode from 'react-qr-code';
import { ModalDescription, ModalProps, ModalTitle } from '../atoms/ModalAtoms';
import ExternalLink from '../../basics/ExternalLink';
import CopyButton from '../../basics/CopyButton';
import styled from 'styled-components';
import { isAndroid, isIOS, isMobile } from '../../helpers/browser';
import { useEffect, useState } from 'react';
import axios from 'axios';

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

type Listings = { [id: string]: Wallet };
type Wallet = {
    app: {
        browser: string;
        ios: string;
        android: string;
        mac: string;
        windows: string;
        linux: string;
    };
    chains: string[];
    description: string;
    desktop: { native: string; universal: string };
    homepage: string;
    id: string;
    metadata: { shortName: string; colors: { primary: string; secondary: string } };
    mobile: { native: string; universal: string };
    name: string;
    versions: string[];
};

const registryUrl = 'https://registry.walletconnect.com/api/v1/wallets';
const logosUrl = 'https://registry.walletconnect.com/api/v1/logo/lg/';

const QRModal = ({ params }: ModalProps<{ uri: string }>): JSX.Element => {
    const { uri } = params;

    const [wallets, setWallets] = useState(null);

    console.log(isMobile(), isAndroid(), isIOS());

    useEffect(() => {
        if (isIOS()) {
            axios
                .get<{ listings: Listings }>(registryUrl)
                .then(({ data }) => {
                    return Object.values(data.listings).filter(
                        (wallet) =>
                            wallet.versions.includes('2') &&
                            wallet.chains.includes('stellar:pubnet'),
                    );
                })
                .then((res) => {
                    setWallets(res);
                });
        }
    }, []);

    return (
        <>
            <ModalTitle>Scan QR code</ModalTitle>
            <ModalDescription smallMarginBottom>
                Open your WalletConnect-compatible app with Stellar support, like
                <br />
                LOBSTR wallet, and scan the QR code to connect.
            </ModalDescription>
            <ExternalLink href="https://lobstr.zendesk.com/hc/en-us/articles/4406569953938-WalletConnect-How-to-log-in-and-use-your-Stellar-wallet-from-LOBSTR-with-other-services">
                How to connect LOBSTR wallet?
            </ExternalLink>

            <QRContainer>
                <QRCode value={uri} size={170} />

                <CopyButtonContainer>
                    <CopyButton text={uri}>
                        <span>Copy to clipboard</span>
                    </CopyButton>
                </CopyButtonContainer>
            </QRContainer>

            {wallets && (
                <div>
                    {wallets.map((wallet) => (
                        <div key={wallet.id}>
                            <img src={`${logosUrl}${wallet.id}`} alt="" />
                        </div>
                    ))}
                </div>
            )}
        </>
    );
};

export default QRModal;
