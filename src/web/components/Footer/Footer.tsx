import styled from 'styled-components';

import { AQUA_NETWORK_URL } from 'constants/urls';

import AquaLogo from 'assets/icons/aqua-logo.svg';

import { commonMaxWidth, respondDown } from '../../../common/mixins';
import { Breakpoints, COLORS } from '../../../common/styles';

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
`;

const CopyrightLine = styled(HelpfulLine)`
    padding-top: 3rem;
    padding-bottom: 5rem;
    box-sizing: border-box;
    font-size: 1.2rem;
    line-height: 180%;
    color: ${COLORS.descriptionText};

    ${respondDown(Breakpoints.md)`
        flex-direction: column-reverse;
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

const Footer = (): JSX.Element => (
    <FooterBlock>
        <HelpfulLine>
            <a href={AQUA_NETWORK_URL} target="_blank" rel="noreferrer noopener">
                <Aqua />
            </a>
        </HelpfulLine>
        <CopyrightLine>
            <div>© {new Date().getFullYear()} aqua.network</div>
            <div>
                Aquarius runs on Stellar. AQUA tokens are issued on Stellar. The project is
                unaffiliated with the Stellar Development Foundation.
            </div>
        </CopyrightLine>
    </FooterBlock>
);

export default Footer;
