import * as React from 'react';
import { useMemo } from 'react';
import styled from 'styled-components';

import { getAquaAssetData } from 'helpers/assets';
import { formatBalance } from 'helpers/format-number';

import { ModalService } from 'services/globalServices';

import { Token } from 'types/token';

import Button from 'web/basics/buttons/Button';
import { respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import AssetLogo from 'basics/AssetLogo';

import NoTrustline from 'components/NoTrustline';

import ClaimRewardsModal from 'modals/ClaimRewardsModal';

const RewardsWrap = styled.div`
    display: flex;
    flex-direction: column;
    background-color: ${COLORS.lightGray};
    padding: 3.2rem;
    border-radius: 0.5rem;
    margin-bottom: 3.2rem;

    ${respondDown(Breakpoints.md)`
        background-color: ${COLORS.white};
    `}
`;

const Rewards = styled.div`
    display: flex;
    align-items: center;
    gap: 2.4rem;
    width: 100%;

    ${respondDown(Breakpoints.md)`
        flex-direction: column;
        gap: 2rem;
    `}
`;

const RewardsDescription = styled.div`
    display: flex;
    flex-direction: column;
    color: ${COLORS.grayText};
    font-size: 1.4rem;

    span:first-child {
        font-size: 1.6rem;
        line-height: 2.8rem;
        color: ${COLORS.paragraphText};
        display: flex;
        align-items: center;

        svg {
            margin: 0 0.5rem;
        }
    }

    ${respondDown(Breakpoints.md)`
        text-align: center;
    `}
`;

const StyledButton = styled(Button)`
    margin-left: auto;

    ${respondDown(Breakpoints.md)`
        margin-left: 0;
    `}
`;

const NoTrustlineStyled = styled(NoTrustline)`
    background-color: ${COLORS.white}!important;

    ${respondDown(Breakpoints.sm)`
        background-color: ${COLORS.lightGray}!important;
    `}
`;

const Logos = styled.div`
    display: flex;
    align-items: center;
`;

const StyledAssetLogo = styled(AssetLogo)`
    border: 0.1rem solid ${COLORS.white};
    background-color: ${COLORS.white};

    &:not(:first-child) {
        margin-left: -1.2rem;
    }
`;

interface RewardsBannerProps {
    rewardsSum: number;
    userRewardsCount: number;
    incentivesSum: Map<Token, number>;
    userIncentivesCount: number;
}

const RewardsBanner = ({
    rewardsSum,
    userRewardsCount,
    incentivesSum,
    userIncentivesCount,
}: RewardsBannerProps) => {
    const { aquaStellarAsset } = getAquaAssetData();

    const tokens = useMemo(() => {
        const res: Token[] = [];

        if (userRewardsCount) {
            res.push(aquaStellarAsset);
        }

        [...incentivesSum.keys()].forEach(token => {
            if (!userRewardsCount || token.contract !== aquaStellarAsset.contract) {
                res.push(token);
            }
        });

        return res;
    }, [userRewardsCount, incentivesSum]);

    return (
        <RewardsWrap>
            <Rewards>
                <Logos>
                    {tokens.map(token => (
                        <StyledAssetLogo key={token.contract} asset={token} />
                    ))}
                </Logos>
                <RewardsDescription>
                    <span>
                        {!userRewardsCount && !userIncentivesCount && (
                            <span>You might have unclaimed rewards or incentives</span>
                        )}

                        {userRewardsCount
                            ? `Rewards (${userRewardsCount}): ${formatBalance(rewardsSum)} AQUA`
                            : ''}

                        {!!userRewardsCount && <br />}

                        {userIncentivesCount
                            ? `Incentives (${userIncentivesCount}): ${[...incentivesSum.entries()]
                                  .filter(([_, amount]) => Boolean(Number(amount)))
                                  .map(
                                      ([token, amount]) =>
                                          `${formatBalance(amount, true, true)} ${token.code}`,
                                  )
                                  .join(', ')}`
                            : ''}
                    </span>
                </RewardsDescription>
                <StyledButton onClick={() => ModalService.openModal(ClaimRewardsModal, {})}>
                    {userRewardsCount || userIncentivesCount ? 'Claim All' : 'Check'}
                </StyledButton>
            </Rewards>

            <NoTrustlineStyled asset={aquaStellarAsset} />

            {[...incentivesSum.keys()]
                .filter(token => token.contract !== aquaStellarAsset.contract)
                .map(token => (
                    <NoTrustlineStyled key={token.contract} asset={token} />
                ))}
        </RewardsWrap>
    );
};

export default RewardsBanner;
