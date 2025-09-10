import * as React from 'react';
import { forwardRef, RefObject, useEffect, useMemo, useState } from 'react';
import { Link as LinkRouter } from 'react-router-dom';
import styled, { css } from 'styled-components';

import { getDelegateeVotes } from 'api/delegate';

import { FIRST_PROPOSAL_ID_WITH_GDICE } from 'constants/delegate';
import { GovernanceRoutes, MarketRoutes } from 'constants/routes';

import { getAssetFromString, getAssetString } from 'helpers/assets';
import { formatBalance } from 'helpers/format-number';

import { useUpdateIndex } from 'hooks/useUpdateIndex';

import useAssetsStore from 'store/assetsStore/useAssetsStore';
import useAuthStore from 'store/authStore/useAuthStore';

import { ModalService } from 'services/globalServices';

import { Delegatee, DelegateeVote } from 'types/delegate';

import { cardBoxShadow, customScroll, flexAllCenter, flexColumn, respondDown } from 'web/mixins';
import ChooseLoginMethodModal from 'web/modals/auth/ChooseLoginMethodModal';
import DelegateClaimModal from 'web/modals/DelegateClaimModal';
import DelegateModal from 'web/modals/DelegateModal';
import { Breakpoints, COLORS } from 'web/styles';

import Discord from 'assets/discord.svg';
import IconFail from 'assets/icon-fail.svg';
import IconSuccess from 'assets/icon-success.svg';
import Twitter from 'assets/twitter.svg';

import AssetLogo from 'basics/AssetLogo';
import { Button } from 'basics/buttons';
import CircularProgress from 'basics/CircularProgress';
import { ToggleGroup } from 'basics/inputs';
import { PageLoader } from 'basics/loaders';

import { getProposalsRequest, PROPOSAL_FILTER } from 'pages/governance/api/api';
import { MarketKey } from 'pages/vote/api/types';
import { DELEGATE_ICE, GOV_ICE, UP_ICE } from 'pages/vote/components/MainPage/MainPage';
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

const rowStyles = css`
    display: flex;
    align-items: center;
    gap: 0.4rem;
    margin-right: auto;
`;

const Row = styled.div`
    ${rowStyles}
`;

const LinkInner = styled(LinkRouter)`
    ${rowStyles};
    cursor: pointer;
    color: ${COLORS.titleText};
    text-decoration: none;
    flex: 1;

    span {
        border-bottom: 0.1rem dashed ${COLORS.purple};
    }
`;

const VoteType = styled.div`
    display: flex;
    align-items: center;
    gap: 0.4rem;
    flex: 2;
    justify-content: flex-start;
`;

const VoteAmount = styled(VoteType)`
    justify-content: flex-end;
    flex: 4;
    white-space: nowrap;
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

const IconAgainst = styled(IconFail)`
    height: 1.6rem;
    width: 1.6rem;
    margin-right: 0.5rem;
`;

const IconFor = styled(IconSuccess)`
    height: 1.6rem;
    width: 1.6rem;
    margin-right: 0.5rem;
