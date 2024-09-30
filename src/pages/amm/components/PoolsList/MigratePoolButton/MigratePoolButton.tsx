import * as React from 'react';
import { useEffect, useState } from 'react';

import { getPoolsToMigrate } from 'api/amm';

import { Pool, PoolClassicProcessed } from 'types/amm';

import { ModalService } from 'services/globalServices';
import MigrateLiquidityStep1 from 'web/modals/migrate-liquidity/MigrateLiquidityStep1';

import Button from 'basics/buttons/Button';

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
