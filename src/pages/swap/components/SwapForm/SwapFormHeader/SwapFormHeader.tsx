import * as React from 'react';
import styled from 'styled-components';

import { ModalService } from 'services/globalServices';
import { flexAllCenter, flexRowSpaceBetween, respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import SettingsIcon from 'assets/icon-settings.svg';

import SwapSettingsModal from '../../SwapSettingsModal/SwapSettingsModal';

const Container = styled.div`
    ${flexRowSpaceBetween};
    margin-bottom: 4.8rem;
`;

const Title = styled.h2`
    font-size: 3.6rem;
    line-height: 4.2rem;
    color: ${COLORS.titleText};
    font-weight: 400;

    ${respondDown(Breakpoints.md)`
        font-size: 2rem;
   `}
`;

const StyledButton = styled.div`
    ${flexAllCenter};
    border-radius: 0.3rem;
    padding: 1rem;
    cursor: pointer;

    &:hover {
        background-color: ${COLORS.lightGray};
    }
`;

const SwapFormHeader = () => (
    <Container>
        <Title>Swap assets</Title>
        <StyledButton onClick={() => ModalService.openModal(SwapSettingsModal, {})}>
            <SettingsIcon />
        </StyledButton>
    </Container>
);

export default SwapFormHeader;
