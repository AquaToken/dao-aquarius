import * as React from 'react';
import styled, { css } from 'styled-components';

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

    ${respondDown(Breakpoints.xs)`
        margin-top: 2.4rem;
        padding: 0 1.6rem;
    `}
`;

const HelpfulLine = styled.div`
    display: flex;
    justify-content: space-between;
    width: 100%;
    align-items: center;
    
    ${respondDown(Breakpoints.xs)`
        flex-direction: column;
        align-items: flex-start;
    `}}
`;

const CopyrightLine = styled(HelpfulLine)`
    padding-top: 3rem;
    padding-bottom: 5rem;
    box-sizing: border-box;
    font-size: 1.2rem;
    line-height: 180%;
    color: ${COLORS.descriptionText};

    div:last-child {
        text-align: right;

        a {
            color: ${COLORS.purple};
            text-decoration: none;
        }
    }

    ${respondDown(Breakpoints.md)`
        align-items: flex-start;
        flex-direction: column;
        padding-top: 1.6rem;
        padding-bottom: 2.4rem;
        gap: 1.6rem;
        
        div:last-child {
            text-align: unset;
        }
   `}
`;

const Aqua = styled(AquaLogo)`
    height: 4.4rem;

    ${respondDown(Breakpoints.xs)`
       height: 3.4rem;
    `}
`;

const Links = styled.div`
    display: flex;
    gap: 0.8rem;

    ${respondDown(Breakpoints.xs)`
        margin-top: 1.6rem;
    `}
`;

const linkStyles = css`
    ${flexAllCenter};
    border-radius: 0.5rem;
    background: ${COLORS.lightGray};
    padding: 1.2rem 1.6rem;
    text-decoration: none;
    color: ${COLORS.descriptionText};
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
        span {
            display: none;
        }
    `}
`;

const DocsLink = styled.a`
    ${linkStyles};
`;

const Footer = (): React.ReactNode => (
    <FooterBlock>
        <HelpfulLine>
            <a href={AQUA_NETWORK_URL} target="_blank" rel="noreferrer noopener">
                <Aqua />
            </a>
            <Links>
                <DocsLink href="https://docs.aqua.network/" target="_blank">
                    <Docs />
                    Aquarius docs
                </DocsLink>
            </Links>
        </HelpfulLine>
        <CopyrightLine>
            <div>
                Aquarius runs on Stellar. AQUA tokens are issued on Stellar.
                <br />
                The project is unaffiliated with the Stellar Development Foundation.
            </div>
            <div>
                For exchanges: <a href="mailto:listings@aqua.network">listings@aqua.network</a>
                <br />© {new Date().getFullYear()} aqua.network
            </div>
        </CopyrightLine>
    </FooterBlock>
);

export default Footer;
