import * as React from 'react';
import { useState } from 'react';
import Tooltip, { TOOLTIP_POSITION } from '../../../../../common/basics/Tooltip';
import { formatBalance, roundToPrecision } from '../../../../../common/helpers/helpers';
import styled from 'styled-components';
import { Breakpoints, COLORS } from '../../../../../common/styles';
import { flexAllCenter, flexRowSpaceBetween, respondDown } from '../../../../../common/mixins';
import { PairStats, TotalStats } from '../../../../api/types';
import InfoIcon from '../../../../../common/assets/img/icon-info.svg';
import IconUp from '../../../../../common/assets/img/icon-up-green.svg';
import IconDown from '../../../../../common/assets/img/icon-down-red.svg';
import { MIN_REWARDS_PERCENT } from '../Table';

const Info = styled(InfoIcon)`
    margin-left: 0.5rem;

    ${respondDown(Breakpoints.md)`
        display: none;
    `}
`;

const Amount = styled.div`
    display: flex;
    flex-direction: column;

    ${respondDown(Breakpoints.md)`
         align-items: flex-end;
    `}
`;

const Percent = styled.div`
    color: ${COLORS.grayText};
    font-size: 1.4rem;
    line-height: 2rem;
    display: flex;

    ${respondDown(Breakpoints.md)`
        display: none;
    `}
`;

const Percents = styled.div`
    display: none;
    flex-direction: row;
    justify-content: flex-end;

    ${respondDown(Breakpoints.md)`
          display: flex;
    `}
`;

const PercentMobile = styled.span`
    color: ${COLORS.grayText};

    font-size: 1.2rem;
    line-height: 1.4rem;
    display: inline-block;
`;

const AmountRow = styled.div`
    ${flexAllCenter};
    cursor: help;

    ${respondDown(Breakpoints.md)`
        flex-direction: column;
        align-items: flex-end;
    `}
`;

const TooltipWrap = styled.div`
    display: flex;
    flex-direction: column;

    ${respondDown(Breakpoints.md)`
        max-width: 17rem;
        white-space: pre-line;
    `}
`;

const TooltipRow = styled.div`
    color: ${COLORS.white};
    font-size: 1.4rem;
    ${flexRowSpaceBetween};
    width: 100%;

    span:first-child {
        margin-right: 2rem;
    }
`;

const Boost = styled.div<{ isDown?: boolean }>`
    display: inline-flex;
    align-items: center;
    margin-left: 0.5rem;
    color: ${({ isDown }) => (isDown ? COLORS.pinkRed : COLORS.green)};

    ${respondDown(Breakpoints.md)`
        margin-left: 0;
    `}
`;

const getPercent = (value: string, total: string): string => {
    if (Number(value) < 0) {
        return '0';
    }
    return roundToPrecision((Number(value) / Number(total)) * 100, 2);
};

const VoteAmount = ({ pair, totalStats }: { pair: PairStats; totalStats: TotalStats }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    if (!pair.votes_value) {
        return null;
    }

    const boosted = Number(pair.adjusted_votes_value) > Number(pair.votes_value);
    const percentValue = pair.votes_value
        ? `${getPercent(pair.votes_value, totalStats.votes_value_sum)}%`
        : null;

    const percentBoostedValue = pair.adjusted_votes_value
        ? `${getPercent(pair.adjusted_votes_value, totalStats.adjusted_votes_value_sum)}%`
        : null;

    const downBoosted =
        Number(pair.votes_value) &&
        Number(pair.adjusted_votes_value) &&
        (Number(pair.votes_value) / Number(totalStats.votes_value_sum)) * 100 >=
            MIN_REWARDS_PERCENT &&
        (Number(pair.adjusted_votes_value) / Number(totalStats.adjusted_votes_value_sum)) * 100 <
            MIN_REWARDS_PERCENT;

    return (
        <Amount
            onMouseEnter={() => {
                setShowTooltip(true);
            }}
            onMouseLeave={() => {
                setShowTooltip(false);
            }}
        >
            <Tooltip
                content={
                    <TooltipWrap>
                        <TooltipRow>
                            <span>Upvotes:</span>
                            <span>{formatBalance(+pair.upvote_value, true)} AQUA</span>
                        </TooltipRow>
                        <TooltipRow>
                            <span>Downvotes:</span>
                            <span>{formatBalance(+pair.downvote_value, true)} AQUA</span>
                        </TooltipRow>
                    </TooltipWrap>
                }
                position={TOOLTIP_POSITION.top}
                isShow={showTooltip}
            >
                <AmountRow>
                    {pair.votes_value ? `${formatBalance(+pair.votes_value, true)} AQUA` : null}
                    <Percents>
                        <PercentMobile>{percentValue}</PercentMobile>
                        {boosted && (
                            <PercentMobile>
                                {
                                    <Boost>
                                        <IconUp />
                                        {percentBoostedValue}
                                    </Boost>
                                }
                            </PercentMobile>
                        )}
                        {downBoosted && (
                            <PercentMobile>
                                {
                                    <Boost isDown>
                                        <IconDown />
                                        {percentBoostedValue}
                                    </Boost>
                                }
                            </PercentMobile>
                        )}
                    </Percents>
                    <Info />
                </AmountRow>
            </Tooltip>

            <Percent>
                {percentValue}{' '}
                {boosted ? (
                    <Boost>
                        <IconUp />
                        {percentBoostedValue}
                    </Boost>
                ) : null}
                {downBoosted && (
                    <Boost isDown>
                        <IconDown />
                        {percentBoostedValue}
                    </Boost>
                )}
            </Percent>
        </Amount>
    );
};

export default VoteAmount;
