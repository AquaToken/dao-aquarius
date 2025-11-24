import * as React from 'react';
import { useEffect, useState } from 'react';
import styled, { css } from 'styled-components';

import { getAquaCirculatingSupply } from 'api/cmc';
import { getIceStatistics } from 'api/ice-locker';
import { getTotalRewards } from 'api/rewards';
import { getAssetDetails } from 'api/stellar-expert';

import { getAquaAssetData } from 'helpers/assets';
import { getDateString } from 'helpers/date';
import { formatBalance } from 'helpers/format-number';
import { getPercentValue } from 'helpers/number';

import { useScrollAnimation } from 'hooks/useScrollAnimation';

import { IceStatistics } from 'types/api-ice-locker';
import { ExpertAssetData } from 'types/api-stellar-expert';

import DotsLoader from 'web/basics/loaders/DotsLoader';

import Info from 'assets/icons/status/icon-info-16.svg';

import Tooltip, { TOOLTIP_POSITION } from 'basics/Tooltip';

import { containerScrollAnimation, slideUpSoftAnimation } from 'styles/animations';
import { cardBoxShadow, commonMaxWidth, respondDown } from 'styles/mixins';
import { Breakpoints, COLORS } from 'styles/style-constants';

import AquaLinks from 'pages/token/components/AquaLinks/AquaLinks';
import AquaPrice from 'pages/token/components/AquaPrice/AquaPrice';

/* -------------------------------------------------------------------------- */
/*                                 Styled                                     */
/* -------------------------------------------------------------------------- */

const Container = styled.section<{ $visible: boolean }>`
    ${commonMaxWidth};
    padding: 0 10rem;
    width: 100%;
    ${containerScrollAnimation};
    background: ${COLORS.white};
    z-index: 100;

    ${respondDown(Breakpoints.sm)`
        padding: 0 1.6rem;
        margin-top: 1.6rem;
    `}
`;

const Content = styled.div<{ $visible: boolean }>`
    border-radius: 4.4rem;
    padding: 3.6rem;
    ${cardBoxShadow};
    position: relative;
    display: flex;
    flex-wrap: wrap;
    gap: 3.2rem;
    ${({ $visible }) => $visible && slideUpSoftAnimation};

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

const Column = styled.div<{ $visible: boolean; $delay: number }>`
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    margin-right: auto;
    opacity: 0;
    ${({ $visible, $delay }) =>
        $visible &&
        css`
            ${slideUpSoftAnimation};
            animation-delay: ${$delay}s;
        `}

    ${respondDown(Breakpoints.sm)`
        flex-direction: row;
        justify-content: space-between;
        margin: 1rem 0;
    `}
`;

const Label = styled.span`
    color: ${COLORS.textGray};
    display: flex;
    align-items: center;
    white-space: nowrap;

    svg {
        margin: 0 0.4rem;
    }
`;

const Value = styled.span`
    color: ${COLORS.textTertiary};
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

/* -------------------------------------------------------------------------- */
/*                                 Component                                  */
/* -------------------------------------------------------------------------- */

const AquaStatistics = () => {
    const [iceStats, setIceStats] = useState<IceStatistics>(null);
    const [expertData, setExpertData] = useState<ExpertAssetData>();
    const [totalRewards, setTotalRewards] = useState<number>(null);
    const [aquaCirculatingSupply, setAquaCirculatingSupply] = useState<number>(null);

    const { aquaStellarAsset } = getAquaAssetData();

    const { ref, visible } = useScrollAnimation(0.3, true);

    useEffect(() => {
        getAssetDetails(aquaStellarAsset).then(setExpertData);
        getIceStatistics().then(setIceStats);
        getTotalRewards().then(({ total_daily_amm_reward, total_daily_sdex_reward }) =>
            setTotalRewards(total_daily_amm_reward + total_daily_sdex_reward),
        );
        getAquaCirculatingSupply().then(setAquaCirculatingSupply);
    }, []);

    return (
        <Container ref={ref as React.RefObject<HTMLDivElement>} $visible={visible}>
            <Content $visible={visible}>
                <AquaPriceStyled />
                <Column $visible={visible} $delay={0}>
                    <Label>First transaction:</Label>
                    <Value>
                        {expertData ? (
                            getDateString(new Date(expertData.created * 1000).getTime())
                        ) : (
                            <DotsLoader />
                        )}
                    </Value>
                </Column>

                <Column $visible={visible} $delay={0.1}>
                    <Label>Payments volume:</Label>
                    <Value>
                        {expertData ? (
                            `${formatBalance(expertData?.payments_amount / 1e7, true)} AQUA`
                        ) : (
                            <DotsLoader />
                        )}
                    </Value>
                </Column>

                <Column $visible={visible} $delay={0.2}>
                    <Label>Traded volume:</Label>
                    <Value>
                        {expertData ? (
                            `${formatBalance(expertData?.traded_amount / 1e7, true, false)} AQUA`
                        ) : (
                            <DotsLoader />
                        )}
                    </Value>
                </Column>

                <Column $visible={visible} $delay={0.3}>
                    <Label>
                        Total frozen:
                        <Tooltip
                            content={
                                <TooltipInner>
                                    AQUA holders can lock/freeze their tokens and receive ICE tokens
                                    with greater voting power.
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
                            )} (${getPercentValue(
                                Number(iceStats.aqua_lock_amount),
                                aquaCirculatingSupply,
                            )}%) AQUA`
                        ) : (
                            <DotsLoader />
                        )}
                    </Value>
                </Column>

                <Column $visible={visible} $delay={0.4}>
                    <Label>
                        Daily rewards:
                        <Tooltip
                            content={
                                <TooltipInner>
                                    Aquarius distributes AQUA tokens to liquidity providers daily.
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
