import * as React from 'react';
import styled from 'styled-components';
import * as StellarSdk from 'stellar-sdk';
import { Breakpoints, COLORS } from '../../../../common/styles';
import DotsLoader from '../../../../common/basics/DotsLoader';
import AssetLogo, { bigLogoStyles, logoStyles } from '../AssetDropdown/AssetLogo';
import External from '../../../../common/assets/img/icon-external-link.svg';
import { flexAllCenter, respondDown } from '../../../../common/mixins';
import {
    AuthRequiredLabel,
    BoostLabel,
    MaxRewardsLabel,
    NoLiquidityLabel,
    RewardLabel,
} from './Labels';
import { AssetSimple } from '../../../../store/assetsStore/types';
import { getAssetString } from '../../../../store/assetsStore/actions';
import { LumenInfo } from '../../../../store/assetsStore/reducer';
import useAssetsStore from '../../../../store/assetsStore/useAssetsStore';
import { Link } from 'react-router-dom';
import { MarketRoutes } from '../../../../routes';

const Wrapper = styled.div<{
    verticalDirections?: boolean;
    mobileVerticalDirections?: boolean;
    leftAlign?: boolean;
}>`
    display: flex;
    ${({ verticalDirections }) => verticalDirections && 'flex-direction: column;'};
    align-items: ${({ leftAlign }) => (leftAlign ? 'flex-start' : 'center')};

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

const BaseIcon = styled.div<{ isBig?: boolean; isCircleLogo?: boolean }>`
    ${({ isBig, isCircleLogo }) => (isBig ? bigLogoStyles(isCircleLogo) : logoStyles)};
    border: 0.3rem solid ${COLORS.white};
    background-color: ${COLORS.white};
    z-index: 1;
    box-sizing: content-box;
    position: relative;
    left: 0.5rem;
`;

const SecondIcon = styled.div<{ isBig?: boolean; isCircleLogo?: boolean }>`
    ${({ isBig, isCircleLogo }) => (isBig ? bigLogoStyles(isCircleLogo) : logoStyles)};
    z-index: 0;
    box-sizing: content-box;
    position: relative;
    left: ${({ isBig }) => (isBig ? '-1.5rem' : '-0.5rem')};
`;

const AssetsDetails = styled.div<{
    verticalDirections?: boolean;
    mobileVerticalDirections?: boolean;
    leftAlign?: boolean;
}>`
    display: flex;
    flex-direction: column;
    ${({ verticalDirections, leftAlign }) =>
        verticalDirections
            ? `align-items: ${leftAlign ? 'flex-start' : 'center'};
        margin-top: 2rem;`
            : 'margin-left: 1.6rem;'};

    ${({ mobileVerticalDirections }) =>
        mobileVerticalDirections &&
        respondDown(Breakpoints.md)`
              margin-left: 0;
              width: calc(100vw - 6.4rem);
          `}
`;

const AssetsCodes = styled.span<{ mobileVerticalDirections?: boolean; bigCodes?: boolean }>`
    font-size: ${({ bigCodes }) => (bigCodes ? '5.6rem' : '1.6rem')};
    line-height: ${({ bigCodes }) => (bigCodes ? '6.4rem' : '2.8rem')};
    font-weight: ${({ bigCodes }) => (bigCodes ? '700' : '400')};
    color: ${COLORS.paragraphText};
    display: flex;
    flex-direction: row;
    align-items: center;

    span {
        margin-right: 1rem;
    }

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
    text-align: left;

    ${respondDown(Breakpoints.md)`
        text-align: center;
    `}

    ${({ mobileVerticalDirections }) =>
        mobileVerticalDirections &&
        respondDown(Breakpoints.md)`
                  font-size: 1.2rem;
                  white-space: wrap;
                  text-align: left;
              `}
`;

const LinkCustom = styled.div`
    cursor: pointer;
    box-sizing: border-box;
    height: 2.8rem;
    ${flexAllCenter};
`;

const Labels = styled.div`
    display: flex;
    margin-top: 0.8rem;
`;

export const assetToString = (asset: StellarSdk.Asset) => {
    if (asset.isNative()) {
        return 'native';
    }

    return `${asset.code}:${asset.issuer}`;
};

const viewOnStellarX = (event, base: StellarSdk.Asset, counter: StellarSdk.Asset) => {
    event.preventDefault();
    event.stopPropagation();
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
    leftAlign?: boolean;
    bigCodes?: boolean;
    bottomLabels?: boolean;
    isBigLogo?: boolean;
    isCircleLogos?: boolean;
    withoutLink?: boolean;
    isMaxRewards?: boolean;
    withMarketLink?: boolean;
};

const Pair = ({
    base,
    counter,
    withoutDomains,
    verticalDirections,
    leftAlign,
    isRewardsOn,
    mobileVerticalDirections,
    authRequired,
    noLiquidity,
    boosted,
    bigCodes,
    bottomLabels,
    isBigLogo,
    isCircleLogos,
    withoutLink,
    isMaxRewards,
    withMarketLink,
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

    return (
        <Wrapper
            verticalDirections={verticalDirections}
            mobileVerticalDirections={mobileVerticalDirections}
            leftAlign={leftAlign}
        >
            <Icons>
                <BaseIcon
                    key={baseInfo?.asset_string}
                    isBig={isBigLogo}
                    isCircleLogo={isCircleLogos}
                >
                    <AssetLogo
                        logoUrl={baseInfo?.image}
                        isBig={isBigLogo}
                        isCircle={isCircleLogos}
                    />
                </BaseIcon>
                <SecondIcon
                    key={counterInfo?.asset_string}
                    isBig={isBigLogo}
                    isCircleLogo={isCircleLogos}
                >
                    <AssetLogo
                        logoUrl={counterInfo?.image}
                        isBig={isBigLogo}
                        isCircle={isCircleLogos}
                    />
                </SecondIcon>
            </Icons>
            <AssetsDetails
                verticalDirections={verticalDirections}
                mobileVerticalDirections={mobileVerticalDirections}
                leftAlign={leftAlign}
            >
                <AssetsCodes
                    mobileVerticalDirections={mobileVerticalDirections}
                    bigCodes={bigCodes}
                >
                    <span>
                        {base.code} / {counter.code}
                    </span>
                    {boosted && !bottomLabels && <BoostLabel />}
                    {isRewardsOn && !bottomLabels && <RewardLabel />}
                    {isMaxRewards && !bottomLabels && <MaxRewardsLabel />}
                    {authRequired && !bottomLabels && <AuthRequiredLabel />}
                    {noLiquidity && !bottomLabels && <NoLiquidityLabel />}
                    {!withoutLink && (
                        <LinkCustom
                            onClick={(e) => viewOnStellarX(e, baseInstance, counterInstance)}
                        >
                            <External />
                        </LinkCustom>
                    )}
                    {withMarketLink && (
                        <Link
                            onClick={(e) => {
                                e.stopPropagation();
                            }}
                            to={`${MarketRoutes.main}/${assetToString(
                                baseInstance,
                            )}/${assetToString(counterInstance)}`}
                        >
                            <External />
                        </Link>
                    )}
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
            {bottomLabels && (
                <Labels>
                    {boosted && <BoostLabel />}
                    {isRewardsOn && <RewardLabel />}
                    {isMaxRewards && <MaxRewardsLabel />}
                    {authRequired && <AuthRequiredLabel />}
                    {noLiquidity && <NoLiquidityLabel />}
                </Labels>
            )}
        </Wrapper>
    );
};

export default Pair;
