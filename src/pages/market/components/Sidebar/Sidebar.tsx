import * as React from 'react';
import styled from 'styled-components';
import { Breakpoints, COLORS } from '../../../../common/styles';
import { flexRowSpaceBetween, respondDown } from '../../../../common/mixins';
import { formatBalance } from '../../../../common/helpers/helpers';
import IconUp from 'assets/icon-up-percent.svg';
import IconDown from 'assets/icon-down-percent.svg';
import Ice from 'assets/ice-logo.svg';
import Aqua from 'assets/aqua-logo-small.svg';
import { getPercent } from '../../../vote/components/MainPage/Table/VoteAmount/VoteAmount';
import VotesProgressLine from './VotesProgressLine/VotesProgressLine';
import {
    AQUA_CODE,
    AQUA_ISSUER,
    DOWN_ICE_CODE,
    ICE_ISSUER,
    StellarEvents,
    UP_ICE_CODE,
} from '../../../../common/services/stellar.service';
import VoteButton from '../../../vote/components/MainPage/Table/VoteButton/VoteButton';
import { useEffect, useState } from 'react';
import { ModalService, StellarService } from '../../../../common/services/globalServices';
import { AQUA, DOWN_ICE, UP_ICE } from '../../../vote/components/MainPage/MainPage';
import useAuthStore from '../../../../store/authStore/useAuthStore';
import DotsLoader from '../../../../common/basics/DotsLoader';
import Button from '../../../../common/basics/Button';
import CreatePairModal from '../../../vote/components/MainPage/CreatePairModal/CreatePairModal';
import ChooseLoginMethodModal from '../../../../common/modals/ChooseLoginMethodModal';

const Container = styled.aside`
    float: right;
    position: sticky;
    right: 10%;
    top: 2rem;
    padding: 4.5rem 5rem;
    box-shadow: 0 2rem 3rem rgba(0, 6, 54, 0.06);
    border-radius: 0.5rem;
    background: ${COLORS.white};
    display: flex;
    flex-direction: column;
    margin-top: -48rem;
    z-index: 102;

    ${respondDown(Breakpoints.lg)`
         float: unset;
         position: relative;
         width: calc(100% - 3.2rem);
         margin-top: 0;
         right: unset;
         margin: 1.6rem;
         box-shadow: unset;
    `}
`;

const Title = styled.span`
    font-weight: 700;
    font-size: 2rem;
    line-height: 2.8rem;
    color: ${COLORS.titleText};
    margin-bottom: 3.4rem;
`;

const CreatePair = styled.div`
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.descriptionText};
    opacity: 0.7;
    max-width: 26rem;
    margin-bottom: 2.5rem;
`;

const Row = styled.div`
    ${flexRowSpaceBetween};
    margin-bottom: 2rem;
    width: 26rem;

    ${respondDown(Breakpoints.md)`
         width: 100%;
    `}
`;

const LastRow = styled(Row)`
    margin-bottom: 3.6rem;
`;

const Label = styled.span`
    font-size: 1.4rem;
    line-height: 2rem;
    color: ${COLORS.grayText};
    display: flex;
    align-items: center;
`;

const Value = styled.span`
    font-size: 1.6rem;
    line-height: 2.4rem;
    color: ${COLORS.paragraphText};
    display: flex;
    align-items: center;
`;

const PercentWithoutBoost = styled.span`
    color: ${COLORS.placeholder};
`;

const Divider = styled.div`
    border-bottom: 0.1rem solid ${COLORS.gray};
    margin: 2.4rem 0;
    width: 100%;
`;

const AquaLogo = styled(Aqua)`
    height: 1.6rem;
    width: 1.6rem;
    margin-right: 0.8rem;
`;

const IceLogo = styled(Ice)`
    height: 1.6rem;
    width: 1.6rem;
    margin-right: 0.8rem;
`;

