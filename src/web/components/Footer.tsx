import styled from 'styled-components';

import { AQUA_NETWORK_URL } from 'constants/urls';

import { commonMaxWidth, flexAllCenter, respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import AquaLogo from 'assets/aqua-logo.svg';
import Docs from 'assets/icon-docs.svg';

const FooterBlock = styled.footer`
    ${commonMaxWidth};
    margin: 8rem auto 0;
    padding: 0 4rem;
    flex: 0 0 auto;
    display: flex;
    flex-direction: column;
    width: 100%;

    ${respondDown(Breakpoints.md)`
        margin-top: 2.4rem;
        padding: 0 1.6rem;
    `}
`;

const HelpfulLine = styled.div`
    display: flex;
    justify-content: space-between;
    width: 100%;
    align-items: center;
`;

const CopyrightLine = styled(HelpfulLine)`
    padding-top: 3rem;
    padding-bottom: 5rem;
    box-sizing: border-box;
    font-size: 1.2rem;
    line-height: 180%;
    color: ${COLORS.descriptionText};

    ${respondDown(Breakpoints.md)`
        align-items: flex-start;
        flex-direction: column;
        padding-top: 1.6rem;
        padding-bottom: 2.4rem;
        gap: 1.6rem;
   `}
`;

const Aqua = styled(AquaLogo)`
    height: 4.4rem;

    ${respondDown(Breakpoints.md)`
       height: 3.4rem;
    `}
`;

const DocsLink = styled.a`
    ${flexAllCenter};
    border-radius: 0.5rem;
    background: ${COLORS.lightGray};
    padding: 1.2rem 1.6rem;
    text-decoration: none;
    color: ${COLORS.descriptionText};
    svg {
        margin-right: 0.5rem;
    }
`;

const Footer = (): JSX.Element => (
    <FooterBlock>
        <HelpfulLine>
            <a href={AQUA_NETWORK_URL} target="_blank" rel="noreferrer noopener">
                <Aqua />
            </a>
            <DocsLink href="https://docs.aqua.network/" target="_blank">
                <Docs />
                Aquarius docs
            </DocsLink>
        </HelpfulLine>
        <CopyrightLine>
            <div>
                Aquarius runs on Stellar. AQUA tokens are issued on Stellar.
                <br />
                The project is unaffiliated with the Stellar Development Foundation.
            </div>
            <div>© {new Date().getFullYear()} aqua.network</div>
        </CopyrightLine>
    </FooterBlock>
);

export default Footer;
