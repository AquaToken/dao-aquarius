import * as React from 'react';
import styled from 'styled-components';

import { COLORS } from 'web/styles';

import LinkArrowIcon from 'assets/icon-link-arrow.svg';

const LinkBody = styled.a`
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

const LinkBodyDiv = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    color: ${COLORS.purple};
    font-size: 1.6rem;
    line-height: 2.8rem;
    cursor: pointer;
    text-decoration: none;
    white-space: nowrap;

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
}

const ExternalLink = ({ children, asDiv, ...props }: ExternalLinkProps): React.ReactNode => {
    if (asDiv) {
        return (
            <LinkBodyDiv {...props}>
                {children}
                <LinkArrow />
            </LinkBodyDiv>
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
