import * as React from 'react';
import styled from 'styled-components';

import { ModalService } from 'services/globalServices';
import { flexAllCenter, respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import ArrowsCircle from 'assets/icon-arrows-circle.svg';

import AccountInput from '../../../AccountInput/AccountInput';

const Wrapper = styled.div`
    ${flexAllCenter};
    cursor: pointer;
`;

const ButtonText = styled.span`
    font-size: 1.4rem;
    line-height: 2rem;
    color: ${COLORS.grayText};
    margin-right: 1.6rem;

    ${respondDown(Breakpoints.md)`
        display: none;
    `}
`;

const IconContainer = styled.div`
    ${flexAllCenter};
    background-color: ${COLORS.white};
    box-shadow: 0 2rem 3rem rgba(0, 6, 54, 0.06);
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
