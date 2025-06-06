import * as React from 'react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

import { getDelegatees } from 'api/delegate';

import useAuthStore from 'store/authStore/useAuthStore';

import { ModalService } from 'services/globalServices';

import { commonMaxWidth, respondDown } from 'web/mixins';
import { Breakpoints } from 'web/styles';

import { ToggleGroup } from 'basics/inputs';
import { PageLoader } from 'basics/loaders';

import DelegatesList from 'pages/delegate/DelegatesList/DelegatesList';
import MyDelegates from 'pages/delegate/MyDelegates/MyDelegates';

import ChooseLoginMethodModal from '../../web/modals/auth/ChooseLoginMethodModal';

const Main = styled.main`
    flex: 1 0 auto;
`;

const Wrapper = styled.div`
    ${commonMaxWidth};
    margin: 0 auto;
    padding: 0 10rem;

    ${respondDown(Breakpoints.md)`
        padding: 0 4rem;
    `}

    ${respondDown(Breakpoints.xs)`
        padding: 0 1.6rem;
    `}
`;

const Title = styled.h2`
    font-weight: 700;
    font-size: 5.6rem;
    line-height: 6.4rem;
    margin-bottom: 3.4rem;
`;

const ToggleGroupStyled = styled(ToggleGroup)`
    width: fit-content;
    margin-bottom: 3.2rem;
`;

enum Tabs {
    whitelist = 'whitelist',
    myDelegations = 'myDelegations',
}

const OPTIONS = [
    { value: Tabs.whitelist, label: 'Whitelist' },
    { value: Tabs.myDelegations, label: 'My delegation' },
];

const Delegate = () => {
    const [delegatees, setDelegatees] = useState(null);

    const [tab, setTab] = useState<Tabs>(Tabs.whitelist);

    const { isLogged } = useAuthStore();

    useEffect(() => {
        getDelegatees().then(setDelegatees);
    }, []);

    const handleTabChange = (newTab: Tabs) => {
        if (newTab === Tabs.myDelegations && !isLogged) {
            ModalService.openModal(ChooseLoginMethodModal, {
                callback: () => setTab(Tabs.myDelegations),
            });
            return;
        }
        setTab(newTab);
    };

    useEffect(() => {
        if (tab === Tabs.myDelegations && !isLogged) {
            setTab(Tabs.whitelist);
        }
    }, [tab, isLogged]);

    return (
        <Main>
            <Wrapper>
                <Title>Delegates</Title>

                <ToggleGroupStyled value={tab} options={OPTIONS} onChange={handleTabChange} />

                {!delegatees ? (
                    <PageLoader />
                ) : (
                    <>
                        {tab === Tabs.whitelist && <DelegatesList delegatees={delegatees} />}
                        {tab === Tabs.myDelegations && <MyDelegates delegatees={delegatees} />}
                    </>
                )}
            </Wrapper>
        </Main>
    );
};
export default Delegate;
