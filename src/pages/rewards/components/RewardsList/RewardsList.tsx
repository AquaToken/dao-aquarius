import * as React from 'react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { flexAllCenter, respondDown } from '../../../../common/mixins';
import { Breakpoints, COLORS } from '../../../../common/styles';
import { getRewards, RewardsSort } from '../../api/api';
import useAssetsStore from '../../../../store/assetsStore/useAssetsStore';
import { useHistory, useLocation } from 'react-router-dom';
import PageLoader from '../../../../common/basics/PageLoader';
import Info from '../../../../common/assets/img/icon-info.svg';
import Link from '../../../../common/assets/img/icon-external-link.svg';
import { formatBalance, getTimeAgoValue } from '../../../../common/helpers/helpers';
import Tooltip, { TOOLTIP_POSITION } from '../../../../common/basics/Tooltip';
import {
    TableBody,
    TableCell,
    TableHead,
    TableHeadRow,
} from '../../../vote/components/MainPage/Table/Table';
import Pair from '../../../vote/components/common/Pair';
import { IconSort } from '../../../../common/basics/Icons';
import { MarketRoutes } from '../../../../routes';

const Container = styled.section`
    position: relative;
    margin: 0 auto;
    max-width: 142rem;
    padding: 1rem 10rem 0;
    width: 100%;

    ${respondDown(Breakpoints.md)`
        padding: 0 1.6rem;
        max-width: 55rem;
    `}
`;

const Header = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 4.2rem;
    padding: 0 1rem;

    ${respondDown(Breakpoints.md)`
        flex-direction: column;
        margin-top: 4rem;
    `}
`;

const Title = styled.h3`
    font-size: 3.5rem;
    line-height: 4.1rem;
    color: ${COLORS.titleText};
    font-weight: normal;

    ${respondDown(Breakpoints.md)`
        margin-bottom: 2rem;
    `}
`;

const LastUpdated = styled.div`
    display: flex;
    align-items: center;
    font-size: 1.4rem;
    line-height: 2rem;
    color: ${COLORS.grayText};

    span {
        margin-right: 1rem;
    }

    svg {
        cursor: help;
    }
`;

const TooltipInner = styled.div`
    width: 15rem;
    white-space: pre-wrap;
`;

const Table = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    position: relative;
`;

const TableLoader = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background-color: rgba(255, 255, 255, 0.8);
    z-index: 10;
    ${flexAllCenter};
    animation: showLoader 0.1s ease-in-out;

    @keyframes showLoader {
        0% {
            background-color: rgba(255, 255, 255, 0);
        }
        100% {
            background-color: rgba(255, 255, 255, 0.8);
        }
    }
`;

const TableBodyRowWrap = styled.div`
    cursor: pointer;
    border: 0.1rem solid ${COLORS.transparent};
    padding: 0.8rem;
    border-radius: 0.5rem;

    &:hover {
        background: ${COLORS.lightGray};
        border: 0.1rem solid ${COLORS.gray};
    }

    ${respondDown(Breakpoints.md)`
          flex-direction: column;
          background: ${COLORS.white};
          border-radius: 0.5rem;
          margin-bottom: 1.6rem;
          padding: 2.7rem 1.6rem 1.6rem;
          
          ${TableCell}:nth-child(2), ${TableCell}:nth-child(3) {
                font-size: 1.6rem;
                line-height: 2.8rem;
                color: ${COLORS.grayText};
            }
    `}
`;

const TableBodyRow = styled.div`
    display: flex;
    align-items: stretch;
    width: 100%;
    min-height: 9.6rem;
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.paragraphText};
    position: relative;
    border-radius: 0.5rem;

    ${TableCell}:nth-child(2), ${TableCell}:nth-child(3) {
        font-size: 1.4rem;
        line-height: 2rem;
        color: ${COLORS.grayText};
    }

    ${respondDown(Breakpoints.md)`
            flex-direction: column;
            
            ${TableCell}:nth-child(2), ${TableCell}:nth-child(3) {
                font-size: 1.4rem;
                line-height: 2.8rem;
                color: ${COLORS.grayText};
            }
      `}
