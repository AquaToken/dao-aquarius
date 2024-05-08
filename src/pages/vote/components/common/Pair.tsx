import * as React from 'react';
import styled from 'styled-components';
import * as StellarSdk from '@stellar/stellar-sdk';
import { Breakpoints, COLORS } from '../../../../common/styles';
import DotsLoader from '../../../../common/basics/DotsLoader';
import AssetLogo, { bigLogoStyles, logoStyles } from '../AssetDropdown/AssetLogo';
import External from '../../../../common/assets/img/icon-external-link.svg';
import Arrow from '../../../../common/assets/img/icon-link-arrow.svg';
import { flexAllCenter, respondDown } from '../../../../common/mixins';
import {
    AuthRequiredLabel,
    BoostLabel,
    CustomLabel,
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
import { formatBalance } from '../../../../common/helpers/helpers';

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

const Icon = styled.div<{ hasNextLogo?: boolean; isBig?: boolean; isCircleLogo?: boolean }>`
    ${({ isBig, isCircleLogo }) => (isBig ? bigLogoStyles(isCircleLogo) : logoStyles)};
    box-sizing: content-box;
    position: relative;
    border: ${({ hasNextLogo }) => (hasNextLogo ? `0.3rem solid ${COLORS.white}` : 'unset')};
    background-color: ${({ hasNextLogo }) => (hasNextLogo ? COLORS.white : 'unset')};
`;

const BaseIcon = styled(Icon)`
    z-index: 3;
    left: 0.5rem;
`;

const SecondIcon = styled(Icon)<{ isBig?: boolean }>`
    z-index: 2;
    left: ${({ isBig }) => (isBig ? '-1.5rem' : '-0.5rem')};
`;

const ThirdIcon = styled(Icon)<{ isBig?: boolean }>`
    z-index: 1;
    left: ${({ isBig }) => (isBig ? '-2.5rem' : '-1.5rem')};
`;

const FourthIcon = styled(Icon)<{ isBig?: boolean }>`
    z-index: 0;
    left: ${({ isBig }) => (isBig ? '-3.5rem' : '-2.5rem')};
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
        display: flex;
        align-items: center;
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
            display: flex;
            flex-wrap: wrap;
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

const ArrowRight = styled(Arrow)`
    margin: 0 0.5rem;
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
    thirdAsset?: AssetSimple;
    fourthAsset?: AssetSimple;
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
    baseAmount?: string;
    counterAmount?: string;
    isSwapResult?: boolean;
    customLabel?: [string, string];
};

const Pair = ({
    base,
    counter,
    thirdAsset,
    fourthAsset,
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
    baseAmount,
    counterAmount,
    isSwapResult,
    customLabel,
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

    const thirdAssetInstance = thirdAsset
        ? new StellarSdk.Asset(thirdAsset.code, thirdAsset.issuer)
        : StellarSdk.Asset.native();
    const isThirdAssetNative = thirdAssetInstance.isNative();
    const hasThirdAssetInfo = isThirdAssetNative || assetsInfo.has(getAssetString(thirdAsset));
    const thirdAssetInfo = isThirdAssetNative
        ? LumenInfo
        : assetsInfo.get(getAssetString(thirdAsset));

    const fourthAssetInstance = fourthAsset
        ? new StellarSdk.Asset(fourthAsset?.code, fourthAsset?.issuer)
        : StellarSdk.Asset.native();
    const isFourthAssetNative = fourthAssetInstance.isNative();
    const hasFourthAssetInfo = isFourthAssetNative || assetsInfo.has(getAssetString(fourthAsset));
    const fourthAssetInfo = isFourthAssetNative
        ? LumenInfo
        : assetsInfo.get(getAssetString(fourthAsset));

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
                    hasNextLogo
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
                    hasNextLogo={Boolean(thirdAsset)}
                >
                    <AssetLogo
                        logoUrl={counterInfo?.image}
                        isBig={isBigLogo}
                        isCircle={isCircleLogos}
                    />
                </SecondIcon>
                {thirdAsset && (
                    <ThirdIcon
                        key={thirdAssetInfo?.asset_string}
                        isBig={isBigLogo}
                        isCircleLogo={isCircleLogos}
                        hasNextLogo={Boolean(thirdAsset)}
                    >
                        <AssetLogo
                            logoUrl={thirdAssetInfo?.image}
                            isBig={isBigLogo}
                            isCircle={isCircleLogos}
                        />
                    </ThirdIcon>
                )}
                {fourthAsset && (
                    <FourthIcon
                        key={fourthAssetInfo?.asset_string}
                        isBig={isBigLogo}
                        isCircleLogo={isCircleLogos}
                    >
                        <AssetLogo
                            logoUrl={fourthAssetInfo?.image}
                            isBig={isBigLogo}
                            isCircle={isCircleLogos}
                        />
                    </FourthIcon>
                )}
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
                        {baseAmount ? formatBalance(+baseAmount) : ''} {base.code}{' '}
                        {isSwapResult ? <ArrowRight /> : '/'}{' '}
                        {counterAmount ? formatBalance(+counterAmount) : ''} {counter.code}
                        {thirdAsset ? ` / ${thirdAsset.code} ` : ''}
                        {fourthAsset ? ` / ${fourthAsset.code} ` : ''}
                    </span>
                    {boosted && !bottomLabels && <BoostLabel />}
                    {isRewardsOn && !bottomLabels && <RewardLabel />}
                    {isMaxRewards && !bottomLabels && <MaxRewardsLabel />}
                    {authRequired && !bottomLabels && <AuthRequiredLabel />}
                    {noLiquidity && !bottomLabels && <NoLiquidityLabel />}
                    {customLabel && <CustomLabel title={customLabel[0]} text={customLabel[1]} />}
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
                        {thirdAsset ? ' · ' : ''}
                        {!thirdAsset ? '' : thirdAssetInfo?.name || thirdAsset.code}
                        {thirdAsset ? '(' : ''}
                        {!thirdAsset ? (
                            ''
                        ) : hasThirdAssetInfo ? (
                            thirdAssetInfo.home_domain ?? 'unknown'
                        ) : (
                            <DotsLoader />
                        )}
                        {thirdAsset ? ')' : ''}
                        {fourthAsset ? ' · ' : ''}
                        {!fourthAsset ? '' : fourthAssetInfo?.name || thirdAsset.code}{' '}
                        {fourthAsset ? '(' : ''}
                        {!fourthAsset ? (
                            ''
                        ) : hasFourthAssetInfo ? (
                            fourthAssetInfo.home_domain ?? 'unknown'
                        ) : (
                            <DotsLoader />
                        )}
                        {fourthAsset ? ')' : ''}
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
                    {customLabel && <CustomLabel title={customLabel[0]} text={customLabel[1]} />}
                </Labels>
            )}
        </Wrapper>
    );
};

export default Pair;