const Sidebar = ({ votesData, base, counter, totalStats, onVoteClick, isPairSelected }) => {
    const { isLogged, account } = useAuthStore();

    const createPair = () => {
        if (isLogged) {
            ModalService.openModal(CreatePairModal, {
                base: base,
                counter: counter,
            });
            return;
        }
        ModalService.openModal(ChooseLoginMethodModal, {
            callback: () =>
                ModalService.openModal(CreatePairModal, {
                    base: base,
                    counter: counter,
                }),
        });
    };
    if (!votesData) {
        return (
            <Container>
                <Title>Create a new market!</Title>
                <CreatePair>
                    This market has not yet been created in the voting tool, be the first to do it!
                </CreatePair>
                <Button onClick={() => createPair()}>Create pair</Button>
            </Container>
        );
    }

    const boosted = Number(votesData.adjusted_votes_value) > Number(votesData.votes_value);
    const percentValue = votesData.votes_value
        ? `${getPercent(votesData.votes_value, totalStats.votes_value_sum)}%`
        : null;

    const percentBoostedValue = votesData.adjusted_votes_value
        ? `${getPercent(votesData.adjusted_votes_value, totalStats.adjusted_votes_value_sum)}%`
        : null;

    const total = +votesData.upvote_value + +votesData.downvote_value || 0;
    const result = +votesData.upvote_value - +votesData.downvote_value || 0;

    const upAqua =
        votesData.extra?.upvote_assets.find(({ asset }) => asset === `${AQUA_CODE}:${AQUA_ISSUER}`)
            ?.votes_sum ?? 0;
    const downAqua =
        votesData.extra?.downvote_assets.find(
            ({ asset }) => asset === `${AQUA_CODE}:${AQUA_ISSUER}`,
        )?.votes_sum ?? 0;
    const upIce =
        votesData.extra?.upvote_assets.find(({ asset }) => asset === `${UP_ICE_CODE}:${ICE_ISSUER}`)
            ?.votes_sum ?? 0;
    const downIce =
        votesData.extra?.downvote_assets.find(
            ({ asset }) => asset === `${DOWN_ICE_CODE}:${ICE_ISSUER}`,
        )?.votes_sum ?? 0;

    const getUpVotesValue = () =>
        +StellarService.getMarketVotesValue(votesData.account_id, account?.accountId(), AQUA) +
        +StellarService.getMarketVotesValue(votesData.account_id, account?.accountId(), UP_ICE);

    const getDownVotesValue = () =>
        +StellarService.getMarketVotesValue(
            votesData.downvote_account_id,
            account?.accountId(),
            AQUA,
        ) +
        +StellarService.getMarketVotesValue(
            votesData.downvote_account_id,
            account?.accountId(),
            DOWN_ICE,
        );

    const [balanceUp, setBalanceUp] = useState(isLogged ? getUpVotesValue() : null);

    const [balanceDown, setBalanceDown] = useState(isLogged ? getDownVotesValue() : null);

    useEffect(() => {
        if (!account) {
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

    return (
        <Container>
            <Title>
                Market {base.code}/{counter.code}
            </Title>
            <Row>
                <Label>Users voted</Label>
                <Value>{votesData.voting_amount || 0}</Value>
            </Row>
            {isLogged && (
                <Row>
                    <Label>Your vote</Label>
                    <Value>
                        {balanceUp === null ? (
                            <DotsLoader />
                        ) : (
                            formatBalance((+balanceUp || 0) - (+balanceDown || 0), true)
                        )}
                    </Value>
                </Row>
            )}
            <Row>
                <Label>Votes</Label>
                <Value>{formatBalance(result, true)}</Value>
            </Row>
            <Row>
                <Label>% of votes</Label>
                <Value>
                    <PercentWithoutBoost>{percentValue}</PercentWithoutBoost>
                    {boosted ? <IconUp /> : <IconDown />}
                    <span>{percentBoostedValue}</span>
                </Value>
            </Row>
            <Divider />
            <VotesProgressLine
                label="Upvotes"
                iceVotes={+upIce}
                aquaVotes={+upAqua}
                total={total}
            />
            <Row>
                <Label>
                    <IceLogo />
                    ICE voted:
                </Label>
                <Label>{formatBalance(+upIce, true)}</Label>
            </Row>
            <LastRow>
                <Label>
                    <AquaLogo />
                    AQUA voted:
                </Label>
                <Label>{formatBalance(+upAqua, true)}</Label>
            </LastRow>
            <VotesProgressLine
                label="Downvotes"
                iceVotes={+downIce}
                aquaVotes={+downAqua}
                total={total}
            />
            <Row>
                <Label>
                    <IceLogo />
                    ICE voted:
                </Label>
                <Label>{formatBalance(+downIce, true)}</Label>
            </Row>
            <LastRow>
                <Label>
                    <AquaLogo />
                    AQUA voted:
                </Label>
                <Label>{formatBalance(+downAqua, true)}</Label>
            </LastRow>
            <VoteButton
                pair={votesData}
                isPairSelected={isPairSelected}
                onButtonClick={() => onVoteClick(votesData)}
                disabled={
                    votesData.auth_required ||
                    votesData.auth_revocable ||
                    votesData.auth_clawback_enabled ||
                    votesData.no_liquidity
                }
                withoutStats
            />
        </Container>
    );
};

export default Sidebar;
