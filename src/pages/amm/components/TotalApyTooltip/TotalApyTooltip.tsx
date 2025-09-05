import * as React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { MainRoutes } from 'constants/routes';

import { apyValueToDisplay } from 'helpers/amount';

import { PoolProcessed } from 'types/amm';

import { flexColumn, flexRowSpaceBetween, respondDown } from 'web/mixins';
import { Breakpoints, COLORS, FONT_SIZE, hexWithOpacity } from 'web/styles';

import Arrow from 'assets/icon-arrow-right-short.svg';

import { IconBoost } from 'basics/icons';
import Label from 'basics/Label';

const Container = styled.div`
    ${flexColumn};
    min-width: 33.2rem;
    ${FONT_SIZE.sm};

    ${respondDown(Breakpoints.xs)`
        min-width: unset;
        ${FONT_SIZE.xs};
    `}
`;

const BoostBlock = styled(Link)`
    padding: 2.4rem;
    ${flexRowSpaceBetween};
    background-color: ${COLORS.darkBlue};
    border-radius: 0.5rem 0.5rem 0 0;
    color: ${COLORS.white};
    gap: 2.4rem;
    text-decoration: none;

    ${respondDown(Breakpoints.xs)`
        padding: 0.8rem;
    `}
`;

const WhiteArrow = styled(Arrow)`
    min-width: 1.6rem;
    path {
        stroke: ${COLORS.white};
    }
`;

const BoostBlockContent = styled.div`
    ${flexColumn};
    gap: 0.8rem;
    white-space: normal;
`;

const ContentBlock = styled.div`
    ${flexColumn};
    padding: 2.4rem 3.2rem;

    ${respondDown(Breakpoints.xs)`
        padding: 0.8rem;
    `}
`;

const ContentRow = styled.div`
    ${flexRowSpaceBetween};
    padding-left: 0.8rem;
    padding-right: 0.8rem;
    gap: 2.4rem;

    &:not(:last-child) {
        margin-bottom: 0.8rem;
    }

    ${respondDown(Breakpoints.xs)`
        flex-direction: column;
        gap: 0.8rem;
    `}
`;

const ContentRowWithBackground = styled(ContentRow)<{ $background: string }>`
    background-color: ${({ $background }) => $background ?? COLORS.white};
    border-radius: 0.8rem;
    padding-top: 0.8rem;
    padding-bottom: 0.8rem;
`;

const Title = styled.span`
    color: ${COLORS.grayText};

    ${respondDown(Breakpoints.xs)`
        font-weight: 700;
    `}
`;

const Value = styled.div`
    display: flex;
    align-items: center;
    color: ${COLORS.titleText};
    gap: 0.8rem;

    ${respondDown(Breakpoints.xs)`
        flex-direction: column;
    `}
`;

const LabelText = styled.div`
    display: flex;
    align-items: center;
    gap: 0.4rem;
`;

const LabelTextTotal = styled(LabelText)`
    ${FONT_SIZE.md};
    font-weight: 700;

    ${respondDown(Breakpoints.xs)`
        ${FONT_SIZE.sm};
    `}
`;

const Cross = styled.span`
    text-decoration-line: line-through;
    text-decoration-thickness: 0.1rem;
    text-decoration-color: ${COLORS.grayText};
    color: ${COLORS.grayText};
`;

interface Props {
    pool: PoolProcessed;
    withBoost?: boolean;
    userBoost?: number;
}

const TotalApyTooltip = ({ pool, withBoost, userBoost }: Props) => (
    <Container>
        {withBoost && (
            <BoostBlock to={MainRoutes.locker}>
                <BoostBlockContent>
                    <Label
                        color={COLORS.darkBlue}
                        background={COLORS.white}
                        labelSize="big"
                        labelText={
                            <LabelText>
                                <IconBoost /> ICE BOOST
                            </LabelText>
                        }
                        withoutBorder
                    />
                    <span>
                        AQUA rewards APY are boosted based on your <b>ICE balance</b>
                    </span>
                </BoostBlockContent>
                <WhiteArrow />
            </BoostBlock>
        )}
        <ContentBlock>
            {!!Number(pool.apy) || (!Number(pool.rewards_apy) && !Number(pool.incentive_apy)) ? (
                <ContentRow>
                    <Title>Swap fee APY:</Title>
                    <Value>{apyValueToDisplay(pool.apy)}</Value>
                </ContentRow>
            ) : null}

            {!!Number(pool.rewards_apy) && (
                <ContentRow>
                    <Title>AQUA rewards base APY:</Title>
                    <Value>
                        {withBoost ? (
                            <>
                                <Cross>{apyValueToDisplay(pool.rewards_apy)}</Cross>
                                <LabelText>
                                    <IconBoost />{' '}
                                    {apyValueToDisplay(
                                        (+pool.rewards_apy * (userBoost || 2.5)).toString(),
                                    )}
                                </LabelText>
                            </>
                        ) : (
                            apyValueToDisplay(pool.rewards_apy)
                        )}
                    </Value>
                </ContentRow>
            )}
            {!!Number(pool.incentive_apy) && (
                <ContentRow>
                    <Title>Extra incentives APY:</Title>
                    <Value>{apyValueToDisplay(pool.incentive_apy)}</Value>
                </ContentRow>
            )}
            {!withBoost && (
                <ContentRowWithBackground $background={hexWithOpacity(COLORS.placeholder, 20)}>
                    <Title>Total APY:</Title>
                    <Value>{apyValueToDisplay(pool.total_apy)}</Value>
                </ContentRowWithBackground>
            )}
            {withBoost && (
                <ContentRowWithBackground $background={hexWithOpacity(COLORS.darkBlue, 10)}>
                    <Title>Max boost APY:</Title>
                    <Value>
                        <Cross>{apyValueToDisplay(pool.total_apy)}</Cross>
                        <LabelTextTotal>
                            <IconBoost />
                            {apyValueToDisplay(
                                (
                                    (+pool.rewards_apy || 0) * 2.5 +
                                    (+pool.apy || 0) +
                                    (+pool.incentive_apy || 0)
                                ).toString(),
                            )}
                        </LabelTextTotal>
                    </Value>
                </ContentRowWithBackground>
            )}
            {Boolean(userBoost) && (
                <ContentRowWithBackground $background={hexWithOpacity(COLORS.purple, 10)}>
                    <Title>Your boost APY:</Title>
                    <Value>
                        <LabelTextTotal>
                            <IconBoost />
                            {apyValueToDisplay(
                                (
                                    (+pool.rewards_apy || 0) * userBoost +
                                    (+pool.apy || 0) +
                                    (+pool.incentive_apy || 0)
                                ).toString(),
                            )}
                        </LabelTextTotal>
                        <Label
                            background={COLORS.darkBlue}
                            labelSize="medium"
                            labelText={
                                userBoost === 1
                                    ? 'No boost'
                                    : userBoost < 1.01
                                    ? 'X<1.01'
                                    : `X${userBoost.toFixed(2)}`
                            }
                        />
                    </Value>
                </ContentRowWithBackground>
            )}
        </ContentBlock>
    </Container>
);

export default TotalApyTooltip;
