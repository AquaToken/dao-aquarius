import * as React from 'react';
import styled, { css } from 'styled-components';
import { COLORS } from '../../../../common/styles';

import Success from '../../../../common/assets/img/icon-success.svg';
import Fail from '../../../../common/assets/img/icon-fail.svg';

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

const Solution = ({ label }: { label: string }): JSX.Element => {
    return (
        <SolutionBlock>
            {label === 'Vote Against' ? <FailIcon /> : <SuccessIcon />}
            <span>{label}</span>
        </SolutionBlock>
    );
};

export default Solution;
