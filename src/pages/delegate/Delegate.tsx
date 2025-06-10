import * as React from 'react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

import { getDelegatees } from 'api/delegate';

import { useUpdateIndex } from 'hooks/useUpdateIndex';

import useAuthStore from 'store/authStore/useAuthStore';

import { ModalService } from 'services/globalServices';

import { commonMaxWidth, respondDown, respondUp } from 'web/mixins';
import ChooseLoginMethodModal from 'web/modals/auth/ChooseLoginMethodModal';
import { Breakpoints } from 'web/styles';

import { ToggleGroup } from 'basics/inputs';
import Select from 'basics/inputs/Select';
import { PageLoader } from 'basics/loaders';

import DelegatesList from 'pages/delegate/DelegatesList/DelegatesList';
import MyDelegates from 'pages/delegate/MyDelegates/MyDelegates';
import MyDelegators from 'pages/delegate/MyDelegators/MyDelegators';
import { DELEGATE_ICE } from 'pages/vote/components/MainPage/MainPage';

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

    ${respondDown(Breakpoints.md)`
        font-size: 4rem;
        line-height: 5rem;
    `}
`;

const ToggleGroupStyled = styled(ToggleGroup)`
    width: fit-content;
    margin-bottom: 3.2rem;

    ${respondDown(Breakpoints.md)`
        display: none;
    `}
`;

const SelectStyled = styled(Select)`
    margin-bottom: 3.2rem;

    ${respondUp(Breakpoints.md)`
        display: none;
    `}
`;

enum Tabs {
    whitelist = 'whitelist',
    myDelegations = 'myDelegations',
    myDelegators = 'myDelegators',
}

const DEFAULT_OPTIONS = [
    { value: Tabs.whitelist, label: 'All delegates' },
    { value: Tabs.myDelegations, label: 'My delegates' },
];

const EXTENDED_OPTIONS = [...DEFAULT_OPTIONS, { value: Tabs.myDelegators, label: 'My delegators' }];

const Delegate = () => {
    const [delegatees, setDelegatees] = useState(null);

    const [tab, setTab] = useState<Tabs>(Tabs.whitelist);

    const { isLogged, account } = useAuthStore();

    const updateIndex = useUpdateIndex(10000);

    useEffect(() => {
        getDelegatees().then(setDelegatees);
    }, [updateIndex]);

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
        if (tab !== Tabs.whitelist && !isLogged) {
            setTab(Tabs.whitelist);
        }
    }, [tab, isLogged]);

    return (
        <Main>
            <Wrapper>
                <Title>Delegates</Title>

                <ToggleGroupStyled
                    value={tab}
                    options={
                        isLogged && account.getAssetBalance(DELEGATE_ICE) !== null
                            ? EXTENDED_OPTIONS
                            : DEFAULT_OPTIONS
                    }
                    onChange={handleTabChange}
                />

                <SelectStyled
                    value={tab}
                    options={
                        isLogged && account.getAssetBalance(DELEGATE_ICE) !== null
                            ? EXTENDED_OPTIONS
                            : DEFAULT_OPTIONS
                    }
                    onChange={handleTabChange}
                />

                {!delegatees ? (
                    <PageLoader />
                ) : (
                    <>
                        {tab === Tabs.whitelist && <DelegatesList delegatees={delegatees} />}
                        {tab === Tabs.myDelegations && <MyDelegates delegatees={delegatees} />}
                        {tab === Tabs.myDelegators && <MyDelegators />}
                    </>
                )}
            </Wrapper>
        </Main>
    );
};
export default Delegate;
