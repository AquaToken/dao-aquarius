import * as React from 'react';
import styled from 'styled-components';

import Tooltip from 'basics/Tooltip';

import { flexAllCenter, respondDown } from 'styles/mixins';
import { Breakpoints, COLORS } from 'styles/style-constants';

const Container = styled.a`
    border-radius: 1.6rem;
    background-color: ${COLORS.gray50};
    width: 7.2rem;
    height: 6rem;
    ${flexAllCenter};
`;

const TooltipStyled = styled(Tooltip)`
    &:not(:last-child) {
        margin-right: 1.6rem;
    }

    ${respondDown(Breakpoints.md)`
        &:not(:last-child) {
            margin-right: 0;
        }
    `}
`;

interface Props {
    children: React.ReactNode;
    href: string;
    label: string;
}

const AquaLink = ({ children, href, label }: Props) => (
    <TooltipStyled content={label} showOnHover>
        <Container href={href} target="_blank">
            {children}
        </Container>
    </TooltipStyled>
);

export default AquaLink;
