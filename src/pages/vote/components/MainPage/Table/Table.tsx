import * as React from 'react';
import styled from 'styled-components';
import { Breakpoints, COLORS } from '../../../../../common/styles';
import { PairStats, TotalStats } from '../../../api/types';
import { formatBalance } from '../../../../../common/helpers/helpers';
import Pair from '../../common/Pair';
import { flexAllCenter, respondDown } from '../../../../../common/mixins';
import VoteButton from './VoteButton/VoteButton';
import VoteAmount from './VoteAmount/VoteAmount';
import Button from '../../../../../common/basics/Button';
import ManageIcon from '../../../../../common/assets/img/icon-manage.svg';
import Tooltip, { TOOLTIP_POSITION } from '../../../../../common/basics/Tooltip';
import { ModalService, StellarService } from '../../../../../common/services/globalServices';
import ManageVotesModal from '../ManageVotesModal/ManageVotesModal';
import Aqua from '../../../../../common/assets/img/aqua-logo-small.svg';
import ArrowRight from '../../../../../common/assets/img/icon-arrow-right.svg';
import Asset from '../../AssetDropdown/Asset';
import BribesModal from '../BribesModal/BribesModal';
import { useHistory } from 'react-router-dom';
import { MarketRoutes } from '../../../../../routes';
import Table, { CellAlign } from '../../../../../common/basics/Table';

const ManageButton = styled(Button)`
    margin-left: 0.8rem;
`;

const TooltipInner = styled.div`
    font-size: 1.2rem;
`;

const BribeInfo = styled.div`
    display: flex;
    align-items: center;
    width: min-content;
    height: 4.8rem;
    background-color: ${COLORS.gray};
    border-radius: 2.2rem;
    padding: 0 1.6rem;
    white-space: nowrap;
    position: relative;
    color: ${COLORS.grayText};
    font-size: 1.4rem;
    line-height: 2rem;
    cursor: pointer;
    margin-top: 0.6rem;

    &:hover {
        padding-right: 1.1rem;
        svg:last-child {
            margin-left: 0.5rem;
        }
    }

    &::after {
        content: '';
        display: block;
        position: absolute;
        bottom: 100%;
        left: 3.3rem;
        border-bottom: 0.6rem solid ${COLORS.gray};
        border-left: 0.6rem solid ${COLORS.transparent};
        border-right: 0.6rem solid ${COLORS.transparent};
    }

    ${respondDown(Breakpoints.md)`
        margin-top: 1.6rem;
        width: 100%;
        height: unset;
        border-radius: 0.6rem;
        flex-direction: column;
        padding: 1.6rem;
        align-items: flex-start;
    `}
`;

const BribeInfoRow = styled.div`
    display: flex;
    align-items: center;
`;

const BribeAquaSum = styled.div`
    display: flex;
    align-items: center;
    background-color: ${COLORS.white};
    height: 3.2rem;
    border-radius: 10rem;
    padding: 0 1.2rem;
    margin-left: 0.9rem;
    margin-right: 2rem;
    color: ${COLORS.paragraphText};

    ${respondDown(Breakpoints.md)`
        background-color: unset;
    `}
`;

const AquaLogo = styled(Aqua)`
    height: 1.6rem;
    width: 1.6rem;
    margin-right: 0.9rem;

    ${respondDown(Breakpoints.md)`
        display: none;
    `}
`;

const BribeAssets = styled.div`
    ${flexAllCenter};
    margin-left: 0.9rem;
    margin-right: 1.1rem;
`;

const BribeAsset = styled.div`
    ${flexAllCenter};
    height: 3.2rem;
    width: 3.2rem;
    background-color: ${COLORS.white};
    border-radius: 50%;
    border: 0.2rem solid ${COLORS.gray};

    &:not(:first-child) {
        margin-left: -1.2rem;
    }
`;

const BribeAssetsMore = styled.span`
    margin-right: 0.5rem;
`;

const ArrowRightIcon = styled(ArrowRight)`
    ${respondDown(Breakpoints.md)`
        position: absolute;
        right: 0.3rem;
        top: 50%;
        transform: translate(0, -50%);
    `}
`;

const PairWrapper = styled.div`
    min-width: 48rem;

    ${respondDown(Breakpoints.md)`
        margin-bottom: 3.2rem;
        min-width: unset;
    `}
`;

const Voted = styled.div`
    font-size: 1.4rem;
    line-height: 2rem;
    color: ${COLORS.grayText};

    ${respondDown(Breakpoints.md)`
        font-size: unset;
        line-height: unset;
        color: unset;
    `}
`;

export const MIN_REWARDS_PERCENT = 0.5;
export const MAX_REWARDS_PERCENT = 10;

export const isRewardsOn = (value: string, total: string): boolean => {
    const percent = (Number(value) / Number(total)) * 100;

    return percent >= MIN_REWARDS_PERCENT;
};

