import { useRef, useState } from 'react';
import styled from 'styled-components';

import useAuthStore from 'store/authStore/useAuthStore';

import { StellarService, ToastService } from 'services/globalServices';

import Community from 'components/Community';
import Subscribe from 'components/Subscribe';

import { getAccountEligibility } from './api/api';
import Conditions from './components/Conditions/Conditions';
import Eligibility from './components/Eligibility/Eligibility';
import FAQ from './components/FAQ/FAQ';
import MainBlock from './components/MainBlock/MainBlock';
import SnapshotStats from './components/SnapshotStats/SnapshotStats';
import SupportedBy from './components/SupportedBy/SupportedBy';
import { PageContainer } from 'web/pages/commonPageStyles';

const Wrapper = styled.div`
    max-width: 122rem;
    width: 100%;
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
        <PageContainer $withoutPadding>
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

            <Wrapper>
                <Subscribe />
            </Wrapper>
        </PageContainer>
    );
};

export default Airdrop2;
