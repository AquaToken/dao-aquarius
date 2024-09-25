import * as React from 'react';
import styled from 'styled-components';

import AccountViewer from '../../../../common/basics/AccountViewer';
import CopyButton from '../../../../common/basics/CopyButton';
import DotsLoader from '../../../../common/basics/DotsLoader';
import ExternalLink from '../../../../common/basics/ExternalLink';
import PageLoader from '../../../../common/basics/PageLoader';
import { formatBalance, getDateString } from '../../../../common/helpers/helpers';
import { respondDown } from '../../../../common/mixins';
import { Breakpoints, COLORS } from '../../../../common/styles';
import { getAssetString } from '../../../../store/assetsStore/actions';
import { LumenInfo } from '../../../../store/assetsStore/reducer';
import { Asset } from '../../../../store/assetsStore/types';
import useAssetsStore from '../../../../store/assetsStore/useAssetsStore';
import AssetLogo from '../../../vote/components/AssetDropdown/AssetLogo';

const Container = styled.div`
    display: flex;
    flex-direction: column;
    background-color: ${COLORS.white};
    padding: 4.2rem 3.2rem 2rem;
    border-radius: 0.5rem;
`;

const Title = styled.span`
    font-weight: 700;
    font-size: 2rem;
    line-height: 2.8rem;
    margin-bottom: 4rem;
    color: ${COLORS.titleText};
`;

const AssetCard = styled.div`
    display: flex;
    margin-bottom: 3.3rem;
`;

const AssetInfo = styled.div`
    display: flex;
    flex-direction: column;
    margin-left: 2.5rem;
    justify-content: center;
`;

const AssetCode = styled.span`
    font-weight: 700;
    font-size: 2rem;
    line-height: 2.8rem;
    color: ${COLORS.titleText};
`;

const AssetDomain = styled.a`
    color: ${COLORS.purple};
    text-decoration: none;
`;

const Description = styled.div`
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.descriptionText};
    opacity: 0.7;
    margin-bottom: 1.6rem;
`;

const AssetDetails = styled.div`
    display: flex;
    margin-top: 3.2rem;

    ${respondDown(Breakpoints.md)`
         flex-direction: column;
    `}
`;

const AssetDetailsColumn = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1;

    ${respondDown(Breakpoints.md)`
         margin-bottom: 3.2rem;
    `}
`;

const AssetDetail = styled.div`
    display: flex;
    flex-direction: column;

    &:not(:last-child) {
        margin-bottom: 3.2rem;
    }
`;

const AssetDetailTitle = styled.span`
    font-size: 1.4rem;
    line-height: 1.6rem;
    color: ${COLORS.grayText};
    margin-bottom: 0.8rem;
`;

const AssetDetailValue = styled.span`
    font-size: 1.6rem;
    line-height: 2.4rem;
    color: ${COLORS.paragraphText};
    width: min-content;
    white-space: nowrap;
`;

const AboutAsset = ({ asset }) => {
    const { assetsInfo } = useAssetsStore();

    const isNative = asset.isNative();
    const hasAssetInfo = isNative || assetsInfo.has(getAssetString(asset));
    const assetInfo: Partial<Asset> = isNative ? LumenInfo : assetsInfo.get(getAssetString(asset));

    if (!assetInfo) {
        return <PageLoader />;
    }

    return (
        <Container>
            <Title>About {asset.code}</Title>
            <AssetCard>
                <AssetLogo asset={asset} isBig />
                <AssetInfo>
                    <AssetCode>
                        {asset.code} ({assetInfo?.name || asset.code})
                    </AssetCode>
                    {hasAssetInfo ? (
                        (
                            <AssetDomain href={`https://${assetInfo.home_domain}`} target="_blank">
                                https://{assetInfo.home_domain}/
                            </AssetDomain>
                        ) ?? 'unknown'
                    ) : (
                        <DotsLoader />
                    )}
                </AssetInfo>
            </AssetCard>
            <Description>{assetInfo.desc}</Description>
            <ExternalLink
                href={`https://stellar.expert/explorer/public/asset/${
                    isNative ? 'native' : `${asset.code}-${asset.issuer}`
                }`}
            >
                View on Network Explorer
            </ExternalLink>
            {!isNative && (
                <AssetDetails>
                    <AssetDetailsColumn>
                        <AssetDetail>
                            <AssetDetailTitle>Asset holders</AssetDetailTitle>
                            <AssetDetailValue>
                                {formatBalance(assetInfo.accounts_authorized)}
                            </AssetDetailValue>
                        </AssetDetail>
                        <AssetDetail>
                            <AssetDetailTitle>First transaction</AssetDetailTitle>
                            <AssetDetailValue>
                                {assetInfo.first_transaction
                                    ? getDateString(
                                          new Date(assetInfo.first_transaction).getTime(),
                                          { withTime: true },
                                      )
                                    : 'No data available'}
                            </AssetDetailValue>
                        </AssetDetail>
                    </AssetDetailsColumn>

                    <AssetDetailsColumn>
                        <AssetDetail>
                            <AssetDetailTitle>Anchored asset</AssetDetailTitle>
                            <AssetDetailValue>
                                {assetInfo.is_asset_anchored
                                    ? assetInfo.anchor_asset
                                    : 'Not set by the issuer'}
                            </AssetDetailValue>
                        </AssetDetail>
                        <AssetDetail>
                            <AssetDetailTitle>Issuer</AssetDetailTitle>
                            <AssetDetailValue>
                                <CopyButton text={asset.issuer}>
                                    <AccountViewer pubKey={asset.issuer} />
                                </CopyButton>
                            </AssetDetailValue>
                        </AssetDetail>
                    </AssetDetailsColumn>

                    <AssetDetailsColumn>
                        <AssetDetail>
                            <AssetDetailTitle>Authorization flags:</AssetDetailTitle>
                            <AssetDetailValue>
                                {assetInfo.auth_required && 'auth required '}
                                {assetInfo.auth_clawback_enabled && 'clawback enabled '}
                                {assetInfo.auth_immutable && 'immutable '}
                                {assetInfo.auth_revocable && 'revocable'}
                                {!assetInfo.auth_required &&
                                    !assetInfo.auth_clawback_enabled &&
                                    !assetInfo.auth_immutable &&
                                    !assetInfo.auth_revocable &&
                                    'None'}
                            </AssetDetailValue>
                        </AssetDetail>
                        <AssetDetail>
                            <AssetDetailTitle>Supply status</AssetDetailTitle>
                            <AssetDetailValue>
                                {assetInfo.is_supply_locked ? 'Locked' : 'Unlocked'}
                            </AssetDetailValue>
                        </AssetDetail>
                    </AssetDetailsColumn>
                </AssetDetails>
            )}
        </Container>
    );
};

export default AboutAsset;
