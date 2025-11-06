import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { DOWN_ICE_CODE, GOV_ICE_CODE, ICE_CODE, ICE_ISSUER, UP_ICE_CODE } from 'constants/assets';
import { MainRoutes } from 'constants/routes';

import { formatBalance } from 'helpers/format-number';
import { createAsset } from 'helpers/token';

import useAuthStore from 'store/authStore/useAuthStore';

import { StellarService } from 'services/globalServices';
import { StellarEvents } from 'services/stellar/events/events';

import { ClaimableBalance } from 'types/stellar';

import Aqua from 'assets/aqua/aqua-logo.svg';
import Withdraw from 'assets/icons/actions/icon-withdraw-16.svg';
import PlusIcon from 'assets/icons/nav/icon-plus-16.svg';
import Info from 'assets/icons/status/icon-info-16.svg';
import Ice from 'assets/tokens/ice-logo.svg';
import Lumen from 'assets/tokens/xlm-logo.svg';

import { Button } from 'basics/buttons';
import DotsLoader from 'basics/loaders/DotsLoader';
import Tooltip, { TOOLTIP_POSITION } from 'basics/Tooltip';

import { cardBoxShadow, commonMaxWidth, respondDown } from 'styles/mixins';
import { Breakpoints, COLORS } from 'styles/style-constants';

const Container = styled.div`
    ${commonMaxWidth};
    width: 100%;
    margin-bottom: 5.6rem;
    padding: 0 4rem;
    margin-top: -5rem;
    z-index: 2;

    ${respondDown(Breakpoints.md)`
        padding: 3.2rem 1.6rem 2rem;
        margin-bottom: 0;
    `}
`;

const Wrapper = styled.div`
    background-color: ${COLORS.white};
    padding: 3.2rem;
    ${cardBoxShadow};
    border-radius: 1rem;

    ${respondDown(Breakpoints.md)`
        padding: 2.4rem;
    `}
`;

const BalancesContainer = styled.div`
    display: flex;
    border-bottom: 0.1rem dashed ${COLORS.gray100};
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
            border-top: 0.1rem dashed ${COLORS.gray100};
            padding-top: 2.4rem;
        }
    `}
`;

const Header = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 2.6rem;

    ${respondDown(Breakpoints.xs)`
        flex-direction: column;
        align-items: flex-start;
        gap: 1.6rem;
    `}
`;

const HeaderButtons = styled.div`
    display: flex;
    align-items: center;
    gap: 0.8rem;

    a {
        text-decoration: none;

        svg {
            margin-right: 0.5rem;
        }
    }
`;

const BalanceTitle = styled.span`
    font-size: 1.6rem;
    line-height: 1.8rem;
    color: ${COLORS.textGray};
`;

const BalanceValue = styled.div`
    display: flex;
    align-items: center;
    font-size: 36px;
    line-height: 42px;
    color: ${COLORS.textPrimary};
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
    color: ${COLORS.textGray};
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
    color: ${COLORS.textPrimary};
`;

const AdditionalInfoBalance = styled.span`
    font-weight: bold;
    font-size: 2rem;
    line-height: 2.8rem;
    color: ${COLORS.purple950};
    margin-top: 1rem;

    ${respondDown(Breakpoints.md)`
         margin-top: 0;
         margin-left: 1.2rem;
         margin-right: 0.6rem;
         font-weight: 400;
         font-size: 1.6rem;
    `}
`;

const AdditionalInfo = styled.div`
    display: flex;
    width: 100%;

    ${respondDown(Breakpoints.md)`
        flex-direction: column;
    `}
`;

const AdditionalInfoDescription = styled.span`
    font-size: 1.4rem;
    line-height: 2rem;
    color: ${COLORS.textGray};
`;

