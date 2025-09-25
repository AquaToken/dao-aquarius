import * as React from 'react';
import { useState } from 'react';
import styled, { css } from 'styled-components';

import { getAssetString } from 'helpers/assets';
import { createAsset } from 'helpers/token';

import { LumenInfo } from 'store/assetsStore/reducer';
import useAssetsStore from 'store/assetsStore/useAssetsStore';

import { ClassicToken, Token, TokenType } from 'types/token';

import { flexAllCenter } from 'web/mixins';
import { COLORS } from 'web/styles';

import UnknownLogo from 'assets/asset-unknown-logo.svg';
import SorobanLogo from 'assets/soroban-token-logo.svg';

import { CircleLoader } from './loaders';

export const logoStyles = (isCircle = true) => css`
    height: 3.2rem;
    width: 3.2rem;
    max-height: 3.2rem;
    max-width: 3.2rem;
    min-width: 3.2rem;
    border-radius: ${isCircle ? '50%' : '0.1rem'};
`;

const smallLogoStyles = (isCircle: boolean) => css`
    height: 1.6rem;
    width: 1.6rem;
    max-height: 1.6rem;
    max-width: 1.6rem;
    min-width: 1.6rem;
    border-radius: ${isCircle ? '50%' : '0.1rem'};
`;

export const bigLogoStyles = (isCircle: boolean) => css`
    height: 8rem;
    width: 8rem;
    max-height: 8rem;
    max-width: 8rem;
    min-width: 8rem;
    border-radius: ${isCircle ? '50%' : '0.5rem'};
`;

const Logo = styled.img<{ $isSmall?: boolean; $isBig?: boolean; $isCircle?: boolean }>`
    ${({ $isSmall, $isBig, $isCircle }) => {
        if ($isSmall) {
            return smallLogoStyles($isCircle);
        }
        if ($isBig) {
            return bigLogoStyles($isCircle);
        }
        return logoStyles($isCircle);
    }}
`;

const Unknown = styled(UnknownLogo)<{ $isSmall?: boolean; $isBig?: boolean; $isCircle?: boolean }>`
    ${({ $isSmall, $isBig, $isCircle }) => {
        if ($isSmall) {
            return smallLogoStyles($isCircle);
        }
        if ($isBig) {
            return bigLogoStyles($isCircle);
        }
        return logoStyles($isCircle);
    }}
`;

const Soroban = styled(SorobanLogo)<{ $isSmall?: boolean; $isBig?: boolean; $isCircle?: boolean }>`
    ${({ $isSmall, $isBig, $isCircle }) => {
        if ($isSmall) {
            return smallLogoStyles($isCircle);
        }
        if ($isBig) {
            return bigLogoStyles($isCircle);
        }
        return logoStyles($isCircle);
    }}
`;

const LogoLoaderContainer = styled.div<{
    $isSmall?: boolean;
    $isBig?: boolean;
    $isCircle?: boolean;
}>`
    ${({ $isSmall, $isBig, $isCircle }) => {
        if ($isSmall) {
            return smallLogoStyles($isCircle);
        }
        if ($isBig) {
            return bigLogoStyles($isCircle);
        }
        return logoStyles($isCircle);
    }}
    ${flexAllCenter};
    background-color: ${COLORS.textSecondary};
`;

const LogoLoader = styled(CircleLoader)`
    color: ${COLORS.white};
`;

const AssetLogo = ({
    asset,
    isSmall,
    isBig,
    isCircle,
    ...props
}: {
    asset: Token;
    isSmall?: boolean;
    isBig?: boolean;
    isCircle?: boolean;
}) => {
    const [isErrorLoad, setIsErrorLoad] = useState(false);

    const { assetsInfo } = useAssetsStore();

    if (!asset.type && !(asset as ClassicToken).issuer) {
        return <Unknown $isSmall={isSmall} $isBig={isBig} $isCircle={isCircle} {...props} />;
    }

    if (asset.type === TokenType.soroban) {
        return <Soroban $isSmall={isSmall} $isBig={isBig} $isCircle={isCircle} {...props} />;
    }

    const assetInstance = createAsset(asset.code, asset.issuer);
    const isNative = assetInstance.isNative();
    const assetInfo = isNative
        ? LumenInfo
        : assetsInfo.get(getAssetString(assetInstance as ClassicToken));
    const logoUrl = assetInfo?.image;

    if (logoUrl === undefined) {
        return (
            <LogoLoaderContainer $isSmall={isSmall} $isBig={isBig} $isCircle={isCircle} {...props}>
                <LogoLoader size="small" />
            </LogoLoaderContainer>
        );
    }

    if (logoUrl === null || isErrorLoad) {
        return <Unknown $isSmall={isSmall} $isBig={isBig} $isCircle={isCircle} {...props} />;
    }

    return (
        <Logo
            src={logoUrl}
            alt=""
            $isSmall={isSmall}
            $isBig={isBig}
            $isCircle={isCircle}
            onError={() => {
                setIsErrorLoad(true);
            }}
            {...props}
        />
    );
};

export default AssetLogo;
