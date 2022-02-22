import * as React from 'react';
import { useState } from 'react';
import { AssetSimple } from '../../api/types';
import styled from 'styled-components';
import useAssetsStore from '../../store/assetsStore/useAssetsStore';
import * as StellarSdk from 'stellar-sdk';
import { getAssetString } from '../../store/assetsStore/actions';
import { LumenInfo } from '../../store/assetsStore/reducer';
import { Breakpoints, COLORS } from '../../../common/styles';
import DotsLoader from '../../../common/basics/DotsLoader';
import AssetLogo, { logoStyles } from '../AssetDropdown/AssetLogo';
import External from '../../../common/assets/img/icon-external-link.svg';
import { flexAllCenter, respondDown } from '../../../common/mixins';
import Tooltip, { TOOLTIP_POSITION } from '../../../common/basics/Tooltip';

const Wrapper = styled.div<{ verticalDirections?: boolean; mobileVerticalDirections?: boolean }>`
    display: flex;
    ${({ verticalDirections }) => verticalDirections && 'flex-direction: column;'};
    align-items: center;

    ${({ mobileVerticalDirections }) =>
        mobileVerticalDirections &&
        respondDown(Breakpoints.md)`
            flex-direction: column;
            align-items: flex-start;
        `}
`;

const Icons = styled.div`
    display: flex;
    align-items: center;
`;

const BaseIcon = styled.div`
    ${logoStyles};
    border: 0.3rem solid ${COLORS.white};
    background-color: ${COLORS.white};
    z-index: 1;
    box-sizing: content-box;
    position: relative;
    left: 0.5rem;
`;

const SecondIcon = styled.div`
    ${logoStyles};
    z-index: 0;
    box-sizing: content-box;
    position: relative;
    left: -0.5rem;
`;

const AssetsDetails = styled.div<{
    verticalDirections?: boolean;
    mobileVerticalDirections?: boolean;
}>`
    display: flex;
    flex-direction: column;
    ${({ verticalDirections }) =>
        verticalDirections
            ? `align-items: center;
        margin-top: 2rem;`
            : 'margin-left: 1.6rem;'};

    ${({ mobileVerticalDirections }) =>
        mobileVerticalDirections &&
        respondDown(Breakpoints.md)`
              margin-left: 0;
              width: calc(100vw - 6.4rem);
          `}
`;

const AssetsCodes = styled.span<{ mobileVerticalDirections?: boolean }>`
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.paragraphText};
    display: flex;
    flex-direction: row;
    align-items: center;

    ${({ mobileVerticalDirections }) =>
        mobileVerticalDirections &&
        respondDown(Breakpoints.md)`
                font-weight: bold;
                        font-size: 2.4rem;
                        line-height: 2.8rem;
                        color: ${COLORS.buttonBackground};
                        margin-top: 0.7rem;
                        margin-bottom: 0.4rem;
            `}
`;

const AssetsDomains = styled.span<{ mobileVerticalDirections?: boolean }>`
    color: ${COLORS.grayText};
    font-size: 1.4rem;
    line-height: 2rem;
    text-align: center;

    ${({ mobileVerticalDirections }) =>
        mobileVerticalDirections &&
        respondDown(Breakpoints.md)`
                  font-size: 1.2rem;
                  white-space: wrap;
                  text-align: left;
              `}
`;

const Link = styled.div`
    cursor: pointer;
    box-sizing: border-box;
    margin-left: 1rem;
    height: 2.8rem;
    ${flexAllCenter};
`;

const LabelWrap = styled.div`
    padding-top: 1rem;
    margin-top: -1rem;
`;

const Label = styled.div<{ isRed?: boolean; isGreen?: boolean }>`
    height: 1.6rem;
    padding: 0 0.4rem;
    border-radius: 0.3rem;
    background: ${({ isRed, isGreen }) => {
        if (isRed) {
            return COLORS.pinkRed;
        }
        if (isGreen) {
            return COLORS.green;
        }
        return COLORS.purple;
    }};
    color: ${COLORS.white};
    text-transform: uppercase;
    font-weight: 500;
    font-size: 0.8rem;
    line-height: 1.8rem;
    margin-left: 0.7rem;
    margin-right: 0.3rem;
    cursor: help;
`;

const TooltipInner = styled.div`
    width: 28.8rem;
    white-space: pre-line;
    font-size: 1.4rem;
    line-height: 2rem;

    a {
        margin-left: 0.5rem;
    }
`;

const assetToString = (asset: StellarSdk.Asset) => {
    if (asset.isNative()) {
        return 'native';
    }

    return `${asset.code}:${asset.issuer}`;
};

const viewOnStellarX = (base: StellarSdk.Asset, counter: StellarSdk.Asset) => {
    window.open(
        `https://stellarx.com/markets/${assetToString(counter)}/${assetToString(base)}`,
        '_blank',
    );
};

type PairProps = {
    base: AssetSimple;
    counter: AssetSimple;
    withoutDomains?: boolean;
    verticalDirections?: boolean;
    isRewardsOn?: boolean;
    mobileVerticalDirections?: boolean;
    authRequired?: boolean;
    noLiquidity?: boolean;
    boosted?: boolean;
};

