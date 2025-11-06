import * as React from 'react';

import { formatBalance } from 'helpers/format-number';

import { AccountEligibility } from 'types/airdrop2';

import AquaGray from 'assets/aqua/aqua-logo-gray.svg';
import Aqua from 'assets/aqua/aqua-logo.svg';

import {
    Container,
    Title,
    WithoutBoost,
    Boost,
    WithBoost,
    ArrowDown,
    DividedReward,
    Reward,
    Description,
} from './ExpectedReward.styled';

interface ExpectedRewardProps {
    accountEligibility: AccountEligibility;
}

const ExpectedReward: React.FC<ExpectedRewardProps> = ({ accountEligibility }) => {
    const hasBoost = Boolean(Number(accountEligibility.airdrop_boost));

    const formatted = {
        raw: formatBalance(+accountEligibility.raw_airdrop_reward, true),
        boosted: formatBalance(+accountEligibility.airdrop_reward, true),
        boostPercent: formatBalance(+accountEligibility.airdrop_boost * 100, true),
        yearly: formatBalance(+accountEligibility.airdrop_reward / 3, true),
        monthly: formatBalance(+accountEligibility.airdrop_reward / 36, true),
    };

    return (
        <Container>
            <Title>Expected Airdrop #2 reward</Title>

            <WithoutBoost $hasBoost={hasBoost}>
                {hasBoost ? <AquaGray /> : <Aqua />}
                {formatted.raw} AQUA
                {hasBoost && (
                    <>
                        <ArrowDown />
                        <Boost>⚡ {formatted.boostPercent}% boost</Boost>
                    </>
                )}
            </WithoutBoost>

            {hasBoost && (
                <WithBoost>
                    <Aqua />
                    {formatted.boosted} AQUA
                </WithBoost>
            )}

            <DividedReward>
                <div>
                    <Reward>{formatted.boosted} AQUA</Reward>
                    <Description>Estimated 3 year total</Description>
                </div>
                <div>
                    <Reward>{formatted.yearly} AQUA</Reward>
                    <Description>Estimated per year</Description>
                </div>
                <div>
                    <Reward>{formatted.monthly} AQUA</Reward>
                    <Description>Estimated per month</Description>
                </div>
            </DividedReward>
        </Container>
    );
};

export default ExpectedReward;
