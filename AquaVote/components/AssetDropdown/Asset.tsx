import * as React from 'react';
import styled from 'styled-components';
import { AssetSimple } from '../../api/types';
import useAssetsStore from '../../store/assetsStore/useAssetsStore';
import { getAssetString } from '../../store/assetsStore/actions';
import { COLORS } from '../../../common/styles';
import DotsLoader from '../../../common/basics/DotsLoader';
import { LumenInfo } from '../../store/assetsStore/reducer';
import * as StellarSdk from 'stellar-sdk';
import AssetLogo from './AssetLogo';

const Container = styled.div`
    height: 6.6rem;
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 0.9rem 2.4rem;
    box-sizing: border-box;
`;

const AssetDetails = styled.div`
    display: flex;
    flex-direction: column;
    margin-left: 1.6rem;
`;

const AssetCode = styled.span`
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.paragraphText};
`;

const AssetDomain = styled.span`
    color: ${COLORS.grayText};
    font-size: 1.4rem;
    line-height: 2rem;
`;

const Asset = ({ asset }: { asset: AssetSimple }): JSX.Element => {
    const { assetsInfo } = useAssetsStore();

    const assetInstance = new StellarSdk.Asset(asset.code, asset.issuer);
    const isNative = assetInstance.isNative();
    const hasAssetInfo = isNative || assetsInfo.has(getAssetString(asset));
    const assetInfo = isNative ? LumenInfo : assetsInfo.get(getAssetString(asset));

    return (
        <Container>
            <AssetLogo logoUrl={assetInfo?.image} />
            <AssetDetails>
                <AssetCode>{asset.code}</AssetCode>
                <AssetDomain>
                    {assetInfo?.name || asset.code} (
                    {hasAssetInfo ? assetInfo.home_domain ?? 'unknown' : <DotsLoader />})
                </AssetDomain>
            </AssetDetails>
        </Container>
    );
};

export default Asset;
