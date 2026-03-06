import * as React from 'react';

import { PoolExtended } from 'types/amm';
import { ModalProps } from 'types/modal';

import { ModalTitle, ModalWrapper } from 'basics/ModalAtoms';

import DepositFlow from './DepositFlow';

type DepositToPoolParams = {
    pool: PoolExtended;
    onUpdate?: () => void;
};

const DepositToPool = ({ params, close }: ModalProps<DepositToPoolParams>) => {
    const { pool, onUpdate } = params;

    return (
        <ModalWrapper>
            <ModalTitle>Add liquidity</ModalTitle>
            <DepositFlow pool={pool} isModal onUpdate={onUpdate} onClose={close} />
        </ModalWrapper>
    );
};

export default DepositToPool;
