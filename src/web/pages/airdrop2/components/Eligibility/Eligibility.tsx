import * as React from 'react';
import { forwardRef, useEffect, useState } from 'react';

import { getIsTestnetEnv } from 'helpers/env';

import { StellarService } from 'services/globalServices';
import { getFederation } from 'services/stellar/utils/resolvers';

import { AccountEligibility } from 'types/airdrop2';

import { ExternalLink } from 'basics/links';
import PageLoader from 'basics/loaders/PageLoader';

import AccountBlock from 'components/AccountBlock';

import { Container, Wrapper, Title, Status, AccountInfo } from './Eligibility.styled';
import EligibilityStatus from './EligibilityStatus/EligibilityStatus';
import ExpectedReward from './ExpectedReward/ExpectedReward';
import SnapshotHoldings from './SnapshotHoldings/SnapshotHoldings';

interface EligibilityProps {
    loading: boolean;
    accountEligibility: Partial<AccountEligibility>;
}

const Eligibility = forwardRef<HTMLDivElement, EligibilityProps>(
    ({ loading, accountEligibility }, ref) => {
        const [federation, setFederation] = useState<string | null>(null);

        useEffect(() => {
            setFederation(null);

            if (!accountEligibility?.account_id) return;

            StellarService.account
                .loadAccount(accountEligibility.account_id)
                .then(account => getFederation(account.home_domain, account.account_id))
                .then(setFederation)
                .catch(() => {
                    // federation may be missing — ignore errors
                });
        }, [accountEligibility]);

        const isEligible = Boolean(Number(accountEligibility?.airdrop_reward));

        return (
            <Container ref={ref}>
                <Wrapper>
                    <Title>Account eligibility</Title>

                    <Status>
                        {loading && <PageLoader />}

                        {accountEligibility && (
                            <>
                                <AccountInfo>
                                    <AccountBlock
                                        accountId={accountEligibility.account_id}
                                        federation={federation}
                                    />
                                    {isEligible ? (
                                        <EligibilityStatus type="eligible" />
                                    ) : (
                                        <EligibilityStatus type="not-eligible" />
                                    )}
                                </AccountInfo>

                                <ExternalLink
                                    href={`https://stellar.expert/explorer/${
                                        getIsTestnetEnv() ? 'testnet' : 'public'
                                    }/account/${accountEligibility.account_id}`}
                                >
                                    View my account details
                                </ExternalLink>
                            </>
                        )}
                    </Status>

                    {isEligible && (
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
