import * as React from 'react';
import styled, { css } from 'styled-components';

import Fail from 'assets/icons/status/fail-red.svg';
import Success from 'assets/icons/status/success.svg';

import { COLORS } from 'styles/style-constants';

import { VoteChoiceSimple } from '../../../api/types';

const SolutionBlock = styled.div`
    display: flex;
    align-items: center;
    color: ${COLORS.textGray};
`;

const IconStyles = css`
    height: 1.6rem;
    width: 1.6rem;
    margin-right: 0.8rem;
`;

const SuccessIcon = styled(Success)`
    ${IconStyles}
`;

const FailIcon = styled(Fail)`
    ${IconStyles}
`;

enum ChoiceLabel {
    vote_against = 'Against',
    vote_for = 'For',
}

const Solution = ({ choice }: { choice: VoteChoiceSimple }): JSX.Element => (
    <SolutionBlock>
        {choice === 'vote_against' ? <FailIcon /> : <SuccessIcon />}
        <span>{ChoiceLabel[choice]}</span>
    </SolutionBlock>
);

export default Solution;
