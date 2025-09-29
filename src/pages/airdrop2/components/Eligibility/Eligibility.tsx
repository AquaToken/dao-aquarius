import * as React from 'react';
import { forwardRef, RefObject, useEffect, useState } from 'react';
import styled from 'styled-components';

import { getIsTestnetEnv } from 'helpers/env';

import { StellarService } from 'services/globalServices';
import { getFederation } from 'services/stellar/utils/resolvers';

import { cardBoxShadow, flexRowSpaceBetween, respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import { ExternalLink } from 'basics/links';
import PageLoader from 'basics/loaders/PageLoader';

import AccountBlock from 'components/AccountBlock';

import ExpectedReward from './ExpectedReward/ExpectedReward';
import SnapshotHoldings from './SnapshotHoldings/SnapshotHoldings';
import Eligible from './Statuses/Eligible';
import NotEligible from './Statuses/NotEligible';

import { AccountEligibility } from '../../api/types';

const Container = styled.section`
    padding: 0 1.6rem;
`;

const Wrapper = styled.div`
    padding: 5rem 4rem 3.5rem;
    background: ${COLORS.white};
    border-radius: 0.5rem;
    max-width: 78rem;
    margin: 3rem auto;
    ${cardBoxShadow};
`;

const Title = styled.h4`
    font-size: 3.5rem;
    line-height: 4.1rem;
    color: ${COLORS.textPrimary};
    margin-bottom: 2.4rem;
    font-weight: 400;
`;

const Status = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 3rem 3rem 2rem;
    background: ${COLORS.gray50};
    border-radius: 0.5rem;
`;

const AccountInfo = styled.div`
    width: 100%;
    ${flexRowSpaceBetween};
    border-bottom: 0.1rem dashed ${COLORS.gray100};
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
                StellarService.account
                    .loadAccount(accountEligibility.account_id)
                    .then(account => getFederation(account.home_domain, account.account_id))
                    .then(res => {
                        setFederation(res);
                    })
                    .catch(() => {
                        // federation may be missing for the user — that's fine
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
                                href={`https://stellar.expert/explorer/${
                                    getIsTestnetEnv() ? 'testnet' : 'public'
                                }/account/${accountEligibility.account_id}`}
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

Eligibility.displayName = 'Eligibility';

export default Eligibility;