`;

const OPTIONS = [
    { value: UP_ICE, label: 'Markets' },
    { value: GOV_ICE, label: 'DAO' },
];

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
        const [marketVotes, setMarketVotes] = useState<(DelegateeVote & MarketKey)[]>(null);
        const [daoVotes, setDaoVotes] = useState(null);
        const [selectedAsset, setSelecttedAsset] = useState(UP_ICE);

        const { isLogged } = useAuthStore();

        const { processNewAssets } = useAssetsStore();

        const updateIndex = useUpdateIndex(10000);

        useEffect(() => {
            if (getAssetString(selectedAsset) !== getAssetString(UP_ICE)) {
                setMarketVotes(null);
                return;
            }
            getDelegateeVotes(delegatee.account, selectedAsset).then(res => {
                setMarketVotes(res.sort((a, b) => +b.total_votes - +a.total_votes));
                const assets = res.reduce((acc, item) => {
                    acc.push(getAssetFromString(item.asset1), getAssetFromString(item.asset2));
                    return acc;
                }, []);
                processNewAssets(assets);
            });
        }, [updateIndex, selectedAsset]);

        useEffect(() => {
            if (getAssetString(selectedAsset) !== getAssetString(GOV_ICE)) {
                setDaoVotes(null);
                return;
            }
            getProposalsRequest({
                filter: PROPOSAL_FILTER.HISTORY,
                pubkey: delegatee.account,
                page: 1,
                pageSize: 500,
            }).then(res => {
                const summary = res.proposals.results.map(proposal => {
                    const { id, logvote_set } = proposal;

                    const result = logvote_set.reduce(
                        (acc, vote) => {
                            const amount = Number(vote.amount);

                            const isFor = vote.vote_choice === 'vote_for';

                            const key = isFor ? 'sum_for' : 'sum_against';
                            acc[key] += amount;

                            if (vote.asset_code === 'gdICE') {
                                acc[`${key}_gdice`] += amount;
                            }

                            return acc;
                        },
                        { sum_for: 0, sum_against: 0, sum_for_gdice: 0, sum_against_gdice: 0 },
                    );

                    return {
                        id,
                        sum_for: result.sum_for,
                        sum_against: result.sum_against,
                        sum_for_gdice: result.sum_for_gdice,
                        sum_against_gdice: result.sum_against_gdice,
                    };
                });

                setDaoVotes(summary);
            });
        }, [selectedAsset]);

        const votesSum = useMemo(() => {
            if (!marketVotes) return 0;

            return marketVotes.reduce((acc, item) => {
                acc += Number(item.total_votes);
                return acc;
            }, 0);
        }, [marketVotes]);

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

                <h3>How This Delegate Votes</h3>
                <ToggleGroup value={selectedAsset} options={OPTIONS} onChange={setSelecttedAsset} />
                {getAssetString(selectedAsset) === getAssetString(UP_ICE) ? (
                    !marketVotes ? (
                        <Stats>
                            <PageLoader />
                        </Stats>
                    ) : (
                        <Stats>
                            {marketVotes.map(vote => (
                                <StatsRow key={vote.id}>
                                    <LinkInner
                                        to={`${MarketRoutes.main}/${vote.asset1}/${vote.asset2}`}
                                    >
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
                                        <span>
                                            {vote.asset1_code} / {vote.asset2_code}
                                        </span>
                                    </LinkInner>
                                    <span>
                                        {getPercent(
                                            vote.total_votes,
                                            delegatee.managed_ice[getAssetString(selectedAsset)],
                                        )}
                                        %
                                    </span>
                                    <CircularProgress
                                        percentage={
                                            +getPercent(
                                                vote.total_votes,
                                                delegatee.managed_ice[
                                                    getAssetString(selectedAsset)
                                                ],
                                            )
                                        }
                                    />
                                </StatsRow>
                            ))}
                            {Number(delegatee.managed_ice[getAssetString(selectedAsset)]) -
                                votesSum >
                                0 && (
                                <StatsRow>
                                    <Row>Unused Voting Power</Row>
                                    <span>
                                        {getPercent(
                                            (
                                                Number(
                                                    delegatee.managed_ice[
                                                        getAssetString(selectedAsset)
                                                    ],
                                                ) - votesSum
                                            ).toString(),
                                            delegatee.managed_ice[getAssetString(selectedAsset)],
                                        )}
                                        %
                                    </span>
                                    <CircularProgress
                                        percentage={
                                            +getPercent(
                                                (
                                                    Number(
                                                        delegatee.managed_ice[
                                                            getAssetString(selectedAsset)
                                                        ],
                                                    ) - votesSum
                                                ).toString(),
                                                delegatee.managed_ice[
                                                    getAssetString(selectedAsset)
                                                ],
                                            )
                                        }
                                    />
                                </StatsRow>
                            )}
                        </Stats>
                    )
                ) : !daoVotes ? (
                    <Stats>
                        <PageLoader />
                    </Stats>
                ) : (
                    <Stats>
                        {daoVotes.length ? (
                            daoVotes.map(vote => (
                                <>
                                    {!!vote.sum_for && (
                                        <StatsRow>
                                            <LinkInner
                                                to={`${GovernanceRoutes.proposal}/${vote.id}`}
                                            >
                                                <span>#{vote.id}</span>{' '}
                                            </LinkInner>
                                            <VoteType>
                                                <IconFor />
                                                For
                                            </VoteType>
                                            <VoteAmount>
                                                <span>
                                                    {formatBalance(vote.sum_for, true, true)}
                                                </span>
                                                {vote.id >= FIRST_PROPOSAL_ID_WITH_GDICE ? (
                                                    <>
                                                        <span>
                                                            ({' '}
                                                            {formatBalance(
                                                                vote.sum_for_gdice,
                                                                true,
                                                                true,
                                                            )}{' '}
                                                        </span>
                                                        <AssetLogo asset={DELEGATE_ICE} isSmall />
                                                        <span>)</span>
                                                    </>
                                                ) : null}
                                            </VoteAmount>
                                        </StatsRow>
                                    )}
                                    {!!vote.sum_against && (
                                        <StatsRow>
                                            <LinkInner
                                                to={`${GovernanceRoutes.proposal}/${vote.id}`}
                                            >
                                                <span>#{vote.id}</span>{' '}
                                            </LinkInner>
                                            <VoteType>
                                                <IconAgainst />
                                                Against
                                            </VoteType>
                                            <VoteAmount>
                                                <span>
                                                    {formatBalance(vote.sum_against, true, true)}
                                                </span>
                                                {vote.id >= FIRST_PROPOSAL_ID_WITH_GDICE ? (
                                                    <>
                                                        <span>
                                                            ({' '}
                                                            {formatBalance(
                                                                vote.sum_against_gdice,
                                                                true,
                                                                true,
                                                            )}{' '}
                                                        </span>
                                                        <AssetLogo asset={DELEGATE_ICE} isSmall />
                                                        <span>)</span>
                                                    </>
                                                ) : null}
                                            </VoteAmount>
                                        </StatsRow>
                                    )}
                                </>
                            ))
                        ) : (
                            <div>Not voted yet</div>
                        )}
                    </Stats>
                )}

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
