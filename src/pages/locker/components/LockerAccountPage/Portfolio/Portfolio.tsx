import * as React from 'react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Breakpoints, COLORS } from '../../../../../common/styles';
import { flexRowSpaceBetween, respondDown } from '../../../../../common/mixins';
import AquaLogo from 'assets/aqua-logo-small.svg';
import AccountService from '../../../../../common/services/account.service';
import { formatBalance, roundToPrecision } from '../../../../../common/helpers/helpers';
import PageLoader from '../../../../../common/basics/PageLoader';
import { ServerApi } from '@stellar/stellar-sdk';
import { StellarService } from '../../../../../common/services/globalServices';
import DotsLoader from '../../../../../common/basics/DotsLoader';

const Container = styled.div`
    margin-top: 6.3rem;
    display: flex;
    flex-direction: column;
    background-color: ${COLORS.white};
    border-radius: 0.5rem;
    padding: 3.2rem;
`;

const Header = styled.div`
    ${flexRowSpaceBetween};
    margin-bottom: 2.4rem;

    ${respondDown(Breakpoints.md)`
          flex-direction: column;
          align-items: flex-start;
    `}
`;

const Title = styled.span`
    font-size: 1.4rem;
    line-height: 2rem;
    color: ${COLORS.grayText};
`;

const BalanceRow = styled.div`
    display: flex;
    align-items: center;
    padding-bottom: 3.2rem;
    border-bottom: 0.1rem dashed ${COLORS.gray};
`;

const Aqua = styled(AquaLogo)`
    height: 4.8rem;
    width: 4.8rem;
`;

const Balance = styled.span`
    font-weight: bold;
    font-size: 5.6rem;
    line-height: 6.4rem;
    color: ${COLORS.buttonBackground};
    margin-left: 1.6rem;

    ${respondDown(Breakpoints.md)`
         font-size: 2.4rem;
         line-height: 3rem;
    `}
`;

export const AdditionalInfo = styled.div`
    display: flex;
    width: 100%;

    ${respondDown(Breakpoints.md)`
        flex-direction: column;
    `}
`;

export const AdditionalInfoColumn = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1;
    padding-top: 3.2rem;
`;

export const BalanceLabel = styled.div<{ color: string; textColor: string }>`
    width: min-content;
    height: 1.9rem;
    border-radius: 0.3rem;
    text-align: center;
    line-height: 1.9rem;
    font-size: 1rem;
    font-weight: bold;
    background: ${({ color }) => color};
    color: ${({ textColor }) => textColor};
    margin-right: 0.7rem;
    padding: 0 0.8rem;
`;

const AdditionalInfoBalance = styled.span`
    font-weight: bold;
    font-size: 2rem;
    line-height: 2.8rem;
    color: ${COLORS.buttonBackground};
    margin-top: 1rem;
`;

export const AdditionalInfoDescription = styled.span`
    font-size: 1.4rem;
    line-height: 2rem;
    color: ${COLORS.grayText};
`;

const Portfolio = ({
    ammAquaBalance,
    currentAccount,
    locks,
}: {
    ammAquaBalance: number;
    currentAccount: AccountService;
    locks: ServerApi.ClaimableBalanceRecord[];
}) => {
    const [price, setPrice] = useState(null);

    useEffect(() => {
        StellarService.getAquaPrice().then((res) => {
            setPrice(res);
        });
    }, []);

    if (!currentAccount || ammAquaBalance === null || locks === null) {
        return (
            <Container>
                <PageLoader />
            </Container>
        );
    }
    const aquaBalance = currentAccount.getAquaBalance();
    const locksSum = locks.reduce((acc, lock) => {
        acc += Number(lock.amount);
        return acc;
    }, 0);

    const total = aquaBalance + locksSum;

    const percent = total ? roundToPrecision((locksSum / total) * 100, 2) : 0;

    return (
        <Container>
            <Header>
                <Title>Your available AQUA balance</Title>
                <Title>{price ? `1 AQUA = ${formatBalance(price)} XLM` : <DotsLoader />}</Title>
            </Header>
            <BalanceRow>
                <Aqua />
                <Balance>{formatBalance(aquaBalance, true)} AQUA</Balance>
            </BalanceRow>
            <AdditionalInfo>
                <AdditionalInfoColumn>
                    <BalanceLabel color={COLORS.yellow} textColor={COLORS.titleText}>
                        AMM
                    </BalanceLabel>
                    <AdditionalInfoBalance>
                        + {formatBalance(ammAquaBalance, true)} AQUA
                    </AdditionalInfoBalance>
                    <AdditionalInfoDescription>in AMM pool</AdditionalInfoDescription>
                </AdditionalInfoColumn>
                <AdditionalInfoColumn>
                    <BalanceLabel color={COLORS.purple} textColor={COLORS.white}>
                        LOCK
                    </BalanceLabel>
                    <AdditionalInfoBalance>
                        + {formatBalance(locksSum, true)} AQUA ({percent}%)
                    </AdditionalInfoBalance>
                    <AdditionalInfoDescription>Locked</AdditionalInfoDescription>
                </AdditionalInfoColumn>
            </AdditionalInfo>
        </Container>
    );
};

export default Portfolio;
