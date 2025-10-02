import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';

import { MAIL_AQUA_LISTINGS } from 'constants/emails';
import { MainRoutes } from 'constants/routes';
import { AQUA_DOCS_AUDIT, AQUA_DOCS_URL } from 'constants/urls';

import { normalizePath } from 'helpers/url';

import { commonSectionPaddings, flexAllCenter, respondDown } from 'web/mixins';
import { Breakpoints, COLORS, MAX_WIDTHS } from 'web/styles';

import AquaLogo from 'assets/aqua/aqua-logo-text.svg';
import Audit from 'assets/icons/objects/icon-audit-16.svg';
import Docs from 'assets/icons/objects/icon-docs-16x17.svg';
import Dune from 'assets/orgs/duneLogoCircle.svg';

import { BlankRouterLink } from 'basics/links';

const FooterBlock = styled.footer`
    ${commonSectionPaddings};
    display: flex;
    justify-content: center;
    align-items: center;
    height: 16rem;
    margin: 5.4rem 0 4.8rem 0;

    ${respondDown(Breakpoints.xl)`
        margin: 3.6rem 0 3rem 0;
    `}

    ${respondDown(Breakpoints.md)`
        height: auto;
        margin: 3.6rem 0 3rem 0;
    `}

    ${respondDown(Breakpoints.sm)`
        margin: 3.6rem 0 3rem 0;
    `}

    ${respondDown(Breakpoints.xs)`
        margin: 3.6rem 0 3.6rem 0;
    `}
`;

const Wrapper = styled.div<{ $isWide: boolean }>`
    max-width: ${props => (props.$isWide ? MAX_WIDTHS.wide : MAX_WIDTHS.common)};
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
    color: ${COLORS.textDark};
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
    color: ${COLORS.textDark};
`;

const ExchangesAndCopyright = styled.div`
    font-size: 1.2rem;
    line-height: 180%;
    color: ${COLORS.textDark};
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
    color: ${COLORS.purple500};
    text-decoration: none;
`;

const MailLink = styled.a`
    font-size: 1.2rem;
    line-height: 180%;
    color: ${COLORS.purple500};
    text-decoration: none;
`;

const DocsLink = styled.a`
    ${flexAllCenter};
    border-radius: 0.5rem;
    background: ${COLORS.gray50};
    padding: 1.2rem 1.6rem;
    text-decoration: none;
    color: ${COLORS.textDark};
    white-space: nowrap;

    span {
        margin-left: 0.3rem;
    }

    svg {
        margin-right: 0.5rem;
    }

    ${respondDown(Breakpoints.md)`
        background: ${COLORS.gray100};
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

const WIDE_PAGES = [
    MainRoutes.bribes,
    MainRoutes.vote,
    MainRoutes.locker,
    MainRoutes.governance,
    MainRoutes.market,
    MainRoutes.account,
    MainRoutes.amm,
    MainRoutes.terms,
    MainRoutes.privacy,
];

const PAGES_WITHOUT_FOOTER = [MainRoutes.swap, MainRoutes.locker];

const Footer = (): React.ReactNode => {
    const location = useLocation();

    if (PAGES_WITHOUT_FOOTER.some(page => location.pathname.startsWith(page))) {
        return null;
    }

    const isWidePage = WIDE_PAGES.includes(normalizePath(location.pathname) as MainRoutes);

    return (
        <FooterBlock>
            <Wrapper $isWide={isWidePage}>
                <LogoWithDesc>
                    <BlankRouterLink to={MainRoutes.main}>
                        <Aqua />
                    </BlankRouterLink>
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
                        <DocsLink href={AQUA_DOCS_URL} target="_blank">
                            <Docs />
                            Aquarius docs
                        </DocsLink>
                        <DocsLink href={AQUA_DOCS_AUDIT} target="_blank">
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
