import * as React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import AquaLogo from './../../assets/img/aqua-logo.svg';
import { COLORS } from '../../styles';
import { commonMaxWidth } from '../../mixins';

const FooterBlock = styled.footer`
    ${commonMaxWidth};
    margin: 8rem auto 0;
    padding: 0 4rem;
    flex: 0 0 auto;
    display: flex;
    flex-direction: column;
    width: 100%;
`;

const HelpfulLine = styled.div`
    display: flex;
    justify-content: space-between;
    width: 100%;
`;

const CopyrightLine = styled(HelpfulLine)`
    margin-top: 3rem;
    margin-bottom: 5rem;
    font-size: 1.2rem;
    line-height: 180%;
    color: ${COLORS.descriptionText};
`;

const Footer = (): JSX.Element => {
    return (
        <FooterBlock>
            <HelpfulLine>
                <Link to="/">
                    <AquaLogo />
                </Link>
            </HelpfulLine>
            <CopyrightLine>
                <div>© 2021 Aquarius.org Ultra Stellar, LLC.</div>
                <div>
                    Aquarius runs on Stellar. AQUA tokens are issued on Stellar. The project is
                    unaffiliated with the Stellar Development Foundation.
                </div>
            </CopyrightLine>
        </FooterBlock>
    );
};

export default Footer;
