import { lazy } from 'react';
import { Navigate, useRoutes } from 'react-router-dom';

import { AppRoutes } from 'constants/routes';

import { useScrollOnNavigate } from 'hooks/useScrollOnNavigate';

import useAuthStore from 'store/authStore/useAuthStore';

import NotFoundPage from 'components/NotFoundPage';
import PageTitle from 'components/PageTitle';

const GovernancePage = lazy(() => import('pages/governance/Governance'));
const MainPage = lazy(() => import('web/pages/main/MainPage'));
const LockerPage = lazy(() => import('./web/pages/locker/Locker'));
const VotePage = lazy(() => import('pages/vote/Vote'));
const BribesPage = lazy(() => import('./web/pages/bribes/Bribes'));
const MarketPage = lazy(() => import('pages/market/Market'));
const RewardsPage = lazy(() => import('pages/rewards/Rewards'));
const AirdropPage = lazy(() => import('web/pages/airdrop/Airdrop'));
const Airdrop2Page = lazy(() => import('web/pages/airdrop2/Airdrop2'));
const ProfilePage = lazy(() => import('pages/profile/Profile'));
const WalletConnectPage = lazy(() => import('./web/pages/wallet-connect/WalletConnect'));
const AmmPage = lazy(() => import('pages/amm/Amm'));
const SwapPage = lazy(() => import('pages/swap/Swap'));
const BuyAquaPage = lazy(() => import('web/pages/buy-aqua/BuyAqua'));
const TestnetSwitcherPage = lazy(() => import('web/pages/testnet-switcher/TestnetSwitcher'));
const TermsPage = lazy(() => import('web/pages/terms/Terms'));
const PrivacyPage = lazy(() => import('web/pages/privacy/Privacy'));
const TokenPage = lazy(() => import('pages/token/TokenPage'));
const QuestPage = lazy(() => import('pages/quest/Quest'));
const DelegatePage = lazy(() => import('pages/delegate/Delegate'));
const IncentivesPage = lazy(() => import('pages/incentives/Incentives'));

const AppRouter = () => {
    useScrollOnNavigate();

    const { isLogged } = useAuthStore();

    return useRoutes([
        {
            path: AppRoutes.page.main,
            element: (
                <PageTitle title="Aquarius">
                    <MainPage />
                </PageTitle>
            ),
        },
        {
            path: AppRoutes.section.locker.parentRoute,
            element: (
                <PageTitle title="Locker - Aquarius">
                    <LockerPage />
                </PageTitle>
            ),
        },
        {
            path: AppRoutes.section.governance.parentRoute,
            element: (
                <PageTitle title="Governance - Aquarius">
                    <GovernancePage />
                </PageTitle>
            ),
        },
        {
            path: AppRoutes.page.vote,
            element: (
                <PageTitle title="Voting - Aquarius">
                    <VotePage />
                </PageTitle>
            ),
        },
        {
            path: AppRoutes.section.bribes.parentRoute,
            element: (
                <PageTitle title="Bribes - Aquarius">
                    <BribesPage />
                </PageTitle>
            ),
        },
        {
            path: AppRoutes.section.market.parentRoute,
            element: <MarketPage />,
        },
        {
            path: AppRoutes.page.rewards,
            element: (
                <PageTitle title="Rewards - Aquarius">
                    <RewardsPage />
                </PageTitle>
            ),
        },
        {
            path: AppRoutes.page.airdrop,
            element: (
                <PageTitle title="Airdrop - Aquarius">
                    <AirdropPage />
                </PageTitle>
            ),
        },
        {
            path: AppRoutes.page.airdrop2,
            element: (
                <PageTitle title="Airdrop #2 - Aquarius">
                    <Airdrop2Page />
                </PageTitle>
            ),
        },
        {
            path: AppRoutes.page.account,
            element: (
                <PageTitle title="Dashboard - Aquarius">
                    {isLogged ? <ProfilePage /> : <Navigate to={AppRoutes.page.main} replace />}
                </PageTitle>
            ),
        },
        {
            path: AppRoutes.page.oldAccount,
            element: <Navigate to={AppRoutes.page.account} replace />,
        },
        {
            path: AppRoutes.page.walletConnect,
            element: (
                <PageTitle title="WalletConnect - Aquarius">
                    <WalletConnectPage />
                </PageTitle>
            ),
        },
        {
            path: AppRoutes.section.amm.parentRoute,
            element: (
                <PageTitle title="Pools - Aquarius">
                    <AmmPage />
                </PageTitle>
            ),
        },
        {
            path: AppRoutes.section.swap.parentRoute,
            element: (
                <PageTitle title="Swap - Aquarius">
                    <SwapPage />
                </PageTitle>
            ),
        },
        {
            path: AppRoutes.page.buyAqua,
            element: (
                <PageTitle title="Buy Aqua - Aquarius">
                    <BuyAquaPage />
                </PageTitle>
            ),
        },
        {
            path: AppRoutes.page.testnet,
            element: (
                <PageTitle title="Testnet - Aquarius">
                    <TestnetSwitcherPage />
                </PageTitle>
            ),
        },
        {
            path: AppRoutes.page.terms,
            element: (
                <PageTitle title="Terms Of Use - Aquarius">
                    <TermsPage />
                </PageTitle>
            ),
        },
        {
            path: AppRoutes.page.privacy,
            element: (
                <PageTitle title="Privacy Policy - Aquarius">
                    <PrivacyPage />
                </PageTitle>
            ),
        },
        {
            path: AppRoutes.page.token,
            element: (
                <PageTitle title="AQUA Token - Aquarius">
                    <TokenPage />
                </PageTitle>
            ),
        },
        {
            path: AppRoutes.page.quest,
            element: (
                <PageTitle title="Onboard To Aquarius">
                    <QuestPage />
                </PageTitle>
            ),
        },
        {
            path: AppRoutes.section.delegate.parentRoute,
            element: (
                <PageTitle title="Delegates - Aquarius">
                    <DelegatePage />
                </PageTitle>
            ),
        },
        {
            path: AppRoutes.section.incentive.parentRoute,
            element: (
                <PageTitle title="Incentives - Aquarius">
                    <IncentivesPage />
                </PageTitle>
            ),
        },
        {
            path: '*',
            element: <NotFoundPage />,
        },
    ]);
};

export default AppRouter;
