import * as React from 'react';
import { useState } from 'react';
import Tooltip, { TOOLTIP_POSITION } from '../../../../../common/basics/Tooltip';
import { formatBalance, roundToPrecision } from '../../../../../common/helpers/helpers';
import styled from 'styled-components';
import { Breakpoints, COLORS } from '../../../../../common/styles';
import { flexAllCenter, flexRowSpaceBetween, respondDown } from '../../../../../common/mixins';
import { PairStats, TotalStats } from '../../../../api/types';
import InfoIcon from '../../../../../common/assets/img/icon-info.svg';
import IconUp from '../../../../../common/assets/img/icon-up-percent.svg';
import IconDown from '../../../../../common/assets/img/icon-down-percent.svg';

const TooltipStyled = styled(Tooltip)`
    label {
        display: none;
    }

    ${respondDown(Breakpoints.md)`
          width: 100%;
          ${flexRowSpaceBetween};
          align-items: flex-start;
          margin-bottom: 1.6rem;
          
          label {
              display: block;
           }
      `}
`;

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
         flex: 1;
    `}
`;

const Percent = styled.div<{ isBoosted: boolean }>`
    color: ${({ isBoosted }) => (isBoosted ? COLORS.green : COLORS.grayText)};
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

const PercentMobile = styled.span<{ isBoosted: boolean }>`
    color: ${({ isBoosted }) => (isBoosted ? COLORS.green : COLORS.grayText)};

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

const TooltipPercents = styled.div`
    display: flex;
    align-items: center;

    span:first-child {
        margin-right: 0;
    }
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

    return (
        <TooltipStyled
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
                    <TooltipRow>
                        <span>% of votes:</span>
                        <TooltipPercents>
                            <span>{percentValue}</span>
                            {boosted ? <IconUp /> : <IconDown />}
                            <span>{percentBoostedValue}</span>
                        </TooltipPercents>
                    </TooltipRow>
                </TooltipWrap>
            }
            position={TOOLTIP_POSITION.top}
            isShow={showTooltip}
        >
            <label
                onMouseEnter={() => {
                    setShowTooltip(true);
                }}
                onMouseLeave={() => {
                    setShowTooltip(false);
                }}
            >
                AQUA Voted:
            </label>
            <Amount
                onMouseEnter={() => {
                    setShowTooltip(true);
                }}
                onMouseLeave={() => {
                    setShowTooltip(false);
                }}
            >
                <AmountRow>
                    {pair.votes_value ? `${formatBalance(+pair.votes_value, true)} AQUA` : null}
                    <Percents>
                        <PercentMobile isBoosted={boosted}>{percentBoostedValue}</PercentMobile>
                    </Percents>
                    <Info />
                </AmountRow>

                <Percent isBoosted={boosted}>{percentBoostedValue}</Percent>
            </Amount>
        </TooltipStyled>
    );
};

export default VoteAmount;
