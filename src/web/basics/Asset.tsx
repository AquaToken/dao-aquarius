import * as React from 'react';
import { useMemo } from 'react';
import styled from 'styled-components';

import { getAssetString } from 'helpers/assets';
import getExplorerLink, { ExplorerSection } from 'helpers/explorer-links';
import { createAsset } from 'helpers/token';
import { truncateString } from 'helpers/truncate-string';

import { LumenInfo } from 'store/assetsStore/reducer';
import useAssetsStore from 'store/assetsStore/useAssetsStore';

import { ModalService } from 'services/globalServices';

import { ClassicToken, Token, TokenType } from 'types/token';

import AssetInfoModal from 'web/modals/AssetInfoModal';

import Info from 'assets/icons/status/icon-info-16.svg';

import AssetLogo from 'basics/AssetLogo';
import DotsLoader from 'basics/loaders/DotsLoader';
import Tooltip, { TOOLTIP_POSITION } from 'basics/Tooltip';

import { flexAllCenter, respondDown, textEllipsis } from 'styles/mixins';
import { Breakpoints, COLORS } from 'styles/style-constants';

type AssetVariant = 'default' | 'compactDomain';
type AssetState = 'default' | 'revoked';

const Container = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    box-sizing: border-box;
    min-width: 0;
`;

const LogoWrap = styled.span<{ $state?: AssetState }>`
    display: inline-flex;
    filter: ${({ $state }) => ($state === 'revoked' ? 'grayscale(1)' : 'none')};
`;

const AssetDetails = styled.div<{ $inRow?: boolean; $variant?: AssetVariant }>`
    display: flex;
    flex: 1 1 auto;
    min-width: 0;
    flex-direction: ${({ $inRow }) => ($inRow ? 'row' : 'column')};
    margin-left: ${({ $inRow, $variant }) =>
        $variant === 'compactDomain' ? '1.2rem' : $inRow ? '0.8rem' : '1.6rem'};
    gap: ${({ $variant }) => ($variant === 'compactDomain' ? '0.2rem' : '0')};
`;

const AssetCode = styled.span<{
    $inRow?: boolean;
    $isBig?: boolean;
    $variant?: AssetVariant;
    $state?: AssetState;
}>`
    font-size: ${({ $isBig, $variant }) =>
        $isBig ? '3.6rem' : $variant === 'compactDomain' ? '1.6rem' : '1.6rem'};
    line-height: ${({ $isBig, $variant }) =>
        $isBig ? '4.2rem' : $variant === 'compactDomain' ? '2rem' : '2.8rem'};
    color: ${COLORS.textTertiary};
    margin-right: ${({ $inRow }) => ($inRow ? '0.3rem' : '0')};
    text-decoration-line: ${({ $state }) => ($state === 'revoked' ? 'line-through' : 'none')};
    text-decoration-thickness: 0.1rem;
`;

const AssetDomain = styled.span<{
    $withMobileView?: boolean;
    $inRow?: boolean;
    $variant?: AssetVariant;
    $state?: AssetState;
}>`
    color: ${({ $inRow }) => ($inRow ? COLORS.textTertiary : COLORS.textGray)};
    font-size: ${({ $inRow, $variant }) =>
        $variant === 'compactDomain' ? '1.2rem' : $inRow ? '1.6rem' : '1.4rem'};
    line-height: ${({ $inRow, $variant }) =>
        $variant === 'compactDomain' ? '1.6rem' : $inRow ? '2.8rem' : '2rem'};
    word-break: break-word;
    text-decoration-line: ${({ $state }) => ($state === 'revoked' ? 'line-through' : 'none')};
    text-decoration-thickness: 0.1rem;

    a,
    span {
        color: inherit;
        text-decoration: inherit;
    }

    ${({ $variant }) =>
        $variant === 'compactDomain' &&
        `
            display: block;
            max-width: 100%;
            ${textEllipsis};

            a,
            span {
                display: block;
                max-width: 100%;
                ${textEllipsis};
            }
        `}

    ${respondDown(Breakpoints.md)`
        white-space: nowrap;
        ${({ $withMobileView }) => $withMobileView && 'display: none;'}
        ${textEllipsis};
    `}
`;

const InfoIcon = styled.div<{ $withMobileView?: boolean }>`
    ${flexAllCenter};
    display: none;

    ${respondDown(Breakpoints.md)`
          ${({ $withMobileView }) => $withMobileView && 'display: flex;'}
    `}
`;

const DomainLink = styled.a`
    color: ${COLORS.purple500};
    text-decoration: none;
    cursor: pointer;
