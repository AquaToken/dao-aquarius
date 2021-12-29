import * as React from 'react';
import styled from 'styled-components';
import { COLORS } from '../../../../common/styles';
import Input from '../../../../common/basics/Input';
import Button from '../../../../common/basics/Button';
import { useState } from 'react';
import { StellarService, ToastService } from '../../../../common/services/globalServices';
import { useHistory } from 'react-router-dom';

const Container = styled.div<{ isModal }>`
    display: flex;
    flex-direction: column;
    background-color: ${COLORS.white};
    box-shadow: ${({ isModal }) => (isModal ? 'unset' : '0 2rem 3rem rgba(0, 6, 54, 0.06)')};
    border-radius: 1rem;
    padding: ${({ isModal }) => (isModal ? '0' : '4.8rem')};
    min-width: 48rem;
`;

const InputBlock = styled.div`
    display: flex;
    flex-direction: column;
    padding-bottom: 4rem;
    border-bottom: 0.1rem dashed ${COLORS.gray};
`;

const Title = styled.span`
    font-size: 3.6rem;
    line-height: 4.2rem;
    color: ${COLORS.titleText};
    margin-bottom: 0.8rem;
`;

const Description = styled.span`
    font-size: 1.4rem;
    line-height: 2rem;
    color: ${COLORS.descriptionText};
    margin-bottom: 4rem;
`;

const StyledButton = styled(Button)`
    margin-top: 4rem;
`;

const AccountInput = ({ params, close }: { params?: any; close?: any }) => {
    const isModal = params?.isModal ?? false;
    const [value, setValue] = useState('');
    const history = useHistory();

    const onSubmit = () => {
        if (!StellarService.isValidPublicKey(value)) {
            ToastService.showErrorToast('Invalid public key');
            return;
        }
        history.push(`/${value}`);
        if (isModal) {
            close();
        }
    };

    return (
        <Container isModal={isModal}>
            <InputBlock>
                <Title>{isModal ? 'Check other account' : 'Check your account'}</Title>
                <Description>You can lock your AQUA token to get airdrop boost</Description>
                <Input
                    placeholder="Enter your public key (starts with G)"
                    value={value}
                    onChange={(e) => {
                        setValue(e.target.value);
                    }}
                />
            </InputBlock>
            <StyledButton isBig disabled={!value} onClick={() => onSubmit()}>
                {isModal ? 'Check account' : 'let’s start'}
            </StyledButton>
        </Container>
    );
};

export default AccountInput;
