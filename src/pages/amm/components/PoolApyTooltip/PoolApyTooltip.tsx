import * as React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { DAY } from 'constants/intervals';
import { MainRoutes } from 'constants/routes';

import { apyValueToDisplay, tpsToDailyAmount } from 'helpers/amount';
import { getAssetFromString } from 'helpers/assets';
import { formatBalance } from 'helpers/format-number';

import { PoolIncentives, PoolProcessed } from 'types/amm';

import { flexAllCenter, flexColumn, flexRowSpaceBetween, respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import ArrowRightIconShort from 'assets/icon-arrow-right-short.svg';
import IceSymbol from 'assets/icon-ice-symbol.svg';
import ArrowRightIcon from 'assets/icon-link-arrow.svg';

import ApyBoosted from 'basics/ApyBoosted';
import Label from 'basics/Label';

const ArrowRight = styled(ArrowRightIcon)`
    path {
        fill: ${COLORS.darkBlue};
    }
`;

const IceSymbolWhite = styled(IceSymbol)`
    path {
        fill: ${COLORS.white};
    }
    margin-right: 0.4rem;
`;

const Labels = styled.div`
    display: flex;
    align-items: center;
`;

const Container = styled.div`
    display: flex;
    flex-direction: column;
    padding: 0.8rem;
    color: ${COLORS.titleText};
    font-size: 1.4rem;
    line-height: 2rem;
    width: 34rem;
    align-items: center;
    white-space: pre-wrap;
    text-align: center;
    gap: 1.9rem;

    ${respondDown(Breakpoints.md)`
        width: 17rem;
        padding: 0.8rem;
        font-size: 1.2rem;
        line-height: 1.8rem;
    `}
`;

const TooltipValuesBlock = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    width: 100%;
`;

const TooltipValues = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;

    span {
        color: ${COLORS.grayText};
    }

    span:last-child {
        color: ${COLORS.paragraphText};
        ${flexAllCenter};
        gap: 0.4rem;
    }
`;

const Divider = styled.div`
    border-bottom: 0.1rem dashed ${COLORS.gray};
    margin: 0.4rem 0;
    width: 100%;
`;

const Amount = styled.span`
    font-weight: 700;
`;

const IceBlockWrap = styled(Link)`
    ${flexRowSpaceBetween};
    padding: 1.6rem;
    gap: 2.4rem;
    border-radius: 1.6rem;
    background: ${COLORS.lightGray};
    cursor: pointer;
    text-decoration: none;

    svg {
        min-width: 1.6rem;
    }
`;

const IceBlock = styled.div`
    ${flexColumn};
    text-align: left;
    gap: 1.6rem;
    color: ${COLORS.paragraphText};
`;

const LabelStyled = styled(Label)`
    border-radius: 0.7rem;
    padding: 0.2rem 1rem;
`;

interface Props {
    pool: PoolProcessed;
    userBoost?: number;
    userRewardsValue?: number;
    userShareRatio?: number;
    incentivesForPool?: PoolIncentives[];
}

const PoolApyTooltip = ({
    pool,
    userBoost,
    userRewardsValue,
    userShareRatio,
    incentivesForPool,
}: Props) => (
    <Container>
        <TooltipValuesBlock>
            {!!Number(pool.reward_tps) && (
                <TooltipValues>
                    <span>{userRewardsValue ? 'My rewards daily:' : 'Rewards daily:'}</span>
                    <Amount>
                        {userRewardsValue
                            ? formatBalance(userRewardsValue, true, true)
                            : tpsToDailyAmount(pool.reward_tps, 7, true)}{' '}
                        AQUA
                    </Amount>
                </TooltipValues>
            )}

            {incentivesForPool?.length
                ? incentivesForPool
                      .filter(incentive => !!Number(incentive.info.tps))
                      .map(incentive => (
                          <TooltipValues key={incentive.token.contract}>
                              <span>
                                  {userShareRatio ? 'My incentive daily' : 'Incentive daily:'}
                              </span>
                              <Amount>
                                  {formatBalance(
                                      ((+incentive.info.tps * DAY) / 1000) *
                                          (userShareRatio ? userShareRatio : 1),
                                      true,
                                      true,
                                  )}{' '}
                                  {incentive.token.code}
                              </Amount>
                          </TooltipValues>
                      ))
                : null}

            {!incentivesForPool?.length &&
                pool.incentive_tps_per_token &&
                !!Object.values(pool.incentive_tps_per_token).length &&
                Object.entries(pool.incentive_tps_per_token).map(([key, val]) => {
                    const token = getAssetFromString(key);
                    return (
                        <TooltipValues key={token.contract}>
                            <span>
                                {userShareRatio ? 'My incentive daily' : 'Incentive daily:'}
                            </span>
                            <Amount>
                                {tpsToDailyAmount(
                                    (userShareRatio ? userShareRatio * +val : +val).toFixed(7),
                                    token.decimal,
                                    true,
                                )}{' '}
                                {token.code}
                            </Amount>
                        </TooltipValues>
                    );
                })}

            {(!!Number(pool.reward_tps) ||
                (pool.incentive_tps_per_token &&
                    !!Object.values(pool.incentive_tps_per_token).length)) && <Divider />}
            <TooltipValues>
                <span>LP APY:</span>
                <span>{apyValueToDisplay(pool.apy)}</span>
            </TooltipValues>
            <TooltipValues>
                <span>Rewards APY:</span>
                <span>
                    {apyValueToDisplay(pool.rewards_apy)}{' '}
                    {Boolean(Number(pool.rewards_apy)) && (
                        <>
                            <ArrowRight />

                            <ApyBoosted
                                value={
                                    Number(pool.rewards_apy) * (userBoost ? userBoost * 100 : 250)
                                }
                                color="blue"
                            />
                        </>
                    )}
                </span>
            </TooltipValues>
            <TooltipValues>
                <span>Incentives APY:</span>
                <span>{apyValueToDisplay(pool.incentive_apy)}</span>
            </TooltipValues>

            {!!Number(pool.reward_tps) && (
                <IceBlockWrap to={MainRoutes.locker}>
                    <IceBlock>
                        <Labels>
                            <LabelStyled
                                labelText={
                                    <span>
                                        <IceSymbolWhite />
                                        ICE BOOST
                                    </span>
                                }
                                labelSize="medium"
                                background={COLORS.darkBlue}
                            />
                            {!!userBoost && (
                                <LabelStyled
                                    labelText={
                                        userBoost.toFixed(2) === '1.00'
                                            ? '< x1.01'
                                            : `x${userBoost.toFixed(2)}`
                                    }
                                    labelSize="medium"
                                    background={COLORS.darkBlue}
                                    withoutUppercase
                                />
                            )}
                        </Labels>

                        <span>Rewards APY are boosted based on your ICE balance</span>
                    </IceBlock>
                    <ArrowRightIconShort />
                </IceBlockWrap>
            )}
        </TooltipValuesBlock>
    </Container>
);

export default PoolApyTooltip;
