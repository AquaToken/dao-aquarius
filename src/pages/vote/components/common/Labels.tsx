import * as React from 'react';
import { MAX_REWARDS_PERCENT, MIN_REWARDS_PERCENT } from '../MainPage/Table/Table';
import Label from '../../../../common/basics/Label';

export const BoostLabel = () => {
    return (
        <Label
            title={'boost'}
            text={'25% boost for markets paired with AQUA, up until 5% of adjusted votes.'}
            isGreen
        />
    );
};

export const RewardLabel = () => {
    return (
        <Label
            title={'reward zone'}
            text={`Any market with at least ${MIN_REWARDS_PERCENT}% of the total AQUA votes is placed into the reward zone and will get rewards after the next rewards update.`}
        />
    );
};

export const AuthRequiredLabel = () => {
    return (
        <Label
            title={'auth required'}
            text={
                <span>
                    “Authorization required” flag is enabled for one asset from the pair. With this
                    flag set, an issuer can grant a limited permissions to transact with its asset.
                    <a
                        rel="noopener noreferrer"
                        target="_blank"
                        href="https://developers.stellar.org/docs/glossary/accounts/#flags"
                    >
                        More details.
                    </a>
                </span>
            }
            isRed
        />
    );
};

export const NoLiquidityLabel = () => {
    return (
        <Label
            title={'no liquidity'}
            text={
                'This market pair is not eligible for AQUA rewards at the moment, as it failed the liquidity test (no path payment from XLM).'
            }
            isRed
        />
    );
};

export const MaxRewardsLabel = () => {
    return (
        <Label
            title={'MAX REWARDS'}
            text={`Every market has a ${MAX_REWARDS_PERCENT}% maximum limit of total daily rewards. Any additional percentage points beyond this limit are distributed equally among all other markets in the reward zone.`}
            isDark
        />
    );
};
