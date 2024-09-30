import * as React from 'react';
import { useCallback } from 'react';
import styled from 'styled-components';

import { formatBalance } from 'helpers/format-number';

import useAuthStore from 'store/authStore/useAuthStore';

import { ClaimableBalance } from 'types/stellar';

import AccountService from 'services/account.service';
import { ModalService, StellarService } from 'services/globalServices';
import { GOV_ICE_CODE, ICE_CODE, ICE_ISSUER } from 'services/stellar.service';
import { respondDown } from 'web/mixins';
import ChooseLoginMethodModal from 'web/modals/auth/ChooseLoginMethodModal';
import { Breakpoints, COLORS } from 'web/styles';

import IceLogo from 'assets/ice-logo.svg';

import Button from 'basics/buttons/Button';
import ExternalLink from 'basics/ExternalLink';

import { DOWN_ICE, UP_ICE } from 'pages/vote/components/MainPage/MainPage';

import AddIceTrustlinesModal from '../AddIceTrustlinesModal/AddIceTrustlinesModal';

const Container = styled.div`
    margin-top: 4rem;
    display: flex;
    flex-direction: column;
    background-color: ${COLORS.white};
    border-radius: 0.5rem;
    padding: 3.2rem 3.2rem 4.2rem;
`;

const Title = styled.span`
    font-size: 1.4rem;
    line-height: 2rem;
    color: ${COLORS.grayText};
    margin-bottom: 0.5rem;
`;

const BalanceRow = styled.div`
    display: flex;
    align-items: center;
    margin-top: 2.4rem;

    &:last-child {
        margin-bottom: 3.2rem;

        ${respondDown(Breakpoints.md)`
            flex-direction: column;
            align-items: flex-start;
        `}
    }
`;

const SmallBalanceColumn = styled.div`
    display: flex;
    flex: 1;
    flex-direction: column;

    ${respondDown(Breakpoints.md)`
         margin-bottom: 2rem;
    `}
`;

const SmallBalance = styled.div`
    display: flex;
    align-items: center;
    font-weight: 700;
    font-size: 2rem;
    line-height: 2.8rem;
    color: ${COLORS.titleText};
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

const IceDescription = styled.div`
    display: flex;
    border-radius: 0.5rem;
    background-color: ${COLORS.lightGray};
    padding: 2.6rem 2.2rem 2rem;
    gap: 2rem;
`;

const IceDescriptionEmoji = styled.span`
    font-weight: 700;
    font-size: 1.8rem;
    line-height: 3.2rem;
`;

const IceDescriptionContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
`;

const IceDescriptionText = styled.span`
    font-weight: 400;
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.descriptionText};
    opacity: 0.7;
`;

const ClaimIceBlock = styled.div`
    display: flex;
    background: ${COLORS.blue};
    border-radius: 5px;
    padding: 2.9rem 4.5rem 2.9rem 3.2rem;
    margin-bottom: 1.6rem;
    justify-content: space-between;

    ${respondDown(Breakpoints.md)`
        flex-direction: column;
        gap: 3rem
    `}
`;

const ClaimIceColumn = styled.div`
    display: flex;
    flex-direction: column;
`;

const ClaimIceColumnTitle = styled.span`
    font-weight: 400;
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.white};
    opacity: 0.7;
`;

const ClaimIceAmount = styled.span`
    font-weight: 700;
    font-size: 2rem;
    line-height: 2.8rem;
    color: ${COLORS.white};
`;

const ClaimIcePending = styled.span`
    font-weight: 400;
    font-size: 1.6rem;
    line-height: 2.8rem;
    font-style: italic;
    color: ${COLORS.white};
    opacity: 0.7;
`;

const Logo = styled(IceLogo)`
    width: 4.8rem;
    height: 4.8rem;
`;

const SmallLogo = styled(IceLogo)`
    width: 2rem;
    height: 2rem;
    margin-right: 0.5rem;
`;

export const MAX_BOOST = 9;
export const MAX_BOOST_PERIOD = 3 * 365 * 24 * 60 * 60 * 1000;
export const MIN_BOOST_PERIOD = 24 * 60 * 60 * 1000;
export const MAX_LOCK_PERIOD = 10 * 365 * 24 * 60 * 60 * 1000;

