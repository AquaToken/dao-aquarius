import * as React from 'react';
import styled from 'styled-components';
import { flexRowSpaceBetween } from '../../../../../common/mixins';
import { COLORS } from '../../../../../common/styles';
import { formatBalance } from '../../../../../common/helpers/helpers';

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

const IceLine = styled.div<{ width: number; hasAquaVotes: boolean }>`
    display: flex;
    width: ${({ width }) => `${width}%`};
    height: 0.8rem;
    border-radius: ${({ hasAquaVotes }) => (!hasAquaVotes ? '0.8rem' : '0.8rem 0 0 0.8rem')};
    border-right: ${({ hasAquaVotes }) =>
        !hasAquaVotes ? 'none' : `0.1rem solid ${COLORS.white}`};
    background: ${COLORS.blue};
`;

const AquaLine = styled.div<{ width: number; hasIceVotes: boolean }>`
    display: flex;
    width: ${({ width }) => `${width}%`};
    height: 0.8rem;
    border-radius: ${({ hasIceVotes }) => (hasIceVotes ? '0 0.8rem 0.8rem 0' : '0.8rem')};
    background: ${COLORS.purple};
`;

const VotesProgressLine = ({ label, total, iceVotes, aquaVotes }) => {
    const icePercent = iceVotes === 0 ? 0 : Math.max((iceVotes / total) * 100, 1);
    const aquaPercent = aquaVotes === 0 ? 0 : Math.max((aquaVotes / total) * 100, 1);

    return (
        <Container>
            <Header>
                <Label>{label}</Label>
                <Sum>{formatBalance(iceVotes + aquaVotes, true)}</Sum>
            </Header>
            <Pillar>
                <IceLine width={icePercent} hasAquaVotes={aquaPercent !== 0} />
                <AquaLine width={aquaPercent} hasIceVotes={icePercent !== 0} />
            </Pillar>
        </Container>
    );
};

export default VotesProgressLine;
