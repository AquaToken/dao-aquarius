import * as React from 'react';
import styled, { css } from 'styled-components';
import { useEffect, useState } from 'react';
import { StellarService } from '../../../../../common/services/globalServices';
import { StellarEvents } from '../../../../../common/services/stellar.service';
import { formatBalance } from '../../../../../common/helpers/helpers';
import useAuthStore from '../../../../../common/store/authStore/useAuthStore';
import Button from '../../../../../common/basics/Button';
import IconTick from '../../../../../common/assets/img/icon-tick.svg';
import IconPlus from '../../../../../common/assets/img/icon-plus.svg';
import { flexRowSpaceBetween } from '../../../../../common/mixins';

const iconStyles = css`
    margin-left: 1.6rem;
`;

const TickStyled = styled(IconTick)`
    ${iconStyles};
`;

const PlusStyled = styled(IconPlus)`
    ${iconStyles};
`;

const Container = styled.div`
    ${flexRowSpaceBetween};
    white-space: nowrap;
`;

const Balance = styled.div`
    margin-right: 1.6rem;
`;

const VoteButton = ({
    marketKey,
    isPairSelected,
    onButtonClick,
}: {
    marketKey: string;
    isPairSelected: boolean;
    onButtonClick: () => void;
}): JSX.Element => {
    const { account, isLogged } = useAuthStore();
    const [balance, setBalance] = useState(
        isLogged ? StellarService.getMarketVotesValue(marketKey, account?.accountId()) : null,
    );

    useEffect(() => {
        if (!account) {
            setBalance(null);
        }
        const unsub = StellarService.event.sub(({ type }) => {
            if (type === StellarEvents.claimableUpdate) {
                setBalance(StellarService.getMarketVotesValue(marketKey, account?.accountId()));
            }
        });

        return () => unsub();
    }, [account]);

    if (!balance) {
        return (
            <Button onClick={onButtonClick} likeDisabled={isPairSelected}>
                {isPairSelected ? 'added' : 'Add To Vote'}
                {isPairSelected ? <TickStyled /> : <PlusStyled />}
            </Button>
        );
    }
    return (
        <Container>
            <Balance>{formatBalance(balance, true)} AQUA</Balance>
            <Button onClick={onButtonClick} likeDisabled={isPairSelected} isSquare>
                {isPairSelected ? <IconTick /> : <IconPlus />}
            </Button>
        </Container>
    );
};

export default VoteButton;
