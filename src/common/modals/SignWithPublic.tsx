import * as React from 'react';
import { useEffect, useState } from 'react';
import { ModalDescription, ModalProps, ModalTitle } from './atoms/ModalAtoms';
import styled from 'styled-components';
import AccountBlock from '../basics/AccountBlock';
import { StellarService } from '../services/globalServices';
import AccountService from '../services/account.service';
import { flexAllCenter, respondDown } from '../mixins';
import { Breakpoints, COLORS } from '../styles';
import Stellar from '../assets/img/xlm-logo.svg';
import ArrowRight from '../assets/img/icon-arrow-right.svg';
import CopyButton from '../basics/CopyButton';
import XdrLogo from '../assets/img/icon-xdr.svg';
import Copy from '../assets/img/icon-copy.svg';

const Container = styled.div`
    width: 52.8rem;

    a {
        text-decoration: none;
        display: block;
        margin-bottom: 1.4rem;
    }

    ${respondDown(Breakpoints.md)`
        width: 100%;
    `}
`;

const Title = styled(ModalTitle)`
    margin-top: 3.2rem;
`;

const ActionContainer = styled.div`
    display: flex;
    align-items: center;
    width: 100%;
    min-height: 9rem;
    background: ${COLORS.lightGray};
    border-radius: 0.5rem;
    cursor: pointer;
    padding: 1.2rem 2.4rem;
`;

const IconContainer = styled.div`
    ${flexAllCenter};
    height: 4.8rem;
    width: 4.8rem;
    min-width: 4.8rem;
    border-radius: 1rem;
    background-color: ${COLORS.white};
    margin-right: 3.1rem;
`;

const ActionMain = styled.div`
    display: flex;
    flex-direction: column;
    margin-right: 1.6rem;
`;

const ActionName = styled.div`
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.paragraphText};
`;

const ActionDescription = styled.div`
    font-size: 1.4rem;
    line-height: 2rem;
    color: ${COLORS.grayText};
`;

const StellarLogo = styled(Stellar)`
    height: 3.2rem;
    min-width: 3.2rem;
`;

const ArrowRightIcon = styled(ArrowRight)`
    margin-left: auto;
    min-width: 1.6rem;

    path {
        fill: ${COLORS.descriptionText};
    }
`;

const CopyIcon = styled(Copy)`
    margin-left: auto;
    min-width: 1.6rem;

    path {
        fill: ${COLORS.descriptionText};
    }
`;

const CopyStyled = styled(CopyButton)`
    width: 100%;
`;

const SignWithPublic = ({ params }: ModalProps<{ xdr: string; account: AccountService }>) => {
    const { xdr, account } = params;
    const accountId = account.accountId();
    const [federation, setFederation] = useState(null);

    useEffect(() => {
        if (!account.home_domain) {
            return;
        }
        StellarService.resolveFederation(account.home_domain, accountId).then((res) => {
            setFederation(res);
        });
    }, []);

    return (
        <Container>
            <AccountBlock accountId={accountId} federation={federation} />
            <Title>Sign with Stellar Laboratory</Title>
            <ModalDescription>
                Please continue and submit transaction with Stellar Laboratory using one of the
                supported methods (Ledger, Trezor, Freighter, Albedo or secret key).
            </ModalDescription>
            <a
                href={`https://laboratory.stellar.org/#txsigner?xdr=${encodeURIComponent(
                    xdr,
                )}&network=public`}
                rel="noreferrer noopener"
                target="_blank"
            >
                <ActionContainer>
                    <IconContainer>
                        <StellarLogo />
                    </IconContainer>
                    <ActionMain>
                        <ActionName>Stellar Laboratory</ActionName>
                        <ActionDescription>
                            Review and finalize the transaction in the Stellar Laboratory
                        </ActionDescription>
                    </ActionMain>
                    <ArrowRightIcon />
                </ActionContainer>
            </a>

            <CopyStyled text={xdr} withoutLogo>
                <ActionContainer>
                    <IconContainer>
                        <XdrLogo />
                    </IconContainer>
                    <ActionMain>
                        <ActionName>Copy XDR</ActionName>
                        <ActionDescription>
                            Copy transaction XDR and paste into Stellar Laboratory or other wallet
                        </ActionDescription>
                    </ActionMain>
                    <CopyIcon />
                </ActionContainer>
            </CopyStyled>
        </Container>
    );
};

export default SignWithPublic;
