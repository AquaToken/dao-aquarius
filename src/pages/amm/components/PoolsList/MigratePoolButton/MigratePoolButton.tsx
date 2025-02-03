import * as React from 'react';
import { useEffect, useState } from 'react';

import { getPoolsToMigrate } from 'api/amm';

import { ModalService } from 'services/globalServices';

import { Pool, PoolClassicProcessed } from 'types/amm';

import MigrateLiquidityStep1 from 'web/modals/migrate-liquidity/MigrateLiquidityStep1';

import IconMigration from 'assets/icon-migration.svg';

import Button from 'basics/buttons/Button';

interface MigratePoolButtonProps {
    pool: PoolClassicProcessed;
    onUpdate: () => void;
    isSmall?: boolean;
}

const MigratePoolButton = ({ pool, onUpdate, isSmall }: MigratePoolButtonProps) => {
    const [poolsToMigrate, setPoolsToMigrate] = useState<Pool[]>(null);

    const [base, counter] = pool.assets;

    useEffect(() => {
        getPoolsToMigrate(base, counter).then(res => {
            setPoolsToMigrate(res);
        });
    }, []);

    return (
        <Button
            isSquare={isSmall}
            fullWidth={!isSmall}
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
            title="Migrate to Aquarius AMM"
        >
            {isSmall ? <IconMigration /> : 'migrate to soroban'}
        </Button>
    );
};

export default MigratePoolButton;
