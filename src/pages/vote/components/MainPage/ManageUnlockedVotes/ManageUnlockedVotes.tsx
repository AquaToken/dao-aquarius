import { useEffect, useState } from 'react';
import styled from 'styled-components';

import useAuthStore from 'store/authStore/useAuthStore';

import { ModalProps } from 'types/modal';

import { StellarService } from 'services/globalServices';
import { StellarEvents } from 'services/stellar.service';

import Button from 'basics/buttons/Button';
import { ModalDescription, ModalTitle, ModalWrapper, StickyButtonWrapper } from 'basics/ModalAtoms';

import { PairStats } from 'pages/vote/api/types';

import VotesList from '../ManageVotesModal/VotesList/VotesList';

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
        <ModalWrapper $isWide>
            <ModalTitle>Manage unlocked votes</ModalTitle>
            <ModalDescription>View your unlocked votes and claim back</ModalDescription>
            {claims.length ? (
                <VotesList votes={claims} withoutClaimDate />
            ) : (
                <>
                    <EmptyList>You don't have unlocked votes</EmptyList>
                    <Button fullWidth onClick={() => close()}>
                        close
                    </Button>
                </>
            )}
        </ModalWrapper>
    );
};

export default ClaimAllModal;
