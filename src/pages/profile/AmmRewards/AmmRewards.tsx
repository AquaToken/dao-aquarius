import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    TableBody,
    TableCell,
    TableHead,
    TableHeadRow,
} from '../../vote/components/MainPage/Table/Table';
import styled from 'styled-components';
import { Breakpoints, COLORS } from '../../../common/styles';
import { flexRowSpaceBetween, respondDown } from '../../../common/mixins';
import Pair from '../../vote/components/common/Pair';
import { StellarService } from '../../../common/services/globalServices';
import { getAmmRewards } from '../api/api';
import useAuthStore from '../../../store/authStore/useAuthStore';
import PageLoader from '../../../common/basics/PageLoader';
import { Empty } from '../YourVotes/YourVotes';
import { Link } from 'react-router-dom';
import { MainRoutes } from '../../../routes';
import ExternalLink from '../../../common/basics/ExternalLink';
import { formatBalance } from '../../../common/helpers/helpers';
import useAssetsStore from '../../../store/assetsStore/useAssetsStore';
import Aqua from '../../../common/assets/img/aqua-logo-small.svg';
import { IconSort } from '../../../common/basics/Icons';
import { SortingHeader } from '../../bribes/components/BribesPage/BribesTable/BribesTable';
import DotsLoader from '../../../common/basics/DotsLoader';
import Label from '../../../common/basics/Label';
import BoostBanner from '../BoostBanner/BoostBanner';

export const Container = styled.div`
    display: flex;
    flex-direction: column;
`;

export const Header = styled.div`
    ${flexRowSpaceBetween};
    margin-bottom: 4.8rem;

    ${respondDown(Breakpoints.md)`
        flex-direction: column;
        gap: 2rem;
        margin-bottom: 2rem;
   `}
`;

export const Title = styled.h2`
    font-size: 3.6rem;
    line-height: 4.2rem;
    color: ${COLORS.titleText};
    font-weight: 400;

    ${respondDown(Breakpoints.md)`
        text-align: center;
   `}
`;

export const Section = styled.section`
    background: ${COLORS.white};
    border-radius: 0.5rem;
    padding: 2.6rem 2.3rem;

    ${respondDown(Breakpoints.md)`
        padding: 0;
        background: ${COLORS.lightGray};
    `}
`;

export const Table = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    position: relative;
`;

export const TableBodyRow = styled.div`
    display: flex;
    align-items: stretch;
    width: 100%;
    min-height: 9.6rem;
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.paragraphText};
    position: relative;
    border-radius: 0.5rem;

    ${respondDown(Breakpoints.md)`
        flex-direction: column;
         background: ${COLORS.white};
         padding: 2.7rem 1.6rem 1.6rem;
         margin-bottom: 1.6rem;
    `}
`;

export const PairCell = styled(TableCell)`
    flex: 2.5;

    ${respondDown(Breakpoints.md)`
        margin-bottom: 2rem;
    `};
`;

export const Cell = styled(TableCell)`
    flex: 1;

    &:last-child {
        flex: 1.5;
    }

    &:nth-last-child(2) {
        justify-content: right;
    }

    &:last-child {
        flex: 1.5;
        justify-content: right;
    }

    label {
        display: none;
        color: ${COLORS.grayText};
    }

    ${respondDown(Breakpoints.md)`
          ${flexRowSpaceBetween};
          align-items: center;
          margin-bottom: 1.6rem;
          
          label {
              display: block;
              margin-right: auto;
              display: flex;
              align-items: center;
           }
      `}
`;

export const ExternalLinkStyled = styled(ExternalLink)`
    font-size: 1.4rem;
    line-height: 2rem;
`;

export const Summary = styled.div`
    font-size: 1.4rem;
    line-height: 2rem;
    color: ${COLORS.grayText};
    display: flex;
    align-items: center;
`;

export const AquaLogo = styled(Aqua)`
    width: 2.4rem;
    height: 2.4rem;
    margin-left: 1.6rem;
    margin-right: 0.8rem;
`;

export const AquaBalance = styled.div`
    font-size: 2rem;
    line-height: 2.4rem;
    color: ${COLORS.titleText};
    margin-right: 1rem;
`;

const Percent = styled.div`
    color: ${COLORS.grayText};
    font-size: 1.4rem;
    line-height: 2.4rem;
