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
}: ModalProps<{ option: string; key: string; endDate: string }>) => {
    const { account } = useAuthStore();

    const [pending, setPending] = useState(false);

    const firstAssetCode = 'yXLM';
    const secondAssetCode = 'SOL';

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
                <AssetsInfo>assetsinfo</AssetsInfo>
                <ContentRow>
                    <Label>Base account reserve</Label>
                    <span>1 XLM</span>
                </ContentRow>
                <ContentRow>
                    <Label>{firstAssetCode} trustline</Label>
                    <span>0.5 XLM</span>
                </ContentRow>
                <ContentRow>
                    <Label>{secondAssetCode} trustline</Label>
                    <span>0.5 XLM</span>
                </ContentRow>
                <ContentRow>
                    <Label>AQUA trustline</Label>
                    <span>0.5 XLM</span>
                </ContentRow>
                <ContentRow>
                    <Label>Total:</Label>
                    <span>2.5 XLM</span>
                </ContentRow>
            </Content>

            <StyledButton fullWidth onClick={() => onSubmit()} pending={pending}>
                Create pair
            </StyledButton>
        </>
    );
};

export default CreatePairModal;
