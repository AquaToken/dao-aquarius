import * as StellarSdk from '@stellar/stellar-sdk';
import * as React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { AmmRoutes, MarketRoutes } from 'constants/routes';

import { getAssetString } from 'helpers/assets';
import { formatBalance } from 'helpers/format-number';

import { LumenInfo } from 'store/assetsStore/reducer';
import { AssetSimple } from 'store/assetsStore/types';
import useAssetsStore from 'store/assetsStore/useAssetsStore';

import { ModalService, StellarService } from 'services/globalServices';
import { POOL_TYPE } from 'services/soroban.service';

import { flexAllCenter, respondDown } from 'web/mixins';
import AssetInfoModal from 'web/modals/AssetInfoModal';
import { Breakpoints, COLORS } from 'web/styles';

import External from 'assets/icon-external-link.svg';
import Arrow from 'assets/icon-link-arrow.svg';

import AssetLogo, { bigLogoStyles, logoStyles } from 'basics/AssetLogo';
import {
    AuthRequiredLabel,
    BoostLabel,
    ClassicPoolLabel,
    ConstantPoolLabel,
    MaxRewardsLabel,
    NoLiquidityLabel,
    RewardLabel,
    StablePoolLabel,
} from 'basics/Labels';

const Wrapper = styled.div<{
    $verticalDirections?: boolean;
    $mobileVerticalDirections?: boolean;
    $leftAlign?: boolean;
}>`
    display: flex;
    ${({ $verticalDirections }) => $verticalDirections && 'flex-direction: column;'};
    align-items: ${({ $leftAlign }) => ($leftAlign ? 'flex-start' : 'center')};

    ${({ $mobileVerticalDirections }) =>
        $mobileVerticalDirections &&
        respondDown(Breakpoints.md)`
            flex-direction: column;
            align-items: flex-start;
        `}
`;

const Icons = styled.div<{
    $isBig: boolean;
    $assetsCount: number;
    $verticalDirections?: boolean;
    $mobileVerticalDirections?: boolean;
    $leftAlign?: boolean;
}>`
    display: flex;
    align-items: center;
    min-width: 12rem;
    justify-content: ${({ $verticalDirections, $leftAlign }) =>
        $leftAlign ? 'flex-start' : $verticalDirections ? 'center' : 'flex-end'};

    ${({ $mobileVerticalDirections }) =>
        $mobileVerticalDirections &&
        respondDown(Breakpoints.md)`
              justify-content: start;
          `}
`;

const Icon = styled.div<{
    $isBig?: boolean;
    $isCircleLogo?: boolean;
    $assetOrderNumber: number;
    $assetsCount: number;
    $verticalDirections?: boolean;
    $mobileVerticalDirections?: boolean;
}>`
    ${({ $isBig, $isCircleLogo }) => ($isBig ? bigLogoStyles($isCircleLogo) : logoStyles())};
    box-sizing: content-box;
    position: relative;
    border: ${({ $assetOrderNumber, $assetsCount }) =>
        $assetsCount > $assetOrderNumber ? `0.3rem solid ${COLORS.white}` : 'unset'};
    background-color: ${({ $assetOrderNumber, $assetsCount }) =>
        $assetsCount > $assetOrderNumber ? COLORS.white : 'unset'};
    z-index: ${({ $assetOrderNumber, $assetsCount }) => $assetsCount - $assetOrderNumber};
    right: ${({ $isBig, $assetOrderNumber, $assetsCount, $verticalDirections }) =>
        `${
            ($verticalDirections ? $assetOrderNumber - 1 : -($assetsCount - $assetOrderNumber)) *
            ($isBig ? 3 : 1)
        }rem`};

    ${({ $mobileVerticalDirections }) =>
        $mobileVerticalDirections &&
        respondDown(Breakpoints.md)`
              right: ${({ $isBig, $assetOrderNumber }) =>
                  `${(+$assetOrderNumber - 1) * ($isBig ? 3 : 1)}rem`};
          `}
`;

const AssetsDetails = styled.div<{
    $verticalDirections?: boolean;
    $mobileVerticalDirections?: boolean;
    $leftAlign?: boolean;
}>`
    display: flex;
    flex-direction: column;
    ${({ $verticalDirections, $leftAlign }) =>
        $verticalDirections
            ? `align-items: ${$leftAlign ? 'flex-start' : 'center'};
        margin-top: 2rem;`
            : 'margin-left: 1.6rem;'};

    ${({ $mobileVerticalDirections }) =>
        $mobileVerticalDirections &&
        respondDown(Breakpoints.md)`
              margin-left: 0;
          `}
`;

