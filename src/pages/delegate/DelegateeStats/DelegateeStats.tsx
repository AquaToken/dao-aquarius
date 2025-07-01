import * as React from 'react';
import { forwardRef, RefObject, useEffect, useMemo, useState } from 'react';
import styled, { css } from 'styled-components';

import { getDelegateeVotes } from 'api/delegate';

import { getAssetFromString } from 'helpers/assets';

import { useUpdateIndex } from 'hooks/useUpdateIndex';

import useAuthStore from 'store/authStore/useAuthStore';

import { ModalService } from 'services/globalServices';

import { Delegatee, DelegateeVote } from 'types/delegate';

import { cardBoxShadow, customScroll, flexAllCenter, flexColumn, respondDown } from 'web/mixins';
import ChooseLoginMethodModal from 'web/modals/auth/ChooseLoginMethodModal';
import DelegateClaimModal from 'web/modals/DelegateClaimModal';
import DelegateModal from 'web/modals/DelegateModal';
import { Breakpoints, COLORS } from 'web/styles';

import Discord from 'assets/discord.svg';
import Twitter from 'assets/twitter.svg';

import AssetLogo from 'basics/AssetLogo';
import { Button } from 'basics/buttons';
import CircularProgress from 'basics/CircularProgress';
import { PageLoader } from 'basics/loaders';

import { MarketKey } from 'pages/vote/api/types';
import { getPercent } from 'pages/vote/components/MainPage/Table/VoteAmount/VoteAmount';

const Container = styled.div<{ $fromTop: boolean; $visible: boolean }>`
    position: absolute;
    background-color: ${COLORS.white};
    ${cardBoxShadow};
    left: calc(100% + 4rem);
    ${({ $fromTop }) => ($fromTop ? 'top: 0;' : 'bottom: 0;')}
    width: 50%;
    visibility: ${({ $visible }) => ($visible ? 'visible' : 'hidden')};
    opacity: ${({ $visible }) => ($visible ? 1 : 0)};
    transition: opacity 0.2s;
    border-radius: 2.4rem;
    padding: 2.4rem;
    ${flexColumn};
    gap: 1.6rem;
    cursor: auto;

    ${respondDown(Breakpoints.lg)`
        position: relative;
        left: 0;
        box-shadow: unset;
        width: 100%;
        padding: 0;
        margin-top: 2.4rem;
    `}
`;

const Strategy = styled.div`
    color: ${COLORS.grayText};
    display: flex;
    flex-direction: column;

    h5 {
        font-weight: 400;
        font-size: 2rem;
        line-height: 2.4rem;
        color: ${COLORS.titleText};
        margin-bottom: 1.6rem;
    }

    span {
        color: ${COLORS.grayText};
    }
`;

const Stats = styled.div`
    padding: 2.4rem;
    border-radius: 1.6rem;
    ${flexColumn};
    gap: 0.8rem;
    background-color: ${COLORS.lightGray};
    ${customScroll};
    max-height: 20rem;
    overflow: auto;

    h3 {
        font-weight: 700;
        font-size: 1.6rem;
        line-height: 2.8rem;
        ${COLORS.titleText};
        margin-bottom: 1.2rem;
    }
`;

const Links = styled.div`
    display: flex;
    gap: 1.6rem;
`;

const LinkStyles = css`
    ${flexAllCenter};
    background-color: ${COLORS.lightGray};
    border-radius: 1.6rem;
    height: 4.4rem;
    padding: 0 1.3rem;
    gap: 0.8rem;
    text-decoration: none;

    svg {
        path {
            fill: ${COLORS.purple};
        }
    }
`;

const DiscordButton = styled.div`
    ${LinkStyles};
`;

const DiscordName = styled.div`
    ${flexAllCenter};
    gap: 0.8rem;
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.purple};
`;

const Link = styled.a`
    ${LinkStyles};
`;

const StatsRow = styled.div`
    display: flex;
    gap: 0.8rem;

    &:not(:last-child) {
        margin-bottom: 1.2rem;
    }
`;

const Market = styled.div`
    display: flex;
    align-items: center;
    gap: 0.4rem;
    margin-right: auto;
`;

const Buttons = styled.div`
    ${flexColumn};
    gap: 0.8rem;
`;

const ClaimButton = styled(Button)`
    background-color: ${COLORS.pinkRed};

    &:hover {
        background-color: ${COLORS.pinkRed};
        opacity: 0.8;
    }
`;

const AssetLogoStyled = styled(AssetLogo)`
    border: 0.1rem solid ${COLORS.white};
`;

const AssetLogoSecond = styled(AssetLogoStyled)`
    margin-left: -0.8rem;
`;