`;

const PairCell = styled(TableCell)`
    flex: 3;
`;

const RightCell = styled(TableCell)`
    justify-content: flex-end;

    label {
        display: none;
    }

    ${respondDown(Breakpoints.md)`
        justify-content: space-between;
        margin-top: 1.6rem;
        
        label {
            display: inline;
        }
    `}
`;

const ClickableCell = styled(RightCell)`
    cursor: pointer;

    &:hover {
        color: ${COLORS.titleText};
    }

    svg {
        margin-left: 0.5rem;
    }
`;

const TableHeadRowStyled = styled(TableHeadRow)`
    padding: 0.8rem;
`;

const LinkIcon = styled(Link)`
    margin-left: 0.5rem;
`;

enum UrlParams {
    sort = 'ordering',
}

const marketKeyToString = (code, issuer) => {
    if (code === 'XLM' && !issuer) {
        return 'native';
    }
    return `${code}:${issuer}`;
};

const RewardsList = ({ isV2 }: { isV2?: boolean }) => {
    const [rewards, setRewards] = useState(null);
    const [sort, setSort] = useState(null);
    const [loading, setLoading] = useState(false);

    const { processNewAssets } = useAssetsStore();

    const location = useLocation();
    const history = useHistory();

    useEffect(() => {
        if (!sort) {
            return;
        }
        setLoading(true);
        getRewards(sort, isV2).then((res) => {
            setRewards(res);
            setLoading(false);
            const assets = res.reduce((acc, item) => {
                const { asset1_code, asset1_issuer, asset2_code, asset2_issuer } = item.market_key;
                acc.push({ code: asset1_code, issuer: asset1_issuer });
                acc.push({ code: asset2_code, issuer: asset2_issuer });
                return acc;
            }, []);

            processNewAssets(assets);
        });
    }, [sort, isV2]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (!params.has(UrlParams.sort)) {
            params.append(UrlParams.sort, RewardsSort.totalUp);
            history.replace({ search: params.toString() });
            return;
        }

        setSort(params.get(UrlParams.sort));
    }, [location]);

    const changeSort = (sortValue) => {
        const params = new URLSearchParams(location.search);
        params.set(UrlParams.sort, sortValue);
        history.push({ pathname: location.pathname, search: params.toString() });
    };

    const goToMarketPage = ({ asset1_code, asset1_issuer, asset2_code, asset2_issuer }) => {
        history.push(
            `${MarketRoutes.main}/${marketKeyToString(
                asset1_code,
                asset1_issuer,
            )}/${marketKeyToString(asset2_code, asset2_issuer)}`,
        );
    };

    if (!rewards) {
        return <PageLoader />;
    }

    return (
        <Container>
            <Header>
                <Title>Market Rewards</Title>

                <LastUpdated>
                    <span>
                        Last updated {getTimeAgoValue(new Date(rewards[0].last_updated).getTime())}
                    </span>
                    <Tooltip
                        content={
                            <TooltipInner>
                                Market rewards are updated once a day at a random time.
                            </TooltipInner>
                        }
                        position={TOOLTIP_POSITION.bottom}
                        showOnHover
                    >
                        <Info />
                    </Tooltip>
                </LastUpdated>
            </Header>
            <Table>
                {rewards && loading && (
                    <TableLoader>
                        <PageLoader />
                    </TableLoader>
                )}

                <TableHead>
                    <TableHeadRowStyled>
                        <PairCell>Market</PairCell>
                        <ClickableCell
                            onClick={() =>
                                changeSort(
                                    sort === RewardsSort.sdexUp
                                        ? RewardsSort.sdexDown
                                        : RewardsSort.sdexUp,
                                )
                            }
                        >
                            SDEX daily reward
                            <IconSort
                                isEnabled={
                                    sort === RewardsSort.sdexUp || sort === RewardsSort.sdexDown
                                }
                                isReversed={sort === RewardsSort.sdexDown}
                            />
                        </ClickableCell>
                        <ClickableCell
                            onClick={() =>
                                changeSort(
                                    sort === RewardsSort.ammUp
                                        ? RewardsSort.ammDown
                                        : RewardsSort.ammUp,
                                )
                            }
                        >
                            AMM daily reward
                            <IconSort
                                isEnabled={
                                    sort === RewardsSort.ammUp || sort === RewardsSort.ammDown
                                }
                                isReversed={sort === RewardsSort.ammDown}
                            />
                        </ClickableCell>
                        <ClickableCell
                            onClick={() =>
                                changeSort(
                                    sort === RewardsSort.totalUp
                                        ? RewardsSort.totalDown
                                        : RewardsSort.totalUp,
                                )
                            }
                        >
                            Total daily reward
                            <IconSort
                                isEnabled={
                                    sort === RewardsSort.totalUp || sort === RewardsSort.totalDown
                                }
                                isReversed={sort === RewardsSort.totalDown}
                            />
                        </ClickableCell>
                    </TableHeadRowStyled>
                </TableHead>
                <TableBody>
                    {rewards.map(
                        ({
                            daily_sdex_reward,
                            daily_sdex_percentage,
                            daily_total_reward,
                            daily_amm_reward,
                            daily_amm_percentage,
                            market_key,
                        }) => (
                            <TableBodyRowWrap
                                key={
                                    market_key.asset1_code +
                                    market_key.asset1_issuer +
                                    market_key.asset2_code +
                                    market_key.asset2_issuer
                                }
                                onClick={() => goToMarketPage(market_key)}
                            >
                                <TableBodyRow>
                                    <PairCell>
                                        <Pair
                                            base={{
                                                code: market_key.asset1_code,
                                                issuer: market_key.asset1_issuer,
                                            }}
                                            counter={{
                                                code: market_key.asset2_code,
                                                issuer: market_key.asset2_issuer,
                                            }}
                                            withoutLink
                                            mobileVerticalDirections
                                        />
                                    </PairCell>
                                    <RightCell>
                                        <label>SDEX daily reward</label>
                                        <span>
                                            {formatBalance(daily_sdex_reward)} AQUA{' '}
                                            {isV2 ? `(${daily_sdex_percentage}%)` : ''}
                                        </span>
                                        <a
                                            href={`https://www.stellarx.com/markets/${marketKeyToString(
                                                market_key.asset1_code,
                                                market_key.asset1_issuer,
                                            )}/${marketKeyToString(
                                                market_key.asset2_code,
                                                market_key.asset2_issuer,
                                            )}`}
                                            target="_blank"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                            }}
                                            title="StellarX"
                                        >
                                            <LinkIcon />
                                        </a>
                                    </RightCell>
                                    <RightCell>
                                        <label>AMM daily reward</label>
                                        <span>
                                            {formatBalance(daily_amm_reward)} AQUA{' '}
                                            {isV2 ? `(${daily_amm_percentage}%)` : ''}
                                        </span>{' '}
                                        <a
                                            href={`https://www.stellarx.com/amm/analytics/${marketKeyToString(
                                                market_key.asset1_code,
                                                market_key.asset1_issuer,
                                            )}/${marketKeyToString(
                                                market_key.asset2_code,
                                                market_key.asset2_issuer,
                                            )}`}
                                            target="_blank"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                            }}
                                            title="StellarX"
                                        >
                                            <LinkIcon />
                                        </a>
                                    </RightCell>
                                    <RightCell>
                                        <label>Total daily reward</label>
                                        <span>{formatBalance(daily_total_reward)} AQUA</span>
                                    </RightCell>
                                </TableBodyRow>
                            </TableBodyRowWrap>
                        ),
                    )}
                </TableBody>
            </Table>
        </Container>
    );
};

export default RewardsList;
