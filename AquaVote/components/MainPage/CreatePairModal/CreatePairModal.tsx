import * as React from 'react';
import { useState } from 'react';
import {
    ModalDescription,
    ModalProps,
    ModalTitle,
} from '../../../../common/modals/atoms/ModalAtoms';
import styled from 'styled-components';
import { flexAllCenter, flexRowSpaceBetween } from '../../../../common/mixins';
import { COLORS } from '../../../../common/styles';
import useAuthStore from '../../../../common/store/authStore/useAuthStore';
import Button from '../../../../common/basics/Button';
import Pair from '../../common/Pair';
import * as StellarSdk from 'stellar-sdk';

const ContentRow = styled.div`
    ${flexRowSpaceBetween};
    width: 52.8rem;
    margin-top: 3rem;
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.paragraphText};
`;
const Content = styled.div`
    padding-bottom: 2.6rem;
    border-bottom: 0.1rem dashed ${COLORS.gray};
`;

const AssetsInfo = styled.div`
    ${flexAllCenter};
    padding: 3.5rem 0;
    background-color: ${COLORS.lightGray};
    border-radius: 0.5rem;
`;

const Label = styled.span`
    font-size: 1.6rem;
    line-height: 1.8rem;
    color: ${COLORS.grayText};
    ${flexAllCenter};
`;

const StyledButton = styled(Button)`
    margin-top: 3.2rem;
`;

const CreatePairModal = ({
    params,
    close,
}: ModalProps<{ base: any; counter: any }>): JSX.Element => {
    const { account } = useAuthStore();
    const { base, counter } = params;

    const [pending, setPending] = useState(false);

    const baseInstance = new StellarSdk.Asset(base.code, base.issuer);
    const isBaseNative = baseInstance.isNative();

    const counterInstance = new StellarSdk.Asset(counter.code, counter.issuer);
    const isCounterNative = counterInstance.isNative();

    const onSubmit = () => {
        console.log('create pair');
    };

    return (
        <>
            <ModalTitle>Create pair</ModalTitle>
            <ModalDescription>
                To create a pair, you need to pay for the trustlines for transactions.
            </ModalDescription>
            <Content>
                <AssetsInfo>
                    <Pair
                        verticalDirections
                        base={{
                            code: base.code,
                            issuer: base.issuer,
                        }}
                        counter={{
                            code: counter.code,
                            issuer: counter.issuer,
                        }}
                    />
                </AssetsInfo>
                <ContentRow>
                    <Label>Base account reserve</Label>
                    <span>1 XLM</span>
                </ContentRow>
                {!isBaseNative && (
                    <ContentRow>
                        <Label>{base.code} trustline</Label>
                        <span>0.5 XLM</span>
                    </ContentRow>
                )}
                {!isCounterNative && (
                    <ContentRow>
                        <Label>{counter.code} trustline</Label>
                        <span>0.5 XLM</span>
                    </ContentRow>
                )}
                <ContentRow>
                    <Label>Marker Key signer</Label>
                    <span>0.5 XLM</span>
                </ContentRow>
                <ContentRow>
                    <Label>Total:</Label>
                    <span>{isBaseNative || isCounterNative ? '2' : '2.5'} XLM</span>
                </ContentRow>
            </Content>

            <StyledButton fullWidth onClick={() => onSubmit()} pending={pending}>
                Create pair
            </StyledButton>
        </>
    );
};

export default CreatePairModal;
