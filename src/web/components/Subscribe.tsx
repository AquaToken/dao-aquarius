import * as React from 'react';
import { FormEvent, useState } from 'react';
import styled, { css } from 'styled-components';

import { useScrollAnimation } from 'hooks/useScrollAnimation';

import { slideUpSoftAnimation, containerScrollAnimation } from 'web/animations';

import Button from 'basics/buttons/Button';
import Input from 'basics/inputs/Input';

import { respondDown } from '../mixins';
import { Breakpoints, COLORS } from '../styles';

/* -------------------------------------------------------------------------- */
/*                                   Styles                                   */
/* -------------------------------------------------------------------------- */

const Wrapper = styled.div<{ $visible: boolean }>`
    display: flex;
    width: 100%;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-end;
    margin-top: 3.2rem;
    opacity: 0;
    ${containerScrollAnimation};

    ${({ $visible }) =>
        $visible &&
        css`
            ${slideUpSoftAnimation};
        `}
`;

const SubscribeBlock = styled.div`
    display: flex;
    justify-content: space-between;
    width: 100%;
    background: ${COLORS.gray50};
    padding: 4rem 4.6rem;
    border-radius: 2.4rem;

    ${respondDown(Breakpoints.lg)`
        flex-direction: column;
    `}

    ${respondDown(Breakpoints.md)`
        padding: 3.2rem;
    `}

    ${respondDown(Breakpoints.xs)`
        border-radius: 0;
    `}
`;

const Header = styled.div`
    display: flex;
    flex: 3;
    flex-direction: column;

    ${respondDown(Breakpoints.lg)`
        margin-bottom: 3.2rem;
    `}

    ${respondDown(Breakpoints.xs)`
        display: none;
        margin-bottom: 2.4rem;
    `}
`;

const HeaderXS = styled(Header)`
    display: none;

    ${respondDown(Breakpoints.xs)`
        display: block;
    `}
`;

const Title = styled.div`
    font-size: 3.5rem;
    line-height: 4.1rem;
    color: ${COLORS.textPrimary};
    margin-bottom: 0;

    ${respondDown(Breakpoints.xs)`
        margin-bottom: 1.6rem;
    `}
`;

const Description = styled.div`
    font-size: 1.6rem;
    line-height: 180%;
    color: ${COLORS.textSecondary};
    opacity: 0.7;

    ${respondDown(Breakpoints.md)`
        font-size: 1.4rem;
    `}
`;

const Form = styled.form`
    display: flex;
    flex: 4;
    justify-content: space-around;
    align-items: center;
    width: 100%;
    gap: 2.6rem;

    ${respondDown(Breakpoints.xs)`
        flex-direction: column;
    `}
`;

const StyledButton = styled(Button)`
    max-width: 20rem;

    ${respondDown(Breakpoints.md)`
        max-width: 26rem;
    `};

    ${respondDown(Breakpoints.sm)`
        max-width: 19rem;
    `};

    ${respondDown(Breakpoints.xs)`
        width: 100%;
        max-width: 100%;
    `};
`;

/* -------------------------------------------------------------------------- */
/*                                   Logic                                    */
/* -------------------------------------------------------------------------- */

const encode = (data: { [key: string]: string }) =>
    Object.keys(data)
        .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
        .join('&');

const Subscribe = (): React.ReactNode => {
    const [email, setEmail] = useState('');
    const { ref, visible } = useScrollAnimation(0.25, true);

    const handleSubmit = (e: React.SyntheticEvent<FormEvent>) => {
        e.preventDefault();
        fetch('/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: encode({ 'form-name': 'subscribe', email }),
        })
            .then(() => alert('Success!'))
            .catch(error => alert(error));
    };

    const HeaderContent = (
        <>
            <Title>Subscribe to stay updated</Title>
            <Description>Aquarius is moving fast, do not forget to subscribe to news</Description>
        </>
    );

    return (
        <Wrapper ref={ref as React.RefObject<HTMLDivElement>} $visible={visible}>
            <HeaderXS>{HeaderContent}</HeaderXS>
            <SubscribeBlock>
                <Header>{HeaderContent}</Header>
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
            </SubscribeBlock>
        </Wrapper>
    );
};

export default Subscribe;
