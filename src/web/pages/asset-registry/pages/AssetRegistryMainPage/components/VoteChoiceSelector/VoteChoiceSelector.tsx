import * as React from 'react';

import { ChoiceButton, ChoiceGroup } from './VoteChoiceSelector.styled';

type VoteChoice = 'against' | 'abstain' | 'for';

type VoteChoiceSelectorProps = {
    value: VoteChoice;
};

const VoteChoiceSelector = ({ value }: VoteChoiceSelectorProps) => (
    <ChoiceGroup>
        <ChoiceButton $variant="against" $isActive={value === 'against'}>
            x
        </ChoiceButton>
        <ChoiceButton $variant="abstain" $isActive={value === 'abstain'}>
            o
        </ChoiceButton>
        <ChoiceButton $variant="for" $isActive={value === 'for'}>
            ✓
        </ChoiceButton>
    </ChoiceGroup>
);

export default VoteChoiceSelector;
