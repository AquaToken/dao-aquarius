import * as React from 'react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

import useAuthStore from 'store/authStore/useAuthStore';

import { ModalProps } from 'types/modal';

import { StellarService } from 'services/globalServices';
import { StellarEvents } from 'services/stellar.service';
import { customScroll, respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import Button from 'basics/buttons/Button';
import { ModalDescription, ModalTitle } from 'basics/ModalAtoms';

import { PairStats } from 'pages/vote/api/types';

import VotesList from '../ManageVotesModal/VotesList/VotesList';

const Container = styled.div`
    width: 80.6rem;
    max-height: 80vh;
    padding-right: 0.5rem;
    overflow: auto;

    ${customScroll};

    ${respondDown(Breakpoints.md)`
          width: 100%;
          max-height: unset;
      `};
`;

const ButtonContainer = styled.div`
    margin-top: 2.5rem;
    padding-top: 3.2rem;
    border-top: 0.1rem dashed ${COLORS.gray};
`;

const EmptyList = styled.span`
    font-size: 1.6rem;
`;

interface ClaimAllModalParams {
    pairs: PairStats[];
}

const ClaimAllModal = ({ params, close }: ModalProps<ClaimAllModalParams>) => {
    const [claims, setClaims] = useState(null);
    const [updateId, setUpdateId] = useState(1);
    const { pairs } = params;
    const { account } = useAuthStore();

    useEffect(() => {
        const unsub = StellarService.event.sub(({ type }) => {
            if (type === StellarEvents.claimableUpdate) {
                setUpdateId(prevState => prevState + 1);
            }
        });

        return () => unsub();
    }, []);

    useEffect(() => {
        const processedClaims = pairs.reduce((acc, pair) => {
            acc = [
                ...acc,
                ...StellarService.getPairVotes(pair, account.accountId())
                    .filter(claim => new Date(claim.claimBackDate) < new Date())
                    .map(item => ({ ...pair, ...item })),
            ];
            return acc;
        }, []);
        setClaims(processedClaims);
    }, [updateId]);

    if (!claims) {
        return null;
    }

    return (
        <Container>
            <ModalTitle>Manage unlocked votes</ModalTitle>
            <ModalDescription>View your unlocked votes and claim back</ModalDescription>
            {claims.length ? (
                <VotesList votes={claims} withoutClaimDate />
            ) : (
                <>
                    <EmptyList>You don't have unlocked votes</EmptyList>
                    <ButtonContainer>
                        <Button fullWidth onClick={() => close()}>
                            close
                        </Button>
                    </ButtonContainer>
                </>
            )}
        </Container>
    );
};

export default ClaimAllModal;
