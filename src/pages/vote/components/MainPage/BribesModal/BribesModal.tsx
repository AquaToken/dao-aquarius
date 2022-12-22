import * as React from 'react';
import { useState } from 'react';
import {
    ModalDescription,
    ModalProps,
    ModalTitle,
} from '../../../../../common/modals/atoms/ModalAtoms';
import { PairStats } from '../../../api/types';
import styled from 'styled-components';
import { flexRowSpaceBetween, respondDown } from '../../../../../common/mixins';
import { Breakpoints, COLORS } from '../../../../../common/styles';
import { convertUTCToLocalDateIgnoringTimezone } from '../../../../bribes/pages/AddBribePage';
import { formatBalance, getDateString } from '../../../../../common/helpers/helpers';
import Aqua from '../../../../../common/assets/img/aqua-logo-small.svg';
import Close from '../../../../../common/assets/img/icon-close-small-purple.svg';
import ExternalLink from '../../../../../common/basics/ExternalLink';
import { TableBody, TableHead, TableHeadRow } from '../Table/Table';
import Asset from '../../AssetDropdown/Asset';
import { StellarService } from '../../../../../common/services/globalServices';
import Info from '../../../../../common/assets/img/icon-info.svg';

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

export const TableBodyRow = styled.div`
    display: flex;
    align-items: stretch;
    width: 100%;
    min-height: 5rem;
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.paragraphText};
    position: relative;

    ${respondDown(Breakpoints.md)`
            flex-direction: column;
            background-color: ${COLORS.lightGray};
            border-radius: 0.5rem;
            margin-bottom: 1.6rem;
            padding: 2.7rem 1.6rem 1.6rem;
      `}
`;

export const TableCell = styled.div`
    display: flex;
    align-items: center;
    flex: 2 0 0;
    min-width: 14rem;
    max-width: 100%;

    label {
        display: none;
        color: ${COLORS.grayText};
    }

    ${respondDown(Breakpoints.md)`
            ${flexRowSpaceBetween};
            align-items: center;
            margin-bottom: 1.6rem;
            
            label {
                display: block;
             }
        `}
`;

export const RightAlignedCell = styled(TableCell)`
    justify-content: flex-end;

    ${respondDown(Breakpoints.md)`
        justify-content: space-between;
    `};
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
    const { start_at, stop_at } = pair.aggregated_bribes[0];

    const startUTC = convertUTCToLocalDateIgnoringTimezone(new Date(start_at));
    const stopUTC = convertUTCToLocalDateIgnoringTimezone(new Date(stop_at));

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
                        <BribeDetailTitle>Bribe per 1000 AQUA/ICE votes:</BribeDetailTitle>
                        <BribeDetailValue>
                            ≈{formatBalance(aquaBribePrice, true)} AQUA per day
                        </BribeDetailValue>
                    </BribeDetail>

                    <BribeDetail>
                        <BribeDetailTitle>Distributed among:</BribeDetailTitle>
                        <BribeDetailValue>{pair.voting_amount} voters</BribeDetailValue>
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
            <TableHead>
                <TableHeadRow>
                    <TableCell>Asset</TableCell>
                    <RightAlignedCell>Reward per day</RightAlignedCell>
                    <RightAlignedCell>AQUA amount</RightAlignedCell>
                </TableHeadRow>
            </TableHead>
            <TableBody>
                {pair.aggregated_bribes.map((bribe) => (
                    <TableBodyRow key={bribe.asset_code + bribe.asset_issuer}>
                        <TableCell>
                            <label>Asset:</label>
                            <Asset
                                asset={StellarService.createAsset(
                                    bribe.asset_code,
                                    bribe.asset_issuer,
                                )}
                                inRow
                                withMobileView
                            />
                        </TableCell>
                        <RightAlignedCell>
                            <label>Reward per day:</label>
                            {formatBalance(+bribe.daily_amount, true)} {bribe.asset_code}
                        </RightAlignedCell>
                        <RightAlignedCell>
                            <label>AQUA amount:</label>
                            {formatBalance(+bribe.daily_aqua_equivalent, true)} AQUA
                        </RightAlignedCell>
                    </TableBodyRow>
                ))}
            </TableBody>
        </ModalContainer>
    );
};

export default BribesModal;
