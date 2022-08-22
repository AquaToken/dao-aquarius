import * as React from 'react';
import styled, { css } from 'styled-components';
import UnknownLogo from '../../../common/assets/img/asset-unknown-logo.svg';
import { flexAllCenter } from '../../../common/mixins';
import { COLORS } from '../../../common/styles';
import Loader from '../../../common/assets/img/loader.svg';
import { useState } from 'react';

export const logoStyles = css`
    height: 3.2rem;
    width: 3.2rem;
    border-radius: 50%;
`;

const smallLogoStyles = css`
    height: 1.6rem;
    width: 1.6rem;
    border-radius: 0.1rem;
`;

const bigLogoStyles = css`
    height: 8rem;
    width: 8rem;
    border-radius: 0.5rem;
`;

const Logo = styled.img<{ isSmall?: boolean; isBig?: boolean }>`
    ${({ isSmall, isBig }) => {
        if (isSmall) {
            return smallLogoStyles;
        }
        if (isBig) {
            return bigLogoStyles;
        }
        return logoStyles;
    }}
`;

const Unknown = styled(UnknownLogo)<{ $isSmall?: boolean; $isBig?: boolean }>`
    ${({ $isSmall, $isBig }) => {
        if ($isSmall) {
            return smallLogoStyles;
        }
        if ($isBig) {
            return bigLogoStyles;
        }
        return logoStyles;
    }}
`;

const LogoLoaderContainer = styled.div<{ isSmall?: boolean; isBig?: boolean }>`
    ${({ isSmall, isBig }) => {
        if (isSmall) {
            return smallLogoStyles;
        }
        if (isBig) {
            return bigLogoStyles;
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
}: {
    logoUrl: string | null | undefined;
    isSmall?: boolean;
    isBig?: boolean;
}) => {
    const [isErrorLoad, setIsErrorLoad] = useState(false);

    if (logoUrl === undefined) {
        return (
            <LogoLoaderContainer isSmall={isSmall} isBig={isBig}>
                <LogoLoader />
            </LogoLoaderContainer>
        );
    }

    if (logoUrl === null || isErrorLoad) {
        return <Unknown $isSmall={isSmall} $isBig={isBig} />;
    }

    return (
        <Logo
            src={logoUrl}
            alt=""
            isSmall={isSmall}
            isBig={isBig}
            onError={() => {
                setIsErrorLoad(true);
            }}
        />
    );
};

export default AssetLogo;