const Pair = ({
    base,
    counter,
    withoutDomains,
    verticalDirections,
    isRewardsOn,
    mobileVerticalDirections,
    authRequired,
    noLiquidity,
    boosted,
}: PairProps): JSX.Element => {
    const { assetsInfo } = useAssetsStore();

    const baseInstance = new StellarSdk.Asset(base.code, base.issuer);
    const isBaseNative = baseInstance.isNative();
    const hasBaseInfo = isBaseNative || assetsInfo.has(getAssetString(base));
    const baseInfo = isBaseNative ? LumenInfo : assetsInfo.get(getAssetString(base));

    const counterInstance = new StellarSdk.Asset(counter.code, counter.issuer);
    const isCounterNative = counterInstance.isNative();
    const hasCounterInfo = isCounterNative || assetsInfo.has(getAssetString(counter));
    const counterInfo = isCounterNative ? LumenInfo : assetsInfo.get(getAssetString(counter));

    const [showBoostTooltip, setShowBoosTooltip] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);
    const [showAuthTooltip, setShowAuthTooltip] = useState(false);
    const [showLiquidityTooltip, setShowLiquidityTooltip] = useState(false);

    return (
        <Wrapper
            verticalDirections={verticalDirections}
            mobileVerticalDirections={mobileVerticalDirections}
        >
            <Icons>
                <BaseIcon key={baseInfo?.asset_string}>
                    <AssetLogo logoUrl={baseInfo?.image} />
                </BaseIcon>
                <SecondIcon key={counterInfo?.asset_string}>
                    <AssetLogo logoUrl={counterInfo?.image} />
                </SecondIcon>
            </Icons>
            <AssetsDetails
                verticalDirections={verticalDirections}
                mobileVerticalDirections={mobileVerticalDirections}
            >
                <AssetsCodes mobileVerticalDirections={mobileVerticalDirections}>
                    {base.code} / {counter.code}
                    {boosted && (
                        <Tooltip
                            content={
                                <TooltipInner
                                    onMouseEnter={() => setShowBoosTooltip(true)}
                                    onMouseLeave={() => setShowBoosTooltip(false)}
                                >
                                    50% boost for pairs who vote with AQUA token
                                </TooltipInner>
                            }
                            position={TOOLTIP_POSITION.top}
                            isShow={showBoostTooltip}
                            onMouseEnter={() => setShowBoosTooltip(true)}
                            onMouseLeave={() => setShowBoosTooltip(false)}
                            isSuccess
                        >
                            <LabelWrap>
                                <Label isGreen>boost</Label>
                            </LabelWrap>
                        </Tooltip>
                    )}
                    {isRewardsOn && (
                        <Tooltip
                            content={
                                <TooltipInner>
                                    Any market with at least 1% of the total AQUA votes is placed
                                    into the reward zone and will get rewards after the next rewards
                                    update.
                                </TooltipInner>
                            }
                            position={TOOLTIP_POSITION.top}
                            isShow={showTooltip}
                        >
                            <Label
                                onMouseEnter={() => setShowTooltip(true)}
                                onMouseLeave={() => setShowTooltip(false)}
                            >
                                reward zone
                            </Label>
                        </Tooltip>
                    )}
                    {authRequired && (
                        <Tooltip
                            content={
                                <TooltipInner
                                    onMouseEnter={() => setShowAuthTooltip(true)}
                                    onMouseLeave={() => setShowAuthTooltip(false)}
                                >
                                    “Authorization required” flag is enabled for one asset from the
                                    pair. With this flag set, an issuer can grant a limited
                                    permissions to transact with its asset.
                                    <a
                                        rel="noopener noreferrer"
                                        target="_blank"
                                        href="https://developers.stellar.org/docs/glossary/accounts/#flagshttps://developers.stellar.org/docs/glossary/accounts/#flags"
                                    >
                                        More details.
                                    </a>
                                </TooltipInner>
                            }
                            position={TOOLTIP_POSITION.top}
                            isShow={showAuthTooltip}
                            isError
                            onMouseEnter={() => setShowAuthTooltip(true)}
                            onMouseLeave={() => setShowAuthTooltip(false)}
                        >
                            <LabelWrap>
                                <Label isRed>auth required</Label>
                            </LabelWrap>
                        </Tooltip>
                    )}
                    {noLiquidity && (
                        <Tooltip
                            content={
                                <TooltipInner
                                    onMouseEnter={() => setShowLiquidityTooltip(true)}
                                    onMouseLeave={() => setShowLiquidityTooltip(false)}
                                >
                                    This market pair is not eligible for AQUA rewards at the moment,
                                    as it failed the liquidity test (no path payment from XLM).
                                </TooltipInner>
                            }
                            position={TOOLTIP_POSITION.top}
                            isShow={showLiquidityTooltip}
                            isError
                            onMouseEnter={() => setShowLiquidityTooltip(true)}
                            onMouseLeave={() => setShowLiquidityTooltip(false)}
                        >
                            <LabelWrap>
                                <Label isRed>no liquidity</Label>
                            </LabelWrap>
                        </Tooltip>
                    )}
                    <Link onClick={() => viewOnStellarX(baseInstance, counterInstance)}>
                        <External />
                    </Link>
                </AssetsCodes>
                {!withoutDomains && (
                    <AssetsDomains mobileVerticalDirections={mobileVerticalDirections}>
                        {baseInfo?.name || base.code} (
                        {hasBaseInfo ? baseInfo.home_domain ?? 'unknown' : <DotsLoader />}){' · '}
                        {counterInfo?.name || counter.code} (
                        {hasCounterInfo ? counterInfo.home_domain ?? 'unknown' : <DotsLoader />})
                    </AssetsDomains>
                )}
            </AssetsDetails>
        </Wrapper>
    );
};

export default Pair;
