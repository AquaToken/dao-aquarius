import * as React from 'react';
import { FormEvent, useState } from 'react';
import styled from 'styled-components';

import Button from 'basics/buttons/Button';
import Input from 'basics/inputs/Input';

import { respondDown } from '../mixins';
import { Breakpoints, COLORS } from '../styles';

const Wrapper = styled.div`
    display: flex;
    width: 100%;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-end;
    border-radius: 1.6rem;
    background: ${COLORS.lightGray};
    margin-top: 3.2rem;

    ${respondDown(Breakpoints.md)`
        padding: 0 1.6rem;
        max-width: 55rem;
    `}
`;

const SubscribeBlock = styled.div`
    display: flex;
    justify-content: space-between;
    width: 100%;

    border-radius: 0.5rem;
    padding: 4.6rem 4rem 4rem;

    ${respondDown(Breakpoints.lg)`
        flex-direction: column;
    `}
`;

const Header = styled.div`
    display: flex;
    flex: 1;
    flex-direction: column;

    ${respondDown(Breakpoints.lg)`
        text-align: center;
        margin-bottom: 2.7rem;
    `}
`;

const Title = styled.div`
    font-size: 3.5rem;
    line-height: 4.1rem;
    color: ${COLORS.titleText};
    margin-bottom: 0;
`;

const Description = styled.div`
    font-size: 1.6rem;
    line-height: 3rem;
    color: ${COLORS.descriptionText};
    opacity: 0.7;

    ${respondDown(Breakpoints.md)`
        margin-top: 1.6rem;
        font-size: 1.4rem;
        line-height: 180%;
    `}
`;

const FormContainer = styled.div`
    display: flex;
    flex: 1.2;
    width: 100%;
`;

const Form = styled.form`
    display: flex;
    justify-content: space-around;
    align-items: center;
    width: 100%;

    ${respondDown(Breakpoints.md)`
        flex-direction: column;
    `}
`;

const StyledButton = styled(Button)`
    margin-left: 2.5rem;

    ${respondDown(Breakpoints.md)`
        margin: 2.7rem 0;
        width: 100%;
    `}
`;

const encode = (data: { [key: string]: string }) =>
    Object.keys(data)
        .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
        .join('&');

const Subscribe = (): React.ReactNode => {
    const [email, setEmail] = useState('');

    const handleSubmit = (e: React.SyntheticEvent<FormEvent>) => {
        fetch('/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: encode({ 'form-name': 'subscribe', email }),
        })
            .then(() => alert('Success!'))
            .catch(error => alert(error));

        e.preventDefault();
    };

    return (
        <Wrapper>
            <SubscribeBlock>
                <Header>
                    <Title>Subscribe to stay updated</Title>
                    <Description>
                        Aquarius is moving fast, do not forget to subscribe to news
                    </Description>
                </Header>
                <FormContainer>
                    <Form onSubmit={handleSubmit}>
                        <input type="hidden" name="form-name" value="subscribe" />

                        <Input
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                        <StyledButton isBig type="submit">
                            Subscribe
                        </StyledButton>
                    </Form>
                </FormContainer>
            </SubscribeBlock>
        </Wrapper>
    );
};

export default Subscribe;
