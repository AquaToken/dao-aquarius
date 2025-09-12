import * as React from 'react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

import { getDelegatees } from 'api/delegate';

import { DelegateRoutes } from 'constants/routes';

import { useUpdateIndex } from 'hooks/useUpdateIndex';

import useAuthStore from 'store/authStore/useAuthStore';

import { ModalService, StellarService } from 'services/globalServices';
import { StellarEvents } from 'services/stellar.service';

import { commonMaxWidth, respondDown, respondUp } from 'web/mixins';
import ChooseLoginMethodModal from 'web/modals/auth/ChooseLoginMethodModal';
import { Breakpoints, COLORS } from 'web/styles';

import BackgroundImageLeft from 'assets/delegate-bg-left.svg';
import BackgroundImageRight from 'assets/delegate-bg-right.svg';

import ExternalLink from 'basics/ExternalLink';
import { ToggleGroup } from 'basics/inputs';
import Select from 'basics/inputs/Select';
import { PageLoader } from 'basics/loaders';

import DelegatesList from 'pages/delegate/components/DelegatesList/DelegatesList';
import MyDelegates from 'pages/delegate/components/MyDelegates/MyDelegates';
import MyDelegators from 'pages/delegate/components/MyDelegators/MyDelegators';

const Main = styled.main`
    flex: 1 0 auto;
    background-color: ${COLORS.lightGray};
`;

const Background = styled.div`
    width: 100%;
    padding: 8.2rem 24%;
    background-color: ${COLORS.darkPurple};
    color: ${COLORS.white};
    position: relative;

    ${respondDown(Breakpoints.md)`
         padding: 5rem 5%;
    `}
`;

const BackgroundLeft = styled(BackgroundImageLeft)`
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;

    ${respondDown(Breakpoints.md)`
        height: unset;
        width: 40%;
        top: 50%;
        transform: translateY(-50%);
    `}
`;

const BackgroundRight = styled(BackgroundImageRight)`
    position: absolute;
    top: 0;
    right: 0;
    height: 100%;

    ${respondDown(Breakpoints.md)`
         height: unset;
         width: 40%;
         top: 50%;
         transform: translateY(-50%);
     `}
`;

const MainTitle = styled.h2`
    font-weight: 700;
    font-size: 8rem;
    line-height: 9.4rem;
    text-align: center;
    white-space: nowrap;
    position: relative;
    z-index: 1;

    ${respondDown(Breakpoints.sm)`
         font-size: 5rem;
         line-height: 5rem;
    `}

    ${respondDown(Breakpoints.xs)`
         font-size: 3rem;
         line-height: 3rem;
    `}
`;

const MainDescription = styled.p`
    font-weight: 400;
    font-size: 1.6rem;
    line-height: 2.8rem;
    text-align: center;
    margin: 1.6rem 0 2.4rem;
    position: relative;
    z-index: 1;
`;

const InviteLink = styled.div`
    display: flex;
    padding: 1.6rem 2.4rem;
    border-radius: 2.4rem;
    background-color: ${COLORS.royalPurple};
    gap: 1.6rem;
    width: fit-content;
    margin: 0 auto;
    position: relative;
    z-index: 1;

    span {
        font-weight: 700;
        font-size: 1.6rem;
        line-height: 2.8rem;
    }

    ${respondDown(Breakpoints.sm)`
         flex-direction: column;
         align-items: center;
    `}
`;

const ExternalLinkStyled = styled(ExternalLink)`
    color: ${COLORS.white};

    svg {
        path {
            fill: ${COLORS.white};
        }
    }
`;

const Wrapper = styled.div`
    ${commonMaxWidth};
    margin: 0 auto 10rem;
    padding: 0 10rem;

    ${respondDown(Breakpoints.md)`
        padding: 0 4rem;
        margin: 0 auto 5rem;
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
    margin-top: 6.8rem;

    ${respondDown(Breakpoints.md)`
        font-size: 4rem;
        line-height: 5rem;
        margin-top: 3.2rem;
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
    { value: Tabs.whitelist, label: 'All Delegates' },
    { value: Tabs.myDelegations, label: 'My Delegates' },
];

const EXTENDED_OPTIONS = [
    ...DEFAULT_OPTIONS,
    { value: Tabs.myDelegators, label: 'ICE Delegated To Me' },
];

const DelegateMain = () => {
    const [delegators, setDelegators] = useState(null);
    const [delegatees, setDelegatees] = useState(null);

    const [tab, setTab] = useState<Tabs>(Tabs.whitelist);

    const { isLogged, account } = useAuthStore();

    const updateIndex = useUpdateIndex(10000);

    useEffect(() => {
        if (!account) {
            return;
        }
        setDelegators(StellarService.getDelegatorLocks(account.accountId()));

        const unsub = StellarService.event.sub(({ type }) => {
            if (type === StellarEvents.claimableUpdate) {
                setDelegators(StellarService.getDelegatorLocks(account.accountId()));
            }
        });

        return () => unsub();
    }, [account]);

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
            <Background>
                <MainTitle>ICE Delegation</MainTitle>
                <MainDescription>
                    Delegate your ICE to trusted community members and let them vote on your behalf.
                    <br />
                    Earn rewards without managing votes yourself or become a delegate and help shape
                    protocol incentives
                </MainDescription>
                <InviteLink>
                    <span>Want to lead and earn incentives?</span>

                    <ExternalLinkStyled to={DelegateRoutes.become}>
                        Become a Delegate
                    </ExternalLinkStyled>
                </InviteLink>
                <BackgroundLeft />
                <BackgroundRight />
            </Background>

            <Wrapper>
                <Title>Delegates</Title>

                <ToggleGroupStyled
                    value={tab}
                    options={isLogged && !!delegators?.length ? EXTENDED_OPTIONS : DEFAULT_OPTIONS}
                    onChange={handleTabChange}
                />

                <SelectStyled
                    value={tab}
                    options={isLogged && !!delegators?.length ? EXTENDED_OPTIONS : DEFAULT_OPTIONS}
                    onChange={handleTabChange}
                />

                {!delegatees ? (
                    <PageLoader />
                ) : (
                    <>
                        {tab === Tabs.whitelist && <DelegatesList delegatees={delegatees} />}
                        {tab === Tabs.myDelegations && (
                            <MyDelegates
                                delegatees={delegatees}
                                goToList={() => setTab(Tabs.whitelist)}
                            />
                        )}
                        {tab === Tabs.myDelegators && <MyDelegators delegators={delegators} />}
                    </>
                )}
            </Wrapper>
        </Main>
    );
};
export default DelegateMain;
