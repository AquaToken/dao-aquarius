import * as React from 'react';
import styled from 'styled-components';

import { ModalService } from 'services/globalServices';

import ArrowsCircle from 'assets/icons/arrows/arrows-circle-16.svg';

import { cardBoxShadow, flexAllCenter, respondDown } from '../../../../../web/mixins';
import { Breakpoints, COLORS } from '../../../../../web/styles';

const Wrapper = styled.div`
    ${flexAllCenter};
    cursor: pointer;
`;

const ButtonText = styled.span`
    font-size: 1.4rem;
    line-height: 2rem;
    color: ${COLORS.textGray};
    margin-right: 1.6rem;

    ${respondDown(Breakpoints.md)`
        display: none;
    `}
`;

const IconContainer = styled.div`
    ${flexAllCenter};
    ${cardBoxShadow};
    background-color: ${COLORS.white};
    height: 4.8rem;
    width: 4.8rem;
    border-radius: 50%;
`;

const OtherAccountButton = () => {
    const onClick = () => {
        ModalService.openModal(AccountInput, { isModal: true });
    };
    return (
        <Wrapper onClick={() => onClick()}>
            <ButtonText>Other account</ButtonText>
            <IconContainer>
                <ArrowsCircle />
            </IconContainer>
        </Wrapper>
    );
};

export default OtherAccountButton;
