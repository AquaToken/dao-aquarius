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

    ${({ mobileVerticalDirections }) =>
        mobileVerticalDirections &&
        respondDown(Breakpoints.md)`
                  font-size: 1.2rem;
                  white=space: wrap;
              `}
`;

const Link = styled.div`
    cursor: pointer;
    box-sizing: border-box;
    margin-left: 1rem;
    height: 2.8rem;
    ${flexAllCenter};
`;

const Label = styled.div<{ isRed?: boolean }>`
    height: 1.6rem;
    padding: 0 0.4rem;
    border-radius: 0.3rem;
    background: ${({ isRed }) => (isRed ? COLORS.pinkRed : COLORS.purple)};
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
};

const Pair = ({
    base,
    counter,
    withoutDomains,
    verticalDirections,
    isRewardsOn,
    mobileVerticalDirections,
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

    const authRequired = counterInfo?.auth_required || baseInfo?.asset_string;

    const [showTooltip, setShowTooltip] = useState(false);

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
                                <TooltipInner>
                                    In this pair there is an asset in which the "auth required" flag
                                    is set. Voting for this pair is prohibited.
                                </TooltipInner>
                            }
                            position={TOOLTIP_POSITION.top}
                            isShow={showTooltip}
                            isError
                        >
                            <Label
                                isRed
                                onMouseEnter={() => setShowTooltip(true)}
                                onMouseLeave={() => setShowTooltip(false)}
                            >
                                auth required
                            </Label>
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
