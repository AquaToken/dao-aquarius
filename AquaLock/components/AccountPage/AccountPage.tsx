import * as React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import useAuthStore from '../../../common/store/authStore/useAuthStore';
import { useEffect, useMemo, useState } from 'react';
import { StellarService } from '../../../common/services/globalServices';
import { MainRoutes } from '../../routes';
import styled from 'styled-components';
import { COLORS } from '../../../common/styles';
import { commonMaxWidth } from '../../../common/mixins';
import AccountInfoBlock from './AccountInfoBlock/AccountInfoBlock';
import PageLoader from '../../../common/basics/PageLoader';
import AccountService from '../../../common/services/account.service';
import Portfolio from './Portfolio/Portfolio';
import ExpectedReward from './ExpectedReward/ExpectedReward';
import {
    START_AIRDROP2_TIMESTAMP,
    yXLM_CODE,
    yXLM_ISSUER,
} from '../../../common/services/stellar.service';
import NotEligibleBlock from './NotEligibleBlock/NotEligibleBlock';
import CurrentLocks from './CurrentLocks/CurrentLocks';
import LockAquaForm from './LockAquaForm/LockAquaForm';
import { roundToPrecision } from '../../../common/helpers/helpers';
import { getSharePrice } from '../../api/api';

const MainBlock = styled.main`
    flex: 1 0 auto;
    background-color: ${COLORS.lightGray};
    padding: 2.5% 0 5%;
`;

const Container = styled.div`
    ${commonMaxWidth};
    flex: 1 0 auto;
    padding: 0 4rem;
    display: flex;
    flex-direction: row;
    justify-content: center;
`;

const LeftColumn = styled.div<{ onlyLeft: boolean }>`
    display: flex;
    flex-direction: column;
    margin-right: 6rem;
    flex: 1;
    max-width: ${({ onlyLeft }) => (onlyLeft ? '67.6rem' : 'unset')};
`;

const RightColumn = styled.div`
    flex: 1;
    max-width: 48rem;
`;

export const MAX_AIRDROP_AMOUNT = 10000000;
export const MAX_TIME_LOCK = (3 * 365 + 1) * 24 * 60 * 60 * 1000;

