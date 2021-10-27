import * as React from 'react';
import styled from 'styled-components';
import { COLORS } from '../../../../common/styles';

const VotesBlock = styled.div`
    width: 100%;
`;

const Title = styled.h5`
    font-size: 2rem;
    line-height: 2.8rem;
    color: ${COLORS.titleText};
`;

const votesMockData = [
    {
        account: 'GARDNV3Q7YGT4AKSDF25LT32YSCCW4EV22Y2TV3I2PU2MMXJTEDL5T55',
        solution: 'Votes For',
        amount: '1.039.389',
    },
    {
        account: 'GBNZILSTVQZ4R7IKQDGHYGY2QXL5QOFJYQMXPKWRRM5PAV7Y4M67AQUA',
        solution: 'Votes Against',
        amount: '241.213',
    },
    {
        account: 'GBDEVU63Y6NTHJQQZIKVTC23NWLQVP3WJ2RI2OTSJTNYOIGICST6DUXR',
        solution: 'Votes For',
        amount: '1.344.213',
    },
];

const Votes = (): JSX.Element => {
    console.log(votesMockData);
    return (
        <VotesBlock>
            <Title>Votes (5)</Title>
            {/*{votesMockData.map((vote) => {*/}
            {/*    return null;*/}
            {/*    return <ResultProgressLine key={result.label} result={result} />;*/}
            {/*})}*/}
        </VotesBlock>
    );
};

export default Votes;
