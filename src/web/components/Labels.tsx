import styled from 'styled-components';

import Crown from 'assets/icon-crown.svg';

import Label from 'basics/Label';

import {
    MAX_REWARDS_PERCENT,
    MIN_REWARDS_PERCENT,
} from 'pages/vote/components/MainPage/Table/Table';

import { COLORS, hexWithOpacity } from '../styles';

const StyledLabel = styled(Label)`
    margin: 0 0.5rem;
`;

const LabelWithIcon = styled.span`
    gap: 0.4rem;
`;

export const BoostLabel = () => (
    <StyledLabel
        labelText="boost"
        tooltipText="50% boost for markets paired with AQUA, 30% boost for markets paired with USDC (centre.io) or XLM. These boosts are cumulative and are effective until reaching 10% of adjusted votes."
        background={COLORS.green500}
    />
);

export const RewardLabel = () => (
    <StyledLabel
        labelText={
            <LabelWithIcon>
                <Crown style={{ height: '0.6rem', width: '0.9rem' }} />
                reward zone
            </LabelWithIcon>
        }
        tooltipText={`Any market with at least ${MIN_REWARDS_PERCENT}% of the total ICE votes is placed into the reward zone and will get rewards after the next rewards update.`}
        color={COLORS.purple500}
        background={`${hexWithOpacity(COLORS.purple500, 10)}`}
        tooltipColor={COLORS.white}
        tooltipBackground={COLORS.purple500}
        withoutBorder
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
        background={COLORS.pink500}
    />
);

export const NoLiquidityLabel = () => (
    <StyledLabel
        labelText="no liquidity"
        tooltipText="This market is not eligible for AQUA rewards at the moment, as it failed the liquidity test (no path payment from XLM)."
        background={COLORS.pink500}
    />
);

export const MaxRewardsLabel = () => (
    <StyledLabel
        labelText="MAX REWARDS"
        tooltipText={`Every market has a ${MAX_REWARDS_PERCENT}% maximum limit of total daily rewards. Any additional percentage points beyond this limit are distributed equally among all other markets in the reward zone.`}
        background={COLORS.textPrimary}
    />
);

export const ClassicPoolLabel = () => (
    <StyledLabel
        labelText="CLASSIC"
        tooltipText="Native Stellar liquidity pool"
        background={COLORS.white}
        color={COLORS.purple300}
        tooltipColor={COLORS.textPrimary}
    />
);

export const ConstantPoolLabel = () => (
    <StyledLabel
        labelText="VOLATILE"
        tooltipText="Simple model for general purpose AMM pools (Uniswap v2)."
        background={COLORS.white}
        color={COLORS.orange300}
        tooltipColor={COLORS.textPrimary}
    />
);

export const StablePoolLabel = () => (
    <StyledLabel
        labelText="STABLE"
        tooltipText="Highly effecient AMM model for correlated assets (i.e.stablecoins) that offers lower slippage."
        background={COLORS.white}
        color={COLORS.blue300}
        tooltipColor={COLORS.textPrimary}
    />
);

export const FeeLabel = ({ fee }: { fee: string }) => (
    <StyledLabel
        labelText={`${(Number(fee) * 100).toFixed(2)}%`}
        tooltipText="Swap fee for this pool"
        background={COLORS.gray100}
        color={COLORS.textGray}
        tooltipColor={COLORS.textPrimary}
        tooltipBackground={COLORS.white}
        withoutBorder
    />
);

export const AmmBribesLabel = () => (
    <StyledLabel
        labelText="Protocol"
        tooltipText="Automatically funded by the Aquarius protocol using a portion of trading fees."
        background={COLORS.purple500}
        color={COLORS.white}
    />
);

export const PrivateBribesLabel = () => (
    <StyledLabel
        labelText="External"
        tooltipText="Funded to attract votes to specific pools by third parties like token projects or DAOs."
        background={COLORS.green500}
        color={COLORS.white}
    />
);