const AssetsCodes = styled.span<{ $mobileVerticalDirections?: boolean; $bigCodes?: boolean }>`
    font-size: ${({ $bigCodes }) => ($bigCodes ? '5.6rem' : '1.6rem')};
    line-height: ${({ $bigCodes }) => ($bigCodes ? '6.4rem' : '2.8rem')};
    font-weight: ${({ $bigCodes }) => ($bigCodes ? '700' : '400')};
    color: ${COLORS.paragraphText};
    display: flex;
    flex-direction: row;
    align-items: center;

    span {
        display: flex;
        align-items: center;
    }

    ${({ $mobileVerticalDirections }) =>
        $mobileVerticalDirections &&
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

const AssetsDomains = styled.span<{ $mobileVerticalDirections?: boolean }>`
    color: ${COLORS.grayText};
    font-size: 1.4rem;
    line-height: 2rem;
    text-align: left;

    ${respondDown(Breakpoints.md)`
        text-align: center;
    `}

    ${({ $mobileVerticalDirections }) =>
        $mobileVerticalDirections &&
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

const Domain = styled.span`
    cursor: pointer;
    &:hover {
        text-decoration: underline;
        text-decoration-style: dashed;
    }
`;

const viewOnStellarX = (event: React.MouseEvent, assets: StellarSdk.Asset[]) => {
    const [base, counter] = assets;
    event.preventDefault();
    event.stopPropagation();
    window.open(
        `https://stellarx.com/markets/${getAssetString(counter)}/${getAssetString(base)}`,
        '_blank',
    );
};

type PairProps = {
    assets: AssetSimple[];
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
    amounts?: string[];
    isSwapResult?: boolean;
    poolAddress?: string;
    poolType?: POOL_TYPE;
};

const Market = ({
    assets: assetsSimple,
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
    amounts,
    isSwapResult,
    poolAddress,
    poolType,
}: PairProps): React.ReactNode => {
    const { assetsInfo } = useAssetsStore();

    const assets = assetsSimple.map(({ code, issuer }) => StellarService.createAsset(code, issuer));

    const getAssetDetails = (asset: StellarSdk.Asset) => {
        if (asset.isNative()) {
            return [LumenInfo.name, LumenInfo.home_domain];
        }

        const { name, home_domain } = assetsInfo.get(getAssetString(asset)) || {};

        return [
            name || asset.code,
            home_domain || `${asset.issuer.slice(0, 4)}...${asset.issuer.slice(-4)}`,
        ];
    };

    const labels = (
        <>
            {poolType === POOL_TYPE.classic && <ClassicPoolLabel />}
            {poolType === POOL_TYPE.stable && <StablePoolLabel />}
            {poolType === POOL_TYPE.constant && <ConstantPoolLabel />}
            {boosted && <BoostLabel />}
            {isRewardsOn && <RewardLabel />}
            {isMaxRewards && <MaxRewardsLabel />}
            {authRequired && <AuthRequiredLabel />}
            {noLiquidity && <NoLiquidityLabel />}
        </>
    );

    const onDomainClick = (e: React.MouseEvent, asset: StellarSdk.Asset) => {
        e.preventDefault();
        e.stopPropagation();

        ModalService.openModal(AssetInfoModal, { asset });
    };

    return (
        <Wrapper
            $verticalDirections={verticalDirections}
            $mobileVerticalDirections={mobileVerticalDirections}
            $leftAlign={leftAlign}
        >
            <Icons
                $isBig={isBigLogo}
                $verticalDirections={verticalDirections}
                $assetsCount={assets.length}
                $mobileVerticalDirections={mobileVerticalDirections}
                $leftAlign={leftAlign}
            >
                {assets.map((asset, index) => (
                    <Icon
                        key={getAssetString(asset)}
                        $isBig={isBigLogo}
                        $isCircleLogo={isCircleLogos}
                        $assetOrderNumber={index + 1}
                        $assetsCount={assets.length}
                        $mobileVerticalDirections={mobileVerticalDirections}
                        $verticalDirections={verticalDirections}
                    >
                        <AssetLogo asset={asset} isBig={isBigLogo} isCircle={isCircleLogos} />
                    </Icon>
                ))}
            </Icons>
            {bottomLabels && <Labels>{labels}</Labels>}
            <AssetsDetails
                $verticalDirections={verticalDirections}
                $mobileVerticalDirections={mobileVerticalDirections}
                $leftAlign={leftAlign}
            >
                <AssetsCodes
                    $mobileVerticalDirections={mobileVerticalDirections}
                    $bigCodes={bigCodes}
                >
                    <span>
                        {assets.map((asset, index) => (
                            <React.Fragment key={getAssetString(asset)}>
                                {index > 0 ? isSwapResult ? <ArrowRight /> : ' / ' : ''}
                                {amounts ? `${formatBalance(Number(amounts[index]))} ` : ''}
                                {asset.code}
                            </React.Fragment>
                        ))}
                    </span>

                    {!bottomLabels && labels}

                    {!withoutLink && (
                        <LinkCustom onClick={(e: React.MouseEvent) => viewOnStellarX(e, assets)}>
                            <External />
                        </LinkCustom>
                    )}
                    {withMarketLink && (
                        <Link
                            onClick={e => {
                                e.stopPropagation();
                            }}
                            to={`${MarketRoutes.main}/${getAssetString(assets[0])}/${getAssetString(
                                assets[1],
                            )}`}
                        >
                            <External />
                        </Link>
                    )}
                    {poolAddress && (
                        <Link
                            onClick={e => {
                                e.stopPropagation();
                            }}
                            to={`${AmmRoutes.analytics}${poolAddress}/`}
                        >
                            <External />
                        </Link>
                    )}
                </AssetsCodes>
                {!withoutDomains && (
                    <AssetsDomains $mobileVerticalDirections={mobileVerticalDirections}>
                        {assets.map((asset, index) => {
                            const [name, domain] = getAssetDetails(asset);
                            return (
                                <span key={getAssetString(asset)}>
                                    {index > 0 ? ' · ' : ''}
                                    {name} (
                                    {asset.isNative() ? (
                                        domain
                                    ) : (
                                        <Domain
                                            onClick={(e: React.MouseEvent) =>
                                                onDomainClick(e, asset)
                                            }
                                        >
                                            {domain}
                                        </Domain>
                                    )}
                                    )
                                </span>
                            );
                        })}
                    </AssetsDomains>
                )}
            </AssetsDetails>
        </Wrapper>
    );
};

export default Market;
