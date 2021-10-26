import * as React from 'react';
import styled from 'styled-components';
import Proposal from './Proposal/Proposal';
import SideBar from './SideBar/SideBar';

const MainBlock = styled.main`
    flex: 1 0 auto;
    padding: 10rem 4rem 8rem;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    column-gap: 4rem;
`;

const VoteProposalPage = (): JSX.Element => {
    return (
        <MainBlock>
            <Proposal />
            <SideBar />
        </MainBlock>
    );
};

export default VoteProposalPage;
