import * as React from 'react';
import styled from 'styled-components';
import { Breakpoints, COLORS } from '../../../../common/styles';
import DotsLoader from '../../../../common/basics/DotsLoader';
import * as StellarSdk from 'stellar-sdk';
import AssetLogo from './AssetLogo';
import { flexAllCenter, respondDown } from '../../../../common/mixins';
import Tooltip, { TOOLTIP_POSITION } from '../../../../common/basics/Tooltip';
import Info from '../../../../common/assets/img/icon-info.svg';
import { AssetSimple } from '../../../../store/assetsStore/types';
import { getAssetString } from '../../../../store/assetsStore/actions';
import { LumenInfo } from '../../../../store/assetsStore/reducer';
import useAssetsStore from '../../../../store/assetsStore/useAssetsStore';

const Container = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    box-sizing: border-box;
`;

const AssetDetails = styled.div<{ inRow?: boolean }>`
    display: flex;
    flex-direction: ${({ inRow }) => (inRow ? 'row' : 'column')};
    margin-left: ${({ inRow }) => (inRow ? '0.8rem' : '1.6rem')};
`;

const AssetCode = styled.span<{ inRow?: boolean }>`
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.paragraphText};
    margin-right: ${({ inRow }) => (inRow ? '0.3rem' : '0')};
`;

const AssetDomain = styled.span<{ withMobileView?: boolean; inRow?: boolean }>`
    color: ${({ inRow }) => (inRow ? COLORS.paragraphText : COLORS.grayText)};
    font-size: ${({ inRow }) => (inRow ? '1.6rem' : '1.4rem')};
    line-height: ${({ inRow }) => (inRow ? '2.8rem' : '2rem')};

    ${respondDown(Breakpoints.md)`
        ${({ withMobileView }) => withMobileView && 'display: none;'}
    `}
`;

const InfoIcon = styled.div<{ withMobileView?: boolean }>`
    ${flexAllCenter};
    display: none;

    ${respondDown(Breakpoints.md)`
          ${({ withMobileView }) => withMobileView && 'display: flex;'}
    `}
`;

const Asset = ({
    asset,
    inRow,
    withMobileView,
    onlyLogo,
    onlyLogoSmall,
    ...props
}: {
    asset: AssetSimple;
    inRow?: boolean;
    withMobileView?: boolean;
    onlyLogo?: boolean;
    onlyLogoSmall?: boolean;
}): JSX.Element => {
    const { assetsInfo } = useAssetsStore();

    const assetInstance = new StellarSdk.Asset(asset.code, asset.issuer);
    const isNative = assetInstance.isNative();
    const hasAssetInfo = isNative || assetsInfo.has(getAssetString(asset));
    const assetInfo = isNative ? LumenInfo : assetsInfo.get(getAssetString(asset));

    if (onlyLogo) {
        return <AssetLogo logoUrl={assetInfo?.image} />;
    }

    if (onlyLogoSmall) {
        return <AssetLogo logoUrl={assetInfo?.image} isSmall />;
    }

    return (
        <Container {...props}>
            <AssetLogo logoUrl={assetInfo?.image} isSmall={inRow} />
            <AssetDetails inRow={inRow}>
                <AssetCode inRow={inRow}>{asset.code}</AssetCode>
                <AssetDomain withMobileView={withMobileView} inRow={inRow}>
                    {inRow ? '' : assetInfo?.name || asset.code} (
                    {hasAssetInfo ? assetInfo.home_domain ?? 'unknown' : <DotsLoader />})
                </AssetDomain>
                <Tooltip
                    content={
                        <span>
                            {hasAssetInfo ? assetInfo.home_domain ?? 'unknown' : <DotsLoader />}
                        </span>
                    }
                    position={TOOLTIP_POSITION.left}
                    showOnHover
                >
                    <InfoIcon withMobileView={withMobileView}>
                        <Info />
                    </InfoIcon>
                </Tooltip>
            </AssetDetails>
        </Container>
    );
};

export default Asset;
