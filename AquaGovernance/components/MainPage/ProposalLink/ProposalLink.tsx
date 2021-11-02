import * as React from 'react';
import styled from 'styled-components';
import { COLORS } from '../../../../common/styles';
import ArrowRight from '../../../../common/assets/img/icon-arrow-right.svg';
import SuccessIcon from '../../../../common/assets/img/icon-success.svg';
import { getDateString } from '../../../../common/helpers/helpers';
import { Link, LinkProps } from 'react-router-dom';

const ProposalLinkBlock = styled(Link)<{ $isEnd: boolean }>`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 3.6rem 0;
    border-bottom: solid 0.1rem rgba(35, 2, 77, 0.1);
    color: ${COLORS.titleText};
    cursor: pointer;
    text-decoration: none;

    pointer-events: ${({ $isEnd }) => ($isEnd ? 'none' : 'auto')};
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

const Success = styled(SuccessIcon)`
    width: 16px;
    height: 16px;
    margin-right: 0.4rem;
`;

interface ProposalLinkProps extends LinkProps {
    proposalData: { proposal: string; isEnd: boolean; dateEnd: string; result: string };
}

const ProposalLink = ({ proposalData, ...props }: ProposalLinkProps): JSX.Element => {
    const { proposal, isEnd, dateEnd, result } = proposalData;

    const dateString = getDateString(dateEnd);
    return (
        <ProposalLinkBlock $isEnd={isEnd} {...props}>
            <Content>
                <Label>{proposal}</Label>
                <Info>{isEnd ? result : `Ends in ${dateString}`}</Info>
            </Content>
            {isEnd ? (
                <EndedLabel>
                    <Success />
                    Ended in {dateString}
                </EndedLabel>
            ) : (
                <ArrowRight />
            )}
        </ProposalLinkBlock>
    );
};

export default ProposalLink;
