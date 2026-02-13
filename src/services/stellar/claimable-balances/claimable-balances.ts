import * as StellarSdk from '@stellar/stellar-sdk';

import {
    D_ICE_CODE,
    DOWN_ICE_CODE,
    GD_ICE_CODE,
    GOV_ICE_CODE,
    ICE_ISSUER,
    ICE_TO_DELEGATE,
    UP_ICE_CODE,
} from 'constants/assets';
import { DELEGATE_MARKER_KEY } from 'constants/stellar-accounts';

import { getAquaAssetData } from 'helpers/assets';

import EventService from 'services/event.service';
import { StellarEvents, StellarPayload } from 'services/stellar/events/events';
import Horizon from 'services/stellar/horizon/horizon';

import { ProposalSimple } from 'types/governance';
import { ClaimableBalance } from 'types/stellar';

import { PairStats } from 'pages/vote/api/types';

export default class ClaimableBalances {
    private readonly horizon: Horizon;
    private readonly event: EventService<StellarEvents, StellarPayload>;
    private claimableBalances: StellarSdk.Horizon.ServerApi.ClaimableBalanceRecord[] | null = null;

    constructor(horizon: Horizon, event: EventService<StellarEvents, StellarPayload>) {
        this.horizon = horizon;
        this.event = event;
    }

    get isClaimableBalancesLoaded() {
        return this.claimableBalances !== null;
    }

    getClaimableBalances(publicKey: string) {
        const limit = 200;
        this.horizon.server
            .claimableBalances()
            .claimant(publicKey)
            .order('desc')
            .limit(limit)
            .call()
            .then(claimable => {
                this.claimableBalances = claimable.records;
                this.event.trigger({ type: StellarEvents.claimableUpdate });

                if (claimable.records.length === limit) {
                    this.getNextClaimableBalances(claimable.next, limit);
                }
            });
    }

    getNextClaimableBalances(
        next: () => Promise<
            StellarSdk.Horizon.ServerApi.CollectionPage<StellarSdk.Horizon.ServerApi.ClaimableBalanceRecord>
        >,
        limit: number,
    ) {
        next().then(res => {
            this.claimableBalances = [...this.claimableBalances, ...res.records];
            this.event.trigger({ type: StellarEvents.claimableUpdate });

            if (res.records.length === limit) {
                this.getNextClaimableBalances(res.next, limit);
            }
        });
    }

    getLocks(publicKey: string) {
        if (!this.claimableBalances) {
            return null;
        }

        const { aquaAssetString } = getAquaAssetData();

        return this.claimableBalances.filter(
            claim =>
                claim.claimants.length === 1 &&
                claim.claimants[0].destination === publicKey &&
                claim.asset === aquaAssetString,
        );
    }

    getMarketVotesValue(marketKey: string, accountId: string, asset: StellarSdk.Asset) {
        if (!this.claimableBalances) {
            return null;
        }

        return this.claimableBalances.reduce((acc, claim) => {
            if (claim.claimants.length !== 2) {
                return acc;
            }
            const hasMarker = claim.claimants.some(claimant => claimant.destination === marketKey);
            const hasSelfClaim = claim.claimants.some(
                claimant => claimant.destination === accountId,
            );
            const isAqua = claim.asset === `${asset.code}:${asset.issuer}`;

            if (hasMarker && hasSelfClaim && isAqua) {
                acc += Number(claim.amount);
            }
            return acc;
        }, 0);
    }

    getVotesForProposal(proposal: ProposalSimple, accountId: string) {
        if (!this.claimableBalances) {
            return null;
        }

        const { aquaAssetString } = getAquaAssetData();

        return this.claimableBalances.reduce((acc, claim) => {
            if (claim.claimants.length !== 2) {
                return acc;
            }
            const hasForMarker = claim.claimants.some(
                claimant => claimant.destination === proposal.vote_for_issuer,
            );
            const hasAgainstMarker = claim.claimants.some(
                claimant => claimant.destination === proposal.vote_against_issuer,
            );
            const selfClaim = claim.claimants.find(claimant => claimant.destination === accountId);
            const isAqua = claim.asset === aquaAssetString;
            const isGovIce = claim.asset === `${GOV_ICE_CODE}:${ICE_ISSUER}`;
            const isGDIce = claim.asset === `${GD_ICE_CODE}:${ICE_ISSUER}`;

            if (
                (hasForMarker || hasAgainstMarker) &&
                Boolean(selfClaim) &&
                (isAqua || isGovIce || isGDIce)
            ) {
                const [code, issuer] = claim.asset.split(':');
                acc.push({
                    ...claim,
                    isForVote: hasForMarker,
                    claimBackDate: selfClaim.predicate.not.abs_before,
                    assetCode: code,
                    assetIssuer: issuer,
                });
            }
            return acc;
        }, []);
    }

