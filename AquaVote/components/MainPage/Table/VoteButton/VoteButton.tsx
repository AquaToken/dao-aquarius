import * as React from 'react';
import styled, { css } from 'styled-components';
import { useEffect, useState } from 'react';
import { ModalService, StellarService } from '../../../../../common/services/globalServices';
import { StellarEvents } from '../../../../../common/services/stellar.service';
import { formatBalance } from '../../../../../common/helpers/helpers';
import useAuthStore from '../../../../../common/store/authStore/useAuthStore';
import Button from '../../../../../common/basics/Button';
import IconTick from '../../../../../common/assets/img/icon-tick.svg';
import IconLike from '../../../../../common/assets/img/icon-like-white.svg';
import IconDislike from '../../../../../common/assets/img/icon-dislike-black.svg';
import { flexRowSpaceBetween } from '../../../../../common/mixins';
import { PairStats } from '../../../../api/types';
import ChooseLoginMethodModal from '../../../../../common/modals/ChooseLoginMethodModal';
import VotesAmountModal from '../../VoteModals/VotesAmountModal';

const iconStyles = css`
    margin-left: 1.6rem;
`;

const TickStyled = styled(IconTick)`
    ${iconStyles};
`;

const Like = styled(IconLike)`
    ${iconStyles};
`;

const Container = styled.div`
    ${flexRowSpaceBetween};
    white-space: nowrap;
`;

const Balance = styled.div`
    margin-right: 1.6rem;
`;

const DownvoteButton = styled(Button)`
    margin-left: 0.8rem;
`;

const VoteButton = ({
    pair,
    isPairSelected,
    onButtonClick,
    disabled,
}: {
    pair: PairStats;
    isPairSelected: boolean;
    onButtonClick: () => void;
    disabled: boolean;
}): JSX.Element => {
    const { market_key: marketKeyUp, downvote_account_id: marketKeyDown } = pair;
    const { account, isLogged } = useAuthStore();
    const [balanceUp, setBalanceUp] = useState(
        isLogged ? StellarService.getMarketVotesValue(marketKeyUp, account?.accountId()) : null,
    );

    const [balanceDown, setBalanceDown] = useState(
        isLogged ? StellarService.getMarketVotesValue(marketKeyDown, account?.accountId()) : null,
    );

    const downVote = () => {
        if (!isLogged) {
            ModalService.openModal(ChooseLoginMethodModal, {});
            return;
        }

        ModalService.openModal(VotesAmountModal, {
            pairs: [pair],
            isDownVoteModal: true,
            updatePairs: () => {},
        });
    };

    useEffect(() => {
        if (!account) {
            setBalanceUp(null);
            setBalanceDown(null);
        }
        const unsub = StellarService.event.sub(({ type }) => {
            if (type === StellarEvents.claimableUpdate) {
                setBalanceUp(StellarService.getMarketVotesValue(marketKeyUp, account?.accountId()));
                setBalanceDown(
                    StellarService.getMarketVotesValue(marketKeyDown, account?.accountId()),
                );
            }
        });

        return () => unsub();
    }, [account]);

    if (!balanceUp && !balanceDown) {
        return (
            <>
                <Button onClick={onButtonClick} likeDisabled={isPairSelected} disabled={disabled}>
                    {isPairSelected ? 'added' : 'Add To Vote'}
                    {isPairSelected ? <TickStyled /> : <Like />}
                </Button>
                <DownvoteButton
                    isSquare
                    likeDisabled
                    disabled={disabled}
                    onClick={() => downVote()}
                >
                    <IconDislike />
                </DownvoteButton>
            </>
        );
    }
    return (
        <Container>
            <Balance>{formatBalance((+balanceUp || 0) - (+balanceDown || 0), true)} AQUA</Balance>
            <Button
                onClick={onButtonClick}
                likeDisabled={isPairSelected}
                isSquare
                disabled={disabled}
            >
                {isPairSelected ? <IconTick /> : <IconLike />}
            </Button>
            <DownvoteButton isSquare likeDisabled disabled={disabled} onClick={() => downVote()}>
                <IconDislike />
            </DownvoteButton>
        </Container>
    );
};

export default VoteButton;
