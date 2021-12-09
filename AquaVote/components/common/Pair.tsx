import * as React from 'react';
import { AssetSimple } from '../../api/types';
import styled from 'styled-components';
import useAssetsStore from '../../store/assetsStore/useAssetsStore';
import * as StellarSdk from 'stellar-sdk';
import { getAssetString } from '../../store/assetsStore/actions';
import { LumenInfo } from '../../store/assetsStore/reducer';
import { COLORS } from '../../../common/styles';
import DotsLoader from '../../../common/basics/DotsLoader';
import AssetLogo, { logoStyles } from '../AssetDropdown/AssetLogo';
import External from '../../../common/assets/img/icon-external-link.svg';
import { flexAllCenter } from '../../../common/mixins';
import Tooltip, { TOOLTIP_POSITION } from '../../../common/basics/Tooltip';
import { useState } from 'react';

const Wrapper = styled.div<{ verticalDirections?: boolean }>`
    display: flex;
    ${({ verticalDirections }) => verticalDirections && 'flex-direction: column;'};
    align-items: center;
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

const AssetsDetails = styled.div<{ verticalDirections?: boolean }>`
    display: flex;
    flex-direction: column;
    ${({ verticalDirections }) =>
        verticalDirections
            ? `align-items: center;
        margin-top: 2rem;`
            : 'margin-left: 1.6rem;'};
`;

const AssetsCodes = styled.span`
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.paragraphText};
    display: flex;
    flex-direction: row;
    align-items: center;
`;

const AssetsDomains = styled.span`
    color: ${COLORS.grayText};
    font-size: 1.4rem;
    line-height: 2rem;
`;

const Link = styled.div`
    cursor: pointer;
    box-sizing: border-box;
    margin-left: 1rem;
    height: 2.8rem;
    ${flexAllCenter};
`;

const RewardsOn = styled.div`
    height: 1.6rem;
    padding: 0 0.4rem;
    border-radius: 0.3rem;
    background: ${COLORS.purple};
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
};

const Pair = ({
    base,
    counter,
    withoutDomains,
    verticalDirections,
    isRewardsOn,
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

    const [showTooltip, setShowTooltip] = useState(false);

    return (
        <Wrapper verticalDirections={verticalDirections}>
            <Icons>
                <BaseIcon key={baseInfo?.asset_string}>
                    <AssetLogo logoUrl={baseInfo?.image} />
                </BaseIcon>
                <SecondIcon key={counterInfo?.asset_string}>
                    <AssetLogo logoUrl={counterInfo?.image} />
                </SecondIcon>
            </Icons>
            <AssetsDetails verticalDirections={verticalDirections}>
                <AssetsCodes>
                    {base.code} / {counter.code}
                    {isRewardsOn && (
                        <Tooltip
                            content={
                                <TooltipInner>
                                    Any market with at least 1% of the total AQUA votes is placed into
                                    the reward zone and will get rewards after the next rewards update.
                                </TooltipInner>
                            }
                            position={TOOLTIP_POSITION.top}
                            isShow={showTooltip}
                        >
                            <RewardsOn
                                onMouseEnter={() => setShowTooltip(true)}
                                onMouseLeave={() => setShowTooltip(false)}
                            >
                                reward zone
                            </RewardsOn>
                        </Tooltip>
                    )}
                    <Link onClick={() => viewOnStellarX(baseInstance, counterInstance)}>
                        <External />
                    </Link>
                </AssetsCodes>
                {!withoutDomains && (
                    <AssetsDomains>
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
