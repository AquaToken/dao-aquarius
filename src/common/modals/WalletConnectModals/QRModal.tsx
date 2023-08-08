import * as React from 'react';
import { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';
import { ModalDescription, ModalProps, ModalTitle } from '../atoms/ModalAtoms';
import ExternalLink from '../../basics/ExternalLink';
import CopyButton from '../../basics/CopyButton';
import styled from 'styled-components';
import { isAndroid, isIOS, isMobile } from '../../helpers/browser';
import axios from 'axios';
import ToggleGroup from '../../basics/ToggleGroup';
import { flexAllCenter, respondDown } from '../../mixins';
import { Breakpoints, COLORS } from '../../styles';
import Button from '../../basics/Button';
import ArrowRight from '../../assets/img/icon-arrow-right.svg';
import { clearCurrentWallet, saveCurrentWallet } from '../../helpers/wallet-connect-helpers';

const Wrapper = styled.div`
    width: 52.8rem;
    display: flex;
    flex-direction: column;

    ${respondDown(Breakpoints.md)`
        width: 100%;
    `}
`;

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

const MobileTitle = styled.span`
    display: inline;
    font-size: 2rem;
`;

const ToggleGroupStyled = styled(ToggleGroup)`
    display: flex;
    width: 100%;
    justify-content: space-evenly;
    margin-bottom: 4rem;
    margin-top: 2.4rem;

    label {
        padding: 0.8rem 0;
        width: 100%;
    }
`;

const AndroidButtonBlock = styled.div`
    ${flexAllCenter};
    border-radius: 0.5rem;
    background: ${COLORS.lightGray};
    padding: 6rem 0;
    margin-top: 2.2rem;
`;

const IosBlock = styled.div`
    margin-top: 2.4rem;
`;

const AppBlock = styled.div`
    display: flex;
    align-items: center;
    border-radius: 0.5rem;
    background: ${COLORS.lightGray};
    padding: 1.9rem 2.4rem 1.9rem 1.9rem;

    &:not(:last-child) {
        margin-bottom: 0.8rem;
    }
`;

const AppName = styled.span`
    font-size: 1.6rem;
    color: ${COLORS.paragraphText};
`;

const AppLogo = styled.img`
    height: 5.2rem;
    width: 5.2rem;
    margin-right: 1.2rem;
    border-radius: 0.8rem;
`;

const ArrowRightIcon = styled(ArrowRight)`
    margin-left: auto;
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
    image_url: {
        lg: string;
        md: string;
        sm: string;
    };
};

const registryUrl = 'https://registry.walletconnect.com/api/v1/wallets';

enum ModalStates {
    mobile = 'mobile',
    qr = 'qr',
}

function formatIOSMobile(uri: string, wallet: Wallet) {
    const encodedUri: string = encodeURIComponent(uri);
    return wallet.mobile.universal
        ? `${wallet.mobile.universal}/wc?uri=${encodedUri}`
        : wallet.mobile.native
        ? `${wallet.mobile.native}${
              wallet.mobile.native.endsWith(':') ? '//' : '/'
          }wc?uri=${encodedUri}`
        : '';
}

const QRModal = ({ params }: ModalProps<{ uri: string }>): JSX.Element => {
    const { uri } = params;

    const [wallets, setWallets] = useState(null);
    const [modalState, setModalState] = useState(isMobile() ? ModalStates.mobile : ModalStates.qr);

    useEffect(() => {
        if (modalState === ModalStates.qr) {
            clearCurrentWallet();
        }
    }, [modalState]);

    useEffect(() => {
        if (isIOS()) {
            axios
                .get<{ listings: Listings }>(registryUrl)
                .then(({ data }) => {
                    return Object.values(data.listings).filter(
                        (wallet) =>
                            wallet.versions.includes('2') &&
                            wallet.chains.includes('stellar:pubnet') &&
                            // TODO remove this hardcode
                            // Hide "SafePal" until they fix compatibility issues
                            wallet.name !== 'SafePal',
                    );
                })
                .then((res) => {
                    setWallets(res);
                });
        }
    }, []);

    return (
        <Wrapper>
            {isMobile() && (
                <>
                    <MobileTitle>WalletConnect</MobileTitle>
                    <ToggleGroupStyled
                        options={[
                            { label: 'Mobile', value: ModalStates.mobile },
                            { label: 'QR code', value: ModalStates.qr },
                        ]}
                        value={modalState}
                        onChange={setModalState}
                    />
                </>
            )}
            <ModalTitle>
                {modalState === ModalStates.qr ? 'Scan QR code' : ''}
                {isAndroid() && modalState === ModalStates.mobile ? 'Connect to Mobile Wallet' : ''}
                {isIOS() && modalState === ModalStates.mobile ? 'Choose your preferred wallet' : ''}
            </ModalTitle>

            {modalState === ModalStates.qr && (
                <>
                    <ModalDescription smallMarginBottom>
                        Open your WalletConnect-compatible app with Stellar support, like LOBSTR
                        wallet, and scan the QR code to connect.
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
                </>
            )}
            {modalState === ModalStates.mobile &&
                (isAndroid() ? (
                    <AndroidButtonBlock
                        onClick={() => {
                            saveCurrentWallet('Unknown', uri);
                            window.open(uri, '_blank');
                        }}
                    >
                        <Button>connect</Button>
                    </AndroidButtonBlock>
                ) : (
                    <>
                        {wallets && (
                            <IosBlock>
                                {wallets.map((wallet: Wallet) => (
                                    <AppBlock
                                        key={wallet.id}
                                        onClick={() => {
                                            const link = formatIOSMobile(uri, wallet);
                                            saveCurrentWallet(wallet.name, link);
                                            window.open(link, '_blank');
                                        }}
                                    >
                                        <AppLogo src={wallet.image_url.md} alt="" />
                                        <AppName>{wallet.name}</AppName>
                                        <ArrowRightIcon />
                                    </AppBlock>
                                ))}
                            </IosBlock>
                        )}
                    </>
                ))}
        </Wrapper>
    );
};

export default QRModal;
