import * as React from 'react';
import { useCallback, useState } from 'react';
import Tooltip, { TOOLTIP_POSITION } from '../../../../common/basics/Tooltip';
import styled from 'styled-components';
import { Breakpoints, COLORS } from '../../../../common/styles';
import { MAX_REWARDS_PERCENT, MIN_REWARDS_PERCENT } from '../MainPage/Table/Table';
import { respondDown } from '../../../../common/mixins';

const TooltipInner = styled.div`
    width: 28.8rem;
    white-space: pre-line;
    font-size: 1.4rem;
    line-height: 2rem;

    a {
        margin-left: 0.5rem;
    }

    ${respondDown(Breakpoints.md)`
        width: 20rem;
    `}
`;

const LabelWrap = styled.div`
    padding-top: 1rem;
    margin-top: -1rem;
`;

const Label = styled.div<{ isRed?: boolean; isGreen?: boolean; isDark?: boolean }>`
    height: 1.6rem;
    padding: 0 0.4rem;
    border-radius: 0.3rem;
    background: ${({ isRed, isGreen, isDark }) => {
        if (isRed) {
            return COLORS.pinkRed;
        }
        if (isGreen) {
            return COLORS.green;
        }
        if (isDark) {
            return COLORS.titleText;
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

const LabelComponent = ({
    title,
    text,
    isGreen,
    isRed,
    isDark,
}: {
    title: string;
    text: string | React.ReactNode;
    isGreen?: boolean;
    isRed?: boolean;
    isDark?: boolean;
}) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const [isEnoughSpaceOnTop, setIsEnoughSpaceOnTop] = useState(true);

    const ref = useCallback(
        (node) => {
            if (node !== null && isEnoughSpaceOnTop) {
                setIsEnoughSpaceOnTop(node.getBoundingClientRect().left > 0);
            }
        },
        [isEnoughSpaceOnTop],
    );

    return (
        <Tooltip
            content={<TooltipInner ref={ref}>{text}</TooltipInner>}
            position={isEnoughSpaceOnTop ? TOOLTIP_POSITION.top : TOOLTIP_POSITION.right}
            isShow={showTooltip}
            isSuccess={isGreen}
            isError={isRed}
            isDark={isDark}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            <LabelWrap>
                <Label isGreen={isGreen} isRed={isRed} isDark={isDark}>
                    {title}
                </Label>
            </LabelWrap>
        </Tooltip>
    );
};

export const BoostLabel = () => {
    return (
        <LabelComponent
            title={'boost'}
            text={'25% boost for markets paired with AQUA, up until 5% of adjusted votes.'}
            isGreen
        />
    );
};

export const RewardLabel = () => {
    return (
        <LabelComponent
            title={'reward zone'}
            text={`Any market with at least ${MIN_REWARDS_PERCENT}% of the total AQUA votes is placed into the reward zone and will get rewards after the next rewards update.`}
        />
    );
};

export const AuthRequiredLabel = () => {
    return (
        <LabelComponent
            title={'auth required'}
            text={
                <span>
                    “Authorization required” flag is enabled for one asset from the pair. With this
                    flag set, an issuer can grant a limited permissions to transact with its asset.
                    <a
                        rel="noopener noreferrer"
                        target="_blank"
                        href="https://developers.stellar.org/docs/glossary/accounts/#flags"
                    >
                        More details.
                    </a>
                </span>
            }
            isRed
        />
    );
};

export const NoLiquidityLabel = () => {
    return (
        <LabelComponent
            title={'no liquidity'}
            text={
                'This market pair is not eligible for AQUA rewards at the moment, as it failed the liquidity test (no path payment from XLM).'
            }
            isRed
        />
    );
};

export const MaxRewardsLabel = () => {
    return (
        <LabelComponent
            title={'MAX REWARDS'}
            text={`Every market has a ${MAX_REWARDS_PERCENT}% maximum limit of total daily rewards. Any additional percentage points beyond this limit are distributed equally among all other markets in the reward zone.`}
            isDark
        />
    );
};
