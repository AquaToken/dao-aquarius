import * as React from 'react';

import Select from 'basics/inputs/Select';

import { PositionsList, Section, SectionTitle } from './ConcentratedPositionsSection.styled';

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
                <Select
                    options={positionSelectOptions}
                    value={selectedPositionKey}
                    onChange={onSelectPosition}
                    placeholder="Select position"
                />
            ) : null}
            {!positionsCount && <span>No positions found</span>}
        </PositionsList>
    </Section>
);

export default ConcentratedPositionsSection;
