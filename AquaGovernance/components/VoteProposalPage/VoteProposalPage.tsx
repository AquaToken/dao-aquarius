import * as React from 'react';
import styled from 'styled-components';
import Proposal from './Proposal/Proposal';

const MainBlock = styled.main`
    flex: 1 0 auto;
    padding: 0 4rem;
`;

const VoteProposalPage = (): JSX.Element => {
    return (
        <MainBlock>
            <Proposal />
        </MainBlock>
    );
};

export default VoteProposalPage;
