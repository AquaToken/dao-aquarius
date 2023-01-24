import * as React from 'react';
import Tooltip, { TOOLTIP_POSITION } from '../../../../common/basics/Tooltip';
import styled from 'styled-components';
import { COLORS } from '../../../../common/styles';
import { useState } from 'react';
import { MIN_REWARDS_PERCENT } from '../MainPage/Table/Table';

const TooltipInner = styled.div`
    width: 28.8rem;
    white-space: pre-line;
    font-size: 1.4rem;
    line-height: 2rem;

    a {
        margin-left: 0.5rem;
    }
`;

const LabelWrap = styled.div`
    padding-top: 1rem;
    margin-top: -1rem;
`;

const Label = styled.div<{ isRed?: boolean; isGreen?: boolean }>`
    height: 1.6rem;
    padding: 0 0.4rem;
    border-radius: 0.3rem;
    background: ${({ isRed, isGreen }) => {
        if (isRed) {
            return COLORS.pinkRed;
        }
        if (isGreen) {
            return COLORS.green;
        }
        return COLORS.purple;
    }};
    color: ${COLORS.white};
    text-transform: uppercase;
    font-weight: 500;
    font-size: 0.8rem;
    line-height: 1.8rem;
    margin-right: 1rem;
    cursor: help;
`;

export const BoostLabel = () => {
    const [showTooltip, setShowTooltip] = useState(false);
    return (
        <Tooltip
            content={
                <TooltipInner
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                >
                    25% boost for markets paired with AQUA, up until 5% of adjusted votes.
                </TooltipInner>
            }
            position={TOOLTIP_POSITION.top}
            isShow={showTooltip}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            isSuccess
        >
            <LabelWrap>
                <Label isGreen>boost</Label>
            </LabelWrap>
        </Tooltip>
    );
};

export const RewardLabel = () => {
    const [showTooltip, setShowTooltip] = useState(false);

    return (
        <Tooltip
            content={
                <TooltipInner>
                    Any market with at least {MIN_REWARDS_PERCENT}% of the total AQUA votes is
                    placed into the reward zone and will get rewards after the next rewards update.
                </TooltipInner>
            }
            position={TOOLTIP_POSITION.top}
            isShow={showTooltip}
        >
            <Label
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
            >
                reward zone
            </Label>
        </Tooltip>
    );
};

export const AuthRequiredLabel = () => {
    const [showTooltip, setShowTooltip] = useState(false);

    return (
        <Tooltip
            content={
                <TooltipInner
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                >
                    “Authorization required” flag is enabled for one asset from the pair. With this
                    flag set, an issuer can grant a limited permissions to transact with its asset.
                    <a
                        rel="noopener noreferrer"
                        target="_blank"
                        href="https://developers.stellar.org/docs/glossary/accounts/#flags"
                    >
                        More details.
                    </a>
                </TooltipInner>
            }
            position={TOOLTIP_POSITION.top}
            isShow={showTooltip}
            isError
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            <LabelWrap>
                <Label isRed>auth required</Label>
            </LabelWrap>
        </Tooltip>
    );
};

export const NoLiquidityLabel = () => {
    const [showTooltip, setShowTooltip] = useState(false);

    return (
        <Tooltip
            content={
                <TooltipInner
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                >
                    This market pair is not eligible for AQUA rewards at the moment, as it failed
                    the liquidity test (no path payment from XLM).
                </TooltipInner>
            }
            position={TOOLTIP_POSITION.top}
            isShow={showTooltip}
            isError
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            <LabelWrap>
                <Label isRed>no liquidity</Label>
            </LabelWrap>
        </Tooltip>
    );
};
