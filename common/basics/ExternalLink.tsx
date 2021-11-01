import * as React from 'react';
import styled from 'styled-components';
import { COLORS } from '../styles';
import LinkArrowIcon from '../assets/img/icon-link-arrow.svg';

const LinkBody = styled.a`
    display: flex;
    flex-direction: row;
    align-items: center;
    color: ${COLORS.purple};
    font-size: 1.6rem;
    line-height: 2.8rem;
    cursor: pointer;
    text-decoration: none;
`;

const LinkArrow = styled(LinkArrowIcon)`
    margin-left: 1rem;
`;

interface ExternalLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    children: string | JSX.Element;
}

const ExternalLink = ({ children, ...props }: ExternalLinkProps): JSX.Element => {
    return (
        <LinkBody {...props}>
            {children}
            <LinkArrow />
        </LinkBody>
    );
};

export default ExternalLink;
