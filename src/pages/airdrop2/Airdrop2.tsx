import * as React from 'react';
import { useRef, useState } from 'react';
import styled from 'styled-components';

import useAuthStore from 'store/authStore/useAuthStore';

import { StellarService, ToastService } from 'services/globalServices';
import { respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import Community from 'components/Community';
import Subscribe from 'components/Subscribe';

import { getAccountEligibility } from './api/api';
import Conditions from './components/Conditions/Conditions';
import Eligibility from './components/Eligibility/Eligibility';
import FAQ from './components/FAQ/FAQ';
import MainBlock from './components/MainBlock/MainBlock';
import SnapshotStats from './components/SnapshotStats/SnapshotStats';
import SupportedBy from './components/SupportedBy/SupportedBy';

const Container = styled.div`
    ${respondDown(Breakpoints.md)`
         background-color: ${COLORS.white};
    `}
`;

const Airdrop2 = () => {
    const { isLogged, account } = useAuthStore();

    const [accountId, setAccountId] = useState(isLogged ? account.accountId() : '');
    const [loading, setLoading] = useState(false);
    const [accountEligibility, setAccountEligibility] = useState(null);

    const eligibilityRef = useRef(null);

    const checkAccount = () => {
        if (!accountId || !StellarService.isValidPublicKey(accountId)) {
            ToastService.showErrorToast('Please enter a valid Stellar account address');
            return;
        }

        if (accountId === accountEligibility?.account_id) {
            return;
        }
        setLoading(true);
        getAccountEligibility(accountId)
            .then(res => {
                setAccountEligibility(res);
            })
            .catch(() => {
                setAccountEligibility({ account_id: accountId });
            })
            .finally(() => {
                setLoading(false);
                eligibilityRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
    };

    return (
        <Container>
            <MainBlock />

            <Conditions
                accountId={accountId}
                setAccountId={setAccountId}
                checkAccount={checkAccount}
            />

            {accountEligibility && (
                <Eligibility
                    loading={loading}
                    accountEligibility={accountEligibility}
                    ref={eligibilityRef}
                />
            )}

            <SnapshotStats />

            <SupportedBy />

            <FAQ />

            <Community />

            <Subscribe />
        </Container>
    );
};

export default Airdrop2;
