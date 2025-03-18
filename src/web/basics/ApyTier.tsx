import * as React from 'react';
import styled from 'styled-components';

import Tooltip from 'basics/Tooltip';

interface Props {
    apyTier: number;
}

const Container = styled.div`
    display: flex;
`;

const TooltipInner = styled.span`
    font-size: 1.4rem;
    line-height: 2rem;
    width: 20rem;
    white-space: wrap;
    font-weight: 400;
`;

const ApyTier = ({ apyTier }: Props) => {
    if (!apyTier) {
        return null;
    }
    return (
        <Tooltip
            content={
                <TooltipInner>
                    The pool rating is based on Base and Rewards APY values combined. Pools that
                    generate most yield in fees and rewards have the highest rating.
                </TooltipInner>
            }
            showOnHover
        >
            <Container>
                {new Array(apyTier).fill('🔥').map((item, index) => (
                    <span key={index}>{item}</span>
                ))}
            </Container>
        </Tooltip>
    );
};

export default ApyTier;
