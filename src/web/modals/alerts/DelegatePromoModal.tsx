import * as React from 'react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { LS_DELEGATE_PROMO_VIEWED_LOCKER } from 'constants/local-storage';
import { MainRoutes } from 'constants/routes';

import { ModalProps } from 'types/modal';

import { flexAllCenter } from 'web/mixins';
import { COLORS } from 'web/styles';

import Tick from 'assets/icon-tick-16.svg';

import { Button } from 'basics/buttons';
import { ModalTitle, ModalWrapper } from 'basics/ModalAtoms';

const Description = styled.p`
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.textGray};
`;

const List = styled.ul`
    padding: 0;
    margin-bottom: 0.8rem;
`;

const ListItem = styled.li`
    list-style: none;
    display: flex;
    align-items: center;
    gap: 0.8rem;
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.textGray};
    margin-bottom: 1.6rem;
`;

const IconWrapper = styled.div`
    ${flexAllCenter};
    height: 3.2rem;
    width: 3.2rem;
    border-radius: 50%;
    background-color: ${COLORS.gray50};

    svg {
        width: 1.6rem;
        height: 1.6rem;
    }
`;

const ButtonBlock = styled.div`
    border-top: 0.1rem dashed ${COLORS.gray100};
    padding-top: 3.3rem;
    margin-top: 3.3rem;

    a {
        text-decoration: none;
    }
`;

const DelegatePromoModal = ({ confirm }: ModalProps<never>) => {
    useEffect(() => {
        localStorage.setItem(LS_DELEGATE_PROMO_VIEWED_LOCKER, 'true');
    }, []);
    return (
        <ModalWrapper>
            <ModalTitle>Delegate your ICE!</ModalTitle>
            <Description>
                Aquarius team has whitelisted a number of trusted community members that can vote on
                your behalf.
            </Description>
            <List>
                <ListItem>
                    <IconWrapper>
                        <Tick />
                    </IconWrapper>
                    You get maximum rewards, hands-off
                </ListItem>
                <ListItem>
                    <IconWrapper>
                        <Tick />
                    </IconWrapper>
                    Receive bribe payments directly to your balance
                </ListItem>
                <ListItem>
                    <IconWrapper>
                        <Tick />
                    </IconWrapper>
                    Undelegate after 24 hours if you changed your mind
                </ListItem>

                <ButtonBlock>
                    <Link to={MainRoutes.delegate} onClick={() => confirm()}>
                        <Button isBig fullWidth>
                            delegate ice
                        </Button>
                    </Link>
                </ButtonBlock>
            </List>
        </ModalWrapper>
    );
};

export default DelegatePromoModal;
