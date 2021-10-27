import * as React from 'react';
import styled, { css } from 'styled-components';
import { COLORS } from '../../../../common/styles';
import NativeVotingButton from './VotingButton/VotingButton';
import Success from '../../../../common/assets/img/icon-success.svg';
import Fail from '../../../../common/assets/img/icon-fail.svg';

const SideBarBlock = styled.aside`
    position: sticky;
    top: 4rem;
    margin: 10rem 4rem 0 0;
    float: right;

    padding: 3.2rem 4.8rem 4.8rem;
    width: 36.4rem;
    background: ${COLORS.white};
    box-shadow: 0 2rem 3rem rgba(0, 6, 54, 0.06);
    border-radius: 0.5rem;
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

const iconStyles = css`
    height: 2.4rem;
    width: 2.4rem;
`;

const FailIcon = styled(Fail)`
    ${iconStyles}
`;
const SuccessIcon = styled(Success)`
    ${iconStyles}
`;

const SideBar = (): JSX.Element => {
    return (
        <SideBarBlock>
            <Title>Cast your votes</Title>
            <VotingButton>
                <SuccessIcon /> Vote <BoldText>For</BoldText>
            </VotingButton>
            <VotingButton isVoteFor>
                <FailIcon />
                Vote <BoldText>Against</BoldText>
            </VotingButton>
        </SideBarBlock>
    );
};

export default SideBar;
