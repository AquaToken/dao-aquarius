import * as React from 'react';
import styled from 'styled-components';

import Button from 'basics/buttons/Button';
import ExternalLink from 'basics/ExternalLink';

import { flexAllCenter, respondDown } from '../../../../common/mixins';
import { ModalTitle } from '../../../../common/modals/atoms/ModalAtoms';
import { Breakpoints, COLORS } from '../../../../common/styles';
import Market from '../../../vote/components/common/Market';

const Container = styled.div`
    width: 52.3rem;
    align-items: center;

    ${respondDown(Breakpoints.md)`
        width: 100%;
    `}
`;

const AssetsInfo = styled.div`
    ${flexAllCenter};
    flex-direction: column;
    padding: 3.5rem 0;
    background-color: ${COLORS.lightGray};
    border-radius: 0.5rem;
    margin-top: 4rem;
    gap: 2.4rem;
`;

const StyledButton = styled(Button)`
    margin-left: auto;
    margin-top: 4.8rem;
`;

const SuccessModal = ({ params, close }) => {
    const { assets, amounts, title, isSwap, hash } = params;
    return (
        <Container>
            <ModalTitle>{title ?? 'Success'}</ModalTitle>
            <AssetsInfo>
                <Market
                    assets={assets}
                    verticalDirections
                    withoutLink
                    amounts={amounts}
                    isSwapResult={isSwap}
                />
                <ExternalLink href={`https://stellar.expert/explorer/public/tx/${hash}`}>
                    View on Explorer
                </ExternalLink>
            </AssetsInfo>

            <StyledButton onClick={() => close()}>done</StyledButton>
        </Container>
    );
};

export default SuccessModal;
