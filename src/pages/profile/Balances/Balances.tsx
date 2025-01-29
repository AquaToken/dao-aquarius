import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

import { formatBalance } from 'helpers/format-number';

import useAuthStore from 'store/authStore/useAuthStore';

import { StellarService } from 'services/globalServices';
import {
    DOWN_ICE_CODE,
    GOV_ICE_CODE,
    ICE_CODE,
    ICE_ISSUER,
    StellarEvents,
    UP_ICE_CODE,
} from 'services/stellar.service';

import { ClaimableBalance } from 'types/stellar';

import { commonMaxWidth, respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import Aqua from 'assets/aqua-logo-small.svg';
import Ice from 'assets/ice-logo.svg';
import Info from 'assets/icon-info.svg';
import Lumen from 'assets/xlm-logo.svg';

import DotsLoader from 'basics/loaders/DotsLoader';
import Tooltip, { TOOLTIP_POSITION } from 'basics/Tooltip';

import {
    AdditionalInfo,
    AdditionalInfoDescription,
    BalanceLabel,
} from '../../locker/components/LockerAccountPage/Portfolio/Portfolio';

const Container = styled.div`
    ${commonMaxWidth};
    width: 100%;
    margin-bottom: 5.6rem;
    padding: 0 4rem;
    margin-top: -9rem;
    z-index: 2;

    ${respondDown(Breakpoints.md)`
        padding: 3.2rem 1.6rem 2rem;
        margin-top: -9rem;
        margin-bottom: 0;
    `}
`;

const Wrapper = styled.div`
    background-color: ${COLORS.white};
    padding: 4.8rem 4.8rem 4.2rem;
    box-shadow: 0 2rem 3rem rgba(0, 6, 54, 0.06);
    border-radius: 1rem;

    ${respondDown(Breakpoints.md)`
        padding: 2.4rem;
    `}
`;

const BalancesContainer = styled.div`
    display: flex;
    border-bottom: 0.1rem dashed ${COLORS.gray};
    padding-bottom: 3.2rem;
    gap: 1.6rem;

    ${respondDown(Breakpoints.lg)`
        flex-direction: column;
    `}
`;

const BalancesColumn = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1;

    ${respondDown(Breakpoints.lg)`
        &:not(:first-child){
            margin-top: 2.4rem;
            border-top: 0.1rem dashed ${COLORS.gray};
            padding-top: 2.4rem;
        }
    `}
`;

const BalanceTitle = styled.span`
    font-size: 1.6rem;
    line-height: 1.8rem;
    color: ${COLORS.grayText};
    margin-bottom: 2.6rem;
`;

const BalanceValue = styled.div`
    display: flex;
    align-items: center;
    font-size: 36px;
    line-height: 42px;
    color: ${COLORS.titleText};
    margin-bottom: 4.4rem;

    ${respondDown(Breakpoints.md)`
         margin-bottom: 1.8rem;
         font-size: 20px;
         line-height: 28px;
         font-weight: 700;
    `}
`;

const AquaLogo = styled(Aqua)`
    height: 4.8rem;
    width: 4.8rem;
    margin-right: 1.9rem;

    ${respondDown(Breakpoints.md)`
        height: 3.2rem;
        width: 3.2rem;
    `}
`;

const IceLogo = styled(Ice)`
    height: 4.8rem;
    width: 4.8rem;
    margin-right: 1.9rem;

    ${respondDown(Breakpoints.md)`
        height: 3.2rem;
        width: 3.2rem;
    `}
`;

const IceLogoSmall = styled(Ice)`
    height: 2rem;
    width: 2rem;
    margin-right: 0.5rem;

    ${respondDown(Breakpoints.md)`
        margin-right: 2.4rem;
        margin-left: 0.7rem;
    `}
`;

const BalanceTitleSmall = styled.div`
    font-size: 1.4rem;
    line-height: 2rem;
    color: ${COLORS.grayText};
    margin-bottom: 0.5rem;

    ${respondDown(Breakpoints.md)`
        margin-left: 0.6rem;
        margin-bottom: 0;
    `}
`;

const BalanceValueSmall = styled.div`
    display: flex;
    align-items: center;
    font-weight: 700;
    font-size: 2rem;
    line-height: 2.8rem;
    color: ${COLORS.titleText};
`;

const AdditionalInfoBalance = styled.span`
    font-weight: bold;
    font-size: 2rem;
    line-height: 2.8rem;
    color: ${COLORS.buttonBackground};
    margin-top: 1rem;

    ${respondDown(Breakpoints.md)`
         margin-top: 0;
         margin-left: 1.2rem;
         margin-right: 0.6rem;
         font-weight: 400;
         font-size: 1.6rem;
    `}
`;

const InfoColumn = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1;

    ${respondDown(Breakpoints.lg)`
         flex: unset;
         margin-right: 10rem;
    `}

    ${respondDown(Breakpoints.md)`
         flex: unset;
         margin-right: 0;
         flex-direction: row;
         align-items: center;
         margin-bottom: 0.8rem;
    `}
`;

const InfoColumnIce = styled(InfoColumn)`
    ${respondDown(Breakpoints.md)`
         flex-direction: row-reverse;
         justify-content: flex-end;
    `}
`;

const LumenBalanceRow = styled.div`
    display: flex;
    align-items: center;
    margin-top: 3.6rem;
    justify-content: space-between;

    ${respondDown(Breakpoints.sm)`
         flex-direction: column;
         gap: 1.8rem;
    `}
`;

const LumenBalanceLabel = styled.span`
    font-size: 1.6rem;
    line-height: 1.8rem;
    color: ${COLORS.grayText};
`;

const LumenBalance = styled.div`
    display: flex;
    align-items: center;

    ${respondDown(Breakpoints.sm)`
         width: 100%;
    `}
`;

const LumenBalanceValue = styled.span`
    font-size: 1.6rem;
    line-height: 1.8rem;
    color: ${COLORS.titleText};
    font-weight: 700;
    margin-right: 1rem;
`;

const LumenLogo = styled(Lumen)`
    width: 3.2rem;
    height: 3.2rem;
    margin-left: 1.6rem;
    margin-right: 1.3rem;

    ${respondDown(Breakpoints.sm)`
         margin-left: auto;
    `}
`;

const HintRow = styled.div`
    display: flex;
    align-items: center;

    ${respondDown(Breakpoints.sm)`
         flex-direction: row-reverse;
    `}
`;

const Hint = styled.div`
    margin-left: auto;
    margin-right: 2rem;
    font-size: 1.4rem;
    line-height: 2rem;
    color: ${COLORS.grayText};

    ${respondDown(Breakpoints.sm)`
        margin-right: 0;
        margin-left: 0.7rem;
        
        span {
            display: none;
        }
    `}
`;

const TooltipInner = styled.div`
    width: 30rem;
    white-space: pre-wrap;
`;

interface BalancesProps {
    ammAquaBalance: number;
}

const Balances = ({ ammAquaBalance }: BalancesProps): React.ReactNode => {
    const [locks, setLocks] = useState<ClaimableBalance[]>(null);
    const [aquaInVotes, setAquaInVotes] = useState(null);

    const { account } = useAuthStore();

    useEffect(() => {
        StellarService.getAquaInLiquidityVotes(account.accountId()).then(res => {
            setAquaInVotes(res);
        });
    }, []);

    useEffect(() => {
        const unsub = StellarService.event.sub((event: { type: StellarEvents }) => {
            if (event.type === StellarEvents.claimableUpdate) {
                StellarService.getAquaInLiquidityVotes(account.accountId()).then(res => {
                    setAquaInVotes(res);
                });
                setLocks(StellarService.getLocks(account.accountId()));
            }
        });

        return () => unsub();
    }, []);

    useEffect(() => {
        setLocks(StellarService.getLocks(account.accountId()));
    }, []);

    const aquaBalance = account.getAquaBalance();
    const lumenBalance = account.getAvailableNativeBalance();

    const locksSum = useMemo(() => {
        if (!locks) {
            return null;
        }
        return locks.reduce((acc: number, lock: ClaimableBalance) => {
            acc += Number(lock.amount);
            return acc;
        }, 0);
    }, [locks]);

    const iceBalance = account.getAssetBalance(StellarService.createAsset(ICE_CODE, ICE_ISSUER));
    const upIceBalance = account.getAssetBalance(
        StellarService.createAsset(UP_ICE_CODE, ICE_ISSUER),
    );
    const downIceBalance = account.getAssetBalance(
        StellarService.createAsset(DOWN_ICE_CODE, ICE_ISSUER),
    );
    const govIceBalance = account.getAssetBalance(
        StellarService.createAsset(GOV_ICE_CODE, ICE_ISSUER),
    );
    return (
        <Container>
            <Wrapper>
                <BalancesContainer>
                    <BalancesColumn>
                        <BalanceTitle>Your available AQUA balance</BalanceTitle>
                        <BalanceValue>
                            <AquaLogo />
                            {formatBalance(+aquaBalance, true)} AQUA
                        </BalanceValue>
                        <AdditionalInfo>
                            <InfoColumn>
                                <BalanceLabel $color={COLORS.yellow} $textColor={COLORS.titleText}>
                                    Aquarius AMM
                                </BalanceLabel>
                                <AdditionalInfoBalance>
                                    {ammAquaBalance === null ? (
                                        <DotsLoader />
                                    ) : (
                                        <span>{formatBalance(ammAquaBalance, true)}</span>
                                    )}
                                </AdditionalInfoBalance>
                                <AdditionalInfoDescription>
                                    AQUA in AMM pools
                                </AdditionalInfoDescription>
                            </InfoColumn>
                            <InfoColumn>
                                <BalanceLabel $color={COLORS.purple} $textColor={COLORS.white}>
                                    LOCK
                                </BalanceLabel>
                                <AdditionalInfoBalance>
                                    {locksSum === null ? (
                                        <DotsLoader />
                                    ) : (
                                        <span>{formatBalance(+locksSum, true)}</span>
                                    )}
                                </AdditionalInfoBalance>
                                <AdditionalInfoDescription>AQUA locked</AdditionalInfoDescription>
                            </InfoColumn>
                            <InfoColumn>
                                <BalanceLabel $color={COLORS.purple} $textColor={COLORS.white}>
                                    VOTE
                                </BalanceLabel>
                                <AdditionalInfoBalance>
                                    {aquaInVotes === null ? (
                                        <DotsLoader />
                                    ) : (
                                        <span>{formatBalance(+aquaInVotes, true)}</span>
                                    )}
                                </AdditionalInfoBalance>
                                <AdditionalInfoDescription>AQUA in votes</AdditionalInfoDescription>
                            </InfoColumn>
                        </AdditionalInfo>
                    </BalancesColumn>
                    <BalancesColumn>
                        <BalanceTitle>Your current ICE balance</BalanceTitle>
                        <BalanceValue>
                            <IceLogo />
                            {formatBalance(+iceBalance, true)} ICE
                        </BalanceValue>
                        <AdditionalInfo>
                            <InfoColumnIce>
                                <BalanceTitleSmall>upvoteICE</BalanceTitleSmall>
                                <BalanceValueSmall>
                                    <IceLogoSmall />
                                    {formatBalance(+upIceBalance, true)}
                                </BalanceValueSmall>
                            </InfoColumnIce>
                            <InfoColumnIce>
                                <BalanceTitleSmall>downvoteICE</BalanceTitleSmall>
                                <BalanceValueSmall>
                                    <IceLogoSmall />
                                    {formatBalance(+downIceBalance, true)}
                                </BalanceValueSmall>
                            </InfoColumnIce>
                            <InfoColumnIce>
                                <BalanceTitleSmall>governICE</BalanceTitleSmall>
                                <BalanceValueSmall>
                                    <IceLogoSmall />
                                    {formatBalance(+govIceBalance, true)}
                                </BalanceValueSmall>
                            </InfoColumnIce>
                        </AdditionalInfo>
                    </BalancesColumn>
                </BalancesContainer>
                <LumenBalanceRow>
                    <LumenBalance>
                        <LumenBalanceLabel>Available XLM balance:</LumenBalanceLabel>
                        <LumenLogo />
                        <LumenBalanceValue>{formatBalance(+lumenBalance, true)}</LumenBalanceValue>
                        <LumenBalanceLabel>XLM</LumenBalanceLabel>
                    </LumenBalance>

                    <Tooltip
                        content={
                            <TooltipInner>
                                All actions performed on the Stellar network require a fee paid in
                                XLM. Ensure a sufficient XLM balance in your wallet to vote with
                                AQUA/ICE, claim back votes, and freeze ICE with the locker tool.
                            </TooltipInner>
                        }
                        position={TOOLTIP_POSITION.top}
                        showOnHover
                    >
                        <HintRow>
                            <Hint>
                                <span>☝️ </span>XLM is used to pay network fees
                            </Hint>

                            <Info />
                        </HintRow>
                    </Tooltip>
                </LumenBalanceRow>
            </Wrapper>
        </Container>
    );
};

export default Balances;
