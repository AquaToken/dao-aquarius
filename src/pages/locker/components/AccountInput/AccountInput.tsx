import * as React from 'react';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';

import { LockerRoutes } from 'constants/routes';

import useAuthStore from 'store/authStore/useAuthStore';

import { ModalProps } from 'types/modal';

import { StellarService, ToastService } from 'services/globalServices';
import { respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import Button from 'basics/buttons/Button';
import Input from 'basics/inputs/Input';

const Container = styled.form<{ $isModal: boolean }>`
    display: flex;
    flex-direction: ${({ $isModal }) => ($isModal ? 'column' : 'row')};
    background-color: ${COLORS.white};
    box-shadow: ${({ $isModal }) => ($isModal ? 'unset' : '0 2rem 3rem rgba(0, 6, 54, 0.06)')};
    border-radius: 1rem;
    padding: ${({ $isModal }) => ($isModal ? '0' : '4.8rem')};
    width: ${({ $isModal }) => ($isModal ? '48rem' : 'unset')};
    margin: ${({ $isModal }) => ($isModal ? '0' : '-8rem 4rem 0')};
    gap: ${({ $isModal }) => ($isModal ? '0' : '6rem')};

    ${respondDown(Breakpoints.xl)`
        margin: 0;
    `}

    ${respondDown(Breakpoints.md)`
        width: 100%;
        box-shadow: unset;
        padding: 4rem 1.6rem;
        flex-direction: column;
        gap: 0;
    `}
`;

const TextBlock = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
`;

const InputBlock = styled.div<{ $isModal: boolean }>`
    width: ${({ $isModal }) => ($isModal ? '100%' : '130%')};
    padding-bottom: ${({ $isModal }) => ($isModal ? '4rem' : '0')};
    border-bottom: ${({ $isModal }) => ($isModal ? `0.1rem dashed ${COLORS.gray}` : 'none')};

    ${respondDown(Breakpoints.md)`
        width: 100%;
        padding-bottom: 4rem;
        border-bottom: 0.1rem dashed ${COLORS.gray};
    `}
`;

const Title = styled.span`
    font-size: 3.6rem;
    line-height: 4.2rem;
    color: ${COLORS.titleText};
    margin-bottom: 0.8rem;
`;

const Description = styled.span<{ $isModal: boolean }>`
    font-size: 1.4rem;
    line-height: 2rem;
    color: ${COLORS.descriptionText};
    margin-bottom: ${({ $isModal }) => ($isModal ? '4rem' : '0')};

    ${respondDown(Breakpoints.md)`
        margin-bottom: 4rem;
    `}
`;

const StyledButton = styled(Button)<{ $isModal: boolean }>`
    width: 100%;
    margin-top: ${({ $isModal }) => ($isModal ? '4rem' : '0')};
    padding: 0;

    ${respondDown(Breakpoints.md)`
        margin-top: 4rem;
    `}
`;

interface AccountInputParams {
    isModal?: boolean;
}

const AccountInput = ({ params, close }: ModalProps<AccountInputParams>) => {
    const { isLogged, logout, account } = useAuthStore();

    const isModal = params?.isModal ?? false;
    const [value, setValue] = useState(isLogged && !isModal ? account.accountId() : '');
    const history = useHistory();

    useEffect(() => {
        if (isLogged && !isModal) {
            setValue(account.accountId());
        }
    }, [isLogged]);

    const onSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!StellarService.isValidPublicKey(value)) {
            ToastService.showErrorToast('Invalid public key');
            return;
        }
        if (isLogged && isModal) {
            logout();
        }
        history.push(`${LockerRoutes.main}/${value}`);
        if (isModal) {
            close();
        }
    };

    return (
        <Container $isModal={isModal} onSubmit={onSubmit}>
            <TextBlock>
                <Title>{isModal ? 'Switch account' : 'Check your account'}</Title>
                <Description $isModal={isModal}>Track your AQUA locks and ICE balance.</Description>
            </TextBlock>
            <InputBlock $isModal={isModal}>
                <Input
                    placeholder="Enter your public key (starts with G)"
                    value={value}
                    onChange={e => {
                        setValue(e.target.value);
                    }}
                />
            </InputBlock>
            <StyledButton isBig disabled={!value} $isModal={isModal} type="submit">
                {isModal ? 'Continue' : "let's start"}
            </StyledButton>
        </Container>
    );
};

export default AccountInput;
