import styled from 'styled-components';

import { COLORS } from 'web/styles';

import Label from 'basics/Label';

import {
    MAX_REWARDS_PERCENT,
    MIN_REWARDS_PERCENT,
} from 'pages/vote/components/MainPage/Table/Table';

const StyledLabel = styled(Label)`
    margin: 0 0.5rem;
`;

export const BoostLabel = () => (
    <StyledLabel
        labelText="boost"
        tooltipText="50% boost for markets paired with AQUA, 30% boost for markets paired with USDC (centre.io) or XLM. These boosts are cumulative and are effective until reaching 10% of adjusted votes."
        background={COLORS.green}
    />
);

export const RewardLabel = () => (
    <StyledLabel
        labelText="reward zone"
        tooltipText={`Any market with at least ${MIN_REWARDS_PERCENT}% of the total AQUA votes is placed into the reward zone and will get rewards after the next rewards update.`}
    />
);

export const AuthRequiredLabel = () => (
    <StyledLabel
        labelText="asset flags"
        tooltipText={
            <span>
                One of the assets in this market has flags enabled. Most assets with “Required”,
                “Revocable”, and “Clawback Enabled” flags are currently banned from Aquarius. Learn
                more about flag
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

export const NoLiquidityLabel = () => (
    <StyledLabel
        labelText="no liquidity"
        tooltipText="This market is not eligible for AQUA rewards at the moment, as it failed the liquidity test (no path payment from XLM)."
        background={COLORS.pinkRed}
    />
);

export const MaxRewardsLabel = () => (
    <StyledLabel
        labelText="MAX REWARDS"
        tooltipText={`Every market has a ${MAX_REWARDS_PERCENT}% maximum limit of total daily rewards. Any additional percentage points beyond this limit are distributed equally among all other markets in the reward zone.`}
        background={COLORS.titleText}
    />
);

export const ClassicPoolLabel = () => (
    <StyledLabel
        labelText="CLASSIC"
        tooltipText="Native Stellar liquidity pool"
        background={COLORS.white}
        color={COLORS.classicPool}
        tooltipColor={COLORS.titleText}
    />
);

export const ConstantPoolLabel = () => (
    <StyledLabel
        labelText="VOLATILE"
        tooltipText="Simple model for general purpose AMM pools (Uniswap v2)."
        background={COLORS.white}
        color={COLORS.constantPool}
        tooltipColor={COLORS.titleText}
    />
);

export const StablePoolLabel = () => (
    <StyledLabel
        labelText="STABLE"
        tooltipText="Highly effecient AMM model for correlated assets (i.e.stablecoins) that offers lower slippage."
        background={COLORS.white}
        color={COLORS.stablePool}
        tooltipColor={COLORS.titleText}
    />
);

export const FeeLabel = ({ fee }: { fee: string }) => (
    <StyledLabel
        labelText={`${(Number(fee) * 100).toFixed(2)}%`}
        tooltipText="Swap fee for this pool"
        background={COLORS.gray}
        color={COLORS.grayText}
        tooltipColor={COLORS.titleText}
        tooltipBackground={COLORS.white}
        withoutBorder
    />
);

export const AmmBribesLabel = () => (
    <StyledLabel
        labelText="Protocol"
        tooltipText="Automatically funded by the Aquarius protocol using a portion of trading fees."
        background={COLORS.purple}
        color={COLORS.white}
    />
);

export const PrivateBribesLabel = () => (
    <StyledLabel
        labelText="External"
        tooltipText="Funded to attract votes to specific pools by third parties like token projects or DAOs."
        background={COLORS.green}
        color={COLORS.white}
    />
);