    getPairVotes(pair: PairStats, accountId: string) {
        if (!this.claimableBalances) {
            return null;
        }
        const { aquaAssetString } = getAquaAssetData();

        return this.claimableBalances.reduce((acc, claim) => {
            if (claim.claimants.length !== 2) {
                return acc;
            }
            const hasUpMarker = claim.claimants.some(
                claimant => claimant.destination === pair.account_id,
            );
            const hasDownMarker = claim.claimants.some(
                claimant => claimant.destination === pair.downvote_account_id,
            );
            const selfClaim = claim.claimants.find(claimant => claimant.destination === accountId);
            const isAqua = claim.asset === aquaAssetString;
            const isUpIce = claim.asset === `${UP_ICE_CODE}:${ICE_ISSUER}`;
            const isDownIce = claim.asset === `${DOWN_ICE_CODE}:${ICE_ISSUER}`;
            const isDelegatedIce = claim.asset === `${D_ICE_CODE}:${ICE_ISSUER}`;

            if (
                (hasUpMarker || hasDownMarker) &&
                Boolean(selfClaim) &&
                (isAqua || isUpIce || isDownIce || isDelegatedIce)
            ) {
                const [code, issuer] = claim.asset.split(':');
                acc.push({
                    ...claim,
                    isDownVote: hasDownMarker,
                    claimBackDate: selfClaim.predicate.not.abs_before,
                    assetCode: code,
                    assetIssuer: issuer,
                });
            }
            return acc;
        }, []);
    }

    getKeysSimilarToMarketKeys(accountId: string): string[] {
        if (!this.claimableBalances) {
            return null;
        }

        const { aquaAssetString } = getAquaAssetData();

        return this.claimableBalances.reduce((acc, claim) => {
            if (claim.claimants.length !== 2) {
                return acc;
            }
            const isAqua = claim.asset === aquaAssetString;
            const isUpIce = claim.asset === `${UP_ICE_CODE}:${ICE_ISSUER}`;
            const isDownIce = claim.asset === `${DOWN_ICE_CODE}:${ICE_ISSUER}`;
            const isDelegatedIce = claim.asset === `${D_ICE_CODE}:${ICE_ISSUER}`;
            const hasSelfClaim = claim.claimants.some(
                claimant => claimant.destination === accountId,
            );
            if ((isAqua || isUpIce || isDownIce || isDelegatedIce) && hasSelfClaim) {
                const similarToMarketKey = claim.claimants.find(
                    claimant => claimant.destination !== accountId,
                );

                if (!similarToMarketKey) {
                    return acc;
                }
                if (!acc.includes(similarToMarketKey.destination)) {
                    acc.push(similarToMarketKey.destination);
                }
            }
            return acc;
        }, []);
    }

    getDelegateLocks(accountId: string) {
        if (!this.claimableBalances) {
            return null;
        }

        return this.claimableBalances
            .reduce((acc, claim) => {
                if (claim.claimants.length !== 3) {
                    return acc;
                }
                const hasMarker = claim.claimants.some(
                    claimant => claimant.destination === DELEGATE_MARKER_KEY,
                );
                const selfClaim = claim.claimants.find(
                    claimant =>
                        claimant.destination === accountId && !!claimant.predicate?.not?.abs_before,
                );

                const isDelegatedIce = ICE_TO_DELEGATE.includes(claim.asset);

                if (hasMarker && Boolean(selfClaim) && isDelegatedIce) {
                    acc.push(claim);
                }
                return acc;
            }, [])
            .map(cb => {
                const unlockDate =
                    cb.claimants.find(({ destination }) => destination === accountId).predicate.not
                        .abs_before_epoch * 1000;

                return { ...cb, unlockDate };
            });
    }

    getDelegatorLocks(accountId: string): ClaimableBalance[] {
        if (!this.claimableBalances) {
            return null;
        }

        return this.claimableBalances.reduce((acc, claim) => {
            if (claim.claimants.length !== 3) {
                return acc;
            }
            const hasMarker = claim.claimants.some(
                claimant => claimant.destination === DELEGATE_MARKER_KEY,
            );
            const selfClaim = claim.claimants.find(
                claimant =>
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    claimant.destination === accountId && !!claimant.predicate?.not?.unconditional,
            );

            const isDelegatedIce = ICE_TO_DELEGATE.includes(claim.asset);

            if (hasMarker && Boolean(selfClaim) && isDelegatedIce) {
                acc.push(claim);
            }
            return acc;
        }, []);
    }

    clearClaimableBalances() {
        this.claimableBalances = null;
    }
}
