import { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import styled from 'styled-components';

import useAuthStore from 'store/authStore/useAuthStore';

import { StellarService } from 'services/globalServices';

import { commonMaxWidth, respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import Select from 'basics/inputs/Select';
import ToggleGroup from 'basics/inputs/ToggleGroup';

import AccountInfo from './AccountInfo/AccountInfo';
import Airdrop2List from './Airdrop2List/Airdrop2List';
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

enum UrlParams {
    tab = 'tab',
}
enum Tabs {
    liquidity = 'amm_liquidity',
    balances = 'balances',
    sdex = 'sdex_rewards',
    your = 'liquidity_votes',
    governance = 'governance',
    airdrop2 = 'airdrop2',
    iceLocks = 'ice_locks',
    history = 'payments_history',
}

const OPTIONS = [
    { label: 'Balances', value: Tabs.balances },
    { label: 'My liquidity', value: Tabs.liquidity },
    { label: 'SDEX rewards', value: Tabs.sdex },
    { label: 'My Liquidity Votes', value: Tabs.your },
    { label: 'Governance Votes', value: Tabs.governance },
    { label: 'Airdrop #2', value: Tabs.airdrop2 },
    { label: 'ICE locks', value: Tabs.iceLocks },
    { label: 'Payments history', value: Tabs.history },
];

const Profile = () => {
    const [selectedTab, setSelectedTab] = useState(Tabs.balances);
    const [ammAquaBalance, setAmmAquaBalance] = useState(null);
    const [aquaUsdPrice, setAquaUsdPrice] = useState(null);

    const { account } = useAuthStore();

    const location = useLocation();
    const history = useHistory();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tabParams = params.get(UrlParams.tab);

        if (tabParams) {
            setSelectedTab(tabParams as Tabs);
        } else {
            params.append(UrlParams.tab, Tabs.balances);
            setSelectedTab(Tabs.balances);
            history.replace({ search: params.toString() });
        }
    }, [location]);

    const setTab = (tab: Tabs) => {
        const params = new URLSearchParams(location.search);
        params.set(UrlParams.tab, tab);
        history.push({ search: params.toString() });
    };

    useEffect(() => {
        account.getAmmAquaBalance().then(res => {
            setAmmAquaBalance(res);
        });
    }, []);

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
                    {selectedTab === Tabs.liquidity && <MyLiquidity />}
                    {selectedTab === Tabs.balances && <BalancesBlock />}
                    {selectedTab === Tabs.sdex && <SdexRewards aquaUsdPrice={aquaUsdPrice} />}
                    {selectedTab === Tabs.your && <YourVotes />}
                    {selectedTab === Tabs.governance && <YourGovernanceVotes />}
                    {selectedTab === Tabs.airdrop2 && <Airdrop2List />}
                    {selectedTab === Tabs.iceLocks && <IceLocks ammAquaBalance={ammAquaBalance} />}
                    {selectedTab === Tabs.history && <PaymentsHistory />}
                </Content>
            </ContentWrap>
        </Container>
    );
};

export default Profile;
