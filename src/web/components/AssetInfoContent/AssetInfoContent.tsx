import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

import { getRegistryAssetMarketStatsRequest } from 'api/asset-registry';
import { getAssetDetails } from 'api/stellar-expert';

import { getAssetString } from 'helpers/assets';
import { getDateString } from 'helpers/date';
import getExplorerLink, { ExplorerSection } from 'helpers/explorer-links';
import { formatBalance } from 'helpers/format-number';

import { useIsMounted } from 'hooks/useIsMounted';

import { LumenInfo } from 'store/assetsStore/reducer';
import useAssetsStore from 'store/assetsStore/useAssetsStore';

import { resolveToml } from 'services/stellar/utils/resolvers';

import { ExpertAssetData } from 'types/api-stellar-expert';
import { AssetInfo } from 'types/asset-info';
import { StellarToml as StellarTomlType } from 'types/stellar';
import { ClassicToken } from 'types/token';

import { RegistryAssetMarketStatsMap } from 'web/pages/asset-registry/pages/AssetRegistryMainPage/AssetRegistryMainPage.types';

import Mail from 'assets/community/email16.svg';
import Git from 'assets/community/github16.svg';
import X from 'assets/community/twitter16.svg';
import External from 'assets/icons/nav/icon-external-link-16.svg';
import IconInfo from 'assets/icons/status/icon-info-16.svg';

import Asset from 'basics/Asset';
import DotsLoader from 'basics/loaders/DotsLoader';
import PageLoader from 'basics/loaders/PageLoader';
import Tooltip, { TOOLTIP_POSITION } from 'basics/Tooltip';

import Changes24 from 'components/Changes24';
import PublicKeyWithIcon from 'components/PublicKeyWithIcon';

import {
    AssetWrap,
    ContactLink,
    CopyButtonStyled,
    Description,
    Detail,
    Details,
    InfoIconWrap,
    InfoLabelWrap,
    Links,
    TopRow,
} from './AssetInfoContent.styled';

const ExternalBlack = styled(External)`
    path {
        fill: currentColor;
    }
`;

type AssetInfoContentProps = {
    asset: ClassicToken;
    badge?: React.ReactNode;
};

