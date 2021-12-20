import * as React from 'react';
import Tooltip, { TOOLTIP_POSITION } from '../../../../../common/basics/Tooltip';
import { formatBalance, roundToPrecision } from '../../../../../common/helpers/helpers';
import styled from 'styled-components';
import { COLORS } from '../../../../../common/styles';
import { flexAllCenter } from '../../../../../common/mixins';
import { useState } from 'react';
import { PairStats, TotalStats } from '../../../../api/types';
import InfoIcon from '../../../../../common/assets/img/icon-info.svg';

const Info = styled(InfoIcon)`
    margin-left: 0.5rem;
`;

const Amount = styled.div`
    display: flex;
    flex-direction: column;
`;

const Percent = styled.div`
    color: ${COLORS.grayText};
    font-size: 1.4rem;
    line-height: 2rem;
`;

const AmountRow = styled.div`
    ${flexAllCenter};
    cursor: help;
`;

const TooltipWrap = styled.div`
    display: flex;
    flex-direction: column;
`;

const TooltipRow = styled.div`
    color: ${COLORS.white};
    font-size: 1.4rem;
`;

const getPercent = (value: string, total: string): string => {
    if (Number(value) < 0) {
        return '0';
    }
    return roundToPrecision((Number(value) / Number(total)) * 100, 2);
};

const VoteAmount = ({ pair, totalStats }: { pair: PairStats; totalStats: TotalStats }) => {
    const [showTooltip, setShowTooltip] = useState(false);
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
                            upvotes: {formatBalance(+pair.upvote_value, true)} AQUA
                        </TooltipRow>
                        <TooltipRow>
                            downvotes: {formatBalance(+pair.downvote_value, true)} AQUA
                        </TooltipRow>
                    </TooltipWrap>
                }
                position={TOOLTIP_POSITION.top}
                isShow={showTooltip}
            >
                <AmountRow>
                    {pair.votes_value ? `${formatBalance(+pair.votes_value, true)} AQUA` : null}
                    <Info />
                </AmountRow>
            </Tooltip>

            <Percent>
                {pair.votes_value
                    ? `${getPercent(pair.votes_value, totalStats.votes_value_sum)}%`
                    : null}
            </Percent>
        </Amount>
    );
};

export default VoteAmount;
