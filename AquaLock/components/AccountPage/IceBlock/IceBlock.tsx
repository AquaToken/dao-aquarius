import * as React from 'react';
import { useCallback } from 'react';
import styled from 'styled-components';
import { Breakpoints, COLORS } from '../../../../common/styles';
import { respondDown } from '../../../../common/mixins';
import IceLogo from '../../../../common/assets/img/ice-logo.svg';
import { formatBalance } from '../../../../common/helpers/helpers';
import ExternalLink from '../../../../common/basics/ExternalLink';
import { ICE_CODE, ICE_ISSUER } from '../../../../common/services/stellar.service';
import { ModalService, StellarService } from '../../../../common/services/globalServices';
import Button from '../../../../common/basics/Button';
import AddIceTrustlinesModal from '../AddIceTrustlinesModal/AddIceTrustlinesModal';
import useAuthStore from '../../../../common/store/authStore/useAuthStore';
import ChooseLoginMethodModal from '../../../../common/modals/ChooseLoginMethodModal';
import AccountService from '../../../../common/services/account.service';
import { ServerApi } from 'stellar-sdk';

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
    margin-bottom: 2.4rem;
`;

const BalanceRow = styled.div`
    display: flex;
    align-items: center;
    padding-bottom: 3.2rem;
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
    margin-top: 3.3rem;
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

export const MAX_BOOST = 9;
export const MAX_BOOST_PERIOD = (3 * 365 + 1) * 24 * 60 * 60 * 1000;
export const MIN_BOOST_PERIOD = 24 * 60 * 60 * 1000;

interface IceBlockProps {
    account: AccountService;
    locks: ServerApi.ClaimableBalanceRecord[];
}

const IceBlock = ({ account, locks }: IceBlockProps): JSX.Element => {
    const { isLogged } = useAuthStore();

    const iceBalance = Number(
        account.getAssetBalance(StellarService.createAsset(ICE_CODE, ICE_ISSUER)),
    );

    const getIceAmount = useCallback(() => {
        return locks.reduce((acc, lock) => {
            const remainingPeriod = Math.max(
                new Date(lock.claimants[0].predicate.not.abs_before).getTime() - Date.now(),
                0,
            );
            const boost = Math.min(remainingPeriod / MAX_BOOST_PERIOD, 1) * MAX_BOOST;
            const distributedAmount = Number(lock.amount) * (1 + boost);
            return acc + distributedAmount;
        }, 0);
    }, [locks]);

    const addTrustlines = () => {
        if (!isLogged) {
            ModalService.openModal(ChooseLoginMethodModal, {});
            return;
        }
        ModalService.openModal(AddIceTrustlinesModal, {});
    };

    return (
        <Container>
            <Title>Your available ICE balance</Title>
            <BalanceRow>
                <Logo />
                <Balance>
                    {account.hasAllIceTrustlines() ? formatBalance(iceBalance, true) : 0} ICE
                </Balance>
            </BalanceRow>
            <IceDescription>
                <IceDescriptionEmoji>☝️</IceDescriptionEmoji>
                <IceDescriptionContent>
                    <IceDescriptionText>
                        ICE enables increased voting power & flexibility between liquidity &
                        governance voting, as well as boosted yields when providing liquidity on
                        markets receiving SDEX & AMM rewards.
                    </IceDescriptionText>
                    <ExternalLink>Learn more</ExternalLink>
                </IceDescriptionContent>
            </IceDescription>
            {Boolean(locks.length && iceBalance === 0) && (
                <ClaimIceBlock>
                    <ClaimIceColumn>
                        <ClaimIceColumnTitle>You have unclaimed ICE tokens:</ClaimIceColumnTitle>
                        <ClaimIceAmount>≈ {formatBalance(getIceAmount(), true)} ICE</ClaimIceAmount>
                        {account.hasAllIceTrustlines() && (
                            <ClaimIcePending>
                                These will be credited to your wallet shortly
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
        </Container>
    );
};

export default IceBlock;
