import * as React from 'react';
import { useEffect, useState } from 'react';

import { ModalService } from 'services/globalServices';
import MigrateLiquidityStep1 from 'web/modals/migrate-liquidity/MigrateLiquidityStep1';

import Button from 'basics/buttons/Button';

import { Pool, PoolClassicProcessed } from 'pages/amm/api/types';

import { getPoolsToMigrate } from '../../../api/api';

interface MigratePoolButtonProps {
    pool: PoolClassicProcessed;
    onUpdate: () => void;
}

const MigratePoolButton = ({ pool, onUpdate }: MigratePoolButtonProps) => {
    const [poolsToMigrate, setPoolsToMigrate] = useState<Pool[]>(null);

    const [base, counter] = pool.assets;

    useEffect(() => {
        getPoolsToMigrate(base, counter).then(res => {
            setPoolsToMigrate(res);
        });
    }, []);
    return (
        <Button
            fullWidth
            onClick={() => {
                ModalService.openModal(MigrateLiquidityStep1, {
                    pool,
                    poolsToMigrate,
                    base,
                    counter,
                    onUpdate,
                });
            }}
            disabled={!poolsToMigrate}
        >
            migrate to soroban
        </Button>
    );
};

export default MigratePoolButton;
