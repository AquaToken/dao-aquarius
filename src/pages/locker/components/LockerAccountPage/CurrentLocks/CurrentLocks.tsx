import * as React from 'react';
import { useCallback, useMemo } from 'react';
import styled from 'styled-components';

import { getDateString } from 'helpers/date';
import { formatBalance, roundToPrecision } from 'helpers/format-number';

import { AccountIceDistribution } from 'types/api-ice-locker';
import { ClaimableBalance } from 'types/stellar';

import { flexRowSpaceBetween, respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import Info from 'assets/icon-info.svg';

import { ProgressLine } from 'basics/progress';
import Table, { CellAlign } from 'basics/Table';
import Tooltip, { TOOLTIP_POSITION } from 'basics/Tooltip';

const Container = styled.div`
    margin-top: 4rem;
    display: flex;
    flex-direction: column;
    background-color: ${COLORS.white};
    border-radius: 0.5rem;
    padding: 3.2rem 3.2rem 4.2rem;

    ${respondDown(Breakpoints.md)`
        padding: 3.2rem 1.6rem;
    `}
`;

const Title = styled.span`
    font-size: 2rem;
    line-height: 2.8rem;
    font-weight: bold;
    color: ${COLORS.textPrimary};
    margin-bottom: 3.2rem;
`;

const LocksList = styled.div`
    display: flex;
    flex-direction: column;
    margin-top: 8rem;
`;

const InfoIcon = styled(Info)`
    margin-left: 0.5rem;
`;

const TooltipInner = styled.div`
    display: flex;
    flex-direction: column;
    width: 32rem;

    ${respondDown(Breakpoints.md)`
        width: 20rem;
    `}
`;

const TooltipRow = styled.div`
    ${flexRowSpaceBetween};
    font-size: 1.4rem;
    line-height: 2rem;
    color: ${COLORS.textGray};
    margin-bottom: 0.4rem;
`;

const TooltipTotal = styled(TooltipRow)`
    font-weight: 700;
    color: ${COLORS.textTertiary};
    font-size: 1.6rem;
    line-height: 2.8rem;
`;

const Total = styled.div`
    display: flex;
    align-items: center;
    text-align: right;

    ${respondDown(Breakpoints.md)`
        div {
            width: min-content;
        }
    `}
`;

interface CurrentLocksProps {
    locks: ClaimableBalance[];
    aquaBalance: number;
    distributions: AccountIceDistribution[];
    ammAquaBalance: number;
    aquaInOffers: number;
}

const CurrentLocks = ({
    locks,
    aquaBalance,
    distributions,
    ammAquaBalance,
    aquaInOffers,
}: CurrentLocksProps): React.ReactNode => {
    const locksSum = locks.reduce((acc, lock) => {
        acc += Number(lock.amount);
        return acc;
    }, 0);

    const total = useMemo(
        () => locksSum + aquaBalance + aquaInOffers + ammAquaBalance,
        [locksSum, aquaBalance, aquaInOffers, ammAquaBalance],
    );

    const availablePercent = useMemo(
        () => roundToPrecision((aquaBalance / total) * 100, 2),
        [total],
    );
    const inOffersPercent = useMemo(
        () => roundToPrecision((aquaInOffers / total) * 100, 2),
        [total],
    );
    const ammPercent = useMemo(() => roundToPrecision((ammAquaBalance / total) * 100, 2), [total]);

    const lockPercent = useMemo(() => roundToPrecision((locksSum / total) * 100, 2), [total]);

    const getIceAmount = useCallback(
        balanceId =>
            distributions.find(distribution => distribution.balance_id === balanceId)
                ?.distributed_amount,
        [distributions, locks],
    );

    return (
        <Container>
            <Title>Current locks</Title>
            <ProgressLine
                percent={+lockPercent}
                leftLabel={`Locked: ${formatBalance(locksSum, true)} AQUA (${lockPercent}%)`}
                rightLabel={
                    <Tooltip
                        content={
                            <TooltipInner>
                                <TooltipTotal>
                                    <span>Total:</span>
                                    <span>{formatBalance(total, true)} AQUA</span>
                                </TooltipTotal>
                                <TooltipRow>
                                    <span>Available:</span>
                                    <span>
                                        {formatBalance(aquaBalance, true)} ({availablePercent}%)
                                    </span>
                                </TooltipRow>
                                <TooltipRow>
                                    <span>In offers:</span>
                                    <span>
                                        {formatBalance(aquaInOffers, true)} ({inOffersPercent}%)
                                    </span>
                                </TooltipRow>
                                <TooltipRow>
                                    <span>In AMM pools:</span>
                                    <span>
                                        {formatBalance(ammAquaBalance, true)} ({ammPercent}%)
                                    </span>
                                </TooltipRow>
                                <TooltipRow>
                                    <span>Locked:</span>
                                    <span>
                                        {formatBalance(locksSum, true)} ({lockPercent}%)
                                    </span>
                                </TooltipRow>
                            </TooltipInner>
                        }
                        position={
                            +window.innerWidth > 992 ? TOOLTIP_POSITION.top : TOOLTIP_POSITION.left
                        }
                        background={COLORS.white}
                        showOnHover
                    >
                        <Total>
                            <div>{formatBalance(total, true)} AQUA</div>
                            <InfoIcon />
                        </Total>
                    </Tooltip>
                }
            />
            <LocksList>
                <Table
                    head={[
                        { children: 'Lock start', flexSize: 1.5 },
                        { children: 'Lock end', flexSize: 1.5 },
                        { children: 'AQUA locked', flexSize: 2, align: CellAlign.Right },
                        { children: 'ICE received', flexSize: 2, align: CellAlign.Right },
                    ]}
                    body={locks.map(lock => ({
                        key: lock.id,
                        isNarrow: true,
                        mobileBackground: COLORS.gray50,
                        mobileFontSize: '1.4rem',
                        rowItems: [
                            {
                                children: lock.last_modified_time
                                    ? getDateString(new Date(lock.last_modified_time).getTime())
                                    : 'No data',
                                label: 'Lock start',
                                flexSize: 1.5,
                            },
                            {
                                children: getDateString(
                                    new Date(
                                        lock.claimants?.[0].predicate?.not?.abs_before,
                                    ).getTime(),
                                ),
                                label: 'Lock end',
                                flexSize: 1.5,
                            },
                            {
                                children: `${formatBalance(Number(lock.amount), true)} AQUA`,
                                flexSize: 2,
                                align: CellAlign.Right,
                                label: 'AQUA locked',
                            },
                            {
                                children: getIceAmount(lock.id)
                                    ? `${formatBalance(Number(getIceAmount(lock.id)), true)} ICE`
                                    : '-',
                                flexSize: 2,
                                align: CellAlign.Right,
                                label: 'ICE received',
                            },
                        ],
                    }))}
                />
            </LocksList>
        </Container>
    );
};

export default CurrentLocks;
