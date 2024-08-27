import * as React from 'react';
import { useEffect, useState } from 'react';
import { getPoolsToMigrate } from '../../../api/api';
import Button from '../../../../../common/basics/Button';
import { ModalService } from '../../../../../common/services/globalServices';
import MigrateLiquidityStep1 from '../../../../../common/modals/MigrateLiquidityModals/MigrateLiquidityStep1';

const MigratePoolButton = ({ pool }) => {
    const [poolsToMigrate, setPoolsToMigrate] = useState(null);

    const [base, counter] = pool.assets;

    useEffect(() => {
        getPoolsToMigrate(base, counter).then((res) => {
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
                });
            }}
            disabled={!poolsToMigrate}
        >
            migrate to soroban
        </Button>
    );
};

export default MigratePoolButton;
