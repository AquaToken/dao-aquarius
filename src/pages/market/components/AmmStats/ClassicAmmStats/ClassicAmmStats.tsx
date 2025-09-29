import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

import { getLumenUsdPrice } from 'api/price';

import { getAssetString } from 'helpers/assets';
import { formatBalance } from 'helpers/format-number';

import { StellarService } from 'services/globalServices';

import { ClassicToken } from 'types/token';

import { respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import { ExternalLink } from 'basics/links';
import PageLoader from 'basics/loaders/PageLoader';

const Description = styled.div`
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.textSecondary};
    opacity: 0.7;
    margin-bottom: 3.2rem;
`;

const Stats = styled.div`
    display: flex;

    ${respondDown(Breakpoints.md)`
         flex-direction: column;
    `}
`;

const StatsColumn = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1;

    ${respondDown(Breakpoints.md)`
         margin-bottom: 3.2rem;
    `}
`;

const StatsDetail = styled.div`
    display: flex;
    flex-direction: column;

    &:not(:last-child) {
        margin-bottom: 3.2rem;
    }
`;

const StatsDetailTitle = styled.span`
    font-size: 1.4rem;
    line-height: 1.6rem;
    color: ${COLORS.textGray};
    margin-bottom: 0.8rem;
`;

const StatsDetailValue = styled.span`
    font-size: 1.6rem;
    line-height: 2.4rem;
    color: ${COLORS.textTertiary};
    width: min-content;
    white-space: nowrap;
`;

const ExternalLinkStyled = styled(ExternalLink)`
    margin-top: 4rem;
`;

interface AmmStatsProps {
    base: ClassicToken;
    counter: ClassicToken;
}

const ClassicAmmStats = ({ base, counter }: AmmStatsProps): React.ReactNode => {
    const [lumenUsdPrice, setLumenUsdPrice] = useState(null);
    const [stats, setStats] = useState(null);

    const [baseLumenPrice, setBaseLumenPrice] = useState(null);
    const [counterLumenPrice, setCounterLumenPrice] = useState(null);

    const [priceLoading, setPriceLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(true);
    const [basePriceLoading, setBasePriceLoading] = useState(true);
    const [counterPriceLoading, setCounterPriceLoading] = useState(true);

    useEffect(() => {
        getLumenUsdPrice().then(res => {
            setPriceLoading(false);
            setLumenUsdPrice(res);
        });

        StellarService.horizon.getLiquidityPoolData(base, counter).then(res => {
            setStatsLoading(false);
            setStats(res);
        });

        if (!base.isNative()) {
            StellarService.price.getAssetLumenPrice(base).then(res => {
                setBaseLumenPrice(res);
                setBasePriceLoading(false);
            });
        } else {
            setBaseLumenPrice('1');
            setBasePriceLoading(false);
        }

        if (!counter.isNative()) {
            StellarService.price.getAssetLumenPrice(counter).then(res => {
                setCounterLumenPrice(res);
                setCounterPriceLoading(false);
            });
        } else {
            setCounterLumenPrice('1');
            setCounterPriceLoading(false);
        }
    }, []);

    const baseReserve = useMemo(() => {
        if (!stats) {
            return null;
        }
        return stats.reserves.find(({ asset }) => asset === getAssetString(base));
    }, [stats, base]);

    const counterReserve = useMemo(() => {
        if (!stats) {
            return null;
        }
        return stats.reserves.find(({ asset }) => asset === getAssetString(counter));
    }, [stats, counter]);

    const liquidity = useMemo(() => {
        if (
            !baseReserve ||
            !counterReserve ||
            !baseLumenPrice ||
            !counterLumenPrice ||
            !lumenUsdPrice
        ) {
            return null;
        }

        const baseUsdAmount =
            Number(baseReserve.amount) * Number(baseLumenPrice) * Number(lumenUsdPrice);

        const counterUsdAmount =
            Number(counterReserve.amount) * Number(counterLumenPrice) * Number(lumenUsdPrice);

        return baseUsdAmount + counterUsdAmount;
    }, [baseReserve, counterReserve, baseLumenPrice, counterLumenPrice, lumenUsdPrice]);

    return (
        <div>
            {priceLoading || statsLoading || basePriceLoading || counterPriceLoading ? (
                <PageLoader />
            ) : stats ? (
                <>
                    <Stats>
                        <StatsColumn>
                            <StatsDetail>
                                <StatsDetailTitle>Liquidity</StatsDetailTitle>
                                <StatsDetailValue>
                                    $ {formatBalance(liquidity, true)}
                                </StatsDetailValue>
                            </StatsDetail>
                            <StatsDetail>
                                <StatsDetailTitle>Members</StatsDetailTitle>
                                <StatsDetailValue>
                                    {formatBalance(stats.total_trustlines)}
                                </StatsDetailValue>
                            </StatsDetail>
                        </StatsColumn>
                        <StatsColumn>
                            <StatsDetail>
                                <StatsDetailTitle>{base.code} deposited</StatsDetailTitle>
                                <StatsDetailValue>
                                    {formatBalance(baseReserve.amount, true)} {base.code}
                                </StatsDetailValue>
                            </StatsDetail>
                            <StatsDetail>
                                <StatsDetailTitle>{counter.code} deposited</StatsDetailTitle>
                                <StatsDetailValue>
                                    {formatBalance(counterReserve.amount, true)} {counter.code}
                                </StatsDetailValue>
                            </StatsDetail>
                        </StatsColumn>
                        <StatsColumn>
                            <StatsDetail>
                                <StatsDetailTitle>Exchange rate</StatsDetailTitle>
                                <StatsDetailValue>
                                    1 {counter.code} ={' '}
                                    {formatBalance(
                                        Number(baseReserve.amount) / Number(counterReserve.amount),
                                    )}{' '}
                                    {base.code}
                                </StatsDetailValue>
                            </StatsDetail>
                            <StatsDetail>
                                <StatsDetailTitle>Exchange rate</StatsDetailTitle>
                                <StatsDetailValue>
                                    1 {base.code} ={' '}
                                    {formatBalance(
                                        Number(counterReserve.amount) / Number(baseReserve.amount),
                                    )}{' '}
                                    {counter.code}
                                </StatsDetailValue>
                            </StatsDetail>
                        </StatsColumn>
                    </Stats>
                    <ExternalLinkStyled
                        href={`https://www.stellarx.com/amm/analytics/${getAssetString(
                            base,
                        )}/${getAssetString(counter)}`}
                    >
                        See AMM on StellarX
                    </ExternalLinkStyled>
                </>
            ) : (
                <Description>AMM statistics for this market were not found</Description>
            )}
        </div>
    );
};

export default ClassicAmmStats;
