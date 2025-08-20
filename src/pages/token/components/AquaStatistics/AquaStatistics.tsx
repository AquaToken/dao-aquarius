import * as React from 'react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

import { getAquaCirculatingSupply } from 'api/cmc';
import { getIceStatistics } from 'api/ice-locker';
import { getTotalRewards } from 'api/rewards';
import { getAssetDetails } from 'api/stellar-expert';

import { getAquaAssetData } from 'helpers/assets';
import { getDateString } from 'helpers/date';
import { formatBalance } from 'helpers/format-number';
import { getPercentValue } from 'helpers/number';

import { IceStatistics } from 'types/api-ice-locker';
import { ExpertAssetData } from 'types/api-stellar-expert';

import DotsLoader from 'web/basics/loaders/DotsLoader';
import { cardBoxShadow, commonMaxWidth, respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import Info from 'assets/icon-info.svg';

import Tooltip, { TOOLTIP_POSITION } from 'basics/Tooltip';

import AquaLinks from 'pages/token/components/AquaLinks/AquaLinks';
import AquaPrice from 'pages/token/components/AquaPrice/AquaPrice';

const Container = styled.section`
    ${commonMaxWidth};
    padding: 0 10rem;
    width: 100%;

    ${respondDown(Breakpoints.sm)`
        padding: 0 1.6rem;
        margin-top: 1.6rem;
    `}
`;

const Content = styled.div`
    border-radius: 4.4rem;
    padding: 3.6rem;
    ${cardBoxShadow};
    z-index: 100;
    background: ${COLORS.white};
    position: relative;
    display: flex;
    flex-wrap: wrap;
    gap: 3.2rem;

    ${respondDown(Breakpoints.sm)`
        flex-direction: column;
        padding: 1.6rem;
    `}
`;

const AquaPriceStyled = styled(AquaPrice)`
    display: none;

    ${respondDown(Breakpoints.sm)`
        display: flex;
        position: static;
        margin-bottom: 1.6rem;
    `}
`;

const AquaLinksStyled = styled(AquaLinks)`
    display: none;

    ${respondDown(Breakpoints.sm)`
        display: flex;
    `}
`;

const Column = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    margin-right: auto;

    ${respondDown(Breakpoints.sm)`
        flex-direction: row;
        justify-content: space-between;
        margin: 1rem 0
    `}
`;

const Label = styled.span`
    color: ${COLORS.grayText};
    display: flex;
    white-space: nowrap;

    svg {
        margin: 0 0.4rem;
    }
`;

const Value = styled.span`
    color: ${COLORS.paragraphText};
    font-size: 1.6rem;
    line-height: 2rem;

    ${respondDown(Breakpoints.sm)`
        text-align: right;
    `}
`;

const TooltipInner = styled.span`
    width: 15rem;
    white-space: normal;

    ${respondDown(Breakpoints.xs)`
        width: 13rem;
    `}
`;

const AquaStatistics = () => {
    const [iceStats, setIceStats] = useState<IceStatistics>(null);
    const [expertData, setExpertData] = useState<ExpertAssetData>(undefined);
    const [totalRewards, setTotalRewards] = useState<number>(null);
    const [aquaCirculatingSupply, setAquaCirculatingSupply] = useState<number>(null);

    const { aquaStellarAsset } = getAquaAssetData();

    useEffect(() => {
        getAssetDetails(aquaStellarAsset).then(setExpertData);

        getIceStatistics().then(res => {
            setIceStats(res);
        });

        getTotalRewards().then(({ total_daily_amm_reward, total_daily_sdex_reward }) => {
            setTotalRewards(total_daily_amm_reward + total_daily_sdex_reward);
        });

        getAquaCirculatingSupply().then(res => {
            setAquaCirculatingSupply(res);
        });
    }, []);

    return (
        <Container>
            <Content>
                <AquaPriceStyled />
                <Column>
                    <Label>First transaction:</Label>
                    <Value>
                        {expertData ? (
                            getDateString(new Date(expertData.created * 1000).getTime())
                        ) : (
                            <DotsLoader />
                        )}
                    </Value>
                </Column>
                <Column>
                    <Label>Payments volume:</Label>
                    <Value>
                        {expertData ? (
                            `${formatBalance(expertData?.payments_amount / 1e7, true)} AQUA`
                        ) : (
                            <DotsLoader />
                        )}
                    </Value>
                </Column>
                <Column>
                    <Label>Traded volume:</Label>
                    <Value>
                        {expertData ? (
                            `${formatBalance(expertData?.traded_amount / 1e7, true, false)} AQUA`
                        ) : (
                            <DotsLoader />
                        )}
                    </Value>
                </Column>
                <Column>
                    <Label>
                        Total frozen:
                        <Tooltip
                            content={
                                <TooltipInner>
                                    AQUA holders can lock/freeze their tokens and receive ICE tokens
                                    with greater voting power
                                </TooltipInner>
                            }
                            position={TOOLTIP_POSITION.top}
                            showOnHover
                        >
                            <Info />
                        </Tooltip>
                    </Label>
                    <Value>
                        {iceStats && aquaCirculatingSupply !== null ? (
                            `${formatBalance(
                                Number(iceStats.aqua_lock_amount),
                                true,
                            )}(${getPercentValue(
                                Number(iceStats.aqua_lock_amount),
                                aquaCirculatingSupply,
                            )}%) AQUA`
                        ) : (
                            <DotsLoader />
                        )}
                    </Value>
                </Column>
                <Column>
                    <Label>
                        Daily rewards:
                        <Tooltip
                            content={
                                <TooltipInner>
                                    Aquarius distributes AQUA tokens to the liquidity providers
                                    every day
                                </TooltipInner>
                            }
                            position={TOOLTIP_POSITION.top}
                            showOnHover
                        >
                            <Info />
                        </Tooltip>
                    </Label>
                    <Value>
                        {totalRewards ? (
                            `${formatBalance(totalRewards, true)} AQUA`
                        ) : (
                            <DotsLoader />
                        )}
                    </Value>
                </Column>
                <AquaLinksStyled />
            </Content>
        </Container>
    );
};

export default AquaStatistics;
