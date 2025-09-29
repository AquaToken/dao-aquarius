import * as React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { D_ICE_CODE, GD_ICE_CODE, ICE_ISSUER } from 'constants/assets';
import { MainRoutes } from 'constants/routes';

import { createAsset } from 'helpers/token';

import { ModalProps } from 'types/modal';

import { flexColumn, flexColumnCenter } from 'web/mixins';
import { COLORS } from 'web/styles';

import DIceLogo from 'assets/tokens/dice-logo.svg';

import { ModalDescription, ModalTitle, ModalWrapper } from 'basics/ModalAtoms';

import NoTrustline from 'components/NoTrustline';

const AssetBlock = styled.div`
    ${flexColumnCenter};
    padding: 3.7rem 0;
    background-color: ${COLORS.gray50};
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
        color: ${COLORS.textPrimary};
    }

    span {
        color: ${COLORS.textGray};
    }
`;

const Buttons = styled.div`
    ${flexColumn};
    gap: 2.4rem;
`;

const LinkStyled = styled(Link)`
    color: ${COLORS.purple500};
    text-decoration: none;
`;

interface Params {
    neededDIceTrustline: boolean;
    neededGDIceTrustline: boolean;
}

const DIceTrustlineModal = ({ params }: ModalProps<Params>) => {
    const { neededDIceTrustline, neededGDIceTrustline } = params;

    const codes = `${neededDIceTrustline ? D_ICE_CODE : ''}${
        neededDIceTrustline && neededGDIceTrustline ? ', ' : ''
    }${neededGDIceTrustline ? GD_ICE_CODE : ''}`;

    const getLinksText = () => {
        if (neededDIceTrustline && neededGDIceTrustline) {
            return (
                <>
                    After that, you’ll be able to vote on the&nbsp;
                    <LinkStyled to={MainRoutes.vote}>Voting page</LinkStyled>
                    &nbsp;and participate in governance on the&nbsp;
                    <LinkStyled to={MainRoutes.governance}>Governance page</LinkStyled>.
                </>
            );
        }
        if (neededDIceTrustline) {
            return (
                <>
                    After that, you’ll be able to vote on the&nbsp;
                    <LinkStyled to={MainRoutes.vote}>Voting page</LinkStyled>.
                </>
            );
        }
        if (neededGDIceTrustline) {
            return (
                <>
                    After that, you’ll be able to participate in governance on the&nbsp;
                    <LinkStyled to={MainRoutes.governance}>Governance page</LinkStyled>.
                </>
            );
        }
        return null;
    };

    return (
        <ModalWrapper>
            <ModalTitle>You’ve Been Delegated ICE</ModalTitle>
            <ModalDescription>
                Someone has delegated ICE to your account — a pending payment in {codes}. Add a
                trustline to receive it. The {codes} will be credited to your balance within 30
                minutes. {getLinksText()}
            </ModalDescription>
            <AssetBlock>
                <DIceLogo />
                <h4>{codes}</h4>
                <span>aqua.network</span>
            </AssetBlock>
            <Buttons>
                {neededDIceTrustline && (
                    <NoTrustline
                        asset={createAsset(D_ICE_CODE, ICE_ISSUER)}
                        onlyButton
                        fullWidth
                        isBig
                        closeModalAfterSubmit
                    />
                )}
                {neededGDIceTrustline && (
                    <NoTrustline
                        asset={createAsset(GD_ICE_CODE, ICE_ISSUER)}
                        onlyButton
                        fullWidth
                        isBig
                        closeModalAfterSubmit
                    />
                )}
            </Buttons>
        </ModalWrapper>
    );
};

export default DIceTrustlineModal;