const AssetInfoContent = ({ asset, badge }: AssetInfoContentProps): React.ReactNode => {
    const [tomlInfo, setTomlInfo] = useState<StellarTomlType>({});
    const [expertData, setExpertData] = useState<ExpertAssetData | null>();
    const [marketStats, setMarketStats] = useState<RegistryAssetMarketStatsMap>({});
    const [isMarketStatsLoading, setIsMarketStatsLoading] = useState(true);
    const { assetsInfo } = useAssetsStore();
    const isMounted = useIsMounted();

    const { desc, home_domain } = assetsInfo.get(getAssetString(asset)) || {};
    const assetInfo: Partial<AssetInfo> = asset.isNative()
        ? LumenInfo
        : assetsInfo.get(getAssetString(asset));

    useEffect(() => {
        if (!home_domain) {
            setTomlInfo({});
            return;
        }

        resolveToml(home_domain)
            .then(res => {
                if (isMounted.current) {
                    setTomlInfo(res);
                }
            })
            .catch(() => {
                if (isMounted.current) {
                    setTomlInfo({});
                }
            });
    }, [home_domain, isMounted]);

    useEffect(() => {
        getAssetDetails(asset)
            .then(details => {
                if (isMounted.current) {
                    setExpertData(details ?? null);
                }
            })
            .catch(() => {
                if (isMounted.current) {
                    setExpertData(null);
                }
            });
    }, [asset, isMounted]);

    useEffect(() => {
        setIsMarketStatsLoading(true);

        getRegistryAssetMarketStatsRequest()
            .then(stats => {
                if (isMounted.current) {
                    setMarketStats(stats);
                }
            })
            .catch(() => {
                if (isMounted.current) {
                    setMarketStats({});
                }
            })
            .finally(() => {
                if (isMounted.current) {
                    setIsMarketStatsLoading(false);
                }
            });
    }, [isMounted]);

    const xLink = useMemo(() => {
        if (!tomlInfo?.DOCUMENTATION?.ORG_TWITTER) {
            return null;
        }

        if (!tomlInfo.DOCUMENTATION.ORG_TWITTER.startsWith('https://')) {
            return tomlInfo.DOCUMENTATION.ORG_TWITTER;
        }

        return tomlInfo.DOCUMENTATION.ORG_TWITTER.split('/')[3];
    }, [tomlInfo]);

    const gitLink = useMemo(() => {
        if (!tomlInfo?.DOCUMENTATION?.ORG_GITHUB) {
            return null;
        }

        if (!tomlInfo.DOCUMENTATION.ORG_GITHUB.startsWith('https://')) {
            return tomlInfo.DOCUMENTATION.ORG_GITHUB;
        }

        return tomlInfo.DOCUMENTATION.ORG_GITHUB.split('/')[3];
    }, [tomlInfo]);

    const authorizationFlags = [
        assetInfo.auth_required && 'auth required',
        assetInfo.auth_clawback_enabled && 'clawback enabled',
        assetInfo.auth_immutable && 'immutable',
        assetInfo.auth_revocable && 'revocable',
    ]
        .filter(Boolean)
        .join(', ');

    const currentMarketStats = marketStats[asset.contract];

    const getUsdAmountView = (value?: number) => {
        if (isMarketStatsLoading) {
            return <DotsLoader />;
        }

        if (value === undefined) {
            return '—';
        }

        return `$${formatBalance(value, true, true)}`;
    };

    const renderInfoTooltip = () => (
        <Tooltip content="Data from Aquarius AMM." position={TOOLTIP_POSITION.top} showOnHover>
            <InfoIconWrap>
                <IconInfo />
            </InfoIconWrap>
        </Tooltip>
    );

    return (
        <>
            <TopRow>
                <AssetWrap>
                    <Asset asset={asset} isBig hasDomainLink />
                </AssetWrap>
                {badge}
            </TopRow>
            <Description>{desc}</Description>
            <Links>
                {xLink && (
                    <ContactLink target="_blank" href={`https://x.com/${xLink}`}>
                        <X />
                        {xLink}
                    </ContactLink>
                )}
                {gitLink && (
                    <ContactLink target="_blank" href={`https://github.com/${gitLink}`}>
                        <Git />
                        {gitLink}
                    </ContactLink>
                )}
                {tomlInfo.DOCUMENTATION?.ORG_OFFICIAL_EMAIL && (
                    <ContactLink
                        target="_blank"
                        href={`mailto:${tomlInfo.DOCUMENTATION.ORG_OFFICIAL_EMAIL}`}
                    >
                        <Mail />
                        {tomlInfo.DOCUMENTATION.ORG_OFFICIAL_EMAIL}
                    </ContactLink>
                )}
                <ContactLink
                    target="_blank"
                    href={getExplorerLink(ExplorerSection.asset, getAssetString(asset))}
                >
                    <ExternalBlack />
                    StellarExpert
                </ContactLink>
            </Links>
            {expertData !== undefined ? (
                expertData ? (
                    <Details>
                        <Detail>
                            <span>Asset holders:</span>
                            <span>{formatBalance(expertData.trustlines[0])}</span>
                        </Detail>
                        {!asset.isNative() && (
                            <Detail>
                                <span>First transaction:</span>
                                <span>{getDateString(expertData.created * 1000)}</span>
                            </Detail>
                        )}
                        <Detail>
                            <span>
                                <InfoLabelWrap>
                                    TVL
                                    {renderInfoTooltip()}
                                </InfoLabelWrap>
                            </span>
                            <span>{getUsdAmountView(currentMarketStats?.tvlUsd)}</span>
                        </Detail>
                        <Detail>
                            <span>
                                <InfoLabelWrap>
                                    Volume 24H
                                    {renderInfoTooltip()}
                                </InfoLabelWrap>
                            </span>
                            <span>{getUsdAmountView(currentMarketStats?.volumeUsd)}</span>
                        </Detail>
                        <Detail>
                            <span>Overall payments volume:</span>
                            <span>
                                {formatBalance(expertData.payments_amount / 1e7, true, true)}{' '}
                                {asset.code}
                            </span>
                        </Detail>
                        <Detail>
                            <span>Overall trading volume:</span>
                            <span>
                                {formatBalance(expertData.traded_amount / 1e7, true, true)}{' '}
                                {asset.code}
                            </span>
                        </Detail>
                        <Detail>
                            <span>Current price:</span>
                            <span>
                                $
                                {formatBalance(
                                    expertData.price7d?.[expertData.price7d.length - 1]?.[1] ?? 0,
                                    true,
                                )}
                            </span>
                        </Detail>
                        <Detail>
                            <span>24h change:</span>
                            <Changes24 expertData={expertData} />
                        </Detail>
                        {!asset.isNative() && asset.issuer && (
                            <Detail>
                                <span>Issuer:</span>
                                <CopyButtonStyled text={asset.issuer}>
                                    <PublicKeyWithIcon pubKey={asset.issuer} />
                                </CopyButtonStyled>
                            </Detail>
                        )}
                        {!asset.isNative() && asset.contract && (
                            <Detail>
                                <span>Contract address:</span>
                                <CopyButtonStyled text={asset.contract}>
                                    <PublicKeyWithIcon pubKey={asset.contract} />
                                </CopyButtonStyled>
                            </Detail>
                        )}
                        <Detail>
                            <span>Authorization flags:</span>
                            <span>{authorizationFlags || 'None'}</span>
                        </Detail>
                        <Detail>
                            <span>Supply status:</span>
                            <span>{assetInfo.is_supply_locked ? 'Locked' : 'Unlocked'}</span>
                        </Detail>
                    </Details>
                ) : null
            ) : (
                <PageLoader />
            )}
        </>
    );
};

export default AssetInfoContent;