`;

const DomainDetails = styled.span`
    cursor: pointer;
    &:hover {
        text-decoration: underline;
        text-decoration-style: dashed;
    }
`;

const DomainDetailsLink = styled.a`
    text-decoration: none;
    color: ${COLORS.textGray};

    &:hover {
        text-decoration: underline;
        text-decoration-style: dashed;
    }
`;

const Asset = ({
    asset,
    inRow,
    withMobileView,
    isBig,
    onlyLogo,
    onlyLogoSmall,
    logoAndCode,
    variant = 'default',
    state = 'default',
    hasDomainLink,
    hasAssetDetailsLink,
    ...props
}: {
    asset: Token;
    inRow?: boolean;
    withMobileView?: boolean;
    onlyLogo?: boolean;
    onlyLogoSmall?: boolean;
    logoAndCode?: boolean;
    variant?: AssetVariant;
    state?: AssetState;
    isBig?: boolean;
    hasDomainLink?: boolean;
    hasAssetDetailsLink?: boolean;
}): React.ReactNode => {
    const { assetsInfo } = useAssetsStore();

    const assetInstance =
        asset.type !== TokenType.soroban ? createAsset(asset.code, asset.issuer) : null;

    const isNative = assetInstance && assetInstance.isNative();
    const hasAssetInfo =
        isNative ||
        (assetInstance && assetsInfo.has(getAssetString(assetInstance as ClassicToken)));
    const assetInfo = isNative
        ? LumenInfo
        : assetInstance
          ? assetsInfo.get(getAssetString(assetInstance as ClassicToken))
          : null;

    const domain = useMemo(() => {
        if (asset.type === TokenType.soroban) {
            return (
                <DomainDetailsLink
                    href={getExplorerLink(ExplorerSection.asset, asset.contract)}
                    target="_blank"
                >
                    soroban token
                </DomainDetailsLink>
            );
        }
        if (!assetInfo) {
            return <DotsLoader />;
        }

        const domainView = assetInfo.home_domain ?? truncateString(asset.issuer, 4);

        if (hasDomainLink && assetInfo.home_domain) {
            return (
                <DomainLink
                    href={`https://${assetInfo.home_domain}`}
                    target="_blank"
                    onClick={event => event.stopPropagation()}
                >
                    {domainView}
                </DomainLink>
            );
        }

        if (hasAssetDetailsLink) {
            return (
                <DomainDetails
                    onClick={event => {
                        event.stopPropagation();
                        ModalService.openModal(AssetInfoModal, { asset });
                    }}
                >
                    {domainView}
                </DomainDetails>
            );
        }

        return domainView;
    }, [assetInfo, asset]);

    if (onlyLogo) {
        return <AssetLogo asset={asset} />;
    }

    if (onlyLogoSmall) {
        return <AssetLogo asset={asset} isSmall />;
    }

    if (logoAndCode) {
        return (
            <Container {...props}>
                <AssetLogo asset={asset} />
                <AssetDetails $inRow>
                    <AssetCode $inRow>{asset.code}</AssetCode>
                </AssetDetails>
            </Container>
        );
    }

    return (
        <Container {...props}>
            <LogoWrap $state={state}>
                <AssetLogo
                    asset={asset}
                    isSmall={inRow}
                    isBig={isBig}
                    size={variant === 'compactDomain' ? 4 : undefined}
                    isCircle={variant === 'compactDomain' ? false : undefined}
                />
            </LogoWrap>
            <AssetDetails $inRow={inRow} $variant={variant}>
                <AssetCode $inRow={inRow} $isBig={isBig} $variant={variant} $state={state}>
                    {asset.code}
                </AssetCode>
                <AssetDomain
                    $withMobileView={withMobileView}
                    $inRow={inRow}
                    $variant={variant}
                    $state={state}
                >
                    {variant === 'compactDomain' ? (
                        domain
                    ) : (
                        <>
                            {inRow
                                ? ''
                                : assetInfo?.name ||
                                  (asset.type === TokenType.soroban ? asset.name : asset.code)}{' '}
                            ({domain})
                        </>
                    )}
                </AssetDomain>
                <Tooltip
                    content={
                        <span>
                            {asset.type === TokenType.soroban ? (
                                'Soroban Token'
                            ) : hasAssetInfo ? (
                                (assetInfo.home_domain ?? 'unknown')
                            ) : (
                                <DotsLoader />
                            )}
                        </span>
                    }
                    position={TOOLTIP_POSITION.left}
                    showOnHover
                >
                    <InfoIcon $withMobileView={withMobileView}>
                        <Info />
                    </InfoIcon>
                </Tooltip>
            </AssetDetails>
        </Container>
    );
};

export default Asset;
