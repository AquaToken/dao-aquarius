import * as React from 'react';
import styled from 'styled-components';
import { COLORS } from '../../../../common/styles';
import NativeVotingButton from './VotingButton/VotingButton';
import Success24Icon from '../../../../common/assets/img/icon-success24.svg';
import Fail24Icon from '../../../../common/assets/img/icon-fail24.svg';

const SideBarBlock = styled.aside`
    position: sticky;
    top: 4rem;

    padding: 3.2rem 4.8rem 4.8rem;
    width: 36.4rem;
    height: 28.6rem;
    background: ${COLORS.white};
    box-shadow: 0 2rem 3rem rgba(0, 6, 54, 0.06);
    border-radius: 0.5rem;
    flex-shrink: 0;
`;

const Title = styled.h5`
    font-size: 2rem;
    line-height: 2.8rem;
    margin-bottom: 3.4rem;
    color: ${COLORS.titleText};
`;

const VotingButton = styled(NativeVotingButton)`
    & > svg {
        margin-right: 1.3rem;
    }

    &:not(:last-child) {
        margin-bottom: 0.8rem;
    }
`;

const BoldText = styled.span`
    font-weight: bold;
    margin-left: 0.8rem;
`;

const SideBar = (): JSX.Element => {
    return (
        <SideBarBlock>
            <Title>Cast your votes</Title>
            <VotingButton>
                <Success24Icon /> Vote <BoldText>For</BoldText>
            </VotingButton>
            <VotingButton isVoteFor>
                <Fail24Icon />
                Vote <BoldText>Against</BoldText>
            </VotingButton>
        </SideBarBlock>
    );
};

export default SideBar;
