import * as React from 'react';
import { useRef, useState } from 'react';
import styled from 'styled-components';

import { createDelegatee } from 'api/delegate';

import { StellarService, ToastService } from 'services/globalServices';

import { cardBoxShadow } from 'web/mixins';
import { COLORS, FONT_SIZE } from 'web/styles';

import { Button } from 'basics/buttons';
import { Input } from 'basics/inputs';
import ImageInput from 'basics/inputs/ImageInput';

const Container = styled.main`
    flex: 1 0 auto;
`;

const Background = styled.div`
    width: 100%;
    background-color: ${COLORS.lightGray};
    padding: 7.7rem 0 21.2rem;
`;

const Content = styled.div`
    width: 79.2rem;
    margin: 0 auto;
`;

const FormWrapper = styled(Content)`
    position: relative;
    top: -17rem;
`;

const Title = styled.h2`
    font-weight: 700;
    ${FONT_SIZE.xxl}
    color: ${COLORS.titleText};
`;

const Description = styled.p`
    ${FONT_SIZE.md};
    color: ${COLORS.descriptionText};
`;

const Form = styled.form`
    background: ${COLORS.white};
    border-radius: 1rem;
    ${cardBoxShadow};
    padding: 6.4rem 4.8rem;
    display: flex;
    flex-direction: column;
`;

const InputStyled = styled(Input)`
    margin-bottom: 7rem;
`;

const ImageInputStyled = styled(ImageInput)`
    margin-bottom: 7rem;
`;

const ButtonStyled = styled(Button)`
    margin-top: 3.2rem;
`;

const BecomeDelegate = () => {
    const [account, setAccount] = useState<string>('');
    const [name, setName] = useState<string>('');
    const [avatar, setAvatar] = useState<string | null>(null);
    const [discord, setDiscord] = useState<string>('');
    const [project, setProject] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [strategy, setStrategy] = useState<string>('');
    const [xLink, setXLink] = useState<string>('');

    const [pending, setPending] = useState<boolean>(false);

    const inputAccountRef = useRef(null);

    const clearForm = () => {
        setAccount('');
        setName('');
        setAvatar(null);
        setDiscord('');
        setProject('');
        setDescription('');
        setStrategy('');
        setXLink('');
    };

    const handleAccountChange = e => {
        const value = e.target.value;
        setAccount(value);

        if (value === '') {
            inputAccountRef.current.setCustomValidity('Required field');
        } else if (!StellarService.isValidPublicKey(value)) {
            inputAccountRef.current.setCustomValidity('Invalid Stellar public key');
        } else {
            inputAccountRef.current.setCustomValidity(''); // Очищаем ошибку
        }
    };

    const handleSubmit = e => {
        e.preventDefault();

        if (!inputAccountRef.current.checkValidity()) {
            inputAccountRef.current.reportValidity();
        }

        setPending(true);

        createDelegatee({ name, account, avatar, description, discord, project, strategy, xLink })
            .then(() => {
                setPending(false);
                clearForm();
                ToastService.showSuccessToast(
                    'Your application to participate as a delegate has been successfully submitted.',
                );
            })
            .catch(err => {
                console.log(err);
                ToastService.showSuccessToast('Something went wrong.');
                setPending(false);
            });
    };

    return (
        <Container>
            <Background>
                <Content>
                    <Title>Call for Aquarius delegates</Title>
                    <Description>
                        Aquarius is launching the Delegated Voting feature: users can now delegate
                        their ICE tokens to a delegate who will vote on their behalf — backed by
                        incentives from the Aquarius DAO.
                    </Description>
                </Content>
            </Background>

            <FormWrapper>
                <Form onSubmit={handleSubmit}>
                    <InputStyled
                        label="Stellar account:"
                        placeholder="G..."
                        value={account}
                        onChange={handleAccountChange}
                        ref={inputAccountRef}
                        required
                    />
                    <InputStyled
                        label="Name"
                        placeholder="Your name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                    />

                    <ImageInputStyled
                        label="Choose avatar"
                        onChange={setAvatar}
                        value={avatar}
                        required
                    />

                    <InputStyled
                        label="Discord handle"
                        placeholder="username"
                        value={discord}
                        onChange={e => setDiscord(e.target.value)}
                        required
                    />
                    <InputStyled
                        label="Affiliate project (optional)"
                        placeholder="Project with which you associate your investment activity"
                        value={project}
                        onChange={e => setProject(e.target.value)}
                    />
                    <InputStyled
                        label="Description "
                        placeholder="А few words about you. Less than 140 characters"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        required
                        maxLength={140}
                    />
                    <InputStyled
                        label="Voting strategy"
                        placeholder="Short description of your investment strategy Less than 140 characters"
                        value={strategy}
                        onChange={e => setStrategy(e.target.value)}
                        required
                        maxLength={140}
                    />
                    <Input
                        label="X link (optional)"
                        placeholder="https://x.com/username"
                        value={xLink}
                        onChange={e => setXLink(e.target.value)}
                        pattern="https:\/\/x\.com\/[A-Za-z0-9_]{1,15}"
                    />

                    <ButtonStyled isBig type="submit" pending={pending}>
                        send
                    </ButtonStyled>
                </Form>
            </FormWrapper>
        </Container>
    );
};

export default BecomeDelegate;
