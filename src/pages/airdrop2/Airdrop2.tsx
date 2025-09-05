import { useRef, useState } from 'react';

import useAuthStore from 'store/authStore/useAuthStore';

import { StellarService, ToastService } from 'services/globalServices';

import { PageContainer, SectionWrapper } from 'web/pages/commonPageStyles';

import FAQ from 'basics/FAQ';

import Community from 'components/Community';
import Subscribe from 'components/Subscribe';

import { AirdropQuestions } from 'pages/airdrop2/components/Questions/Questions';

import { getAccountEligibility } from './api/api';
import Conditions from './components/Conditions/Conditions';
import Eligibility from './components/Eligibility/Eligibility';
import MainBlock from './components/MainBlock/MainBlock';
import SnapshotStats from './components/SnapshotStats/SnapshotStats';
import SupportedBy from './components/SupportedBy/SupportedBy';

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
        <PageContainer>
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

            <FAQ questions={AirdropQuestions} />

            <SectionWrapper>
                <Community />

                <Subscribe />
            </SectionWrapper>
        </PageContainer>
    );
};

export default Airdrop2;
