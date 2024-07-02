import * as React from 'react';
import styled from 'styled-components';
import { flexAllCenter, respondDown } from '../../../../common/mixins';
import { Breakpoints, COLORS } from '../../../../common/styles';
import { ModalTitle } from '../../../../common/modals/atoms/ModalAtoms';
import Pair from '../../../vote/components/common/Pair';
import Button from '../../../../common/basics/Button';
import ExternalLink from '../../../../common/basics/ExternalLink';

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
    console.log(hash);
    return (
        <Container>
            <ModalTitle>{title ?? 'Success'}</ModalTitle>
            <AssetsInfo>
                <Pair
                    base={assets[0]}
                    counter={assets[1]}
                    thirdAsset={assets[2]}
                    fourthAsset={assets[3]}
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
