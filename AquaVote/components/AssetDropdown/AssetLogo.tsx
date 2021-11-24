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

const Logo = styled.img`
    ${logoStyles};
`;

const Unknown = styled(UnknownLogo)`
    ${logoStyles};
`;

const LogoLoaderContainer = styled.div`
    ${logoStyles};
    ${flexAllCenter};
    background-color: ${COLORS.descriptionText};
`;

const LogoLoader = styled(Loader)`
    height: 1.2rem;
    width: 1.2rem;
    color: ${COLORS.white};
`;

const AssetLogo = ({ logoUrl }: { logoUrl: string | null | undefined }) => {
    const [isErrorLoad, setIsErrorLoad] = useState(false);

    if (logoUrl === undefined) {
        return (
            <LogoLoaderContainer>
                <LogoLoader />
            </LogoLoaderContainer>
        );
    }

    if (logoUrl === null || isErrorLoad) {
        return <Unknown />;
    }

    return (
        <Logo
            src={logoUrl}
            alt=""
            onError={() => {
                setIsErrorLoad(true);
            }}
        />
    );
};

export default AssetLogo;
