import * as React from 'react';
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { createDelegatee } from 'api/delegate';

import { DelegateRoutes } from 'constants/routes';

import { StellarService, ToastService } from 'services/globalServices';

import CircleButton from 'web/basics/buttons/CircleButton';
import { cardBoxShadow, respondDown } from 'web/mixins';
import { Breakpoints, COLORS, FONT_SIZE } from 'web/styles';

import ArrowLeft from 'assets/icon-arrow-left.svg';

import { Button } from 'basics/buttons';
import { Input, TextArea } from 'basics/inputs';
import ImageInput from 'basics/inputs/ImageInput';

const Container = styled.main`
    flex: 1 0 auto;
`;

const Background = styled.div`
    width: 100%;
    background-color: ${COLORS.lightGray};
    padding: 7.7rem 0 21.2rem;

    ${respondDown(Breakpoints.md)`
        padding: 3.2rem 0 0;
    `};
`;

const Content = styled.div`
    width: 79.2rem;
    margin: 0 auto;

    ${respondDown(Breakpoints.md)`
        width: 100%;
        padding: 1.6rem;
    `};
`;

const FormWrapper = styled(Content)`
    position: relative;
    top: -17rem;

    ${respondDown(Breakpoints.md)`
        top: 0;
    `};
`;

const Title = styled.h2`
    font-weight: 700;
    ${FONT_SIZE.xxl}
    color: ${COLORS.titleText};

    ${respondDown(Breakpoints.md)`
        width: 100%;
         ${FONT_SIZE.xl}
    `};
`;

const Description = styled.p`
    ${FONT_SIZE.md};
    color: ${COLORS.descriptionText};
`;

const DescriptionLink = styled.span`
    color: ${COLORS.purple};
    text-decoration: underline;
`;

const Form = styled.form`
    background: ${COLORS.white};
    border-radius: 1rem;
    ${cardBoxShadow};
    padding: 6.4rem 4.8rem;
    display: flex;
    flex-direction: column;

    ${respondDown(Breakpoints.md)`
        padding: 4rem 1.6rem;
    `};
`;

const InputStyled = styled(Input)`
    margin-bottom: 2.4rem;
`;

const ImageInputStyled = styled(ImageInput)`
    margin-bottom: 2.4rem;
`;

const TextAreaStyled = styled(TextArea)`
    margin-bottom: 2.4rem;
`;

const ButtonStyled = styled(Button)`
    margin-top: 3.2rem;
`;

const BackButton = styled(CircleButton)`
    margin-bottom: 7.2rem;

    ${respondDown(Breakpoints.md)`
        margin-bottom: 3.2rem;
    `}
`;

const LinkStyled = styled(Link)`
    text-decoration: none;
    cursor: pointer;
`;

const InputName = styled.span`
    color: ${COLORS.titleText};
    ${FONT_SIZE.md};
    margin-bottom: 0.8rem;
`;

const InputDescription = styled.span`
    color: ${COLORS.grayText};
    ${FONT_SIZE.sm};
    margin-bottom: 0.8rem;
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
                    'Thanks for applying! We’ll review your submission and reach out via Discord or X once selected.',
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
                    <LinkStyled to={DelegateRoutes.main}>
                        <BackButton label="Back to delegates">
                            <ArrowLeft />
                        </BackButton>
                    </LinkStyled>

                    <Title>Delegate Application Form</Title>
                    <Description>
                        Apply to become an Aquarius Delegate. If selected, your profile will be
                        featured on <DescriptionLink>aqua.network</DescriptionLink>, and users will
                        be able to delegate ICE to your wallet. You’ll vote on their behalf and earn
                        a share of protocol rewards.
                    </Description>
                </Content>
            </Background>

            <FormWrapper>
                <Form onSubmit={handleSubmit}>
                    <InputName>Display Name</InputName>
                    <InputDescription>
                        Public name to be shown on the delegate page.
                    </InputDescription>
                    <InputStyled
                        placeholder="Your name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                    />

                    <InputName>Stellar Wallet Address</InputName>
                    <InputDescription>
                        Must be the Stellar wallet you control that will receive delegations and
                        cast votes.
                    </InputDescription>
                    <InputStyled
                        placeholder="G..."
                        value={account}
                        onChange={handleAccountChange}
                        ref={inputAccountRef}
                        required
                    />

                    <InputName>Profile Picture</InputName>
                    <InputDescription>
                        Upload a visual icon or photo to represent your delegate profile.
                    </InputDescription>

                    <ImageInputStyled onChange={setAvatar} value={avatar} required />

                    <InputName>Discord Username</InputName>
                    <InputDescription>
                        Used to connect with you or add you to the delegate chat.
                    </InputDescription>

                    <InputStyled
                        placeholder="username"
                        value={discord}
                        onChange={e => setDiscord(e.target.value)}
                        required
                    />

                    <InputName>Affiliated Project / Organization</InputName>
                    <InputDescription>
                        Name of any project, DAO, or team you represent (if applicable).
                    </InputDescription>

                    <InputStyled
                        placeholder="e.g. Aquanauts DAO, StellarBridge Labs"
                        value={project}
                        onChange={e => setProject(e.target.value)}
                    />

                    <InputName>X (Twitter) Handle</InputName>
                    <InputDescription>
                        Public social media reference for visibility.
                    </InputDescription>

                    <InputStyled
                        placeholder="https://x.com/username"
                        value={xLink}
                        onChange={e => setXLink(e.target.value)}
                        pattern="https:\/\/x\.com\/[A-Za-z0-9_]{1,15}"
                    />

                    <InputName>Description</InputName>
                    <InputDescription>
                        Short multiline bio that introduces who you are and what your background is.
                    </InputDescription>

                    <TextAreaStyled
                        placeholder="А few words about you. Less than 140 characters"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        required
                        maxLength={140}
                        autosize
                        rows={2}
                    ></TextAreaStyled>

                    <InputName>Voting Strategy</InputName>
                    <InputDescription>
                        Explain how you plan to use delegated votes. For example: focus on top
                        traded pools, support long-term ecosystem growth, rotate weekly, etc.
                    </InputDescription>

                    <TextAreaStyled
                        placeholder="Short description of your investment strategy. Less than 140 characters"
                        value={strategy}
                        onChange={e => setStrategy(e.target.value)}
                        required
                        maxLength={140}
                        autosize
                        rows={2}
                    ></TextAreaStyled>

                    <ButtonStyled isBig type="submit" pending={pending}>
                        submit
                    </ButtonStyled>
                </Form>
            </FormWrapper>
        </Container>
    );
};

export default BecomeDelegate;
