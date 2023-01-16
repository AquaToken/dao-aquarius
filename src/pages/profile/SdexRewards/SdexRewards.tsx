import * as React from 'react';
import { TableBody, TableHead, TableHeadRow } from '../../vote/components/MainPage/Table/Table';
import Pair from '../../vote/components/common/Pair';
import { StellarService } from '../../../common/services/globalServices';
import { useEffect, useMemo, useState } from 'react';
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

const SdexRewards = () => {
    const { account } = useAuthStore();

    const [sdexRewards, setSdexRewards] = useState(null);

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

            {!sdexRewards ? (
                <PageLoader />
            ) : sdexRewards.length ? (
                <Section>
                    <Table>
                        <TableHead>
                            <TableHeadRow>
                                <PairCell>Pair</PairCell>
                                <Cell>Daily SDEX reward</Cell>
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
                            {sdexRewards.map(
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
