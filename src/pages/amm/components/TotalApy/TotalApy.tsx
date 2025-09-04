import * as React from 'react';
import styled from 'styled-components';

import { apyValueToDisplay } from 'helpers/amount';

import { PoolProcessed } from 'types/amm';

import { COLORS, hexWithOpacity } from 'web/styles';

import { IconBoost } from 'basics/icons';
import Label from 'basics/Label';
import Tooltip from 'basics/Tooltip';

import TotalApyTooltip from 'pages/amm/components/TotalApyTooltip/TotalApyTooltip';

const Container = styled.div`
    display: flex;
    gap: 0.4rem;
`;

const LabelContent = styled.div`
    display: flex;
    align-items: center;
    gap: 0.4rem;
`;

interface Props {
    pool: PoolProcessed;
    userBoost?: number;
}

const TotalApy = ({ pool, userBoost }: Props) => (
    <Container>
        <Tooltip
            content={<TotalApyTooltip pool={pool} />}
            showOnHover
            background={COLORS.white}
            color={COLORS.paragraphText}
            withoutPadding
        >
            <Label
                labelText={apyValueToDisplay(pool.total_apy)}
                labelSize="extraLarge"
                background={hexWithOpacity(COLORS.placeholder, 20)}
                color={COLORS.paragraphText}
                withoutBorder
                fontWeight={400}
            />
        </Tooltip>

        {Boolean(Number(pool.rewards_apy)) && (
            <Tooltip
                content={<TotalApyTooltip pool={pool} withBoost userBoost={userBoost} />}
                showOnHover
                background={COLORS.white}
                color={COLORS.paragraphText}
                withoutPadding
            >
                <Label
                    labelText={
                        <LabelContent>
                            <IconBoost />
                            {apyValueToDisplay(
                                (
                                    (+pool.rewards_apy || 0) * (userBoost || 2.5) +
                                    (+pool.apy || 0) +
                                    (+pool.incentive_apy || 0)
                                ).toString(),
                            )}
                        </LabelContent>
                    }
                    labelSize="extraLarge"
                    background={hexWithOpacity(userBoost ? COLORS.purple : COLORS.darkBlue, 10)}
                    color={COLORS.paragraphText}
                    withoutBorder
                    fontWeight={400}
                />
            </Tooltip>
        )}
    </Container>
);

export default TotalApy;
