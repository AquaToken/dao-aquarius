import * as React from 'react';
import styled from 'styled-components';

import { useActiveAnchorIndex } from 'hooks/useIsOnViewport';

import { cardBoxShadow, contentWithSidebar, respondDown } from 'styles/mixins';
import { Breakpoints, COLORS } from 'styles/style-constants';

const NavPanel = styled.div`
    ${contentWithSidebar};
    padding-left: 4rem;
    display: flex;
    width: 100%;
    z-index: 101;
    top: 0;
    position: sticky;

    ${respondDown(Breakpoints.md)`
         display: none;
    `}
`;

const NavBackground = styled.div`
    display: flex;
    width: 100%;
    background: ${COLORS.white};
    border-radius: 0.5rem;
    padding: 2.4rem;
    ${cardBoxShadow};
`;

const NavItem = styled.div<{ $active?: boolean }>`
    color: ${({ $active }) => ($active ? COLORS.purple500 : COLORS.textGray)};
    font-weight: ${({ $active }) => ($active ? 700 : 400)};
    border-bottom: ${({ $active }) =>
        $active ? `0.1rem solid ${COLORS.purple500} ` : `0.1rem solid ${COLORS.transparent}`};
    cursor: pointer;
    padding: 0.8rem;

    &:hover {
        border-bottom: 0.1rem solid ${COLORS.purple500};
        color: ${COLORS.purple500};
    }

    &:not(:last-child) {
        margin-right: 1.2rem;
    }
`;

type PageAnchor = {
    title: string;
    ref: React.RefObject<HTMLElement>;
};

const SCROLL_OFFSET = 70;
const OVERSCROLL_OFFSET = 10;

const PageNavigation = ({ anchors }: { anchors: PageAnchor[] }): React.ReactNode => {
    const scrollToRef = (ref: React.RefObject<HTMLElement>) => {
        const elementPosition =
            (ref.current?.getBoundingClientRect().top || 0) + document.body.scrollTop;
        const offsetPosition = elementPosition - SCROLL_OFFSET;

        document.body.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    };

    const activeIndex = useActiveAnchorIndex(
        anchors.map(({ ref }) => ref),
        OVERSCROLL_OFFSET + SCROLL_OFFSET,
    );

    return (
        <NavPanel>
            <NavBackground>
                {anchors.map((anchor, index) => (
                    <NavItem
                        key={anchor.title}
                        onClick={() => scrollToRef(anchor.ref)}
                        $active={index === activeIndex}
                    >
                        {anchor.title}
                    </NavItem>
                ))}
            </NavBackground>
        </NavPanel>
    );
};

export default PageNavigation;
