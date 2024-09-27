import * as React from 'react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

import useAuthStore from 'store/authStore/useAuthStore';

import { StellarService } from 'services/globalServices';
import { flexAllCenter, respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import { ModalDescription, ModalTitle } from 'basics/ModalAtoms';

import { ModalProps } from 'components/ModalBody';

import VotesList from './VotesList/VotesList';

import { PairStats } from '../../../api/types';
import Market from '../../common/Market';

const Container = styled.div`
    width: 80.6rem;
    max-height: 80vh;
    padding-right: 0.5rem;
    overflow: auto;

    &::-webkit-scrollbar {
        width: 0.5rem;
    }

    /* Track */
    &::-webkit-scrollbar-track {
        background: ${COLORS.white};
    }

    /* Handle */
    &::-webkit-scrollbar-thumb {
        background: ${COLORS.purple};
        border-radius: 0.25rem;
    }

    ${respondDown(Breakpoints.md)`
        width: 100%;
        max-height: unset;
    `};
`;

const PairBlock = styled.div`
    ${flexAllCenter};
    padding: 3.4rem 0;
    border-radius: 0.5rem;
    background: ${COLORS.lightGray};
    margin-bottom: 2.3rem;

    ${respondDown(Breakpoints.md)`
        display: none;
    `}
`;

const ManageVotesModal = ({ params }: ModalProps<{ pair: PairStats }>) => {
    const [claims, setClaims] = useState(null);

    const { pair } = params;
    const { account } = useAuthStore();

    const base = { code: pair.asset1_code, issuer: pair.asset1_issuer };
    const counter = { code: pair.asset2_code, issuer: pair.asset2_issuer };

    useEffect(() => {
        setClaims(StellarService.getPairVotes(pair, account.accountId())?.reverse());
    }, []);

    if (!claims) {
        return null;
    }

    return (
        <Container>
            <ModalTitle>Manage your votes</ModalTitle>
            <ModalDescription>
                View your votes for a market and claim unlocked votes back
            </ModalDescription>
            <PairBlock>
                <Market verticalDirections assets={[base, counter]} />
            </PairBlock>

            <VotesList votes={claims} pair={pair} />
        </Container>
    );
};

export default ManageVotesModal;
