import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

import ExternalLink from '../../../../common/basics/ExternalLink';
import PageLoader from '../../../../common/basics/PageLoader';
import { formatBalance, getAssetString } from '../../../../common/helpers/helpers';
import { respondDown } from '../../../../common/mixins';
import { StellarService } from '../../../../common/services/globalServices';
import { Breakpoints, COLORS } from '../../../../common/styles';

const Container = styled.div`
    display: flex;
    flex-direction: column;
    background-color: ${COLORS.white};
    padding: 4.2rem 3.2rem 2rem;
    border-radius: 0.5rem;
`;

const Title = styled.span`
    font-weight: 700;
    font-size: 2rem;
    line-height: 2.8rem;
    color: ${COLORS.titleText};

    ${respondDown(Breakpoints.md)`
        margin-bottom: 1.6rem;
    `}
`;

const Description = styled.div`
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.descriptionText};
    opacity: 0.7;
    margin-bottom: 3.2rem;
`;

const Stats = styled.div`
    display: flex;
    margin-top: 3.2rem;

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
    color: ${COLORS.grayText};
    margin-bottom: 0.8rem;
`;

const StatsDetailValue = styled.span`
    font-size: 1.6rem;
    line-height: 2.4rem;
    color: ${COLORS.paragraphText};
    width: min-content;
    white-space: nowrap;
`;

const ExternalLinkStyled = styled(ExternalLink)`
    margin-top: 4rem;
`;

const AmmStats = ({ base, counter }) => {
    const [lumenUsdPrice, setLumenUsdPrice] = useState(null);
    const [stats, setStats] = useState(null);

    const [baseLumenPrice, setBaseLumenPrice] = useState(null);
    const [counterLumenPrice, setCounterLumenPrice] = useState(null);

    const [priceLoading, setPriceLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(true);
    const [basePriceLoading, setBasePriceLoading] = useState(true);
    const [counterPriceLoading, setCounterPriceLoading] = useState(true);

    useEffect(() => {
        StellarService.getLumenUsdPrice().then(res => {
            setPriceLoading(false);
            setLumenUsdPrice(res);
        });

        StellarService.getLiquidityPoolData(base, counter).then(res => {
            setStatsLoading(false);
            setStats(res);
        });

        if (!base.isNative()) {
            StellarService.getAssetLumenPrice(base).then(res => {
                setBaseLumenPrice(res);
                setBasePriceLoading(false);
            });
        } else {
            setBaseLumenPrice('1');
            setBasePriceLoading(false);
        }

        if (!counter.isNative()) {
            StellarService.getAssetLumenPrice(counter).then(res => {
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
        <Container>
            <Title>AMM stats</Title>

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
        </Container>
    );
};

export default AmmStats;
