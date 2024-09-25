import * as React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import Aqua from 'assets/aqua-logo-small.svg';
import Xlm from 'assets/xlm-logo.svg';
import YXlm from 'assets/yxlm-logo.svg';

import ExternalLink from 'basics/ExternalLink';

import { BalanceLabel } from 'pages/locker/components/LockerAccountPage/Portfolio/Portfolio';

import { formatBalance } from '../../../../../common/helpers/helpers';
import { respondDown } from '../../../../../common/mixins';
import { Breakpoints, COLORS } from '../../../../../common/styles';
import { LockerRoutes } from '../../../../../routes';
import { AccountEligibility } from '../../../api/types';

const Container = styled.div`
    display: block;
    padding: 3rem 3rem 2rem;
    background: ${COLORS.lightGray};
    border-radius: 0.5rem;
    margin-top: 2rem;
`;

const Title = styled.div`
    font-size: 2rem;
    font-weight: 700;
    line-height: 2.8rem;
    color: ${COLORS.titleText};
    margin-bottom: 0.8rem;
`;

const Date = styled.div`
    font-size: 1.4rem;
    line-height: 2rem;
    color: ${COLORS.grayText};
    margin-bottom: 3.2rem;
`;

const Balances = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    padding-bottom: 4.4rem;

    ${respondDown(Breakpoints.sm)`
        grid-template-columns: 1fr;
        grid-row-gap: 3rem;
    `}
`;

const Asset = styled.div`
    display: flex;
    align-items: center;
    font-size: 1.4rem;
    line-height: 2rem;
    color: ${COLORS.descriptionText};

    svg {
        margin-right: 0.8rem;
        height: 2.4rem;
        width: 2.4rem;
    }
`;

const Amount = styled.div`
    font-size: 2rem;
    font-weight: 700;
    line-height: 2.8rem;
    color: ${COLORS.titleText};
    margin-top: 1.6rem;

    ${respondDown(Breakpoints.sm)`
        margin-top: 0.6rem;
    `}
`;

const AmmAmount = styled.div`
    display: flex;
    align-items: center;
    font-size: 1.4rem;
    line-height: 2rem;
    color: ${COLORS.titleText};
    margin-top: 1.6rem;

    ${respondDown(Breakpoints.sm)`
        margin-top: 0.6rem;
    `}
`;

const LockAmount = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-top: 0.1rem dashed ${COLORS.gray};
    padding-top: 3.2rem;
    margin-bottom: 1rem;
    font-size: 1.6rem;
    line-height: 2.9rem;
    color: ${COLORS.darkGrayText};

    ${respondDown(Breakpoints.sm)`
       display: block;
    `}
`;

const SnapshotHoldings = ({ accountEligibility }: { accountEligibility: AccountEligibility }) => (
    <Container>
        <Title>Snapshot holdings</Title>
        <Date>January 15, 2022 00:00:00 UTC</Date>

        <Balances>
            <div>
                <Asset>
                    <Aqua />
                    AQUA
                </Asset>
                <Amount>{formatBalance(+accountEligibility.aqua_balance, true)} AQUA</Amount>
                {Boolean(Number(accountEligibility.aqua_pool_balance)) && (
                    <AmmAmount>
                        <BalanceLabel color={COLORS.yellow} textColor={COLORS.titleText}>
                            AMM
                        </BalanceLabel>
                        {formatBalance(+accountEligibility.aqua_pool_balance, true)} AQUA
                    </AmmAmount>
                )}
            </div>
            <div>
                <Asset>
                    <Xlm />
                    XLM
                </Asset>
                <Amount>{formatBalance(+accountEligibility.native_balance, true)} XLM</Amount>
                {Boolean(Number(accountEligibility.native_pool_balance)) && (
                    <AmmAmount>
                        <BalanceLabel color={COLORS.yellow} textColor={COLORS.titleText}>
                            AMM
                        </BalanceLabel>
                        {formatBalance(+accountEligibility.native_pool_balance, true)} XLM
                    </AmmAmount>
                )}
            </div>
            <div>
                <Asset>
                    <YXlm />
                    yXLM
                </Asset>
                <Amount>{formatBalance(+accountEligibility.yxlm_balance, true)} yXLM</Amount>
                {Boolean(Number(accountEligibility.yxlm_pool_balance)) && (
                    <AmmAmount>
                        <BalanceLabel color={COLORS.yellow} textColor={COLORS.titleText}>
                            AMM
                        </BalanceLabel>
                        {formatBalance(+accountEligibility.yxlm_pool_balance, true)} yXLM
                    </AmmAmount>
                )}
            </div>
        </Balances>

        {Boolean(Number(accountEligibility.aqua_lock_balance)) && (
            <LockAmount>
                <div>
                    AQUA locked:{' '}
                    <b>{formatBalance(+accountEligibility.aqua_lock_balance, true)} AQUA</b>
                </div>
                <ExternalLink asDiv>
                    <Link
                        to={`${
                            LockerRoutes.main
                        }/${'GACCUBVEQDNC453CIF5XSB4PCF7IRQTET2Y4FOXV44TUEWI6Z65GXQ47'}`}
                    >
                        View locks history
                    </Link>
                </ExternalLink>
            </LockAmount>
        )}
    </Container>
);

export default SnapshotHoldings;
