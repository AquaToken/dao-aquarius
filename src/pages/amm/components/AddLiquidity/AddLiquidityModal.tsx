import * as React from 'react';

import { POOL_TYPE } from 'constants/amm';

import { PoolExtended } from 'types/amm';
import { ModalProps } from 'types/modal';

import { ModalTitle, ModalWrapper } from 'basics/ModalAtoms';

import ConcentratedAddLiquidityFlow from './Concentrated/flow/ConcentratedAddLiquidityFlow';
import AddLiquidityFlow from './Regular/AddLiquidityFlow';

type AddLiquidityModalParams = {
    pool: PoolExtended;
    onUpdate?: () => void;
};

const AddLiquidityModal = ({ params, close }: ModalProps<AddLiquidityModalParams>) => {
    const { pool, onUpdate } = params;

    return (
        <ModalWrapper $width={pool.pool_type === POOL_TYPE.concentrated ? '64rem' : undefined}>
            <ModalTitle>Add liquidity</ModalTitle>
            {pool.pool_type === POOL_TYPE.concentrated ? (
                <ConcentratedAddLiquidityFlow pool={pool} onUpdate={onUpdate} onClose={close} />
            ) : (
                <AddLiquidityFlow pool={pool} isModal onUpdate={onUpdate} onClose={close} />
            )}
        </ModalWrapper>
    );
};

export default AddLiquidityModal;
