import * as React from 'react';
import styled from 'styled-components';
import { COLORS } from '../../../../common/styles';
import AquaGray from '../../../../common/assets/img/aqua-logo-gray.svg';
import Aqua from '../../../../common/assets/img/aqua-logo-small.svg';
import ArrowDown from '../../../../common/assets/img/icon-arrow-down-long.svg';
import { formatBalance, roundToPrecision } from '../../../../common/helpers/helpers';

const AquaLogo = styled(Aqua)`
    height: 4.8rem;
    width: 4.8rem;
`;

const Container = styled.div`
    margin-top: 4rem;
    display: flex;
    flex-direction: column;
    background-color: ${COLORS.white};
    border-radius: 0.5rem;
    padding: 3.2rem 3.2rem 4.2rem;
`;

const Title = styled.span`
    font-size: 2rem;
    line-height: 2.8rem;
    font-weight: bold;
    color: ${COLORS.titleText};
    margin-bottom: 3.2rem;
`;

const AccountAirdrop = styled.div`
    display: flex;
    flex-direction: column;
    padding-bottom: 3.2rem;
    border-bottom: 0.1rem dashed ${COLORS.gray};
`;

const CurrentAirdrop = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;

    svg {
        margin-right: 1.6rem;
    }
`;

const CurrentAirdropAmount = styled.span`
    font-size: 3.6rem;
    line-height: 4.2rem;
    color: ${COLORS.grayText};
    margin-right: 1.6rem;
`;

const BoostInfo = styled.div`
    height: 3.5rem;
    line-height: 3.5rem;
    font-size: 1.4rem;
    color: ${COLORS.white};
    padding: 0 1.2rem;
    background-color: ${COLORS.tooltip};
    border-radius: 0.5rem;
`;

const AirdropSchedule = styled.div`
    display: flex;
    flex-direction: row;
    margin-top: 3.2rem;
`;

const AirdropAmountColumn = styled.div`
    display: flex;
    flex-direction: column;
    margin-right: 8rem;
`;

const AirdropSum = styled.span`
    font-weight: bold;
    font-size: 2rem;
    line-height: 2.8rem;
    color: ${COLORS.titleText};
    margin-bottom: 0.3rem;
`;

const AirdropSumPeriod = styled.div`
    font-size: 1.4rem;
    line-height: 2rem;
    color: ${COLORS.grayText};
`;

const BoostedAirdrop = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;

    svg {
        margin-right: 1.6rem;
    }
`;

const BoostedAmount = styled.span`
    font-weight: bold;
    font-size: 5.6rem;
    line-height: 6.4rem;
    color: ${COLORS.titleText};
`;

const Arrow = styled(ArrowDown)`
    margin: 0.8rem 1.8rem;
`;

const ExpectedReward = ({ boostPercent, airdropAmount }) => {
    return (
        <Container>
            <Title>Expected Airdrop #2 reward</Title>
            <AccountAirdrop>
                <CurrentAirdrop>
                    {Boolean(boostPercent) ? <AquaGray /> : <AquaLogo />}
                    <CurrentAirdropAmount>
                        {formatBalance(airdropAmount, true)} AQUA
                    </CurrentAirdropAmount>
                    <BoostInfo>
                        ⚡{' '}
                        {Boolean(boostPercent)
                            ? `+${roundToPrecision(boostPercent, 2)}% boost`
                            : 'Lock AQUA to get boost'}
                    </BoostInfo>
                </CurrentAirdrop>
                {Boolean(boostPercent) && (
                    <>
                        <Arrow />
                        <BoostedAirdrop>
                            <AquaLogo />
                            <BoostedAmount>
                                {formatBalance((airdropAmount * (100 + boostPercent)) / 100, true)}{' '}
                                AQUA
                            </BoostedAmount>
                        </BoostedAirdrop>
                    </>
                )}
            </AccountAirdrop>
            <AirdropSchedule>
                <AirdropAmountColumn>
                    <AirdropSum>{formatBalance(airdropAmount, true)} AQUA</AirdropSum>
                    <AirdropSumPeriod>Total for 3 years</AirdropSumPeriod>
                </AirdropAmountColumn>
                <AirdropAmountColumn>
                    <AirdropSum>{formatBalance(airdropAmount / 3, true)} AQUA</AirdropSum>
                    <AirdropSumPeriod>1 year profit</AirdropSumPeriod>
                </AirdropAmountColumn>
                <AirdropAmountColumn>
                    <AirdropSum>{formatBalance(airdropAmount / 36, true)} AQUA</AirdropSum>
                    <AirdropSumPeriod>1 month profit</AirdropSumPeriod>
                </AirdropAmountColumn>
            </AirdropSchedule>
        </Container>
    );
};

export default ExpectedReward;
