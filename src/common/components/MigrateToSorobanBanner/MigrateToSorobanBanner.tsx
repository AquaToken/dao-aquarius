import * as React from 'react';
import styled from 'styled-components';
import { Breakpoints, COLORS } from '../../styles';
import Soroban from '../../assets/img/soroban.svg';
import Button from '../../basics/Button';
import { respondDown } from '../../mixins';
import { useEffect, useState } from 'react';
import { ModalService, StellarService } from '../../services/globalServices';
import useAuthStore from '../../../store/authStore/useAuthStore';
import { getPoolsToMigrate } from '../../../pages/amm/api/api';
import MigrateLiquidityStep1 from '../../modals/MigrateLiquidityModals/MigrateLiquidityStep1';

const Container = styled.div`
    display: flex;
    width: 100%;
    background: ${COLORS.white};
    margin-top: 4.8rem;
    align-items: center;
    gap: 1.6rem;
    padding-right: 3.2rem;

    ${respondDown(Breakpoints.xl)`
      flex-direction: column;
      padding: 2rem;
      gap: 3.2rem;
    `}
`;

const Info = styled.div`
    display: flex;
    flex-direction: column;
    font-size: 2rem;
    font-weight: 700;
    line-height: 2.8rem;
    justify-content: center;
    margin-right: auto;

    span:last-child {
        font-size: 1.6rem;
        font-weight: 400;
        line-height: 2.4rem;
        margin-top: 0.4rem;
    }

    ${respondDown(Breakpoints.xl)`
        text-align: center;
        margin-right: unset;
    `}
`;

const MigrateToSorobanBanner = ({ base, counter }) => {
    const { account } = useAuthStore();
    const [pool, setPool] = useState(null);
    const [poolsToMigrate, setPoolsToMigrate] = useState(null);

    useEffect(() => {
        StellarService.getLiquidityPoolData(base, counter).then((res) => {
            setPool(res);
        });
    }, []);

    useEffect(() => {
        getPoolsToMigrate(base, counter).then((res) => {
            setPoolsToMigrate(res);
        });
    }, []);

    if (!pool || !Number(account?.getPoolBalance(pool.id)) || !poolsToMigrate) {
        return null;
    }

    const migrate = () => {
        ModalService.openModal(MigrateLiquidityStep1, { pool, poolsToMigrate, base, counter });
    };

    return (
        <Container>
            <Soroban />
            <Info>
                <span>Ready for the Soroban migration!</span>
                <span>You have liquidity in classic AMM and can migrate it to Soroban pool</span>
            </Info>
            <Button onClick={() => migrate()}>migrate</Button>
        </Container>
    );
};

export default MigrateToSorobanBanner;
