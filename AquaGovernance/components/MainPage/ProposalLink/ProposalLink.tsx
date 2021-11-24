import * as React from 'react';
import styled from 'styled-components';
import { COLORS } from '../../../../common/styles';
import ArrowRight from '../../../../common/assets/img/icon-arrow-right.svg';
import SuccessIcon from '../../../../common/assets/img/icon-success.svg';
import { getDateString, roundToPrecision } from '../../../../common/helpers/helpers';
import { Link, LinkProps } from 'react-router-dom';
import { ProposalSimple } from '../../../api/types';
import Fail from '../../../../common/assets/img/icon-fail.svg';

const ProposalLinkBlock = styled(Link)`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 3.6rem 0;
    border-bottom: solid 0.1rem rgba(35, 2, 77, 0.1);
    color: ${COLORS.titleText};
    cursor: pointer;
    text-decoration: none;

    &:hover {
        color: ${COLORS.purple};
    }
`;

const Content = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
`;
const Label = styled.div`
    font-weight: bold;
    font-size: 2rem;
    line-height: 2.8rem;
`;
const Info = styled.div`
    font-size: 1.4rem;
    line-height: 2rem;
    color: ${COLORS.grayText};
`;

const EndedLabel = styled.div`
    display: flex;
    align-items: center;
    background-color: ${COLORS.purple};
    min-width: 18.5rem;
    border-radius: 100px;
    color: ${COLORS.white};
    padding: 0.8rem;
    font-size: 1.4rem;
    line-height: 1.6rem;
`;
const CanceledLabel = styled(EndedLabel)`
    background-color: ${COLORS.gray};
    color: ${COLORS.darkGrayText};
`;

const FailIcon = styled(Fail)`
    height: 1.4rem;
    width: 1.4rem;
    margin-right: 0.6rem;

    rect {
        fill: ${COLORS.white};
    }
    path {
        stroke: ${COLORS.grayText};
    }
`;

const Success = styled(SuccessIcon)`
    width: 16px;
    height: 16px;
    margin-right: 0.4rem;
`;

interface ProposalLinkProps extends LinkProps {
    proposal: ProposalSimple;
}

const getProposalInfo = (proposal: ProposalSimple): string => {
    const {
        end_at: dateEnd,
        is_simple_proposal: isSimpleProposal,
        vote_for_result: voteFor,
        vote_against_result: voteAgainst,
    } = proposal;

    const isEnd = new Date() >= new Date(dateEnd);

    if (!isEnd) {
        const dateString = getDateString(new Date(dateEnd).getTime());
        return `Ends on ${dateString}`;
    }

    if (isSimpleProposal) {
        const voteForValue = Number(voteFor);
        const voteAgainstValue = Number(voteAgainst);

        const isVoteForWin = voteForValue > voteAgainstValue;

        const percent =
            ((isVoteForWin ? voteForValue : voteAgainstValue) / (voteForValue + voteAgainstValue)) *
            100;
        const roundedPercent = roundToPrecision(percent, 2);

        if (Number.isNaN(percent)) {
            return 'No votes yet';
        }

        return `${
            isVoteForWin ? 'Voted "For"' : 'Voted "Against"'
        } with ${roundedPercent}% of the votes`;
    }
};

const ProposalLink = ({ proposal, ...props }: ProposalLinkProps): JSX.Element => {
    const { title, end_at: dateEnd } = proposal;

    const dateString = getDateString(new Date(dateEnd).getTime());
    const isEnd = new Date() >= new Date(dateEnd);
    // TODO fix this when backend comes up
    const isCanceled = false;
    const info = getProposalInfo(proposal);

    return (
        <ProposalLinkBlock {...props}>
            <Content>
                <Label>{title}</Label>
                <Info>{info}</Info>
            </Content>
            {isEnd && (
                <EndedLabel>
                    <Success />
                    Ended on {dateString}
                </EndedLabel>
            )}
            {isCanceled && (
                <CanceledLabel>
                    <FailIcon />
                    Canceled on {dateString}
                </CanceledLabel>
            )}
            {!isCanceled && !isEnd && <ArrowRight />}
        </ProposalLinkBlock>
    );
};

export default ProposalLink;
