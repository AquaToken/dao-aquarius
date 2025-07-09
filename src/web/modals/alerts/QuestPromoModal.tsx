import * as React from 'react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { LS_IS_QUEST_PROMO_VIEWED } from 'constants/local-storage';
import { MainRoutes } from 'constants/routes';

import { ModalProps } from 'types/modal';

import { Button } from 'basics/buttons';
import { ModalDescription, ModalTitle, ModalWrapper } from 'basics/ModalAtoms';

const LinkStyled = styled(Link)`
    text-decoration: none;
`;

const QuestPromoModal = ({ confirm }: ModalProps<never>) => {
    useEffect(() => {
        localStorage.setItem(LS_IS_QUEST_PROMO_VIEWED, JSON.stringify(true));
    }, []);
    return (
        <ModalWrapper>
            <ModalTitle>Get 20 USDC completing Aquarius quest! </ModalTitle>
            <ModalDescription>
                4 simple tasks to learn the full power of Aquarius:
                <ul>
                    <li>swaps</li>
                    <li>getting ICE</li>
                    <li>liquidity provision</li>
                    <li>voting</li>
                </ul>
                <b>
                    <i>Quest continues till 30.06.2025.</i>
                </b>
            </ModalDescription>
            <LinkStyled to={MainRoutes.quest}>
                <Button fullWidth isBig withGradient isRounded onClick={() => confirm()}>
                    Start quest
                </Button>
            </LinkStyled>
        </ModalWrapper>
    );
};

export default QuestPromoModal;
