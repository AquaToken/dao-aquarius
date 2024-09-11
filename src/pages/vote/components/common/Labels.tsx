import * as React from 'react';
import { MAX_REWARDS_PERCENT, MIN_REWARDS_PERCENT } from '../MainPage/Table/Table';
import Label from '../../../../common/basics/Label';
import styled from 'styled-components';
import { COLORS } from '../../../../common/styles';

const StyledLabel = styled(Label)`
    margin: 0 0.5rem;
`;

export const BoostLabel = () => {
    return (
        <StyledLabel
            title={'boost'}
            text={'25% boost for markets paired with AQUA, up until 5% of adjusted votes.'}
            background={COLORS.green}
        />
    );
};

export const RewardLabel = () => {
    return (
        <StyledLabel
            title={'reward zone'}
            text={`Any market with at least ${MIN_REWARDS_PERCENT}% of the total AQUA votes is placed into the reward zone and will get rewards after the next rewards update.`}
        />
    );
};

export const AuthRequiredLabel = () => {
    return (
        <StyledLabel
            title={'asset flags'}
            text={
                <span>
                    One of the assets in this market has flags enabled. Most assets with “Required”,
                    “Revocable”, and “Clawback Enabled” flags are currently banned from Aquarius.
                    Learn more about flag
                    <a
                        rel="noopener noreferrer"
                        target="_blank"
                        href="https://developers.stellar.org/docs/glossary/accounts/#flags"
                    >
                        here
                    </a>
                    .
                </span>
            }
            background={COLORS.pinkRed}
        />
    );
};

export const NoLiquidityLabel = () => {
    return (
        <StyledLabel
            title={'no liquidity'}
            text={
                'This market is not eligible for AQUA rewards at the moment, as it failed the liquidity test (no path payment from XLM).'
            }
            background={COLORS.pinkRed}
        />
    );
};

export const MaxRewardsLabel = () => {
    return (
        <StyledLabel
            title={'MAX REWARDS'}
            text={`Every market has a ${MAX_REWARDS_PERCENT}% maximum limit of total daily rewards. Any additional percentage points beyond this limit are distributed equally among all other markets in the reward zone.`}
            background={COLORS.titleText}
        />
    );
};

export const ClassicPoolLabel = () => {
    return (
        <StyledLabel
            title={'CLASSIC'}
            text={'Native Stellar liquidity pool'}
            background={COLORS.white}
            color={COLORS.classicPool}
        />
    );
};

export const ConstantPoolLabel = () => {
    return (
        <StyledLabel
            title={'VOLATILE'}
            text={'Simple model for general purpose AMM pools (Uniswap v2).'}
            background={COLORS.white}
            color={COLORS.constantPool}
        />
    );
};

export const StablePoolLabel = () => {
    return (
        <StyledLabel
            title={'STABLE'}
            text={
                'Highly effecient AMM model for correlated assets (i.e.stablecoins) that offers lower slippage.'
            }
            background={COLORS.white}
            color={COLORS.stablePool}
        />
    );
};
