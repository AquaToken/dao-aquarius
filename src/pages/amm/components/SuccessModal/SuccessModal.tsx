import styled from 'styled-components';

import { getIsTestnetEnv } from 'helpers/env';

import { ModalProps } from 'types/modal';
import { Token } from 'types/token';

import { flexAllCenter } from 'web/mixins';
import { COLORS } from 'web/styles';

import Button from 'basics/buttons/Button';
import { ExternalLink } from 'basics/links';
import Market from 'basics/Market';
import { ModalTitle, ModalWrapper } from 'basics/ModalAtoms';

const AssetsInfo = styled.div`
    ${flexAllCenter};
    flex-direction: column;
    padding: 3.5rem 0;
    background-color: ${COLORS.gray50};
    border-radius: 0.5rem;
    margin-top: 4rem;
    gap: 2.4rem;
`;

const StyledButton = styled(Button)`
    margin-left: auto;
    margin-top: 4.8rem;
`;

interface SuccessModalParams {
    assets: Token[];
    amounts: string[];
    title: string;
    isSwap?: boolean;
    hash?: string;
}

const SuccessModal = ({ params, close }: ModalProps<SuccessModalParams>) => {
    const { assets, amounts, title, isSwap, hash } = params;

    return (
        <ModalWrapper>
            <ModalTitle>{title ?? 'Success'}</ModalTitle>
            <AssetsInfo>
                <Market
                    assets={assets}
                    verticalDirections
                    withoutLink
                    amounts={amounts}
                    isSwapResult={isSwap}
                />
                <ExternalLink
                    href={`https://stellar.expert/explorer/${
                        getIsTestnetEnv() ? 'testnet' : 'public'
                    }/tx/${hash}`}
                >
                    View on Explorer
                </ExternalLink>
            </AssetsInfo>

            <StyledButton onClick={() => close()}>done</StyledButton>
        </ModalWrapper>
    );
};

export default SuccessModal;
