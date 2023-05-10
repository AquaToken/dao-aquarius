import * as React from 'react';
import { TableBody, TableHead, TableHeadRow } from '../../vote/components/MainPage/Table/Table';
import Pair from '../../vote/components/common/Pair';
import { StellarService } from '../../../common/services/globalServices';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getSdexRewards } from '../api/api';
import useAuthStore from '../../../store/authStore/useAuthStore';
import PageLoader from '../../../common/basics/PageLoader';
import { Empty } from '../YourVotes/YourVotes';
import { Link } from 'react-router-dom';
import { MainRoutes } from '../../../routes';
import { formatBalance } from '../../../common/helpers/helpers';
import {
    AquaBalance,
    AquaLogo,
    Cell,
    Container,
    ExternalLinkStyled,
    getSortFunction,
    Header,
    PairCell,
    Section,
    Summary,
    Table,
    TableBodyRow,
    Title,
    TOOLTIP_TEXT,
    TooltipCustom,
    TooltipInner,
} from '../AmmRewards/AmmRewards';
import useAssetsStore from '../../../store/assetsStore/useAssetsStore';
import { TOOLTIP_POSITION } from '../../../common/basics/Tooltip';
import Info from '../../../common/assets/img/icon-info.svg';
import { SortingHeader } from '../../bribes/components/BribesPage/BribesTable/BribesTable';
import { IconSort } from '../../../common/basics/Icons';

enum SortField {
    daily = 'daily',
    boost = 'boost',
    total = 'total',
}

const SdexRewards = () => {
    const { account } = useAuthStore();

    const [sdexRewards, setSdexRewards] = useState(null);
    const [sort, setSort] = useState(SortField.total);
    const [isSortReversed, setIsSortReversed] = useState(false);

    const { processNewAssets } = useAssetsStore();

    useEffect(() => {
        getSdexRewards(account.accountId()).then((res) => {
            setSdexRewards(res);

            const assets = res.reduce((acc, { market_key: pair }) => {
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

    const summary = useMemo(() => {
        if (!sdexRewards || !sdexRewards.length) {
            return null;
        }

        return sdexRewards.reduce((acc, reward) => {
            acc += reward.maker_reward * 24;
            return acc;
        }, 0);
    }, [sdexRewards]);

    const sorted = useMemo(() => {
        if (!sdexRewards) {
            return null;
        }
        switch (sort) {
            case SortField.daily:
                return sdexRewards.sort((a, b) =>
                    getSortFunction(
                        a.maker_reward - a.boosted_reward,
                        b.maker_reward - b.boosted_reward,
                        isSortReversed,
                    ),
                );
            case SortField.boost:
                return sdexRewards.sort((a, b) =>
                    getSortFunction(a.boosted_reward, b.boosted_reward, isSortReversed),
                );
            case SortField.total:
                return sdexRewards.sort((a, b) =>
                    getSortFunction(a.maker_reward, b.maker_reward, isSortReversed),
                );
            default:
                throw new Error('Invalid sort field');
        }
    }, [sdexRewards, sort, isSortReversed]);

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
                <Title>SDEX rewards overview</Title>
                {summary && (
                    <Summary>
                        Daily SDEX reward: <AquaLogo />
                        <AquaBalance>{formatBalance(summary, true)} AQUA</AquaBalance>
                    </Summary>
                )}
            </Header>

            {!sorted ? (
                <PageLoader />
            ) : sorted.length ? (
                <Section>
                    <Table>
                        <TableHead>
                            <TableHeadRow>
                                <PairCell>Pair</PairCell>
                                <Cell>
                                    <SortingHeader
                                        position="left"
                                        onClick={() => changeSort(SortField.daily)}
                                    >
                                        Daily SDEX reward
                                        <IconSort
                                            isEnabled={sort === SortField.daily}
                                            isReversed={isSortReversed}
                                        />
                                    </SortingHeader>
                                </Cell>
                                <Cell>
                                    <SortingHeader
                                        position="left"
                                        onClick={() => changeSort(SortField.boost)}
                                    >
                                        ICE holding boost
                                        <IconSort
                                            isEnabled={sort === SortField.boost}
                                            isReversed={isSortReversed}
                                        />
                                        <TooltipCustom
                                            content={<TooltipInner>{TOOLTIP_TEXT}</TooltipInner>}
                                            position={TOOLTIP_POSITION.top}
                                            showOnHover
                                        >
                                            <Info />
                                        </TooltipCustom>
                                    </SortingHeader>
                                </Cell>
                                <Cell>
                                    <SortingHeader
                                        position="left"
                                        onClick={() => changeSort(SortField.total)}
                                    >
                                        Total daily reward
                                        <IconSort
                                            isEnabled={sort === SortField.total}
                                            isReversed={isSortReversed}
                                        />
                                    </SortingHeader>
                                </Cell>
                            </TableHeadRow>
                        </TableHead>

                        <TableBody>
                            {sorted.map(
                                ({
                                    market_key: pair,
                                    maker_reward: reward,
                                    boosted_reward: boost,
                                }) => {
                                    const dailyReward = reward * 24;
                                    const dailyBoost = boost * 24;
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

                                    return (
                                        <TableBodyRow
                                            key={
                                                baseCode + baseIssuer + counterCode + counterIssuer
                                            }
                                        >
                                            <PairCell>
                                                <Pair
                                                    base={base}
                                                    counter={counter}
                                                    withoutLink
                                                    mobileVerticalDirections
                                                />
                                            </PairCell>
                                            <Cell>
                                                <label>Daily SDEX reward:</label>
                                                {formatBalance(dailyReward - dailyBoost, true)} AQUA
                                            </Cell>
                                            <Cell>
                                                <label>
                                                    ICE holding boost:
                                                    <TooltipCustom
                                                        content={
                                                            <TooltipInner>
                                                                {TOOLTIP_TEXT}
                                                            </TooltipInner>
                                                        }
                                                        position={TOOLTIP_POSITION.top}
                                                        showOnHover
                                                    >
                                                        <Info />
                                                    </TooltipCustom>
                                                </label>
                                                {formatBalance(dailyBoost, true)} AQUA
                                            </Cell>
                                            <Cell>
                                                <label>Total daily reward:</label>
                                                {formatBalance(dailyReward, true)} AQUA
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
                        <span>It looks like you don't get SDEX rewards</span>

                        <ExternalLinkStyled asDiv>
                            <Link to={MainRoutes.rewards}>Learn about SDEX rewards</Link>
                        </ExternalLinkStyled>
                    </Empty>
                </Section>
            )}
        </Container>
    );
};

export default SdexRewards;