interface Props {
    fromTop: boolean;
    popupVisible: boolean;
    delegatee: Partial<Delegatee>;
    delegatees: Delegatee[];
    withClaim?: boolean;
}

const DelegateeStats = forwardRef(
    (
        { fromTop, popupVisible, delegatee, delegatees, withClaim }: Props,
        popupRef: RefObject<HTMLDivElement>,
    ) => {
        const [votes, setVotes] = useState<(DelegateeVote & MarketKey)[]>(null);

        const { isLogged } = useAuthStore();

        const updateIndex = useUpdateIndex(10000);

        useEffect(() => {
            getDelegateeVotes(delegatee.account).then(res =>
                setVotes(res.sort((a, b) => +b.total_votes - +a.total_votes)),
            );
        }, [updateIndex]);

        const votesSum = useMemo(() => {
            if (!votes) return 0;

            return votes.reduce((acc, item) => {
                acc += Number(item.total_votes);
                return acc;
            }, 0);
        }, [votes]);

        return (
            <Container $fromTop={fromTop} $visible={popupVisible} ref={popupRef}>
                {Boolean(delegatee.voting_strategy) && (
                    <Strategy>
                        <h5>Voting Strategy:</h5>
                        <span>{delegatee.voting_strategy}</span>
                    </Strategy>
                )}
                {(Boolean(delegatee.discord_handle) || Boolean(delegatee.twitter_link)) && (
                    <Links>
                        {Boolean(delegatee.discord_handle) && (
                            <DiscordButton>
                                <DiscordName>
                                    <Discord />
                                    <span>{delegatee.discord_handle}</span>
                                </DiscordName>
                            </DiscordButton>
                        )}
                        {Boolean(delegatee.twitter_link) && (
                            <Link
                                href={delegatee.twitter_link}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Twitter />
                            </Link>
                        )}
                    </Links>
                )}
                {!!Number(delegatee.managed_ice) &&
                    (!votes ? (
                        <Stats>
                            <PageLoader />
                        </Stats>
                    ) : (
                        <Stats>
                            <h3>How This Delegate Votes</h3>
                            {votes.map(vote => (
                                <StatsRow key={vote.id}>
                                    <Market>
                                        <AssetLogoStyled
                                            isCircle
                                            asset={getAssetFromString(vote.asset1)}
                                            isSmall
                                        />
                                        <AssetLogoSecond
                                            isCircle
                                            asset={getAssetFromString(vote.asset2)}
                                            isSmall
                                        />
                                        {vote.asset1_code} / {vote.asset2_code}
                                    </Market>
                                    <span>
                                        {getPercent(vote.total_votes, delegatee.managed_ice)}%
                                    </span>
                                    <CircularProgress
                                        percentage={
                                            +getPercent(vote.total_votes, delegatee.managed_ice)
                                        }
                                    />
                                </StatsRow>
                            ))}
                            {Number(delegatee.managed_ice) - votesSum > 0 && (
                                <StatsRow>
                                    <Market>Not distributed</Market>
                                    <span>
                                        {getPercent(
                                            (Number(delegatee.managed_ice) - votesSum).toString(),
                                            delegatee.managed_ice,
                                        )}
                                        %
                                    </span>
                                    <CircularProgress
                                        percentage={
                                            +getPercent(
                                                (
                                                    Number(delegatee.managed_ice) - votesSum
                                                ).toString(),
                                                delegatee.managed_ice,
                                            )
                                        }
                                    />
                                </StatsRow>
                            )}
                        </Stats>
                    ))}
                <Buttons>
                    <Button
                        isRounded
                        isBig
                        onClick={() => {
                            if (!isLogged) {
                                return ModalService.openModal(ChooseLoginMethodModal, {
                                    callback: () =>
                                        ModalService.openModal(DelegateModal, {
                                            delegatee,
                                            delegatees,
                                        }),
                                });
                            }
                            ModalService.openModal(DelegateModal, { delegatee, delegatees });
                        }}
                    >
                        delegate ice
                    </Button>
                    {withClaim && (
                        <ClaimButton
                            isRounded
                            isBig
                            onClick={() => {
                                if (!isLogged) {
                                    return ModalService.openModal(ChooseLoginMethodModal, {
                                        callback: () =>
                                            ModalService.openModal(DelegateModal, {
                                                delegatee,
                                                delegatees,
                                            }),
                                    });
                                }
                                ModalService.openModal(DelegateClaimModal, { delegatee });
                            }}
                        >
                            undelegate
                        </ClaimButton>
                    )}
                </Buttons>
            </Container>
        );
    },
);

DelegateeStats.displayName = 'DelegateeStats';

export default DelegateeStats;
