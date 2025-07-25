import * as React from 'react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

import { D_ICE_CODE, DOWN_ICE_CODE, ICE_ISSUER, UP_ICE_CODE } from 'constants/assets';

import { getAquaAssetData } from 'helpers/assets';
import { formatBalance } from 'helpers/format-number';

import useAuthStore from 'store/authStore/useAuthStore';

import { ModalService, StellarService } from 'services/globalServices';
import { StellarEvents } from 'services/stellar.service';

import { Asset } from 'types/stellar';

import { flexRowSpaceBetween, respondDown } from 'web/mixins';
import ChooseLoginMethodModal from 'web/modals/auth/ChooseLoginMethodModal';
import { Breakpoints, COLORS } from 'web/styles';

import Aqua from 'assets/aqua-logo-small.svg';
import DIce from 'assets/dice-logo.svg';
import Ice from 'assets/ice-logo.svg';
import IconDown from 'assets/icon-down-percent.svg';
import IconUp from 'assets/icon-up-percent.svg';

import Button from 'basics/buttons/Button';
import DotsLoader from 'basics/loaders/DotsLoader';

import { PairStats, TotalStats } from 'pages/vote/api/types';
import { DOWN_ICE, UP_ICE } from 'pages/vote/components/MainPage/MainPage';
import { getPercent } from 'pages/vote/components/MainPage/Table/VoteAmount/VoteAmount';

import VotesProgressLine from './VotesProgressLine/VotesProgressLine';

import CreatePairModal from '../../../vote/components/MainPage/CreatePairModal/CreatePairModal';
import VoteButton from '../../../vote/components/MainPage/Table/VoteButton/VoteButton';

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
    margin-top: -18rem;
    z-index: 102;

    ${respondDown(Breakpoints.lg)`
         float: unset;
         position: relative;
         width: calc(100% - 3.2rem);
         margin-top: 0;
         right: unset;
         margin: 1.6rem;
         box-shadow: unset;
    `};

    ${respondDown(Breakpoints.md)`
      padding: 3.2rem 1.6rem;
    `};
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

const DIceLogo = styled(DIce)`
    height: 1.6rem;
    width: 1.6rem;
    margin-right: 0.8rem;
`;

interface SidebarProps {
    votesData: PairStats;
    base: Asset;
    counter: Asset;
    totalStats: TotalStats;
    onVoteClick: (value: PairStats) => void;
    isPairSelected: boolean;
}

const Sidebar = ({
    votesData,
    base,
    counter,
    totalStats,
    onVoteClick,
    isPairSelected,
}: SidebarProps): React.ReactNode => {
    const { isLogged, account } = useAuthStore();

    const { aquaAssetString, aquaStellarAsset } = getAquaAssetData();

    const createPair = () => {
        if (isLogged) {
            ModalService.openModal(CreatePairModal, {
                base,
                counter,
            });
            return;
        }
        ModalService.openModal(ChooseLoginMethodModal, {
            callback: () =>
                ModalService.openModal(CreatePairModal, {
                    base,
                    counter,
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
        votesData.extra?.upvote_assets.find(({ asset }) => asset === aquaAssetString)?.votes_sum ??
        0;
    const downAqua =
        votesData.extra?.downvote_assets.find(({ asset }) => asset === aquaAssetString)
            ?.votes_sum ?? 0;
    const upIce =
        votesData.extra?.upvote_assets.find(({ asset }) => asset === `${UP_ICE_CODE}:${ICE_ISSUER}`)
            ?.votes_sum ?? 0;
    const downIce =
        votesData.extra?.downvote_assets.find(
            ({ asset }) => asset === `${DOWN_ICE_CODE}:${ICE_ISSUER}`,
        )?.votes_sum ?? 0;

    const dIce =
        votesData.extra?.upvote_assets.find(({ asset }) => asset === `${D_ICE_CODE}:${ICE_ISSUER}`)
            ?.votes_sum ?? 0;

    const getUpVotesValue = () =>
        +StellarService.getMarketVotesValue(
            votesData.account_id,
            account?.accountId(),
            aquaStellarAsset,
        ) + +StellarService.getMarketVotesValue(votesData.account_id, account?.accountId(), UP_ICE);

    const getDownVotesValue = () =>
        +StellarService.getMarketVotesValue(
            votesData.downvote_account_id,
            account?.accountId(),
            aquaStellarAsset,
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
            <Row>
                <Label>
                    <DIceLogo />
                    dICE voted:
                </Label>
                <Label>{formatBalance(+dIce, true)}</Label>
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
