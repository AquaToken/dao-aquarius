import * as React from 'react';
import { useState } from 'react';
import { convertUTCToLocalDateIgnoringTimezone } from '../../../../bribes/pages/AddBribePage';
import { formatBalance, getDateString } from '../../../../../common/helpers/helpers';
import {
    BribeDetail,
    BribeDetailsMain,
    BribeDetailTitle,
    BribeDetailValue,
    CloseButton,
    ExternalLinkMobile,
    ExternalLinkWeb,
    HowItWorksFooter,
    HowItWorksText,
} from '../../../../vote/components/MainPage/BribesModal/BribesModal';
import Close from '../../../../../common/assets/img/icon-close-small-purple.svg';

import Asset from '../../../../vote/components/AssetDropdown/Asset';
import { StellarService } from '../../../../../common/services/globalServices';
import styled from 'styled-components';
import { Breakpoints, COLORS } from '../../../../../common/styles';
import Aqua from '../../../../../common/assets/img/aqua-logo-small.svg';
import Info from '../../../../../common/assets/img/icon-info.svg';
import { respondDown } from '../../../../../common/mixins';
import Table, { CellAlign } from '../../../../../common/basics/Table';

const Container = styled.div`
    display: flex;
    flex-direction: column;
`;

const Description = styled.div`
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.descriptionText};
    opacity: 0.7;
    margin-bottom: 3.2rem;
`;

const AquaLogo = styled(Aqua)`
    height: 5rem;
    width: 5rem;
    margin-right: 3.8rem;
`;

const IconInfo = styled(Info)`
    position: absolute;
    right: 1.6rem;
    top: 1.6rem;
    cursor: pointer;
`;

const AquaLogoSmall = styled(Aqua)`
    height: 1.6rem;
    width: 1.6rem;
    margin-right: 0.8rem;
`;

const BribeDetails = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 3.8rem;
    background: ${COLORS.lightGray};
    border-radius: 0.5rem;
    margin-bottom: 3.8rem;
    position: relative;

    ${respondDown(Breakpoints.md)`
        padding: 1.6rem 0;
        background-color: ${COLORS.white};
    `}
`;

export const HowItWorks = styled.div`
    background-color: ${COLORS.white};
    padding: 3.2rem;
    margin-top: 1.8rem;
    position: relative;

    &::after {
        content: '';
        display: block;
        position: absolute;
        bottom: 100%;
        left: 50%;
        transform: translate(-50%, 0);
        border-bottom: 0.6rem solid ${COLORS.white};
        border-left: 0.6rem solid ${COLORS.transparent};
        border-right: 0.6rem solid ${COLORS.transparent};
    }

    ${respondDown(Breakpoints.md)`
        padding: 1.6rem;
        background-color: ${COLORS.lightGray};
    `}
`;

const Total = styled.div`
    display: flex;
    align-items: center;
`;

const MarketCurrentBribes = ({ extra, bribes }) => {
    const [showHowItWorks, setShowHowItWorks] = useState(false);
    if (!bribes) {
        return (
            <Container>
                <Description>There are no bribes this week</Description>
            </Container>
        );
    }

    const { start_at, stop_at } = bribes[0];

    const startUTC = convertUTCToLocalDateIgnoringTimezone(new Date(start_at));
    const stopUTC = convertUTCToLocalDateIgnoringTimezone(new Date(stop_at));

    const { upvoteSum, upvoteCount } = extra.upvote_assets.reduce(
        (acc, { votes_count, votes_sum }) => {
            acc.upvoteSum += Number(votes_sum);
            acc.upvoteCount += votes_count;
            return acc;
        },
        { upvoteSum: 0, upvoteCount: 0 },
    );

    const sum = bribes.reduce((acc, bribe) => {
        acc += Number(bribe.daily_aqua_equivalent);
        return acc;
    }, 0);

    const aquaBribePrice = Number(sum / Number(upvoteSum)) * 1000;

    return (
        <Container>
            <Description>
                This week bribes from{' '}
                {getDateString(new Date(startUTC).getTime(), { withoutYear: true })} to{' '}
                {getDateString(new Date(stopUTC).getTime() - 1)}
            </Description>
            <BribeDetails>
                <BribeDetailsMain>
                    <AquaLogo />

                    <BribeDetail>
                        <BribeDetailTitle>Bribe per 1000 AQUA/ICE votes:</BribeDetailTitle>
                        <BribeDetailValue>
                            ≈{formatBalance(aquaBribePrice, true)} AQUA per day
                        </BribeDetailValue>
                    </BribeDetail>

                    <BribeDetail>
                        <BribeDetailTitle>Distributed among:</BribeDetailTitle>
                        <BribeDetailValue>{upvoteCount} voters</BribeDetailValue>
                    </BribeDetail>

                    <IconInfo onClick={() => setShowHowItWorks(true)} />
                </BribeDetailsMain>

                {showHowItWorks && (
                    <HowItWorks>
                        <HowItWorksText>
                            Bribes are paid out during a 7 day period. They are divided among all
                            participants in the voting for the market pair. Bribes are issued in the
                            currency indicated by the creator of the bribe, in order to receive them
                            you need to have an open trustline.
                        </HowItWorksText>
                        <HowItWorksFooter>
                            <ExternalLinkWeb href="https://medium.com/aquarius-aqua/introducing-aquarius-bribes-6b0931dc3dd7">
                                Learn more about Aquarius Bribes
                            </ExternalLinkWeb>
                            <ExternalLinkMobile href="https://medium.com/aquarius-aqua/introducing-aquarius-bribes-6b0931dc3dd7">
                                Learn more
                            </ExternalLinkMobile>
                            <CloseButton onClick={() => setShowHowItWorks(false)}>
                                <span>Close</span>
                                <Close />
                            </CloseButton>
                        </HowItWorksFooter>
                    </HowItWorks>
                )}
            </BribeDetails>

            <Table
                head={[
                    { children: 'Asset' },
                    { children: 'Reward per day', align: CellAlign.Right },
                    { children: 'AQUA amount', align: CellAlign.Right },
                ]}
                body={[
                    ...bribes.map((bribe) => ({
                        isNarrow: true,
                        key: bribe.asset_code + bribe.asset_issuer,
                        mobileBackground: COLORS.lightGray,
                        rowItems: [
                            {
                                children: (
                                    <Asset
                                        asset={StellarService.createAsset(
                                            bribe.asset_code,
                                            bribe.asset_issuer,
                                        )}
                                        inRow
                                        withMobileView
                                    />
                                ),
                                label: 'Asset:',
                            },
                            {
                                children: `${formatBalance(+bribe.daily_amount, true)} ${
                                    bribe.asset_code
                                }`,
                                label: 'Reward per day:',
                                align: CellAlign.Right,
                            },
                            {
                                children: `${formatBalance(
                                    +bribe.daily_aqua_equivalent,
                                    true,
                                )} AQUA`,
                                label: 'AQUA amount:',
                                align: CellAlign.Right,
                            },
                        ],
                    })),
                    {
                        isNarrow: true,
                        key: 'total',
                        mobileBackground: COLORS.lightGray,
                        rowItems: [
                            { children: 'Total reward per day:' },
                            { children: '' },
                            {
                                children: (
                                    <Total>
                                        <AquaLogoSmall />≈{formatBalance(sum, true)} AQUA
                                    </Total>
                                ),
                                align: CellAlign.Right,
                                label: 'AQUA amount:',
                            },
                        ],
                    },
                ]}
            />
        </Container>
    );
};

export default MarketCurrentBribes;
