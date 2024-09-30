import * as React from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';

import { ModalProps } from 'types/modal';

import Button from 'basics/buttons/Button';
import { ModalDescription, ModalTitle } from 'basics/ModalAtoms';

import { MainRoutes } from '../../../routes';
import { respondDown } from '../../mixins';
import { Breakpoints } from '../../styles';

const Container = styled.div`
    width: 52.8rem;

    ${respondDown(Breakpoints.md)`
        width: 100%;
    `}
`;

const Buttons = styled.div`
    display: flex;
    gap: 2.4rem;
    margin-top: 7.3rem;

    ${respondDown(Breakpoints.md)`
        flex-direction: column;
    `}
`;

const ButtonStyled = styled(Button)`
    width: 25rem;

    ${respondDown(Breakpoints.md)`
        width: 100%;
    `}
`;

export const LIVE_ON_SOROBAN_SHOWED_ALIAS = 'live_on_soroban_showed';

const LiveOnSorobanAlert = ({ confirm }: ModalProps<never>) => {
    const history = useHistory();

    const onSubmit = (route: string) => {
        history.push(route);
        localStorage.setItem(LIVE_ON_SOROBAN_SHOWED_ALIAS, 'true');
        confirm();
    };
    return (
        <Container>
            <ModalTitle>Aquarius is live on Soroban!</ModalTitle>
            <ModalDescription>
                We have launched our AMM protocol on Pubnet. Volatile and Stable pools, as well as
                multihop token swap are ready to be tried in action.
            </ModalDescription>
            <i>
                The functionality is in early access mode, the audits are expected to be done soon.
            </i>
            <Buttons>
                <ButtonStyled isBig onClick={() => onSubmit(MainRoutes.amm)}>
                    Browse pools
                </ButtonStyled>
                <ButtonStyled isBig onClick={() => onSubmit(MainRoutes.swap)}>
                    Try swaps
                </ButtonStyled>
            </Buttons>
        </Container>
    );
};

export default LiveOnSorobanAlert;
