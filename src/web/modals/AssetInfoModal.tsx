import * as React from 'react';
import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { getAssetDetails } from 'api/stellar-expert';

import { MainRoutes } from 'constants/routes';

import { getAquaAssetData, getAssetString } from 'helpers/assets';
import { getDateString } from 'helpers/date';
import { getIsTestnetEnv } from 'helpers/env';
import { formatBalance } from 'helpers/format-number';
import { createLumen } from 'helpers/token';

import { LumenInfo } from 'store/assetsStore/reducer';
import useAssetsStore from 'store/assetsStore/useAssetsStore';

import { ModalService } from 'services/globalServices';
import { resolveToml } from 'services/stellar/utils/resolvers';

import { ExpertAssetData } from 'types/api-stellar-expert';
import { AssetInfo } from 'types/asset-info';
import { ModalProps } from 'types/modal';
import { StellarToml as StellarTomlType } from 'types/stellar';
import { ClassicToken } from 'types/token';

import Mail from 'assets/community/email16.svg';
import Git from 'assets/community/github16.svg';
import X from 'assets/community/twitter16.svg';
import External from 'assets/icons/nav/icon-external-link-16.svg';

import Asset from 'basics/Asset';
import Button from 'basics/buttons/Button';
import PageLoader from 'basics/loaders/PageLoader';
import { ModalWrapper } from 'basics/ModalAtoms';

import Changes24 from 'components/Changes24';
import NoTrustline from 'components/NoTrustline';
import PublicKeyWithIcon from 'components/PublicKeyWithIcon';

import { respondDown } from 'styles/mixins';
import { Breakpoints, COLORS } from 'styles/style-constants';

import CopyButton from '../basics/buttons/CopyButton';

const Description = styled.p`
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.textSecondary};
    opacity: 0.7;
    margin: 2.4rem 0 1.6rem;
`;

const Links = styled.div`
    display: flex;

    ${respondDown(Breakpoints.md)`
        flex-direction: column;
        gap: 1rem;
    `}
`;

const ContactLink = styled.a`
    display: flex;
    align-items: center;
    color: ${COLORS.purple500};
    text-decoration: none;
    margin-right: 2.4rem;
    font-size: 1.6rem;
    line-height: 2.8rem;

    svg {
        margin-right: 0.4rem;
    }
`;

const ExternalBlack = styled(External)`
    path {
        fill: ${COLORS.black};
    }
`;

const Details = styled.div`
    display: flex;
    flex-wrap: wrap;
    margin-top: 4rem;
    gap: 3.2rem;
`;

const Detail = styled.div`
    flex: 1;
    min-width: 30%;
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    color: ${COLORS.textTertiary};

    span:first-child {
        color: ${COLORS.textGray};
    }

    span:last-child {
        line-height: 2.8rem;
    }
`;

const Buttons = styled.div`
    display: flex;
    margin-top: 3.2rem;
    gap: 1.2rem;

    ${respondDown(Breakpoints.md)`
        flex-direction: column;
    `}
`;

const LinkStyled = styled(Link)`
    display: flex;
    flex: 1;
    text-decoration: none;

    Button {
        width: 100%;
        flex: 1;
    }
`;

const CopyButtonStyled = styled(CopyButton)`
    font-size: 1.4rem;
`;

interface AssetInfoModalParams {
    asset: ClassicToken;
}

const AssetInfoModal = ({ params }: ModalProps<AssetInfoModalParams>): React.ReactNode => {
    const { asset } = params;

    const [tomlInfo, setTomlInfo] = useState<StellarTomlType>({});
    const [expertData, setExpertData] = useState<ExpertAssetData>(undefined);

    const { assetsInfo } = useAssetsStore();

    const { desc, home_domain } = assetsInfo.get(getAssetString(asset)) || {};
    const { aquaCode, aquaIssuer, aquaStellarAsset } = getAquaAssetData();

    const isNative = asset.isNative();
    const assetInfo: Partial<AssetInfo> = isNative
        ? LumenInfo
        : assetsInfo.get(getAssetString(asset));

    useEffect(() => {
        resolveToml(home_domain)
            .then(res => {
                setTomlInfo(res);
            })
            .catch(() => {
                setTomlInfo({});
            });

        getAssetDetails(asset)
            .then(details => {
                setExpertData(details);
            })
            .catch(() => {
                setExpertData(null);
            });
    }, []);

    const xLink = useMemo(() => {
        if (!tomlInfo?.DOCUMENTATION?.ORG_TWITTER) {
            return null;
        }

        if (!tomlInfo?.DOCUMENTATION?.ORG_TWITTER.startsWith('https://')) {
            return tomlInfo?.DOCUMENTATION?.ORG_TWITTER;
        }
        return tomlInfo?.DOCUMENTATION?.ORG_TWITTER.split('/')[3];
    }, [tomlInfo]);

    const gitLink = useMemo(() => {
        if (!tomlInfo?.DOCUMENTATION?.ORG_GITHUB) {
            return null;
        }

        if (!tomlInfo?.DOCUMENTATION?.ORG_GITHUB.startsWith('https://')) {
            return tomlInfo?.DOCUMENTATION?.ORG_GITHUB;
        }
        return tomlInfo?.DOCUMENTATION?.ORG_GITHUB.split('/')[3];
    }, [tomlInfo]);

    return (
        <ModalWrapper $isWide>
            <Asset asset={asset} isBig hasDomainLink />
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
                    href={`https://stellar.expert/explorer/${
                        getIsTestnetEnv() ? 'testnet' : 'public'
                    }/asset/${asset.code}-${asset.issuer}`}
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
                        <Detail>
                            <span>First transaction:</span>
                            <span>{getDateString(expertData.created * 1000)}</span>
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
                            <span>24H change:</span>
                            <Changes24 expertData={expertData} />
                        </Detail>
                        <Detail>
                            <span>Issuer:</span>
                            <CopyButtonStyled text={asset.issuer}>
                                <PublicKeyWithIcon pubKey={asset.issuer} />
                            </CopyButtonStyled>
                        </Detail>
                        <Detail>
                            <span>Authorization flags:</span>
                            <span>
                                {assetInfo.auth_required && 'auth required '}
                                {assetInfo.auth_clawback_enabled && 'clawback enabled '}
                                {assetInfo.auth_immutable && 'immutable '}
                                {assetInfo.auth_revocable && 'revocable'}
                                {!assetInfo.auth_required &&
                                    !assetInfo.auth_clawback_enabled &&
                                    !assetInfo.auth_immutable &&
                                    !assetInfo.auth_revocable &&
                                    'None'}
                            </span>
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
            <Buttons>
                <LinkStyled
                    to={`${MainRoutes.swap}/${getAssetString(asset)}/${getAssetString(
                        asset.code === aquaCode && asset.issuer === aquaIssuer
                            ? createLumen()
                            : aquaStellarAsset,
                    )}`}
                    onClick={() => ModalService.closeAllModals()}
                >
                    <Button isBig>swap</Button>
                </LinkStyled>

                <LinkStyled
                    to={`${MainRoutes.vote}/?base=${getAssetString(asset)}`}
                    onClick={() => ModalService.closeAllModals()}
                >
                    <Button isBig>vote</Button>
                </LinkStyled>

                <NoTrustline asset={asset} onlyButton secondary isBig />
            </Buttons>
        </ModalWrapper>
    );
};

export default AssetInfoModal;