export const roundMsToDays = (timestamp: number) => Math.floor(timestamp / (24 * 60 * 60 * 1000));

interface IceBlockProps {
    account: AccountService;
    locks: ClaimableBalance[];
}

const IceBlock = ({ account, locks }: IceBlockProps): React.ReactNode => {
    const { isLogged } = useAuthStore();

    const iceBalance = Number(
        account.getAssetBalance(StellarService.createAsset(ICE_CODE, ICE_ISSUER)),
    );

    const upBalance = account.getAssetBalance(UP_ICE);
    const downBalance = account.getAssetBalance(DOWN_ICE);
    const govBalance = account.getAssetBalance(
        StellarService.createAsset(GOV_ICE_CODE, ICE_ISSUER),
    );

    const getIceAmount = useCallback(
        () =>
            locks.reduce((acc, lock) => {
                const remainingPeriod = Math.max(
                    roundMsToDays(new Date(lock.claimants[0].predicate.not.abs_before).getTime()) -
                        roundMsToDays(Date.now()),
                    0,
                );
                const boost =
                    Math.min(remainingPeriod / roundMsToDays(MAX_BOOST_PERIOD), 1) * MAX_BOOST;
                const distributedAmount = Number(lock.amount) * (1 + boost);
                return acc + distributedAmount;
            }, 0),
        [locks],
    );

    const addTrustlines = () => {
        if (!isLogged) {
            ModalService.openModal(ChooseLoginMethodModal, {
                callback: () => ModalService.openModal(AddIceTrustlinesModal, {}),
            });
            return;
        }
        ModalService.openModal(AddIceTrustlinesModal, {});
    };

    return (
        <Container>
            <Title>Your available ICE balance</Title>
            <div>
                <BalanceRow>
                    <Logo />
                    <Balance>
                        {account.hasAllIceTrustlines() ? formatBalance(iceBalance, true) : 0} ICE
                    </Balance>
                </BalanceRow>
                <BalanceRow>
                    <SmallBalanceColumn>
                        <Title>upvoteICE</Title>
                        <SmallBalance>
                            <SmallLogo />
                            {formatBalance(Number(upBalance), true)}
                        </SmallBalance>
                    </SmallBalanceColumn>
                    <SmallBalanceColumn>
                        <Title>downvoteICE</Title>
                        <SmallBalance>
                            <SmallLogo />
                            {formatBalance(Number(downBalance), true)}
                        </SmallBalance>
                    </SmallBalanceColumn>
                    <SmallBalanceColumn>
                        <Title>governICE</Title>
                        <SmallBalance>
                            <SmallLogo />
                            {formatBalance(Number(govBalance), true)}
                        </SmallBalance>
                    </SmallBalanceColumn>
                </BalanceRow>
            </div>

            {Boolean(locks.length && iceBalance === 0) && (
                <ClaimIceBlock>
                    <ClaimIceColumn>
                        <ClaimIceColumnTitle>You have unclaimed ICE tokens:</ClaimIceColumnTitle>
                        <ClaimIceAmount>≈ {formatBalance(getIceAmount(), true)} ICE</ClaimIceAmount>
                        {account.hasAllIceTrustlines() && (
                            <ClaimIcePending>
                                ICE tokens will be credited to your wallet within the next 2 hours.
                            </ClaimIcePending>
                        )}
                    </ClaimIceColumn>
                    {!account.hasAllIceTrustlines() && (
                        <Button isWhite onClick={() => addTrustlines()}>
                            CLAIM ICE
                        </Button>
                    )}
                </ClaimIceBlock>
            )}
            <IceDescription>
                <IceDescriptionEmoji>☝️</IceDescriptionEmoji>
                <IceDescriptionContent>
                    <IceDescriptionText>
                        ICE enables increased voting power & flexibility between liquidity &
                        governance voting, as well as boosted yields when providing liquidity on
                        markets receiving SDEX & AMM rewards.
                    </IceDescriptionText>
                    <ExternalLink href="https://medium.com/aquarius-aqua/ice-the-next-stage-of-aquarius-810edc7cf3bb">
                        Learn more
                    </ExternalLink>
                </IceDescriptionContent>
            </IceDescription>
        </Container>
    );
};

export default IceBlock;
