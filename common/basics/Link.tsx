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
`;

const LinkArrow = styled(LinkArrowIcon)`
    margin-left: 1rem;
`;

const Link = ({ children }: { children: JSX.Element | string }): JSX.Element => {
    return (
        <LinkBody>
            {children}
            <LinkArrow />
        </LinkBody>
    );
};

export default Link;
