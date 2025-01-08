import * as React from 'react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

import { formatBalance } from 'helpers/format-number';

import { useUpdateIndex } from 'hooks/useUpdateIndex';

import useAuthStore from 'store/authStore/useAuthStore';

import { SorobanService } from 'services/globalServices';

import { PoolProcessed } from 'types/amm';
import { ModalProps } from 'types/modal';

import { Button } from 'basics/buttons';
import { DotsLoader } from 'basics/loaders';
import Market from 'basics/Market';
import { ModalTitle, ModalWrapper, ModalDescription } from 'basics/ModalAtoms';

import { flexAllCenter } from '../mixins';
import { COLORS } from '../styles';

const MarketBlock = styled.div`
    ${flexAllCenter};
    padding: 3.4rem 0;
    border-radius: 0.5rem;
    background: ${COLORS.lightGray};
    margin-bottom: 2.3rem;
`;

const ClaimRewards = ({ params }: ModalProps<{ pool: PoolProcessed }>) => {
    const [rewards, setRewards] = useState(null);

    const { pool } = params;

    const { account } = useAuthStore();

    const updateIndex = useUpdateIndex(5000);

    useEffect(() => {
        SorobanService.getPoolRewards(account.accountId(), pool.address).then(res => {
            setRewards(res);
        });
    }, [updateIndex, pool]);

    return (
        <ModalWrapper>
            <ModalTitle>Claim rewards</ModalTitle>
            <ModalDescription>
                You have unclaimed rewards for the pool. Click the button below to claim them.
            </ModalDescription>
            <MarketBlock>
                <Market assets={pool.assets} verticalDirections />
            </MarketBlock>

            <Button fullWidth>
                Claim {rewards ? formatBalance(rewards.to_claim, true) : <DotsLoader />} AQUA
            </Button>
        </ModalWrapper>
    );
};

export default ClaimRewards;
