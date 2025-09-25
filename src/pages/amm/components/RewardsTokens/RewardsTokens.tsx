import * as React from 'react';
import styled from 'styled-components';

import { apyValueToDisplay } from 'helpers/amount';
import { getAquaAssetData, getAssetFromString } from 'helpers/assets';
import { formatBalance } from 'helpers/format-number';

import { PoolIncentives, PoolProcessed } from 'types/amm';

import { flexAllCenter, flexColumn, flexRowSpaceBetween, respondDown } from 'web/mixins';
import { Breakpoints, COLORS, FONT_SIZE, hexWithOpacity } from 'web/styles';

import Arrows from 'assets/icon-arrows.svg';
import Crown from 'assets/icon-crown.svg';

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
    background-color: ${COLORS.purple50};
`;

const Divider = styled.div`
    border-left: 0.1rem solid ${hexWithOpacity(COLORS.textGray, 20)};
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
    padding: 2.4rem;
    ${flexColumn};
    min-width: 24rem;

    ${respondDown(Breakpoints.xs)`
        padding: 0.8rem;
        min-width: unset;
    `}
`;

const TooltipSectionTitle = styled.div`
    display: flex;
    align-items: center;
    ${FONT_SIZE.xs}
    color: ${COLORS.purple500};
    text-transform: uppercase;
    gap: 0.8rem;
    margin-bottom: 1.6rem;
`;

const TooltipRow = styled.div`
    ${flexRowSpaceBetween};
    ${FONT_SIZE.sm}
    color: ${COLORS.textTertiary};

    &:not(:last-child) {
        margin-bottom: 1.6rem;
    }
    gap: 3.2rem;

    ${respondDown(Breakpoints.xs)`
        gap: 0.8rem;
        ${FONT_SIZE.xs}
    `}
`;

const TooltipToken = styled.div`
    display: flex;
    align-items: center;
    gap: 0.8rem;
`;

const TooltipDivider = styled.div`
    border-top: 0.1rem dashed ${COLORS.gray100};
    margin: 1.6rem 0;
`;

interface Props {
    pool: PoolProcessed;
    myRewards?: number;
    myIncentives?: PoolIncentives[];
}

const RewardsTokens = ({ pool, myRewards, myIncentives }: Props) => {
    const { aquaStellarAsset } = getAquaAssetData();
    const hasRewards = Boolean(Number(pool.rewards_apy)) || !!myRewards;

    const hasIncentives =
        pool.incentive_tps_per_token && !!Object.values(pool.incentive_tps_per_token).length;

    return (
        <Tooltip
            content={
                <TooltipInner>
                    {!myRewards && !myIncentives?.length && (
                        <>
                            <TooltipSectionTitle>
                                <BlockWithIcon>
                                    <Arrows />
                                </BlockWithIcon>
                                SWAP REWARDS
                            </TooltipSectionTitle>
                            <TooltipRow>
                                <span>Swap fees</span>
                                <span>{apyValueToDisplay(pool.apy)} APY</span>
                            </TooltipRow>
                        </>
                    )}

                    {!myRewards && !myIncentives?.length && hasRewards && <TooltipDivider />}

                    {Boolean(Number(pool.rewards_apy)) && (
                        <>
                            <TooltipSectionTitle>
                                <BlockWithIcon>
                                    <Crown style={{ width: '1.2rem', height: '0.8rem' }} />
                                </BlockWithIcon>
                                {myRewards ? 'REWARDS TO CLAIM' : 'AQUARIUS REWARDS'}
                            </TooltipSectionTitle>
                            <TooltipRow>
                                <TooltipToken>
                                    <AssetLogoStyled asset={aquaStellarAsset} />
                                    AQUA
                                </TooltipToken>
                                {myRewards ? (
                                    <span>{formatBalance(myRewards, true)} AQUA</span>
                                ) : (
                                    <span>{apyValueToDisplay(pool.rewards_apy)} APY</span>
                                )}
                            </TooltipRow>
                        </>
                    )}

                    {(hasIncentives || (!!myIncentives?.length && !!myRewards)) && (
                        <TooltipDivider />
                    )}

                    {(Boolean(Number(pool.incentive_apy)) || !!myIncentives?.length) && (
                        <>
                            <TooltipSectionTitle>
                                {myIncentives?.length ? 'extra rewards to claim' : 'extra rewards'}
                            </TooltipSectionTitle>

                            {myIncentives?.length
                                ? myIncentives.map(({ token, info }) => (
                                      <TooltipRow key={token.contract}>
                                          <TooltipToken>
                                              <AssetLogoStyled asset={token} />
                                              {token.code}
                                          </TooltipToken>
                                          <span>
                                              {formatBalance(+info.user_reward, true)} {token.code}
                                          </span>
                                      </TooltipRow>
                                  ))
                                : Object.entries(pool.incentive_apy_per_token)
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
            withoutPadding
            background={COLORS.white}
            color={COLORS.textTertiary}
            showOnHover
        >
            <Container>
                {!myRewards && !myIncentives?.length && (
                    <BlockWithIcon>
                        <Arrows />
                    </BlockWithIcon>
                )}

                {!myRewards && !myIncentives?.length && hasRewards && <Divider />}

                {hasRewards && (
                    <BlockWithIcon>
                        <Crown style={{ width: '1.2rem', height: '0.8rem' }} />
                    </BlockWithIcon>
                )}

                {(hasIncentives || (!!myIncentives?.length && !!myRewards)) && <Divider />}

                {(hasIncentives || !!myIncentives?.length) && (
                    <Logos>
                        {myIncentives?.length
                            ? myIncentives.map(({ token }) => (
                                  <AssetLogoStyled key={token.contract} asset={token} />
                              ))
                            : Object.entries(pool.incentive_tps_per_token).map(([key]) => {
                                  const token = getAssetFromString(key);
                                  return <AssetLogoStyled key={token.contract} asset={token} />;
                              })}
                    </Logos>
                )}
            </Container>
        </Tooltip>
    );
};

export default RewardsTokens;
