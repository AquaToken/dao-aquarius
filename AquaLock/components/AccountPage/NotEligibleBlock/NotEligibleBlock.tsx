import * as React from 'react';
import styled from 'styled-components';
import { COLORS } from '../../../../common/styles';
import { flexAllCenter } from '../../../../common/mixins';
import Fail from '../../../../common/assets/img/icon-fail-white.svg';
import ExternalLink from '../../../../common/basics/ExternalLink';

const Container = styled.div`
    margin-top: 4rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: ${COLORS.white};
    border-radius: 0.5rem;
    padding: 3.2rem 3.2rem 4.2rem;
`;

const NotEligible = styled.div`
    ${flexAllCenter};
    width: min-content;
    white-space: nowrap;
    padding: 0 1.5rem;
    height: 3rem;
    border-radius: 1.5rem;
    background-color: ${COLORS.pinkRed};
    color: ${COLORS.white};
    font-size: 1.4rem;
    line-height: 180%;

    svg {
        margin-right: 0.8rem;
    }
`;

const Description = styled.span`
    font-size: 1.4rem;
    line-height: 2rem;
    color: ${COLORS.descriptionText};
    opacity: 0.7;
    margin-top: 2.4rem;
    margin-bottom: 1.6rem;
`;

const NotEligibleBlock = ({ accountId }: { accountId: string }) => {
    return (
        <Container>
            <NotEligible>
                <Fail />
                <span>Not eligible for Airdrop #2</span>
            </NotEligible>
            <Description>
                Hold a balance of at least 500 XLM (or yXLM) AND at least 1 AQUA on January 15,
                2022.
            </Description>
            <ExternalLink href={`https://stellar.expert/explorer/public/account/${accountId}`}>
                View my account details
            </ExternalLink>
        </Container>
    );
};

export default NotEligibleBlock;