const AccountPage = () => {
    const [currentAccount, setCurrentAccount] = useState(null);
    const [ammReserves, setAmmReserves] = useState(null);
    const [averageAquaPrice, setAverageAquaPrice] = useState(null);
    const [locks, setLocks] = useState(null);
    const [airdropSharesPrice, setAirdropSharesPrice] = useState(null);
    const [updateIndex, setUpdateIndex] = useState(0);

    const { account } = useAuthStore();
    const { accountId } = useParams<{ accountId: string }>();
    const history = useHistory();

    useEffect(() => {
        if (!StellarService.isValidPublicKey(accountId)) {
            history.push(MainRoutes.main);
            return;
        }
        if (account && accountId !== account.accountId()) {
            setCurrentAccount(null);
            history.replace(`/${account.accountId()}`);
        }
    }, [account, accountId]);

    useEffect(() => {
        getSharePrice().then((res) => {
            setAirdropSharesPrice(res.share_price);
            setAverageAquaPrice(+res.aqua_price);
        });
    }, []);

    useEffect(() => {
        if (!accountId) {
            return;
        }
        setCurrentAccount(null);
        StellarService.loadAccount(accountId).then((res) => {
            setCurrentAccount(new AccountService(res, null));
        });
    }, [accountId, updateIndex]);

    useEffect(() => {
        if (!accountId) {
            return;
        }
        StellarService.getAccountLocks(accountId).then((res) => {
            setLocks(res);
        });
    }, [accountId, updateIndex]);

    useEffect(() => {
        if (!currentAccount) {
            return;
        }
        currentAccount.getAmmBalancesForAirdrop2().then((res) => {
            setAmmReserves(res);
        });
    }, [currentAccount]);

    const updateAccount = () => {
        setUpdateIndex((prevState) => prevState + 1);
    };

    const { boostPercent, lockAmount } = useMemo(() => {
        if (
            !locks?.length ||
            !averageAquaPrice ||
            !ammReserves ||
            !currentAccount ||
            !airdropSharesPrice
        ) {
            return { boostPercent: 0, lockAmount: 0 };
        }

        const maxTimeStamp = new Date('2025-01-15T00:00:00Z').getTime();

        const { amountSum, weightedAverageTime } = locks.reduce(
            (acc, lock) => {
                acc.amountSum += Number(lock.amount);
                const lockEndTimestamp = new Date(
                    lock?.claimants?.[0].predicate?.not?.abs_before,
                ).getTime();
                const period = Math.min(lockEndTimestamp, maxTimeStamp) - START_AIRDROP2_TIMESTAMP;
                acc.weightedAverageTime += Math.max(period, 0) * Number(lock.amount);
                return acc;
            },
            { amountSum: 0, weightedAverageTime: 0 },
        );

        const averageLockTime = weightedAverageTime / amountSum;

        const timeLockMultiplier = Math.min(MAX_TIME_LOCK, averageLockTime) / MAX_TIME_LOCK;

        const lockedValue = amountSum * +averageAquaPrice;

        const xlmBalance = currentAccount.getAssetBalance(StellarService.createLumen());
        const yXlmBalance = currentAccount.getAssetBalance(
            StellarService.createAsset(yXLM_CODE, yXLM_ISSUER),
        );
        const aquaBalance = currentAccount.getAquaBalance();

        const airdropShares =
            xlmBalance +
            ammReserves.XLM +
            yXlmBalance +
            ammReserves.yXLM +
            (aquaBalance + ammReserves.AQUA + amountSum) * +averageAquaPrice;

        const unlockedValue = airdropShares - lockedValue;

        const valueLockMultiplier = Math.min(lockedValue, unlockedValue) / unlockedValue;

        const totalMultiplier = timeLockMultiplier * valueLockMultiplier;

        const maxBoost = 3;

        const boost = totalMultiplier * maxBoost;

        return { boostPercent: boost * 100, lockAmount: amountSum };
    }, [locks, averageAquaPrice, ammReserves, currentAccount]);

    if (!currentAccount || !ammReserves || !averageAquaPrice || !airdropSharesPrice) {
        return (
            <Container>
                <PageLoader />
            </Container>
        );
    }

    const xlmBalance = currentAccount.getAssetBalance(StellarService.createLumen());
    const yXlmBalance = currentAccount.getAssetBalance(
        StellarService.createAsset(yXLM_CODE, yXLM_ISSUER),
    );
    const aquaBalance = currentAccount.getAquaBalance();

    const hasEnoughAqua = aquaBalance >= 1;
    const hasEnoughLumens = xlmBalance + yXlmBalance >= 500;

    const isEligibleForAirdrop = hasEnoughAqua && hasEnoughLumens;

    const airdropSharesWithoutLocks =
        xlmBalance +
        ammReserves.XLM +
        yXlmBalance +
        ammReserves.yXLM +
        (aquaBalance + ammReserves.AQUA + lockAmount) * +averageAquaPrice;

    const airdropAmountWithoutLocks = roundToPrecision(
        Math.min(airdropSharesWithoutLocks * Number(airdropSharesPrice), MAX_AIRDROP_AMOUNT),
        2,
    );

    return (
        <MainBlock>
            <Container>
                <LeftColumn onlyLeft={!isEligibleForAirdrop}>
                    <AccountInfoBlock account={currentAccount} />
                    {!isEligibleForAirdrop && (
                        <NotEligibleBlock accountId={currentAccount.accountId()} />
                    )}
                    <Portfolio ammReserves={ammReserves} currentAccount={currentAccount} />
                    {isEligibleForAirdrop && (
                        <ExpectedReward
                            airdropAmount={airdropAmountWithoutLocks}
                            boostPercent={boostPercent}
                        />
                    )}
                    {Boolean(locks?.length) && (
                        <CurrentLocks locks={locks} aquaBalance={aquaBalance} />
                    )}
                </LeftColumn>
                {isEligibleForAirdrop && (
                    <RightColumn>
                        <LockAquaForm
                            account={currentAccount}
                            averageAquaPrice={averageAquaPrice}
                            locks={locks}
                            airdropSharesWithoutLocks={airdropSharesWithoutLocks}
                            airdropSharesPrice={+airdropSharesPrice}
                            ammReserves={ammReserves}
                            updateAccount={updateAccount}
                        />
                    </RightColumn>
                )}
            </Container>
        </MainBlock>
    );
};

export default AccountPage;
