import * as React from 'react';
import { AccountEligibility } from '../../../api/types';
import styled from 'styled-components';
import { Breakpoints, COLORS } from '../../../../../common/styles';
import Aqua from '../../../../../common/assets/img/aqua-logo-small.svg';
import AquaGray from '../../../../../common/assets/img/aqua-logo-gray.svg';
import Down from '../../../../../common/assets/img/icon-arrow-down-long.svg';
import { formatBalance } from '../../../../../common/helpers/helpers';
import { respondDown } from '../../../../../common/mixins';

const Container = styled.div`
    margin-top: 2rem;
    padding: 3rem 3rem 2rem;
    background: ${COLORS.lightGray};
    border-radius: 0.5rem;
`;

const Title = styled.div`
    font-size: 2rem;
    font-weight: 700;
    line-height: 2.8rem;
    color: ${COLORS.titleText};
    margin-bottom: 0.8rem;
`;

const WithoutBoost = styled.div<{ hasBoost: boolean }>`
    display: flex;
    align-items: center;
    font-size: 3.6rem;
    line-height: 4.2rem;
    color: ${({ hasBoost }) => (hasBoost ? COLORS.grayText : COLORS.titleText)};
    position: relative;

    svg {
        height: 4.8rem;
        width: 4.8rem;
        margin-right: 1.6rem;
    }

    ${respondDown(Breakpoints.sm)`
        display: grid;
        grid-template-columns: min-content auto;
        grid-row-gap: 1rem;
        grid-column-gap: 1.3rem;
        white-space: nowrap;
        font-size: 2rem;
        font-weight: 400;
        line-height: 2.4rem;
        
        svg {
            min-width: 2.4rem;
            height: 2.4rem;
            width: 2.4rem;
            margin-right: 0;
        }
    `}
`;

const Boost = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: min-content;
    height: 3.5rem;
    margin-left: 1.6rem;
    padding: 0 1.4rem 0 1.2rem;
    background: ${COLORS.tooltip};
    border-radius: 5px;
    font-size: 1.4rem;
    line-height: 2rem;
    color: ${COLORS.white};
    white-space: nowrap;

    ${respondDown(Breakpoints.sm)`
        align-self: flex-start;
        height: 2.5rem;
        margin-left: 0;
        font-size: 1.2rem;
        line-height: 2rem;
    `}
`;

const WithBoost = styled.div`
    display: flex;
    align-items: center;
    font-size: 5.6rem;
    font-weight: 700;
    line-height: 6.4rem;
    margin-top: 3rem;
    color: ${COLORS.titleText};

    svg {
        height: 4.8rem;
        width: 4.8rem;
        margin-right: 1.6rem;
    }

    ${respondDown(Breakpoints.sm)`
        display: grid;
        grid-template-columns: min-content auto;
        grid-row-gap: 1rem;
        grid-column-gap: 1.3rem;
        white-space: nowrap;
        font-size: 2rem;
        font-weight: 400;
        line-height: 2.4rem;
        margin-top: 1.3rem;
        
        svg {
            min-width: 2.4rem;
            height: 2.4rem;
            width: 2.4rem;
            margin-right: 1.6rem;
        }
    `}
`;

const ArrowDown = styled(Down)`
    position: absolute;
    height: 1.7rem !important;
    width: 1rem !important;
    left: 2rem;
    top: calc(100% + 1rem);

    ${respondDown(Breakpoints.sm)`
        position: static;
        height: 3.4rem !important;
   `};
`;

const DividedReward = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    margin-top: 3.2rem;
    padding-top: 3.2rem;
    border-top: 1px dashed ${COLORS.gray};

    ${respondDown(Breakpoints.sm)`
        grid-template-columns: 1fr;
        grid-row-gap: 3.6rem;
   `};
`;

const Reward = styled.div`
    font-size: 2rem;
    font-weight: 700;
    line-height: 2.8rem;
    color: ${COLORS.titleText};
    margin-bottom: 0.3rem;
`;

const Description = styled.div`
    font-size: 1.4rem;
    line-height: 2rem;
    color: ${COLORS.grayText};
`;

const ExpectedReward = ({ accountEligibility }: { accountEligibility: AccountEligibility }) => {
    const hasBoost = Boolean(Number(accountEligibility.airdrop_boost));

    return (
        <Container>
            <Title>Expected Airdrop #2 reward</Title>

            <WithoutBoost hasBoost={hasBoost}>
                {hasBoost ? <AquaGray /> : <Aqua />}
                {formatBalance(+accountEligibility.raw_airdrop_reward, true)} AQUA
                {hasBoost && (
                    <>
                        <ArrowDown />
                        <Boost>
                            ⚡ {formatBalance(+accountEligibility.airdrop_boost * 100, true)}% boost
                        </Boost>
                    </>
                )}
            </WithoutBoost>
            {hasBoost && (
                <WithBoost>
                    <Aqua />
                    {formatBalance(+accountEligibility.airdrop_reward, true)} AQUA
                </WithBoost>
            )}
            <DividedReward>
                <div>
                    <Reward>{formatBalance(+accountEligibility.airdrop_reward, true)} AQUA</Reward>
                    <Description>Estimated 3 year total</Description>
                </div>
                <div>
                    <Reward>
                        {formatBalance(+accountEligibility.airdrop_reward / 3, true)} AQUA
                    </Reward>
                    <Description>Estimated per year</Description>
                </div>
                <div>
                    <Reward>
                        {formatBalance(+accountEligibility.airdrop_reward / 36, true)} AQUA
                    </Reward>
                    <Description>Estimated per month</Description>
                </div>
            </DividedReward>
        </Container>
    );
};

export default ExpectedReward;
