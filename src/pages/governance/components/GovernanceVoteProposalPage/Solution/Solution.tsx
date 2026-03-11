import * as React from 'react';
import { ReactElement } from 'react';
import styled from 'styled-components';

import { ChoiceOption } from 'constants/dao';

import { VoteChoiceSimple } from 'types/governance';

import { VoteIcon } from 'basics/icons';

import { COLORS } from 'styles/style-constants';

const SolutionBlock = styled.div`
    display: flex;
    align-items: center;
    color: ${COLORS.textGray};
    gap: 0.8rem;
`;

const Solution = ({ choice }: { choice: VoteChoiceSimple }): ReactElement => (
    <SolutionBlock>
        <VoteIcon option={ChoiceOption[choice]} />
        <span>{ChoiceOption[choice]}</span>
    </SolutionBlock>
);

export default Solution;
