import * as React from 'react';

import getExplorerLink, { ExplorerSection } from 'helpers/explorer-links';
import { formatBalance } from 'helpers/format-number';

import { ModalProps } from 'types/modal';
import { Token } from 'types/token';

import AssetLogo from 'basics/AssetLogo';
import { ExternalLink } from 'basics/links';
import { ModalWrapper } from 'basics/ModalAtoms';

import {
    Amount,
    Amounts,
    Buttons,
    DarkArrow,
    Description,
    ExplorerLink,
    StyledButton,
    SuccessIcon,
    Title,
    Wrapper,
} from 'pages/swap/components/SwapSuccessModal/SwapSuccessModal.styled';

interface Props {
    source: Token;
    destination: Token;
    sourceAmount: string;
    destinationAmount: string;
    txHash: string;
}

const SwapSuccessModal = ({ params, close }: ModalProps<Props>) => {
    const { source, destination, sourceAmount, destinationAmount, txHash } = params;

    return (
        <ModalWrapper>
            <Wrapper>
                <SuccessIcon />
                <Title>Swap Success!</Title>
                <Description>
                    Your {source.code} to {destination.code} swap was completed successfully.
                </Description>
                <Amounts>
                    <Amount>
                        <AssetLogo asset={source} />
                        <span>
                            {formatBalance(+sourceAmount)} {source.code}
                        </span>
                    </Amount>
                    <DarkArrow />
                    <Amount>
                        <AssetLogo asset={destination} />
                        <span>
                            {formatBalance(+destinationAmount)} {destination.code}
                        </span>
                    </Amount>
                </Amounts>

                <Buttons>
                    <ExplorerLink href={getExplorerLink(ExplorerSection.tx, txHash)}>
                        <ExternalLink asDiv>View on Explorer</ExternalLink>
                    </ExplorerLink>
                    <StyledButton isRounded isBig onClick={() => close()}>
                        done
                    </StyledButton>
                </Buttons>
            </Wrapper>
        </ModalWrapper>
    );
};

export default SwapSuccessModal;
