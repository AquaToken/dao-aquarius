import * as React from 'react';
import { useState } from 'react';
import styled from 'styled-components';

import { convertLocalDateToUTCIgnoringTimezone, getDateString } from 'helpers/date';
import { formatBalance } from 'helpers/format-number';

import { StellarService } from 'services/globalServices';

import { ModalProps } from 'types/modal';

import { respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import Aqua from 'assets/aqua-logo-small.svg';
import Close from 'assets/icon-close-small-purple.svg';
import Info from 'assets/icon-info.svg';

import Asset from 'basics/Asset';
import ExternalLink from 'basics/ExternalLink';
import { ModalDescription, ModalTitle } from 'basics/ModalAtoms';
import Table, { CellAlign } from 'basics/Table';

import { PairStats } from '../../../api/types';

const ModalContainer = styled.div`
    width: 80.6rem;
    max-height: 80vh;
    padding-right: 0.5rem;
    overflow: auto;

    &::-webkit-scrollbar {
        width: 0.5rem;
    }

    /* Track */
    &::-webkit-scrollbar-track {
        background: ${COLORS.white};
    }

    /* Handle */
    &::-webkit-scrollbar-thumb {
        background: ${COLORS.purple};
        border-radius: 0.25rem;
    }

    ${respondDown(Breakpoints.md)`
          width: 100%;
          max-height: unset;
      `};
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
        padding: 1.6rem;
    `}
`;

export const BribeDetailsMain = styled.div`
    display: flex;
    align-items: center;
    width: 100%;

    ${respondDown(Breakpoints.md)`
        flex-direction: column;
        align-items: flex-start;
    `}
`;

export const BribeDetail = styled.div`
    display: flex;
    flex-direction: column;

    &:not(:last-child) {
        margin-right: 7.7rem;
    }

    ${respondDown(Breakpoints.md)`
        margin: 2.4rem 0;
   `}
`;

export const BribeDetailTitle = styled.div`
    font-weight: 400;
    font-size: 1.4rem;
    line-height: 2rem;
    ${COLORS.grayText}
`;

export const BribeDetailValue = styled.div`
    font-weight: 700;
    font-size: 2rem;
    line-height: 2.8rem;
    ${COLORS.titleText}
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

const HowItWorks = styled.div`
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
`;

export const HowItWorksText = styled.span`
    font-size: 1.6rem;
    line-height: 2.4rem;
    color: ${COLORS.grayText};
`;

export const HowItWorksFooter = styled.div`
    display: flex;
    justify-content: space-between;
    margin-top: 1.6rem;
`;

export const CloseButton = styled.div`
    display: flex;
    align-items: center;
    cursor: pointer;
    color: ${COLORS.purple};
    font-size: 1.6rem;
    line-height: 2.8rem;
    svg {
        margin-left: 0.8rem;
    }
`;

export const ExternalLinkWeb = styled(ExternalLink)`
    ${respondDown(Breakpoints.md)`
         display: none;
     `};
`;

export const ExternalLinkMobile = styled(ExternalLink)`
    display: none;

    ${respondDown(Breakpoints.md)`
         display: block;
     `};
`;

const BribesModal = ({ params }: ModalProps<{ pair: PairStats }>) => {
    const [showHowItWorks, setShowHowItWorks] = useState(false);
    const { pair } = params;

    const sum = pair.aggregated_bribes.reduce((acc, bribe) => {
        acc += Number(bribe.daily_aqua_equivalent);
        return acc;
    }, 0);

    const apy = (sum / Number(pair.upvote_value) + 1) ** 365 - 1;

    const { start_at, stop_at } = pair.aggregated_bribes[0];

    const startUTC = convertLocalDateToUTCIgnoringTimezone(new Date(start_at));
    const stopUTC = convertLocalDateToUTCIgnoringTimezone(new Date(stop_at));

    const aquaBribePrice = Number(sum / Number(pair.upvote_value)) * 1000;
    return (
        <ModalContainer>
            <ModalTitle>
                Bribes for {pair.asset1_code}/{pair.asset2_code}
            </ModalTitle>
            <ModalDescription>
                This week bribes from{' '}
                {getDateString(new Date(startUTC).getTime(), { withoutYear: true })} to{' '}
                {getDateString(new Date(stopUTC).getTime() - 1)}
            </ModalDescription>
            <BribeDetails>
                <BribeDetailsMain>
                    <AquaLogo />

                    <BribeDetail>
                        <BribeDetailTitle>Bribe per 1000 AQUA or ICE votes:</BribeDetailTitle>
                        <BribeDetailValue>
                            {formatBalance(aquaBribePrice, true)} AQUA per day
                        </BribeDetailValue>
                    </BribeDetail>

                    <BribeDetail>
                        <BribeDetailTitle>Distributed among:</BribeDetailTitle>
                        <BribeDetailValue>{pair.voting_amount} voters</BribeDetailValue>
                    </BribeDetail>

                    <BribeDetail>
                        <BribeDetailTitle>Bribes APY:</BribeDetailTitle>
                        <BribeDetailValue>
                            {formatBalance(+(apy * 100).toFixed(2), true)}%
                        </BribeDetailValue>
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
                body={pair.aggregated_bribes.map(bribe => ({
                    key: bribe.asset_code + bribe.asset_issuer,
                    isNarrow: true,
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
                            align: CellAlign.Right,
                            label: 'Reward per day:',
                        },
                        {
                            children: `${formatBalance(+bribe.daily_aqua_equivalent, true)} AQUA`,
                            align: CellAlign.Right,
                            label: 'AQUA amount:',
                        },
                    ],
                }))}
            />
        </ModalContainer>
    );
};

export default BribesModal;
