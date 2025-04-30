import * as React from 'react';
import { Link } from 'react-router-dom';
import styled, { css } from 'styled-components';

import { COLORS } from 'web/styles';

import LinkArrowIcon from 'assets/icon-link-arrow.svg';

const styles = css`
    display: flex;
    flex-direction: row;
    align-items: center;
    color: ${COLORS.purple};
    font-size: 1.6rem;
    line-height: 2.8rem;
    cursor: pointer;
    text-decoration: none;
    white-space: nowrap;
`;

const LinkBody = styled.a`
    ${styles};
`;

const LinkStyled = styled(Link)`
    ${styles};
`;

const LinkBodyDiv = styled.div`
    ${styles};

    a {
        text-decoration: none;
    }
`;

const LinkArrow = styled(LinkArrowIcon)`
    margin-left: 1rem;
`;

interface ExternalLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement & HTMLDivElement> {
    children: string | React.ReactNode;
    asDiv?: boolean;
    to?: string;
}

const ExternalLink = ({ children, asDiv, to, ...props }: ExternalLinkProps): React.ReactNode => {
    if (asDiv) {
        return (
            <LinkBodyDiv {...props}>
                {children}
                <LinkArrow />
            </LinkBodyDiv>
        );
    }

    if (to) {
        return (
            <LinkStyled to={to}>
                {children}
                <LinkArrow />
            </LinkStyled>
        );
    }
    return (
        <LinkBody {...props} target="_blank" rel="noreferrer noopener">
            {children}
            <LinkArrow />
        </LinkBody>
    );
};

export default ExternalLink;
