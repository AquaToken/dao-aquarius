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

const Logo = styled.img<{ isSmall?: boolean }>`
    ${({ isSmall }) => (isSmall ? smallLogoStyles : logoStyles)};
`;

const Unknown = styled(UnknownLogo)<{ $isSmall?: boolean }>`
    ${({ $isSmall }) => ($isSmall ? smallLogoStyles : logoStyles)};
`;

const LogoLoaderContainer = styled.div<{ isSmall?: boolean }>`
    ${({ isSmall }) => (isSmall ? smallLogoStyles : logoStyles)};
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
}: {
    logoUrl: string | null | undefined;
    isSmall?: boolean;
}) => {
    const [isErrorLoad, setIsErrorLoad] = useState(false);

    if (logoUrl === undefined) {
        return (
            <LogoLoaderContainer isSmall={isSmall}>
                <LogoLoader />
            </LogoLoaderContainer>
        );
    }

    if (logoUrl === null || isErrorLoad) {
        return <Unknown $isSmall={isSmall} />;
    }

    return (
        <Logo
            src={logoUrl}
            alt=""
            isSmall={isSmall}
            onError={() => {
                setIsErrorLoad(true);
            }}
        />
    );
};

export default AssetLogo;
