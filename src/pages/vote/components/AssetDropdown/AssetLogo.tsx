import * as React from 'react';
import styled, { css } from 'styled-components';
import UnknownLogo from '../../../../common/assets/img/asset-unknown-logo.svg';
import { flexAllCenter } from '../../../../common/mixins';
import { COLORS } from '../../../../common/styles';
import Loader from '../../../../common/assets/img/loader.svg';
import { useState } from 'react';

export const logoStyles = css`
    height: 3.2rem;
    width: 3.2rem;
    max-height: 3.2rem;
    max-width: 3.2rem;
    min-width: 3.2rem;
    border-radius: 50%;
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

const Logo = styled.img<{ isSmall?: boolean; isBig?: boolean; isCircle?: boolean }>`
    ${({ isSmall, isBig, isCircle }) => {
        if (isSmall) {
            return smallLogoStyles(isCircle);
        }
        if (isBig) {
            return bigLogoStyles(isCircle);
        }
        return logoStyles;
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
        return logoStyles;
    }}
`;

const LogoLoaderContainer = styled.div<{ isSmall?: boolean; isBig?: boolean; isCircle?: boolean }>`
    ${({ isSmall, isBig, isCircle }) => {
        if (isSmall) {
            return smallLogoStyles(isCircle);
        }
        if (isBig) {
            return bigLogoStyles(isCircle);
        }
        return logoStyles;
    }}
    ${flexAllCenter};
    background-color: ${COLORS.descriptionText};
`;

const LogoLoader = styled(Loader)`
    height: 1.2rem;
    width: 1.2rem;
    color: ${COLORS.white};
`;

const AssetLogo = ({
    logoUrl,
    isSmall,
    isBig,
    isCircle,
}: {
    logoUrl: string | null | undefined;
    isSmall?: boolean;
    isBig?: boolean;
    isCircle?: boolean;
}) => {
    const [isErrorLoad, setIsErrorLoad] = useState(false);

    if (logoUrl === undefined) {
        return (
            <LogoLoaderContainer isSmall={isSmall} isBig={isBig} isCircle={isCircle}>
                <LogoLoader />
            </LogoLoaderContainer>
        );
    }

    if (logoUrl === null || isErrorLoad) {
        return <Unknown $isSmall={isSmall} $isBig={isBig} $isCircl={isCircle} />;
    }

    return (
        <Logo
            src={logoUrl}
            alt=""
            isSmall={isSmall}
            isBig={isBig}
            isCircle={isCircle}
            onError={() => {
                setIsErrorLoad(true);
            }}
        />
    );
};

export default AssetLogo;