const VoteTable = ({
    pairs,
    selectedPairs,
    selectPair,
    loading,
    totalStats,
    isYourVotes,
}: {
    pairs: PairStats[];
    selectedPairs: PairStats[];
    selectPair: (PairStats) => void;
    loading: boolean;
    totalStats: TotalStats;
    isYourVotes: boolean;
}): JSX.Element => {
    const history = useHistory();

    if (!pairs.length) {
        return null;
    }

    const isPairSelected = ({ market_key: marketKey }: PairStats): boolean => {
        return selectedPairs.some((pair) => pair.market_key === marketKey);
    };

    const manageVotes = (event, pair) => {
        event.preventDefault();
        event.stopPropagation();
        ModalService.openModal(ManageVotesModal, { pair });
    };

    const showBribes = (event, pair) => {
        event.preventDefault();
        event.stopPropagation();
        ModalService.openModal(BribesModal, { pair });
    };

    const goToMarketPage = (pair) => {
        history.push(`${MarketRoutes.main}/${pair.asset1}/${pair.asset2}`);
    };

    return (
        <Table
            pending={loading || !totalStats}
            head={[
                { children: 'Pair', flexSize: 2 },
                { children: 'Users Voted', flexSize: 0.5 },
                { children: 'Votes' },
                { children: 'Your Vote', align: CellAlign.Right, flexSize: 1.5 },
            ]}
            body={pairs.map((pair) => {
                const hasBribes = pair.aggregated_bribes?.length;
                const sum = hasBribes
                    ? pair.aggregated_bribes.reduce((acc, bribe) => {
                          acc += Number(bribe.daily_aqua_equivalent);
                          return acc;
                      }, 0)
                    : 0;

                return {
                    onRowClick: () => {
                        goToMarketPage(pair);
                    },
                    key: pair.id.toString(),
                    rowItems: [
                        {
                            children: (
                                <PairWrapper>
                                    <Pair
                                        base={{
                                            code: pair.asset1_code,
                                            issuer: pair.asset1_issuer,
                                        }}
                                        counter={{
                                            code: pair.asset2_code,
                                            issuer: pair.asset2_issuer,
                                        }}
                                        isRewardsOn={
                                            (isRewardsOn(
                                                pair.votes_value,
                                                totalStats.votes_value_sum,
                                            ) ||
                                                Number(pair.adjusted_votes_value) >
                                                    Number(pair.votes_value)) &&
                                            isRewardsOn(
                                                pair.adjusted_votes_value,
                                                totalStats.adjusted_votes_value_sum,
                                            )
                                        }
                                        isMaxRewards={
                                            pair.adjusted_votes_value
                                                ? (Number(pair.adjusted_votes_value) /
                                                      Number(totalStats.adjusted_votes_value_sum)) *
                                                      100 >
                                                  MAX_REWARDS_PERCENT
                                                : false
                                        }
                                        mobileVerticalDirections
                                        authRequired={
                                            pair.auth_required ||
                                            pair.auth_revocable ||
                                            pair.auth_clawback_enabled
                                        }
                                        noLiquidity={pair.no_liquidity}
                                        boosted={
                                            Number(pair.adjusted_votes_value) >
                                            Number(pair.votes_value)
                                        }
                                    />
                                </PairWrapper>
                            ),
                            flexSize: 2,
                        },
                        {
                            children: (
                                <Voted>
                                    {pair.voting_amount ? formatBalance(pair.voting_amount) : null}
                                </Voted>
                            ),
                            label: 'Users Voted:',
                            flexSize: 0.5,
                        },
                        {
                            children: <VoteAmount pair={pair} totalStats={totalStats} />,
                            mobileStyle: { width: '100%' },
                        },
                        {
                            children: (
                                <>
                                    <VoteButton
                                        pair={pair}
                                        isPairSelected={isPairSelected(pair)}
                                        onButtonClick={() => selectPair(pair)}
                                        disabled={
                                            pair.auth_required ||
                                            pair.auth_revocable ||
                                            pair.auth_clawback_enabled ||
                                            pair.no_liquidity
                                        }
                                    />
                                    {isYourVotes && (
                                        <Tooltip
                                            content={<TooltipInner>Manage votes</TooltipInner>}
                                            position={TOOLTIP_POSITION.top}
                                            showOnHover
                                        >
                                            <ManageButton
                                                isSquare
                                                likeDisabled
                                                onClick={(e) => manageVotes(e, pair)}
                                            >
                                                <ManageIcon />
                                            </ManageButton>
                                        </Tooltip>
                                    )}
                                </>
                            ),
                            flexSize: 1.5,
                            align: CellAlign.Right,
                        },
                    ],
                    afterRow: hasBribes ? (
                        <BribeInfo key={pair.account_id} onClick={(e) => showBribes(e, pair)}>
                            <BribeInfoRow>
                                <span>Daily bribe amount:</span>
                                <BribeAquaSum>
                                    <AquaLogo />
                                    <span>≈{formatBalance(sum, true)} AQUA</span>
                                </BribeAquaSum>
                            </BribeInfoRow>
                            <BribeInfoRow>
                                <span>Paid in:</span>
                                <BribeAssets>
                                    {pair.aggregated_bribes
                                        .sort(
                                            (a, b) =>
                                                Number(b.daily_aqua_equivalent) -
                                                Number(a.daily_aqua_equivalent),
                                        )
                                        .slice(0, 3)
                                        .map((bribe, index) => (
                                            <BribeAsset
                                                style={{ zIndex: 3 - index }}
                                                key={bribe.asset_code + bribe.asset_issuer}
                                            >
                                                <Asset
                                                    asset={StellarService.createAsset(
                                                        bribe.asset_code,
                                                        bribe.asset_issuer,
                                                    )}
                                                    onlyLogoSmall
                                                />
                                            </BribeAsset>
                                        ))}
                                </BribeAssets>
                                {pair.aggregated_bribes.length > 3 ? (
                                    <BribeAssetsMore>
                                        +{pair.aggregated_bribes.length - 3} more
                                    </BribeAssetsMore>
                                ) : null}
                            </BribeInfoRow>
                            <ArrowRightIcon />
                        </BribeInfo>
                    ) : null,
                };
            })}
        />
    );
};

export default VoteTable;
