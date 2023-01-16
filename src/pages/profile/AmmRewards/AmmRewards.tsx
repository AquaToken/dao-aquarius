import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
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
import Info from '../../../common/assets/img/icon-info.svg';
import Aqua from '../../../common/assets/img/aqua-logo-small.svg';
import Tooltip, { TOOLTIP_POSITION } from '../../../common/basics/Tooltip';

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
    flex: 3;

    ${respondDown(Breakpoints.md)`
        margin-bottom: 2rem;
    `};
`;

export const Cell = styled(TableCell)`
    flex: 1;

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
`;

const Percent = styled.div`
    color: ${COLORS.grayText};
    margin-left: 0.5rem;
`;

export const TooltipCustom = styled(Tooltip)`
    margin-left: 0.5rem;
`;

export const TooltipInner = styled.span`
    width: 40rem;
    white-space: pre-line;

    ${respondDown(Breakpoints.md)`
        width: 20rem;
    `}
`;

export const TOOLTIP_TEXT =
    'You can freeze AQUA into ICE for additional benefits. One of them is a boost in SDEX and AMM rewards you can receive. The higher your ICE balance, the higher your boost can be.';

const AmmRewards = () => {
    const { account } = useAuthStore();

    const [ammRewards, setAmmRewards] = useState(null);

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

    const summary = useMemo(() => {
        if (!ammRewards || !ammRewards.length) {
            return null;
        }

        return ammRewards.reduce((acc, reward) => {
            acc += reward.reward_amount * 24;
            return acc;
        }, 0);
    }, [ammRewards]);

    return (
        <Container>
            <Header>
                <Title>AMM rewards overview</Title>
                {summary && (
                    <Summary>
                        Daily AMM reward: <AquaLogo />
                        <AquaBalance>{formatBalance(summary, true)} AQUA</AquaBalance>
                    </Summary>
                )}
            </Header>

            {!ammRewards ? (
                <PageLoader />
            ) : ammRewards.length ? (
                <Section>
                    <Table>
                        <TableHead>
                            <TableHeadRow>
                                <PairCell>Pair</PairCell>
                                <Cell>Total shares</Cell>
                                <Cell>My shares</Cell>
                                <Cell>Daily AMM reward</Cell>
                                <Cell>
                                    ICE holding boost
                                    <TooltipCustom
                                        content={<TooltipInner>{TOOLTIP_TEXT}</TooltipInner>}
                                        position={TOOLTIP_POSITION.top}
                                        showOnHover
                                    >
                                        <Info />
                                    </TooltipCustom>
                                </Cell>
                                <Cell>Total daily reward</Cell>
                            </TableHeadRow>
                        </TableHead>

                        <TableBody>
                            {ammRewards.map(
                                ({
                                    market_pair: pair,
                                    pool_id: id,
                                    total_shares: totalShares,
                                    reward_amount: rewardAmount,
                                    boosted_reward: boostedReward,
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
                                    const dailyBoost = boostedReward * 24;

                                    return (
                                        <TableBodyRow key={id}>
                                            <PairCell>
                                                <Pair
                                                    base={base}
                                                    counter={counter}
                                                    withoutLink
                                                    mobileVerticalDirections
                                                />
                                            </PairCell>
                                            <Cell>
                                                <label>Total shares:</label>
                                                {formatBalance(totalShares, true)}
                                            </Cell>
                                            <Cell>
                                                <label>My shares:</label>
                                                {formatBalance(account.getPoolBalance(id), true)}
                                                <Percent>
                                                    {getSharesPercent(
                                                        Number(totalShares),
                                                        account.getPoolBalance(id),
                                                    )}
                                                </Percent>
                                            </Cell>
                                            <Cell>
                                                <label>Daily AMM reward:</label>
                                                {formatBalance(dailyReward - dailyBoost, true)} AQUA
                                            </Cell>
                                            <Cell>
                                                <label>
                                                    ICE holding boost:{' '}
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