const BalanceLabel = styled.div<{ $color: string; $textColor: string }>`
    width: min-content;
    height: 1.9rem;
    border-radius: 0.3rem;
    text-align: center;
    line-height: 1.9rem;
    font-size: 1rem;
    font-weight: bold;
    background: ${({ $color }) => $color};
    color: ${({ $textColor }) => $textColor};
    margin-right: 0.7rem;
    padding: 0 0.8rem;
    white-space: nowrap;
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
    margin-top: 2rem;
    justify-content: space-between;

    ${respondDown(Breakpoints.sm)`
         flex-direction: column;
         gap: 1.8rem;
    `}
`;

const LumenBalanceLabel = styled.span`
    font-size: 1.6rem;
    line-height: 1.8rem;
    color: ${COLORS.textGray};
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
    color: ${COLORS.textPrimary};
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
    color: ${COLORS.textGray};

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

    const { account } = useAuthStore();

    useEffect(() => {
        const unsub = StellarService.event.sub((event: { type: StellarEvents }) => {
            if (event.type === StellarEvents.claimableUpdate) {
                setLocks(StellarService.cb.getLocks(account.accountId()));
            }
        });

        return () => unsub();
    }, []);

    useEffect(() => {
        setLocks(StellarService.cb.getLocks(account.accountId()));
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

    const iceBalance = account.getAssetBalance(createAsset(ICE_CODE, ICE_ISSUER));
    const upIceBalance = account.getAssetBalance(createAsset(UP_ICE_CODE, ICE_ISSUER));
    const downIceBalance = account.getAssetBalance(createAsset(DOWN_ICE_CODE, ICE_ISSUER));
    const govIceBalance = account.getAssetBalance(createAsset(GOV_ICE_CODE, ICE_ISSUER));
    return (
        <Container>
            <Wrapper>
                <BalancesContainer>
                    <BalancesColumn>
                        <Header>
                            <BalanceTitle>Your Available AQUA Balance</BalanceTitle>
                        </Header>

                        <BalanceValue>
                            <AquaLogo />
                            {formatBalance(+aquaBalance, true)} AQUA
                        </BalanceValue>
                        <AdditionalInfo>
                            <InfoColumn>
                                <BalanceLabel
                                    $color={COLORS.yellow500}
                                    $textColor={COLORS.textPrimary}
                                >
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
                                    AQUA In AMM Pools
                                </AdditionalInfoDescription>
                            </InfoColumn>
                            <InfoColumn>
                                <BalanceLabel $color={COLORS.purple500} $textColor={COLORS.white}>
                                    LOCK
                                </BalanceLabel>
                                <AdditionalInfoBalance>
                                    {locksSum === null ? (
                                        <DotsLoader />
                                    ) : (
                                        <span>{formatBalance(+locksSum, true)}</span>
                                    )}
                                </AdditionalInfoBalance>
                                <AdditionalInfoDescription>AQUA Locked</AdditionalInfoDescription>
                            </InfoColumn>
                        </AdditionalInfo>
                    </BalancesColumn>
                    <BalancesColumn>
                        <Header>
                            <BalanceTitle>Your Current ICE Balance</BalanceTitle>
                            <HeaderButtons>
                                <Link to={MainRoutes.locker}>
                                    <Button isSmall>
                                        <PlusIcon /> get ice
                                    </Button>
                                </Link>

                                <Link to={MainRoutes.delegate}>
                                    <Button isSmall secondary>
                                        <Withdraw /> delegate
                                    </Button>
                                </Link>
                            </HeaderButtons>
                        </Header>

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
                        <LumenBalanceLabel>Available XLM Balance:</LumenBalanceLabel>
                        <LumenLogo />
                        <LumenBalanceValue>{formatBalance(+lumenBalance, true)}</LumenBalanceValue>
                        <LumenBalanceLabel>XLM</LumenBalanceLabel>
                    </LumenBalance>

                    <Tooltip
                        content={
                            <TooltipInner>
                                All actions performed on the Stellar network require a fee paid in
                                XLM. Ensure a sufficient XLM balance in your wallet to vote with
                                ICE, claim back votes, and freeze ICE with the locker tool.
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
