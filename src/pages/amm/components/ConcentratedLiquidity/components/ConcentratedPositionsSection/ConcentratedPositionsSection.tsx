import * as React from 'react';
import styled from 'styled-components';

import Select from 'basics/inputs/Select';

import { PositionsList, Section, SectionTitle } from './ConcentratedPositionsSection.styled';

const PositionsSelectWrap = styled.div`
    > div > div:nth-child(2) > [data-withdraw-position-card='true'] {
        padding: 2.4rem 0;
    }
`;

type Option = {
    value: string;
    label: React.ReactNode;
};

type Props = {
    positionsCount: number;
    selectedPositionKey: string | null;
    positionSelectOptions: Option[];
    onSelectPosition: (value: string) => void;
};

const ConcentratedPositionsSection = ({
    positionsCount,
    selectedPositionKey,
    positionSelectOptions,
    onSelectPosition,
}: Props) => (
    <Section>
        <SectionTitle>Select position</SectionTitle>
        <PositionsList>
            {positionsCount > 0 && selectedPositionKey ? (
                <PositionsSelectWrap>
                    <Select
                        options={positionSelectOptions}
                        value={selectedPositionKey}
                        onChange={onSelectPosition}
                        placeholder="Select position"
                    />
                </PositionsSelectWrap>
            ) : null}
            {!positionsCount && <span>No positions found</span>}
        </PositionsList>
    </Section>
);

export default ConcentratedPositionsSection;
