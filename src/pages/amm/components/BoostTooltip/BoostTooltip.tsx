import * as React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { MainRoutes } from 'constants/routes';

import { formatBalance } from 'helpers/format-number';

import { PoolProcessed } from 'types/amm';

import { respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import IceSymbol from 'assets/icon-ice-symbol.svg';

import { Button } from 'basics/buttons';
import Label from 'basics/Label';

const Container = styled.div`
    display: flex;
    flex-direction: column;
    padding: 2.4rem;
    color: ${COLORS.textPrimary};
    font-size: 1.4rem;
    line-height: 2rem;
    width: 25.8rem;
    align-items: center;
    white-space: pre-wrap;
    text-align: center;
    gap: 1.9rem;

    ${respondDown(Breakpoints.md)`
        width: 14rem;
        padding: 0.8rem;
        font-size: 1.2rem;
        line-height: 1.8rem;
    `}
`;

const BoostTooltipValuesBlock = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    width: 100%;
`;

const BoostTooltipValues = styled.div`
    display: flex;
    justify-content: space-between;
    width: 100%;

    span {
        color: ${COLORS.textGray};
    }

    span:last-child {
        color: ${COLORS.textTertiary};
    }
`;

const UserBoostTooltipValues = styled(BoostTooltipValues)`
    span {
        color: ${COLORS.purple500} !important;
    }
`;

const Boosted = styled.span`
    color: ${COLORS.blue700}!important;
`;

const IceSymbolWhite = styled(IceSymbol)`
    path {
        fill: ${COLORS.white};
    }
    margin-right: 0.4rem;
`;

const LinkButton = styled(Link)`
    color: ${COLORS.white};
    text-decoration: none;
    width: 100%;
`;

interface Props {
    pool: PoolProcessed;
    userBoost?: number;
}

const BoostTooltip = ({ pool, userBoost }: Props) => (
    <Container>
        <Label
            labelText={
                <span>
                    <IceSymbolWhite />
                    ICE BOOST
                </span>
            }
            labelSize="big"
            background={COLORS.blue700}
        />
        <span>Rewards APY are boosted based on your ICE balance</span>
        <BoostTooltipValuesBlock>
            <BoostTooltipValues>
                <span>Max. reward:</span>
                <Boosted>{formatBalance(+(Number(pool.rewards_apy) * 250).toFixed(2))}%</Boosted>
            </BoostTooltipValues>
            {userBoost && (
                <UserBoostTooltipValues>
                    <span>Your reward:</span>
                    <Boosted>
                        {formatBalance(+(Number(pool.rewards_apy) * 100 * userBoost).toFixed(2))}%
                    </Boosted>
                </UserBoostTooltipValues>
            )}
            <BoostTooltipValues>
                <span>Min. reward:</span>
                <span>{formatBalance(+(Number(pool.rewards_apy) * 100).toFixed(2))}%</span>
            </BoostTooltipValues>
        </BoostTooltipValuesBlock>
        <LinkButton to={MainRoutes.locker}>
            <Button fullWidth>get ice</Button>
        </LinkButton>
    </Container>
);

export default BoostTooltip;
