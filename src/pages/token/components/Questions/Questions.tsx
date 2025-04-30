import * as React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { MainRoutes } from 'constants/routes';

import useAuthStore from 'store/authStore/useAuthStore';

import { ModalService } from 'services/globalServices';

import { commonMaxWidth, respondDown } from 'web/mixins';
import { Breakpoints } from 'web/styles';

import Question from 'basics/Question';

import ChooseLoginMethodModal from '../../../../web/modals/auth/ChooseLoginMethodModal';

const Container = styled.section`
    display: flex;
    flex-direction: column;
    width: 100%;
    ${commonMaxWidth};
    padding: 0 10rem;
    margin-top: 8rem;

    ${respondDown(Breakpoints.sm)`
        padding: 0 1.6rem;
        margin-top: 4.8rem;
    `}
`;

const Title = styled.h1`
    font-weight: 700;
    font-size: 5.6rem;
    line-height: 6.4rem;
    margin-bottom: 4.6rem;

    ${respondDown(Breakpoints.sm)`
        font-size: 2.9rem;
        line-height: 3rem;
        font-weight: 400;
    `}
`;

const Questions = () => {
    const { isLogged } = useAuthStore();

    const buyAqua = e => {
        if (!isLogged) {
            e.preventDefault();
            e.stopPropagation();

            ModalService.openModal(ChooseLoginMethodModal, {});

            return;
        }
    };
    return (
        <Container>
            <Title>What can I do with AQUA</Title>
            <Question
                question="Deposit into AMM"
                answer={
                    <span>
                        Deposit AQUA into Aquarius AMM pools with Stellar assets to earn LP rewards
                        from trading. Markets in the reward zone grant extra AQUA emission rewards.
                    </span>
                }
            />
            <Question
                question="Freeze into ICE"
                answer={
                    <span>
                        Convert your AQUA into ICE to boost your voting power. Each frozen AQUA
                        gives you ICE, which can be used for Aquarius governance and additional
                        benefits.
                    </span>
                }
            />
            <Question
                question="Vote for proposals"
                answer={
                    <span>
                        Use AQUA to participate in community voting and shape the future of the
                        Aquarius protocol. Explore active proposals in the DAO section.
                    </span>
                }
            />
            <Question
                question="Vote for markets"
                answer={
                    <span>
                        AQUA holders can vote to add markets to the reward zone, deciding which
                        markets earn AQUA emissions. Receive extra incentives for supporting certain
                        pools.
                    </span>
                }
            />
            <Question
                question="Swap on Aquarius"
                answer={
                    <span>
                        If you already have some Stellar assets, feel free to use our{' '}
                        <Link to={MainRoutes.swap}>Swap section</Link> to get AQUA in a few clicks.
                    </span>
                }
            />
            <Question
                question="Buy for fiat"
                answer={
                    <span>
                        If you don't have any Stellar assets, proceed to{' '}
                        <Link to={MainRoutes.buyAqua} onClick={buyAqua}>
                            "Buy AQUA" section
                        </Link>{' '}
                        to seamlessly purchase AQUA tokens directly, using a bank card.
                    </span>
                }
            />
        </Container>
    );
};

export default Questions;
