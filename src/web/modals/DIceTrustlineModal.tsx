import * as React from 'react';
import styled from 'styled-components';

import { D_ICE_CODE, ICE_ISSUER } from 'constants/assets';

import { StellarService } from 'services/globalServices';

import { flexColumnCenter } from 'web/mixins';
import { COLORS } from 'web/styles';

import IceLogo from 'assets/ice-logo.svg';

import { ModalDescription, ModalTitle, ModalWrapper } from 'basics/ModalAtoms';

import NoTrustline from 'components/NoTrustline';

const AssetBlock = styled.div`
    ${flexColumnCenter};
    padding: 3.7rem 0;
    background-color: ${COLORS.lightGray};
    border-radius: 0.5rem;
    margin-bottom: 2.4rem;

    svg {
        height: 3.2rem;
        width: 3.2rem;
        margin-bottom: 2.6rem;
    }

    h4 {
        font-weight: 400;
        font-size: 1.6rem;
        line-height: 2.8rem;
        color: ${COLORS.titleText};
    }

    span {
        color: ${COLORS.grayText};
    }
`;

const DIceTrustlineModal = () => (
    <ModalWrapper>
        <ModalTitle>You're being delegated to ICE</ModalTitle>
        <ModalDescription>
            Someone has delegated ICE to you - you have a pending dICE payment. To receive it please
            provide trustline.
        </ModalDescription>
        <AssetBlock>
            <IceLogo />
            <h4>dICE</h4>
            <span>aqua.network</span>
        </AssetBlock>
        <NoTrustline
            asset={StellarService.createAsset(D_ICE_CODE, ICE_ISSUER)}
            onlyButton
            fullWidth
            isBig
            closeModalAfterSubmit
        />
    </ModalWrapper>
);

export default DIceTrustlineModal;