`;

export const TooltipInner = styled.span`
    width: 40rem;
    white-space: pre-line;

    ${respondDown(Breakpoints.md)`
        width: 20rem;
    `}
`;

export const DailyRewards = styled.span`
    margin-right: 1rem;
`;

export const InOffers = styled.div`
    display: flex;
    flex-direction: column;
    line-height: 2.4rem;

    ${respondDown(Breakpoints.md)`
        text-align: right;
    `}
`;

export const TOOLTIP_TEXT =
    'You can freeze AQUA into ICE for additional benefits. One of them is a boost in SDEX and AMM rewards you can receive. The higher your ICE balance, the higher your boost can be.';

enum SortField {
    market = 'market',
    your = 'your',
}

export const getSortFunction = (value1, value2, isSortReversed) => {
    return isSortReversed ? value1 - value2 : value2 - value1;
};

const AmmRewards = ({ aquaUsdPrice }) => {
    const { account } = useAuthStore();

    const [ammRewards, setAmmRewards] = useState(null);
    const [sort, setSort] = useState(SortField.your);
    const [isSortReversed, setIsSortReversed] = useState(false);

    const { processNewAssets } = useAssetsStore();

    useEffect(() => {
        getAmmRewards(account.accountId()).then((res) => {
            setAmmRewards(res);

            const assets = res.reduce((acc, { market_pair: pair }) => {
                const {
                    asset1_code: baseCode,
                    asset1_issuer: baseIssuer,
                    asset2_code: counterCode,
                    asset2_issuer: counterIssuer,
                } = pair;

                acc.push({ code: baseCode, issuer: baseIssuer });
                acc.push({ code: counterCode, issuer: counterIssuer });
                return acc;
            }, []);

            processNewAssets(assets);
        });
    }, []);

    const getSharesPercent = (total, balance) => {
        const percent = ((balance / total) * 100).toFixed(2);

        if (percent === '0.00') {
            return ' (< 0.01%)';
        }

        return ` (${percent}%)`;
    };

    const { sumBoost, sumRewards } = useMemo(() => {
        if (!ammRewards || !ammRewards.length) {
            return { sumBoost: 0, sumRewards: 0 };
        }

        return ammRewards.reduce(
            (acc, reward) => {
                acc.sumRewards += reward.reward_amount * 24;
                acc.sumBoost += reward.boosted_reward;
                return acc;
            },
            { sumBoost: 0, sumRewards: 0 },
        );
    }, [ammRewards]);

    const sorted = useMemo(() => {
        if (!ammRewards) {
            return null;
        }
        switch (sort) {
            case SortField.market:
                return ammRewards.sort((a, b) =>
                    getSortFunction(a.reward_volume, b.reward_volume, isSortReversed),
                );
            case SortField.your:
                return ammRewards.sort((a, b) =>
                    getSortFunction(a.reward_amount, b.reward_amount, isSortReversed),
                );
            default:
                throw new Error('Invalid sort field');
        }
    }, [ammRewards, sort, isSortReversed]);

    const changeSort = useCallback(
        (sortField) => {
            if (sortField === sort) {
                setIsSortReversed((prevState) => !prevState);
                return;
            }
            setSort(sortField);
            setIsSortReversed(false);
        },
        [sort, isSortReversed],
    );

    return (
        <Container>
            <Header>
                <Title>AMM rewards overview</Title>
                {Boolean(sumRewards) && (
                    <Summary>
                        Daily AMM reward: <AquaLogo />
                        <AquaBalance>{formatBalance(sumRewards, true)} AQUA</AquaBalance>
                        {aquaUsdPrice ? (
                            `(≈${(aquaUsdPrice * sumRewards).toFixed(2)}$)`
                        ) : (
                            <DotsLoader />
                        )}
                    </Summary>
                )}
            </Header>

            {Boolean(sorted?.length) && !sumBoost && <BoostBanner />}

            {!sorted ? (
                <PageLoader />
            ) : sorted.length ? (
                <Section>
                    <Table>
                        <TableHead>
                            <TableHeadRow>
                                <PairCell>Pair</PairCell>
                                <Cell>Pooled</Cell>
                                <Cell>Pool shares</Cell>
                                <Cell>
                                    <SortingHeader
                                        position="right"
                                        onClick={() => changeSort(SortField.market)}
                                    >
                                        AMM daily reward
                                        <IconSort
                                            isEnabled={sort === SortField.market}
                                            isReversed={isSortReversed}
                                        />
                                    </SortingHeader>
                                </Cell>

                                <Cell>
                                    <SortingHeader
                                        position="right"
                                        onClick={() => changeSort(SortField.your)}
                                    >
                                        Your daily reward
                                        <IconSort
                                            isEnabled={sort === SortField.your}
                                            isReversed={isSortReversed}
                                        />
                                    </SortingHeader>
                                </Cell>
                            </TableHeadRow>
                        </TableHead>

                        <TableBody>
                            {sorted.map(
                                ({
                                    market_pair: pair,
                                    pool_id: id,
                                    total_shares: totalShares,
                                    reward_amount: rewardAmount,
                                    boosted_reward: boostedReward,
                                    reward_volume: rewardVolume,
                                    reserve_a_amount,
                                    reserve_b_amount,
                                }) => {
                                    const {
                                        asset1_code: baseCode,
                                        asset1_issuer: baseIssuer,
                                        asset2_code: counterCode,
                                        asset2_issuer: counterIssuer,
                                    } = pair;
                                    const base = baseIssuer
                                        ? StellarService.createAsset(baseCode, baseIssuer)
                                        : StellarService.createLumen();

                                    const counter = counterIssuer
                                        ? StellarService.createAsset(counterCode, counterIssuer)
                                        : StellarService.createLumen();

                                    const dailyReward = rewardAmount * 24;
                                    const marketRewards = rewardVolume * 24;

                                    const boostValue = (
                                        rewardAmount /
                                        (rewardAmount - boostedReward)
                                    ).toFixed(2);

                                    const poolBalance = account.getPoolBalance(id);
                                    const percent = poolBalance / Number(totalShares);
                                    const basePooled = reserve_a_amount * percent;
                                    const counterPooled = reserve_b_amount * percent;

                                    return (
                                        <TableBodyRow key={id}>
                                            <PairCell>
                                                <Pair
                                                    base={base}
                                                    counter={counter}
                                                    withoutLink
                                                    withMarketLink
                                                    mobileVerticalDirections
                                                />
                                            </PairCell>
                                            <Cell>
                                                <label>Pooled:</label>
                                                <InOffers>
                                                    <div>
                                                        {formatBalance(basePooled, true)}{' '}
                                                        {base.code}
                                                    </div>
                                                    <div>
                                                        {formatBalance(counterPooled, true)}{' '}
                                                        {counter.code}
                                                    </div>
                                                </InOffers>
                                            </Cell>
                                            <Cell>
                                                <label>Pool shares:</label>
                                                <InOffers>
                                                    {formatBalance(
                                                        account.getPoolBalance(id),
                                                        true,
                                                    )}
                                                    <Percent>
                                                        {getSharesPercent(
                                                            Number(totalShares),
                                                            account.getPoolBalance(id),
                                                        )}
                                                    </Percent>
                                                </InOffers>
                                            </Cell>
                                            <Cell>
                                                <label>AMM daily reward::</label>
                                                {formatBalance(marketRewards, true)} AQUA
                                            </Cell>

                                            <Cell>
                                                <label>Your daily reward:</label>

                                                <DailyRewards>
                                                    {formatBalance(dailyReward, true)} AQUA
                                                </DailyRewards>

                                                {Boolean(boostedReward) && (
                                                    <Label
                                                        title={`Boosted ${boostValue}x`}
                                                        text={TOOLTIP_TEXT}
                                                        isBlue
                                                    />
                                                )}
                                            </Cell>
                                        </TableBodyRow>
                                    );
                                },
                            )}
                        </TableBody>
                    </Table>
                </Section>
            ) : (
                <Section>
                    <Empty>
                        <h3>There's nothing here.</h3>
                        <span>
                            It looks like there are don't have an active liquidity position.
                        </span>

                        <ExternalLinkStyled asDiv>
                            <Link to={MainRoutes.rewards}>Learn about AMM rewards</Link>
                        </ExternalLinkStyled>
                    </Empty>
                </Section>
            )}
        </Container>
    );
};

export default AmmRewards;
