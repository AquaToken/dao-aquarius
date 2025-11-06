import styled from 'styled-components';

import { D_ICE_CODE, DOWN_ICE_CODE, ICE_ISSUER, UP_ICE_CODE } from 'constants/assets';

import { formatBalance, roundToPrecision } from 'helpers/format-number';

import IconDown from 'assets/icons/arrows/arrow-negative-16.svg';
import IconUp from 'assets/icons/arrows/arrow-positive-16.svg';
import InfoIcon from 'assets/icons/status/icon-info-16.svg';
import DIce from 'assets/tokens/dice-logo.svg';
import Ice from 'assets/tokens/ice-logo.svg';

import Tooltip, { TOOLTIP_POSITION } from 'basics/Tooltip';

import { flexAllCenter, flexRowSpaceBetween, respondDown } from 'styles/mixins';
import { Breakpoints, COLORS } from 'styles/style-constants';

import { PairStats, TotalStats } from 'pages/vote/api/types';

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

const InfoMobile = styled(InfoIcon)`
    margin-left: 0.5rem;
    margin-top: 0.6rem;
    display: none;

    ${respondDown(Breakpoints.md)`
        display: block;
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

const Percent = styled.div<{ $isBoosted: boolean }>`
    color: ${({ $isBoosted }) => ($isBoosted ? COLORS.green500 : COLORS.textGray)};
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

const PercentMobile = styled.span<{ $isBoosted: boolean }>`
    color: ${({ $isBoosted }) => ($isBoosted ? COLORS.green500 : COLORS.textGray)};

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
    color: ${COLORS.textGray};
    font-size: 1.4rem;
    line-height: 2rem;
    ${flexRowSpaceBetween};
    width: 100%;

    span:first-child {
        margin-right: 2rem;
    }
`;

const TooltipRowTitleFirst = styled.div`
    color: ${COLORS.textTertiary};
    font-size: 1.4rem;
    ${flexRowSpaceBetween};
    width: 100%;
    font-weight: 400;
    line-height: 2.8rem;

    span:first-child {
        margin-right: 2rem;
        font-weight: 400;
    }
`;

const TooltipRowTitle = styled(TooltipRowTitleFirst)`
    margin-top: 1.6rem;
`;

const TooltipPercents = styled.div`
    display: flex;
    align-items: center;

    span:first-child {
        margin-right: 0;
        color: ${COLORS.textGray};
    }
`;

const IceLogo = styled(Ice)`
    height: 1.8rem;
    width: 1.8rem;
    margin-right: 0.5rem;
`;

const DIceLogo = styled(DIce)`
    height: 1.8rem;
    width: 1.8rem;
    margin-right: 0.5rem;
`;

const TokenAmount = styled.div`
    ${flexAllCenter};
`;

export const getPercent = (value: string | number, total: string | number): string => {
    if (Number(value) < 0) {
        return '0';
    }
    return roundToPrecision((Number(value) / Number(total)) * 100, 2);
};

const VoteAmount = ({ pair, totalStats }: { pair: PairStats; totalStats: TotalStats }) => {
    if (!pair.votes_value) {
        return null;
    }

    const boosted = Number(pair.adjusted_votes_value) > Number(pair.votes_value);
    const percentValue = pair.votes_value
        ? getPercent(pair.votes_value, totalStats.votes_value_sum)
        : null;

    const percentBoostedValue = pair.adjusted_votes_value
        ? getPercent(pair.adjusted_votes_value, totalStats.adjusted_votes_value_sum)
        : null;

    const upIce =
        pair.extra.upvote_assets.find(({ asset }) => asset === `${UP_ICE_CODE}:${ICE_ISSUER}`)
            ?.votes_sum ?? 0;
    const downIce =
        pair.extra.downvote_assets.find(({ asset }) => asset === `${DOWN_ICE_CODE}:${ICE_ISSUER}`)
            ?.votes_sum ?? 0;
    const dIce =
        pair.extra.upvote_assets.find(({ asset }) => asset === `${D_ICE_CODE}:${ICE_ISSUER}`)
            ?.votes_sum ?? 0;

    return (
        <TooltipStyled
            content={
                <TooltipWrap>
                    <TooltipRowTitleFirst>
                        <span>Upvotes:</span>
                        <span>{formatBalance(+pair.upvote_value, true)}</span>
                    </TooltipRowTitleFirst>
                    <TooltipRow>
                        <span>ICE:</span>
                        <TokenAmount>
                            <IceLogo />
                            {formatBalance(+upIce, true)}
                        </TokenAmount>
                    </TooltipRow>
                    <TooltipRow>
                        <span>dICE:</span>
                        <TokenAmount>
                            <DIceLogo />
                            {formatBalance(+dIce, true)}
                        </TokenAmount>
                    </TooltipRow>
                    <TooltipRowTitle>
                        <span>Downvotes:</span>
                        <span>{formatBalance(+pair.downvote_value, true)}</span>
                    </TooltipRowTitle>
                    <TooltipRow>
                        <span>ICE:</span>
                        <TokenAmount>
                            <IceLogo />
                            {formatBalance(+downIce, true)}
                        </TokenAmount>
                    </TooltipRow>
                    <TooltipRowTitle>
                        <span>% of votes:</span>
                        <TooltipPercents>
                            <span>{percentValue}%</span>
                            {+percentValue < +percentBoostedValue ? <IconUp /> : <IconDown />}
                            <span>{percentBoostedValue}%</span>
                        </TooltipPercents>
                    </TooltipRowTitle>
                </TooltipWrap>
            }
            position={TOOLTIP_POSITION.top}
            background={COLORS.white}
            showOnHover
        >
            <label>Votes:</label>
            <Amount>
                <AmountRow>
                    {pair.votes_value ? formatBalance(+pair.votes_value, true) : null}
                    <Percents>
                        <PercentMobile $isBoosted={boosted}>{percentBoostedValue}%</PercentMobile>
                    </Percents>
                    <Info />
                </AmountRow>

                <Percent $isBoosted={boosted}>{percentBoostedValue}%</Percent>
            </Amount>
            <InfoMobile />
        </TooltipStyled>
    );
};

export default VoteAmount;
