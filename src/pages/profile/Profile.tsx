import { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import styled from 'styled-components';

import { getAmmAquaBalance } from 'api/amm';

import { useUpdateIndex } from 'hooks/useUpdateIndex';

import useAuthStore from 'store/authStore/useAuthStore';

import { StellarService } from 'services/globalServices';

import { commonMaxWidth, respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import Select from 'basics/inputs/Select';
import ToggleGroup from 'basics/inputs/ToggleGroup';

import AccountInfo from './AccountInfo/AccountInfo';
import Balances from './Balances/Balances';
import IceLocks from './IceLocks/IceLocks';
import PaymentsHistory from './PaymentsHistory/PaymentsHistory';
import SdexRewards from './SdexRewards/SdexRewards';
import YourGovernanceVotes from './YourGovernanceVotes/YourGovernanceVotes';
import YourVotes from './YourVotes/YourVotes';

import BalancesBlock from '../amm/components/BalancesBlock/BalancesBlock';
import MyLiquidity from '../amm/components/MyLiquidity/MyLiquidity';

const Container = styled.div`
    height: 100%;
    position: relative;
    display: flex;
    flex: 1 0 auto;
    flex-direction: column;
    scroll-behavior: smooth;
    overflow: auto;
`;

const ControlsWrapper = styled.div`
    ${commonMaxWidth};
    width: 100%;
    padding: 0 4rem;
    margin-bottom: 5rem;

    ${respondDown(Breakpoints.md)`
        padding: 3.2rem 1.6rem 2rem;
        background: ${COLORS.white};
    `}
`;

const ToggleGroupStyled = styled(ToggleGroup)`
    width: min-content;

    ${respondDown(Breakpoints.xl)`
        display: none;
    `}
`;

const SelectStyled = styled(Select)`
    display: none;

    ${respondDown(Breakpoints.xl)`
        display: flex;
    `}
`;

const ContentWrap = styled.div`
    width: 100%;
    background: ${COLORS.lightGray};
`;

const Content = styled.div`
    ${commonMaxWidth};
    width: 100%;
    padding: 5.6rem 4rem 4rem;
    background: ${COLORS.lightGray};

    ${respondDown(Breakpoints.md)`
        padding: 3.2rem 1.6rem 2rem;
    `}
`;

export enum ProfileUrlParams {
    tab = 'tab',
}
export enum ProfileTabs {
    liquidity = 'amm_liquidity',
    balances = 'balances',
    sdex = 'sdex_rewards',
    your = 'liquidity_votes',
    governance = 'governance',
    iceLocks = 'ice_locks',
    history = 'payments_history',
}

const OPTIONS = [
    { label: 'Balances', value: ProfileTabs.balances },
    { label: 'My liquidity', value: ProfileTabs.liquidity },
    { label: 'SDEX rewards', value: ProfileTabs.sdex },
    { label: 'My Liquidity Votes', value: ProfileTabs.your },
    { label: 'Governance Votes', value: ProfileTabs.governance },
    { label: 'ICE locks', value: ProfileTabs.iceLocks },
    { label: 'Payments history', value: ProfileTabs.history },
];

const Profile = () => {
    const [selectedTab, setSelectedTab] = useState(ProfileTabs.balances);
    const [ammAquaBalance, setAmmAquaBalance] = useState(null);
    const [aquaUsdPrice, setAquaUsdPrice] = useState(null);

    const { account } = useAuthStore();

    const location = useLocation();
    const history = useHistory();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tabParams = params.get(ProfileUrlParams.tab);

        if (tabParams) {
            setSelectedTab(tabParams as ProfileTabs);
        } else {
            params.append(ProfileUrlParams.tab, ProfileTabs.balances);
            setSelectedTab(ProfileTabs.balances);
            history.replace({ search: params.toString() });
        }
    }, [location]);

    const setTab = (tab: ProfileTabs) => {
        const params = new URLSearchParams('');
        params.set(ProfileUrlParams.tab, tab);
        history.push({ search: params.toString() });
    };

    const updateIndex = useUpdateIndex(10000);

    useEffect(() => {
        getAmmAquaBalance(account.accountId()).then(res => {
            setAmmAquaBalance(res);
        });
    }, [updateIndex]);

    useEffect(() => {
        StellarService.getAquaUsdPrice().then(setAquaUsdPrice);
    }, []);

    return (
        <Container>
            <AccountInfo />
            <Balances ammAquaBalance={ammAquaBalance} />
            <ControlsWrapper>
                <ToggleGroupStyled value={selectedTab} options={OPTIONS} onChange={setTab} />
                <SelectStyled value={selectedTab} options={OPTIONS} onChange={setTab} />
            </ControlsWrapper>

            <ContentWrap>
                <Content>
                    {selectedTab === ProfileTabs.liquidity && <MyLiquidity />}
                    {selectedTab === ProfileTabs.balances && <BalancesBlock />}
                    {selectedTab === ProfileTabs.sdex && (
                        <SdexRewards aquaUsdPrice={aquaUsdPrice} />
                    )}
                    {selectedTab === ProfileTabs.your && <YourVotes />}
                    {selectedTab === ProfileTabs.governance && <YourGovernanceVotes />}
                    {selectedTab === ProfileTabs.iceLocks && (
                        <IceLocks ammAquaBalance={ammAquaBalance} />
                    )}
                    {selectedTab === ProfileTabs.history && <PaymentsHistory />}
                </Content>
            </ContentWrap>
        </Container>
    );
};

export default Profile;
