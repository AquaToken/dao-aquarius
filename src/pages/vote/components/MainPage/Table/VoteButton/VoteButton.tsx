import * as React from 'react';
import { useEffect, useState } from 'react';
import styled, { css } from 'styled-components';

import IconDislike from 'assets/icon-dislike-black.svg';
import IconLike from 'assets/icon-like-white.svg';
import IconTick from 'assets/icon-tick.svg';

import Button from 'basics/buttons/Button';
import Tooltip, { TOOLTIP_POSITION } from 'basics/Tooltip';

import { formatBalance } from '../../../../../../common/helpers/helpers';
import { flexRowSpaceBetween } from '../../../../../../common/mixins';
import ChooseLoginMethodModal from '../../../../../../common/modals/ChooseLoginMethodModal';
import { ModalService, StellarService } from '../../../../../../common/services/globalServices';
import { StellarEvents } from '../../../../../../common/services/stellar.service';
import useAuthStore from '../../../../../../store/authStore/useAuthStore';
import { PairStats } from '../../../../api/types';
import { AQUA, DOWN_ICE, UP_ICE } from '../../MainPage';
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

const TooltipInner = styled.div`
    font-size: 1.2rem;
`;

const VoteButton = ({
    pair,
    isPairSelected,
    onButtonClick,
    disabled,
    withoutStats,
}: {
    pair: PairStats;
    isPairSelected: boolean;
    onButtonClick: () => void;
    disabled: boolean;
    withoutStats?: boolean;
}): JSX.Element => {
    const { market_key: marketKeyUp, downvote_account_id: marketKeyDown } = pair;
    const { account, isLogged } = useAuthStore();

    const getUpVotesValue = () =>
        +StellarService.getMarketVotesValue(marketKeyUp, account?.accountId(), AQUA) +
        +StellarService.getMarketVotesValue(marketKeyUp, account?.accountId(), UP_ICE);

    const getDownVotesValue = () =>
        +StellarService.getMarketVotesValue(marketKeyDown, account?.accountId(), AQUA) +
        +StellarService.getMarketVotesValue(marketKeyDown, account?.accountId(), DOWN_ICE);

    const [balanceUp, setBalanceUp] = useState(isLogged ? getUpVotesValue() : null);

    const [balanceDown, setBalanceDown] = useState(isLogged ? getDownVotesValue() : null);

    const downVote = event => {
        event.preventDefault();
        event.stopPropagation();
        if (!isLogged) {
            ModalService.openModal(ChooseLoginMethodModal, {
                callback: () =>
                    ModalService.openModal(VotesAmountModal, {
                        pairs: [pair],
                        isDownVoteModal: true,
                        updatePairs: () => {},
                    }),
            });
            return;
        }

        ModalService.openModal(VotesAmountModal, {
            pairs: [pair],
            isDownVoteModal: true,
            updatePairs: () => {},
        });
    };

    useEffect(() => {
        if (!account || withoutStats) {
            setBalanceUp(null);
            setBalanceDown(null);
            return;
        }
        const unsub = StellarService.event.sub(({ type }) => {
            if (type === StellarEvents.claimableUpdate) {
                setBalanceUp(getUpVotesValue());
                setBalanceDown(getDownVotesValue());
            }
        });

        return () => unsub();
    }, [account]);

    if ((!balanceUp && !balanceDown) || withoutStats) {
        return (
            <Container>
                <Button
                    onClick={e => {
                        e.preventDefault();
                        e.stopPropagation();
                        onButtonClick();
                    }}
                    likeDisabled={isPairSelected}
                    disabled={disabled}
                >
                    {isPairSelected ? 'added' : 'Add To Vote'}
                    {isPairSelected ? <TickStyled /> : <Like />}
                </Button>
                <Tooltip
                    content={<TooltipInner>Downvote this market</TooltipInner>}
                    position={TOOLTIP_POSITION.top}
                    showOnHover
                >
                    <DownvoteButton
                        isSquare
                        likeDisabled
                        disabled={disabled}
                        onClick={e => downVote(e)}
                    >
                        <IconDislike />
                    </DownvoteButton>
                </Tooltip>
            </Container>
        );
    }
    return (
        <Container>
            <Balance>{formatBalance((+balanceUp || 0) - (+balanceDown || 0), true)}</Balance>
            <Button
                onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    onButtonClick();
                }}
                likeDisabled={isPairSelected}
                isSquare
                disabled={disabled}
            >
                {isPairSelected ? <IconTick /> : <IconLike />}
            </Button>
            <Tooltip
                content={<TooltipInner>Downvote this market</TooltipInner>}
                position={TOOLTIP_POSITION.top}
                showOnHover
            >
                <DownvoteButton
                    isSquare
                    likeDisabled
                    disabled={disabled}
                    onClick={e => downVote(e)}
                >
                    <IconDislike />
                </DownvoteButton>
            </Tooltip>
        </Container>
    );
};

export default VoteButton;
