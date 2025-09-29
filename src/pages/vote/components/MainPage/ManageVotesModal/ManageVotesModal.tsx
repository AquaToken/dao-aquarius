import { useEffect, useState } from 'react';
import styled from 'styled-components';

import { createAsset } from 'helpers/token';

import useAuthStore from 'store/authStore/useAuthStore';

import { StellarService } from 'services/globalServices';

import { ModalProps } from 'types/modal';

import { flexAllCenter, respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import Market from 'basics/Market';
import { ModalDescription, ModalTitle, ModalWrapper } from 'basics/ModalAtoms';

import VotesList from './VotesList/VotesList';

import { PairStats } from '../../../api/types';

const PairBlock = styled.div`
    ${flexAllCenter};
    padding: 3.4rem 0;
    border-radius: 0.5rem;
    background: ${COLORS.gray50};
    margin-bottom: 2.3rem;

    ${respondDown(Breakpoints.md)`
        display: none;
    `}
`;

const ManageVotesModal = ({ params }: ModalProps<{ pair: PairStats }>) => {
    const [claims, setClaims] = useState(null);

    const { pair } = params;
    const { account } = useAuthStore();

    const base = createAsset(pair.asset1_code, pair.asset1_issuer);
    const counter = createAsset(pair.asset2_code, pair.asset2_issuer);

    useEffect(() => {
        setClaims(StellarService.cb.getPairVotes(pair, account.accountId())?.reverse());
    }, []);

    if (!claims) {
        return null;
    }

    return (
        <ModalWrapper $isWide>
            <ModalTitle>Manage your votes</ModalTitle>
            <ModalDescription>
                View your votes for a market and claim unlocked votes back
            </ModalDescription>
            <PairBlock>
                <Market verticalDirections assets={[base, counter]} />
            </PairBlock>

            <VotesList votes={claims} pair={pair} />
        </ModalWrapper>
    );
};

export default ManageVotesModal;
