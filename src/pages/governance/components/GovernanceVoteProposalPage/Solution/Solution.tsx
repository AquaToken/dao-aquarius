import * as React from 'react';
import styled, { css } from 'styled-components';
import { COLORS } from '../../../../../common/styles';

import Success from 'assets/icon-success.svg';
import Fail from 'assets/icon-fail.svg';
import { VoteChoiceSimple } from '../../../api/types';

const SolutionBlock = styled.div`
    display: flex;
    align-items: center;
    color: ${COLORS.grayText};
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

const Solution = ({ choice }: { choice: VoteChoiceSimple }): JSX.Element => {
    return (
        <SolutionBlock>
            {choice === 'vote_against' ? <FailIcon /> : <SuccessIcon />}
            <span>{ChoiceLabel[choice]}</span>
        </SolutionBlock>
    );
};

export default Solution;
