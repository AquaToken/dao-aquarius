import * as React from 'react';
import { forwardRef, RefObject, useEffect, useState } from 'react';
import styled from 'styled-components';
import { Breakpoints, COLORS } from '../../../../common/styles';
import PageLoader from '../../../../common/basics/PageLoader';
import AccountBlock from '../../../../common/basics/AccountBlock';
import { StellarService } from '../../../../common/services/globalServices';
import { AccountEligibility } from '../../api/types';
import Eligible from './Statuses/Eligible';
import NotEligible from './Statuses/NotEligible';
import { flexRowSpaceBetween, respondDown } from '../../../../common/mixins';
import ExternalLink from '../../../../common/basics/ExternalLink';
import SnapshotHoldings from './SnapshotHoldings/SnapshotHoldings';
import ExpectedReward from './ExpectedReward/ExpectedReward';

const Container = styled.section`
    padding: 0 1.6rem;
`;

const Wrapper = styled.div`
    padding: 5rem 4rem 3.5rem;
    background: ${COLORS.white};
    box-shadow: 0 2rem 3rem rgba(0, 6, 54, 0.06);
    border-radius: 0.5rem;
    max-width: 78rem;
    margin: 3rem auto;
`;

const Title = styled.h4`
    font-size: 3.5rem;
    line-height: 4.1rem;
    color: ${COLORS.titleText};
    margin-bottom: 2.4rem;
    font-weight: 400;
`;

const Status = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 3rem 3rem 2rem;
    background: ${COLORS.lightGray};
    border-radius: 0.5rem;
`;

const AccountInfo = styled.div`
    width: 100%;
    ${flexRowSpaceBetween};
    border-bottom: 0.1rem dashed ${COLORS.gray};
    padding-bottom: 2rem;
    margin-bottom: 1.7rem;

    ${respondDown(Breakpoints.sm)`
        flex-direction: column;
        gap: 2rem;
    `}
`;

const Eligibility = forwardRef(
    (
        {
            loading,
            accountEligibility,
        }: { loading: boolean; accountEligibility: Partial<AccountEligibility> },
        ref: RefObject<HTMLDivElement>,
    ) => {
        const [federation, setFederation] = useState(null);

        useEffect(() => {
            setFederation(null);
            if (accountEligibility) {
                StellarService.loadAccount(accountEligibility.account_id)
                    .then((account) =>
                        StellarService.resolveFederation(account.home_domain, account.account_id),
                    )
                    .then((res) => {
                        setFederation(res);
                    });
            }
        }, [accountEligibility]);

        return (
            <Container ref={ref}>
                <Wrapper>
                    <Title>Account eligibility</Title>
                    <Status>
                        {loading && <PageLoader />}
                        {accountEligibility && (
                            <AccountInfo>
                                <AccountBlock
                                    accountId={accountEligibility.account_id}
                                    federation={federation}
                                />

                                {Number(accountEligibility.airdrop_reward) ? (
                                    <Eligible />
                                ) : (
                                    <NotEligible />
                                )}
                            </AccountInfo>
                        )}
                        {accountEligibility && (
                            <ExternalLink
                                href={`https://stellar.expert/explorer/public/account/${accountEligibility.account_id}`}
                            >
                                View my account details
                            </ExternalLink>
                        )}
                    </Status>

                    {Boolean(Number(accountEligibility.airdrop_reward)) && (
                        <>
                            <SnapshotHoldings
                                accountEligibility={accountEligibility as AccountEligibility}
                            />
                            <ExpectedReward
                                accountEligibility={accountEligibility as AccountEligibility}
                            />
                        </>
                    )}
                </Wrapper>
            </Container>
        );
    },
);

export default Eligibility;
