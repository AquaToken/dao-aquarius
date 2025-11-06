import * as React from 'react';

import { useScrollAnimation } from 'hooks/useScrollAnimation';

import LobstrIcon from 'assets/wallets/lobstr/lobstr-name-logo.svg';
import StellarTermIcon from 'assets/wallets/stellarterm-logo.svg';
import StellarXIcon from 'assets/wallets/stellarx-logo.svg';

import {
    Wrapper,
    Title,
    FlexTitle,
    ImageBlock,
    IconWrapper,
    FreighterIcon,
    HotWalletIcon,
} from './SupportedWallets.styled';

const SupportedWallets: React.FC = () => {
    const { ref, visible } = useScrollAnimation(0.2, true);

    return (
        <Wrapper
            id="supported-wallets"
            ref={ref as React.RefObject<HTMLElement>}
            $visible={visible}
        >
            <Title $visible={visible}>Supported by:</Title>

            <ImageBlock>
                <FlexTitle $visible={visible}>Supported by:</FlexTitle>

                <IconWrapper
                    href="https://lobstr.co/"
                    target="_blank"
                    rel="noreferrer"
                    $visible={visible}
                    $delay={0.05}
                >
                    <LobstrIcon />
                </IconWrapper>

                <IconWrapper
                    href="https://www.stellarx.com/"
                    target="_blank"
                    rel="noreferrer"
                    $visible={visible}
                    $delay={0.15}
                >
                    <StellarXIcon />
                </IconWrapper>

                <IconWrapper
                    href="https://www.freighter.app/"
                    target="_blank"
                    rel="noreferrer"
                    $visible={visible}
                    $delay={0.25}
                >
                    <FreighterIcon />
                </IconWrapper>

                <IconWrapper
                    href="https://stellarterm.com/"
                    target="_blank"
                    rel="noreferrer"
                    $visible={visible}
                    $delay={0.35}
                >
                    <StellarTermIcon />
                </IconWrapper>

                <IconWrapper
                    href="https://hot-labs.org/"
                    target="_blank"
                    rel="noreferrer"
                    $visible={visible}
                    $delay={0.45}
                >
                    <HotWalletIcon />
                </IconWrapper>
            </ImageBlock>
        </Wrapper>
    );
};

export default SupportedWallets;
