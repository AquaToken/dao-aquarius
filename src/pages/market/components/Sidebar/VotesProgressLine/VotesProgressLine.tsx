import * as React from 'react';
import styled from 'styled-components';

import { formatBalance } from 'helpers/format-number';

import { flexRowSpaceBetween } from 'web/mixins';
import { COLORS } from 'web/styles';

const Container = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    margin-bottom: 1.6rem;
`;

const Header = styled.div`
    ${flexRowSpaceBetween};
    margin-bottom: 0.5rem;
`;

const Label = styled.span`
    font-size: 1.4rem;
    line-height: 2rem;
    color: ${COLORS.grayText};
`;

const Sum = styled.span`
    font-size: 1.6rem;
    line-height: 2.4rem;
    color: ${COLORS.paragraphText};
`;

const Pillar = styled.div`
    display: flex;
    width: 100%;
    height: 0.8rem;
    border-radius: 0.8rem;
    background: ${COLORS.gray};
`;

const IceLine = styled.div<{ $width: number; $hasDiceVotes: boolean }>`
    display: flex;
    width: ${({ $width }) => `${$width}%`};
    height: 0.8rem;
    border-radius: ${({ $hasDiceVotes }) => (!$hasDiceVotes ? '0.8rem' : '0.8rem 0 0 0.8rem')};
    border-right: ${({ $hasDiceVotes }) =>
        !$hasDiceVotes ? 'none' : `0.1rem solid ${COLORS.white}`};
    background: ${COLORS.blue};
`;

const DiceLine = styled.div<{ $width: number; $hasIceVotes: boolean }>`
    display: flex;
    width: ${({ $width }) => `${$width}%`};
    height: 0.8rem;
    border-radius: ${({ $hasIceVotes }) => ($hasIceVotes ? '0 0.8rem 0.8rem 0' : '0.8rem')};
    background: ${COLORS.darkPurple};
`;

interface VotesProgressLineProps {
    label: string;
    total: number;
    iceVotes: number;
    diceVotes?: number;
}

const VotesProgressLine = ({
    label,
    total,
    iceVotes,
    diceVotes,
}: VotesProgressLineProps): React.ReactNode => {
    const icePercent = iceVotes === 0 ? 0 : Math.max((iceVotes / total) * 100, 1);
    const dicePercent = diceVotes === 0 ? 0 : Math.max((diceVotes / total) * 100, 1);

    return (
        <Container>
            <Header>
                <Label>{label}</Label>
                <Sum>{formatBalance(iceVotes + (diceVotes ?? 0), true)}</Sum>
            </Header>
            <Pillar>
                <IceLine $width={icePercent} $hasDiceVotes={dicePercent !== 0} />
                <DiceLine $width={dicePercent} $hasIceVotes={icePercent !== 0} />
            </Pillar>
        </Container>
    );
};

export default VotesProgressLine;
