import * as React from 'react';
import styled from 'styled-components';

import { apyValueToDisplay } from 'helpers/amount';
import { getAquaAssetData, getAssetFromString } from 'helpers/assets';

import { PoolProcessed } from 'types/amm';

import { flexAllCenter, flexColumn, flexRowSpaceBetween } from 'web/mixins';
import { COLORS, FONT_SIZE, hexWithOpacity } from 'web/styles';

import Arrows from 'assets/icon-arrows.svg';
import Lightning from 'assets/icon-lightning.svg';

import AssetLogo from 'basics/AssetLogo';
import Tooltip from 'basics/Tooltip';

const Container = styled.div`
    display: flex;
    align-items: center;
    gap: 0.8rem;
`;

const BlockWithIcon = styled.div`
    ${flexAllCenter};
    height: 2.4rem;
    width: 2.4rem;
    border-radius: 0.6rem;
    background-color: ${COLORS.extralightPurple};
`;

const Divider = styled.div`
    border-left: 0.1rem solid ${hexWithOpacity(COLORS.grayText, 20)};
    height: 1.7rem;
`;

const Logos = styled.div`
    display: flex;
    align-items: center;
`;

const AssetLogoStyled = styled(AssetLogo)`
    height: 2.4rem;
    width: 2.4rem;
    min-width: 2.4rem;
    min-height: 2.4rem;
    max-height: 2.4rem;
    max-width: 2.4rem;
    border: 0.1rem solid ${COLORS.white};
    background-color: ${COLORS.white};

    &:not(:first-child) {
        margin-left: -0.6rem;
    }
`;

const TooltipInner = styled.div`
    padding: 1.5rem 1.2rem;
    ${flexColumn};
    min-width: 24rem;
`;

const TooltipSectionTitle = styled.div`
    display: flex;
    align-items: center;
    ${FONT_SIZE.xs}
    color: ${COLORS.purple};
    text-transform: uppercase;
    gap: 0.8rem;
    margin-bottom: 1.6rem;
`;

const TooltipRow = styled.div`
    ${flexRowSpaceBetween};
    ${FONT_SIZE.sm}
    color: ${COLORS.paragraphText};

    &:not(:last-child) {
        margin-bottom: 1.6rem;
    }
    gap: 3.2rem;
`;

const TooltipToken = styled.div`
    display: flex;
    align-items: center;
    gap: 0.8rem;
`;

const TooltipDivider = styled.div`
    border-top: 0.1rem dashed ${COLORS.gray};
    margin: 1.6rem 0;
`;

interface Props {
    pool: PoolProcessed;
}

const RewardsTokens = ({ pool }: Props) => {
    const { aquaStellarAsset } = getAquaAssetData();
    const hasRewards = Boolean(Number(pool.rewards_apy));

    const hasIncentives =
        pool.incentive_tps_per_token && !!Object.values(pool.incentive_tps_per_token).length;

    return (
        <Tooltip
            content={
                <TooltipInner>
                    <TooltipSectionTitle>
                        <BlockWithIcon>
                            <Arrows />
                        </BlockWithIcon>
                        SWAP REWARDS (24H)
                    </TooltipSectionTitle>
                    <TooltipRow>
                        <span>Swap fee</span>
                        <span>{apyValueToDisplay(pool.apy)} APY</span>
                    </TooltipRow>

                    {Boolean(Number(pool.rewards_apy)) && (
                        <>
                            <TooltipDivider />
                            <TooltipSectionTitle>
                                <BlockWithIcon>
                                    <Lightning style={{ width: '0.7rem', height: '1.2rem' }} />
                                </BlockWithIcon>
                                REWARD ZONE
                            </TooltipSectionTitle>
                            <TooltipRow>
                                <TooltipToken>
                                    <AssetLogoStyled asset={aquaStellarAsset} />
                                    AQUA
                                </TooltipToken>
                                <span>{apyValueToDisplay(pool.rewards_apy)} APY</span>
                            </TooltipRow>
                        </>
                    )}

                    {Boolean(Number(pool.incentive_apy)) && (
                        <>
                            <TooltipDivider />
                            <TooltipSectionTitle>extra rewards</TooltipSectionTitle>

                            {Object.entries(pool.incentive_apy_per_token)
                                .filter(([, val]) => Boolean(Number(val)))
                                .map(([key, val]) => {
                                    const token = getAssetFromString(key);
                                    return (
                                        <TooltipRow key={token.contract}>
                                            <TooltipToken>
                                                <AssetLogoStyled asset={token} />
                                                {token.code}
                                            </TooltipToken>
                                            <span>{apyValueToDisplay(val)} APY</span>
                                        </TooltipRow>
                                    );
                                })}
                        </>
                    )}
                </TooltipInner>
            }
            background={COLORS.white}
            color={COLORS.paragraphText}
            showOnHover
        >
            <Container>
                <BlockWithIcon>
                    <Arrows />
                </BlockWithIcon>

                {hasRewards && (
                    <>
                        <Divider />
                        <BlockWithIcon>
                            <Lightning style={{ width: '0.7rem', height: '1.2rem' }} />
                        </BlockWithIcon>
                    </>
                )}

                {hasIncentives && (
                    <>
                        <Divider />
                        <Logos>
                            {Object.entries(pool.incentive_tps_per_token).map(([key]) => {
                                const token = getAssetFromString(key);
                                return <AssetLogoStyled key={token.contract} asset={token} />;
                            })}
                        </Logos>
                    </>
                )}
            </Container>
        </Tooltip>
    );
};

export default RewardsTokens;
