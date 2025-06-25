import { useEffect, useState } from 'react';
import styled, { css } from 'styled-components';

import { getAquaAssetData } from 'helpers/assets';
import { formatBalance } from 'helpers/format-number';

import useAuthStore from 'store/authStore/useAuthStore';

import { ModalService, StellarService } from 'services/globalServices';
import { StellarEvents } from 'services/stellar.service';

import { flexRowSpaceBetween } from 'web/mixins';
import ChooseLoginMethodModal from 'web/modals/auth/ChooseLoginMethodModal';

import IconDislike from 'assets/icon-dislike-black.svg';
import IconLike from 'assets/icon-like-white.svg';
import IconTick from 'assets/icon-tick-16.svg';

import Button from 'basics/buttons/Button';
import Tooltip, { TOOLTIP_POSITION } from 'basics/Tooltip';

import { PairStats } from 'pages/vote/api/types';

import { DELEGATE_ICE, DOWN_ICE, UP_ICE } from '../../MainPage';
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
    line-height: 1.6rem;
    width: 12rem;
    white-space: pre-line;
    text-align: center;
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
    const {
        market_key: marketKeyUp,
        downvote_account_id: marketKeyDown,
        downvote_immunity: downvoteImmunity,
    } = pair;
    const { account, isLogged } = useAuthStore();
    const { aquaStellarAsset } = getAquaAssetData();

    const getUpVotesValue = () =>
        +StellarService.getMarketVotesValue(marketKeyUp, account?.accountId(), aquaStellarAsset) +
        +StellarService.getMarketVotesValue(marketKeyUp, account?.accountId(), UP_ICE) +
        +StellarService.getMarketVotesValue(marketKeyUp, account?.accountId(), DELEGATE_ICE);

    const getDownVotesValue = () =>
        +StellarService.getMarketVotesValue(marketKeyDown, account?.accountId(), aquaStellarAsset) +
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
                    secondary={isPairSelected}
                    disabled={disabled}
                >
                    {isPairSelected ? 'added' : 'Add To Vote'}
                    {isPairSelected ? <TickStyled /> : <Like />}
                </Button>
                <Tooltip
                    content={
                        <TooltipInner>
                            {downvoteImmunity
                                ? "Markets with XLM, AQUA, USDC and EURC can't be downvoted"
                                : 'Downvote this market'}
                        </TooltipInner>
                    }
                    position={TOOLTIP_POSITION.top}
                    showOnHover
                >
                    <DownvoteButton
                        isSquare
                        secondary
                        disabled={disabled || downvoteImmunity}
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
                secondary={isPairSelected}
                isSquare
                disabled={disabled}
            >
                {isPairSelected ? <IconTick /> : <IconLike />}
            </Button>
            <Tooltip
                content={
                    <TooltipInner>
                        {downvoteImmunity
                            ? "Markets with XLM, AQUA, USDC and EURC can't be downvoted"
                            : 'Downvote this market'}
                    </TooltipInner>
                }
                position={TOOLTIP_POSITION.top}
                showOnHover
            >
                <DownvoteButton
                    isSquare
                    secondary
                    disabled={disabled || downvoteImmunity}
                    onClick={e => downVote(e)}
                >
                    <IconDislike />
                </DownvoteButton>
            </Tooltip>
        </Container>
    );
};

export default VoteButton;
