import { Link, useLocation } from 'react-router-dom';
import styled, { css } from 'styled-components';

import { MainRoutes } from 'constants/routes';

import { flexAllCenter, respondDown } from 'web/mixins';
import { Breakpoints, COLORS, MAX_WIDTHS } from 'web/styles';

import AquaLogo from 'assets/aqua-logo.svg';
import Audit from 'assets/audit.svg';
import Dune from 'assets/DuneLogoCircle.svg';
import Docs from 'assets/icon-docs.svg';
import { MAIL_AQUA_LISTINGS } from 'constants/emails';

const FooterBlock = styled.footer`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 16rem;
    margin: 5.4rem 2.4rem 4.8rem 2.4rem;

    ${respondDown(Breakpoints.lg)`
        margin: 3.6rem 2.4rem 3rem 2.4rem;
    `}

    ${respondDown(Breakpoints.md)`
        height: auto;
        margin: 3.6rem 2.4rem 3rem 2.4rem;
    `}

    ${respondDown(Breakpoints.sm)`
        margin: 3.6rem 0.8rem 3rem 0.8rem;
    `}
`;

const Wrapper = styled.div<{ $isMainPage: boolean }>`
    max-width: ${props => (props.$isMainPage ? MAX_WIDTHS.mainPage : MAX_WIDTHS.common)};
    display: flex;
    gap: 3.2rem;
    width: 100%;

    ${respondDown(Breakpoints.sm)`
        flex-direction: column;
        gap: 2.4rem;
    `}
`;

const LogoWithDesc = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    line-height: 180%;
    flex: 1;

    ${respondDown(Breakpoints.xs)`
        padding: 0 0.8rem;
    `}
`;

const Description = styled.div`
    font-size: 1.4rem;
    color: ${COLORS.darkGrayText};
    margin-top: 3.2rem;

    ${respondDown(Breakpoints.sm)`
        margin-top: 2.4rem;
    `}
`;

const LinksAndCopyright = styled.div`
    display: flex;
    flex-direction: column;
    align-items: end;
    line-height: 180%;
    flex: 1;
    color: ${COLORS.darkGrayText};
`;

const ExchangesAndCopyright = styled.div`
    font-size: 1.2rem;
    line-height: 180%;
    color: ${COLORS.darkGrayText};
    text-decoration: none;
    height: 100%;
    display: flex;
    align-items: end;
    justify-content: center;
    flex-direction: column;

    ${respondDown(Breakpoints.sm)`
        padding: 0 0.8rem;
        flex-direction: row-reverse;
        justify-content: space-between;
        width: 100%;
        margin-top: 2.4rem;
    `}

    ${respondDown(Breakpoints.xs)`
        flex-direction: column;
        align-items: start;
        gap: 0.8rem;
    `}
`;

const Exchanges = styled.span``;

const Aqua = styled(AquaLogo)`
    height: 3.8rem;
`;

const LogoLink = styled(Link)`
    width: fit-content;
`;

const DocLinks = styled.div`
    display: flex;
    justify-content: space-between;
    gap: 0.8rem;

    ${respondDown(Breakpoints.sm)`
        width: 100%;
    `}

    ${respondDown(Breakpoints.xs)`
        width: 100%;
        flex-direction: column;
    `}
`;

const AquaLinks = styled.div`
    display: flex;
    gap: 1.6rem;
    margin-top: 1.2rem;

    ${respondDown(Breakpoints.sm)`
        padding: 0 0.8rem;
    `}
`;

const AquaLink = styled(Link)`
    font-size: 1.2rem;
    line-height: 180%;
    color: ${COLORS.purple};
    text-decoration: none;
`;

const MailLink = styled.a`
    font-size: 1.2rem;
    line-height: 180%;
    color: ${COLORS.purple};
    text-decoration: none;
`;

const DocsLink = styled.a`
    ${flexAllCenter};
    border-radius: 0.5rem;
    background: ${COLORS.lightGray};
    padding: 1.2rem 1.6rem;
    text-decoration: none;
    color: ${COLORS.darkGrayText};
    white-space: nowrap;

    span {
        margin-left: 0.3rem;
    }

    svg {
        margin-right: 0.5rem;
    }

    ${respondDown(Breakpoints.md)`
        background: ${COLORS.gray};
    `}

    ${respondDown(Breakpoints.sm)`
        flex: 1;
        span {
            display: none;
        }
    `}
`;

const DuneLogo = styled(Dune)`
    height: 1.6rem;
    width: 1.6rem;
    overflow: visible;
`;

const Footer = (): React.ReactNode => {
    const location = useLocation();

    if (location.pathname.startsWith(MainRoutes.swap)) {
        return null;
    }

    const isMainPage = location.pathname === MainRoutes.main;

    return (
        <FooterBlock>
            <Wrapper $isMainPage={isMainPage}>
                <LogoWithDesc>
                    <LogoLink to={MainRoutes.main}>
                        <Aqua />
                    </LogoLink>
                    <Description>
                        Aquarius runs on Stellar. AQUA tokens are issued on Stellar. <br />
                        The project is unaffiliated with the Stellar Development Foundation.
                    </Description>
                    <AquaLinks>
                        <AquaLink to={MainRoutes.terms}>Terms of use</AquaLink>
                        <AquaLink to={MainRoutes.privacy}>Privacy policy</AquaLink>
                    </AquaLinks>
                </LogoWithDesc>
                <LinksAndCopyright>
                    <DocLinks>
                        <DocsLink href="https://dune.com/fergmolina/aquarius" target="_blank">
                            <DuneLogo />
                            Dune dashboard
                        </DocsLink>
                        <DocsLink href="https://docs.aqua.network/" target="_blank">
                            <Docs />
                            Aquarius docs
                        </DocsLink>
                        <DocsLink
                            href="https://docs.aqua.network/technical-documents/audits"
                            target="_blank"
                        >
                            <Audit />
                            Audits
                        </DocsLink>
                    </DocLinks>
                    <ExchangesAndCopyright>
                        <Exchanges>
                            For exchanges:{' '}
                            <MailLink
                                href={`mailto:${MAIL_AQUA_LISTINGS}`}
                                target="_blank"
                                rel="noreferrer noopener"
                            >
                                {MAIL_AQUA_LISTINGS}
                            </MailLink>
                        </Exchanges>
                        <span>© {new Date().getFullYear()} aqua.network</span>
                    </ExchangesAndCopyright>
                </LinksAndCopyright>
            </Wrapper>
        </FooterBlock>
    );
};

export default Footer;
