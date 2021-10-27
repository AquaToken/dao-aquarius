import * as React from 'react';
import styled from 'styled-components';
import ResultProgressLine from './ResultProgressLine/ResultProgressLine';
import { COLORS } from '../../../../common/styles';

const ResultBlock = styled.div`
    width: 100%;
`;

const Title = styled.h5`
    font-size: 2rem;
    line-height: 2.8rem;
    color: ${COLORS.titleText};
`;

const resultsMockData = [
    { label: 'Votes For', percentage: '74%', amount: '1.039.389' },
    { label: 'Votes Against', percentage: '26%', amount: '241.213' },
];

const CurrentResults = (): JSX.Element => {
    return (
        <ResultBlock>
            <Title>Current result</Title>
            {resultsMockData.map((result) => {
                return <ResultProgressLine key={result.label} result={result} />;
            })}
        </ResultBlock>
    );
};

export default CurrentResults;
