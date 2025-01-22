import * as React from 'react';
import { useState } from 'react';
import styled from 'styled-components';

import { cardBoxShadow, respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import Arrow from 'assets/icon-arrow-down.svg';

import { linkStyles, WithCountStyles } from 'components/Header/Header';

const Menu = styled.div`
    position: relative;
    padding: 0 2.4rem;
`;

const MenuHead = styled.div`
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.8rem;
    padding: 0.2rem;

    ${respondDown(Breakpoints.md)`
        display: none;
    `}
`;

const MenuHeadTitle = styled.div<{ count: number }>`
    ${({ count }) => Boolean(count) && WithCountStyles};
    ${linkStyles};
    font-size: 1.6rem;
    color: ${COLORS.titleText};
`;

const MenuLinks = styled.div<{ $isOpen: boolean }>`
    ${cardBoxShadow};
    display: ${({ $isOpen }) => ($isOpen ? 'flex' : 'none')};
    flex-direction: column;
    position: absolute;
    background: ${COLORS.white};
    padding: 2.4rem;
    left: 0;
    border-radius: 0.5rem;

    a {
        width: fit-content;

        &:not(:last-child) {
            margin: 0 0 1.2rem 0 !important;
        }
    }

    ${respondDown(Breakpoints.md)`
        display: flex;
        position: relative;
        box-shadow: unset;
        align-items: center;
        
        a:not(:last-child) {
            margin-bottom: 2.4rem!important;
        }
    `}
`;

interface Props {
    links: React.ReactNode;
    title: string;
    count?: number;
}

const ExpandedMenu = ({ links, title, count }: Props): React.ReactNode => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <Menu onMouseEnter={() => setIsOpen(true)} onMouseLeave={() => setIsOpen(false)}>
            <MenuHead>
                <MenuHeadTitle count={count}>{title}</MenuHeadTitle>
                <Arrow />
            </MenuHead>
            <MenuLinks $isOpen={isOpen}>{links}</MenuLinks>
        </Menu>
    );
};

export default ExpandedMenu;
