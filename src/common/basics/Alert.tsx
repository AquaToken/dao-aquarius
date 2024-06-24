import * as React from 'react';
import styled from 'styled-components';
import IconAlert from '../assets/img/icon-alert.svg';
import { COLORS } from '../styles';
import { flexAllCenter } from '../mixins';

const Container = styled.div`
    display: flex;
    background-color: ${COLORS.lightGray};
    border-radius: 0.5rem;
    padding: 3.2rem 2.4rem;
    margin-top: 2.1rem;
    width: 100%;
`;

const IconWrapper = styled.div`
    ${flexAllCenter};
    height: 7.4rem;
    min-height: 7.4rem;
    width: 7.4rem;
    min-width: 7.4rem;
    background-color: ${COLORS.white};
    border-radius: 50%;
    border: 0.2rem solid ${COLORS.lightGray};
    margin-right: 2.4rem;
`;

const Content = styled.div`
    display: flex;
    flex-direction: column;
`;

const Title = styled.span`
    font-weight: 400;
    font-size: 1.6rem;
    line-height: 2.3rem;
    color: ${COLORS.paragraphText};
    margin-bottom: 0.8rem;
`;

const Text = styled.span`
    font-weight: 400;
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.grayText};
`;

const Alert = ({ title, text }) => {
    return (
        <Container>
            <IconWrapper>
                <IconAlert />
            </IconWrapper>
            <Content>
                <Title>{title}</Title>
                <Text>{text}</Text>
            </Content>
        </Container>
    );
};

export default Alert;
