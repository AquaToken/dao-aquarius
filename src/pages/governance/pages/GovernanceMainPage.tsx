import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import styled from 'styled-components';

import { GovernanceRoutes } from 'constants/routes';

import { useIsOnViewport } from 'hooks/useIsOnViewport';

import useAuthStore from 'store/authStore/useAuthStore';

import { ModalService } from 'services/globalServices';

import { commonMaxWidth, flexAllCenter, respondDown } from 'web/mixins';
import ChooseLoginMethodModal from 'web/modals/auth/ChooseLoginMethodModal';
import { Breakpoints, COLORS } from 'web/styles';

import BackgroundImageLeft from 'assets/background-left.svg';
import BackgroundImageRight from 'assets/background-right.svg';
import ArrowDown from 'assets/icon-arrow-down.svg';

import Select from 'basics/inputs/Select';
import ToggleGroup from 'basics/inputs/ToggleGroup';
import PageLoader from 'basics/loaders/PageLoader';
import Pagination from 'basics/Pagination';

import { getProposalsRequest, PROPOSAL_FILTER } from '../api/api';
import CreateProposal from '../components/GovernanceMainPage/CreateProposal/CreateProposal';
import FAQ from '../components/GovernanceMainPage/FAQ/FAQ';
import ProposalPreview from '../components/GovernanceMainPage/ProposalPreview/ProposalPreview';

export const CREATE_DISCUSSION_COST = 100000;
export const CREATE_PROPOSAL_COST = 900000;
export const APPROVED_PROPOSAL_REWARD = 1500000;

const MainBlock = styled.main`
    flex: 1 0 auto;
`;

const Background = styled.div`
    padding: 10% 4rem;
    ${flexAllCenter};
    flex-direction: column;
    background-color: ${COLORS.darkPurple};
    min-height: 10rem;
    max-height: 40vh;
    overflow: hidden;
    position: relative;
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

const Title = styled.h2`
    font-size: 8rem;
    line-height: 9.4rem;
    font-weight: bold;
    color: ${COLORS.white};
    z-index: 1;
    margin-bottom: 1.6rem;
    text-align: center;

    ${respondDown(Breakpoints.lg)`
      font-size: 7rem;
      line-height: 8rem;
      margin-bottom: 1.2rem;
    `}

    ${respondDown(Breakpoints.md)`
        font-size: 5.5rem;
        line-height: 6rem;
        margin-bottom: 1rem;
    `}
    
    ${respondDown(Breakpoints.sm)`
        font-size: 4rem;
        line-height: 5rem;
        margin-bottom: 0.8rem;
    `}
`;

const Description = styled.div`
    max-width: 79.2rem;
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.white};
    text-align: center;
    opacity: 0.7;
    z-index: 1;
`;

const ProposalsBlockWrapper = styled.div`
    padding: 8.5rem 4rem 0;
    ${commonMaxWidth};
    margin-bottom: 10rem;

    ${respondDown(Breakpoints.md)`
        padding: 5.5rem 1.6rem 0; 
        background: ${COLORS.lightGray};
        margin-bottom: 0;
    `}
`;

const ProposalsBlock = styled.div`
    display: flex;
    justify-content: space-between;
    column-gap: 6rem;

    ${respondDown(Breakpoints.xl)`
        flex-direction: column;
        row-gap: 6rem;
    `}
`;

const ProposalList = styled.div`
    flex: 3;
    display: flex;
    flex-direction: column;
`;

const TitleBlock = styled.div`
    display: flex;
    justify-content: space-between;
    margin-bottom: 4.8rem;
    align-items: center;

    ${respondDown(Breakpoints.lg)`
        flex-direction: column;
    `}
`;

const ProposalsTitle = styled.h3`
    font-size: 4rem;
    line-height: 6.4rem;
    font-weight: bold;
    color: ${COLORS.titleText};

    ${respondDown(Breakpoints.lg)`
         margin-bottom: 5.5rem;
    `}
`;

const ToggleGroupStyled = styled(ToggleGroup)`
    ${respondDown(Breakpoints.md)`
        display: none;
    `}
`;

const SelectStyled = styled(Select)`
    display: none;

    ${respondDown(Breakpoints.md)`
          display: flex;
    `}
`;

const ScrollToSidebarButton = styled.div`
    display: none;
    position: fixed;
    justify-content: space-between;
    align-items: center;
    bottom: 0;
    left: 0;
    width: 100%;
    background: ${COLORS.white};
    box-shadow: 0 -0.5rem 1rem rgba(0, 6, 54, 0.06);
    border-radius: 1rem 1rem 0 0;
    padding: 2.4rem 1.6rem;
    font-size: 1.6rem;
    line-height: 2.4rem;
    font-weight: bold;
    cursor: pointer;

    ${respondDown(Breakpoints.md)`
        display: flex;
    `}
`;

const EmptyList = styled.div`
    flex: 1;
    ${flexAllCenter};
    flex-direction: column;
`;

const EmptyTitle = styled.span`
    font-weight: 700;
    font-size: 2rem;
    line-height: 2.8rem;
    color: ${COLORS.buttonBackground};
    margin-bottom: 0.8rem;
`;

const EmptyDescription = styled.div`
    font-weight: 400;
    font-size: 1.4rem;
    line-height: 2rem;
    color: ${COLORS.grayText};
    text-align: center;
`;

const EmptyLink = styled.span`
    color: ${COLORS.purple};
    text-decoration: underline;
    cursor: pointer;
`;

const List = styled.div`
    position: relative;
`;

const Loader = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background-color: rgba(255, 255, 255, 0.8);
    z-index: 10;
    ${flexAllCenter};
    animation: showLoader 0.1s ease-in-out;

    @keyframes showLoader {
        0% {
            background-color: rgba(255, 255, 255, 0);
        }
        100% {
            background-color: rgba(255, 255, 255, 0.8);
        }
    }
`;

const scrollToRef = ref => {
    ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

enum UrlParams {
    filter = 'filter',
}

const Options = [
    { label: 'All', value: PROPOSAL_FILTER.ALL },
    { label: 'Active', value: PROPOSAL_FILTER.ACTIVE },
    { label: 'Discussion', value: PROPOSAL_FILTER.DISCUSSION },
    { label: 'Finished', value: PROPOSAL_FILTER.CLOSED },
    { label: 'My proposals', value: PROPOSAL_FILTER.MY },
    { label: 'My votes', value: PROPOSAL_FILTER.MY_VOTES },
    { label: 'History', value: PROPOSAL_FILTER.HISTORY },
];

const PAGE_SIZE = 5;

const GovernanceMainPage = (): JSX.Element => {
    const [proposals, setProposals] = useState(null);
    const [filter, setFilter] = useState(null);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(1);

    const { isLogged, account } = useAuthStore();

    const location = useLocation();
    const history = useHistory();

    const onLinkClick = () => {
        if (!isLogged) {
            ModalService.openModal(ChooseLoginMethodModal, {
                redirectURL: GovernanceRoutes.create,
            });
            return;
        }

        history.push(GovernanceRoutes.create);
    };

    const setFilterValue = (value: PROPOSAL_FILTER) => {
        if (value === PROPOSAL_FILTER.MY && !isLogged) {
            ModalService.openModal(ChooseLoginMethodModal, {
                redirectURL: `${GovernanceRoutes.main}?${UrlParams.filter}=${PROPOSAL_FILTER.MY}`,
            });
            return;
        }
        if (value === PROPOSAL_FILTER.MY_VOTES && !isLogged) {
            ModalService.openModal(ChooseLoginMethodModal, {
                redirectURL: `${GovernanceRoutes.main}?${UrlParams.filter}=${PROPOSAL_FILTER.MY_VOTES}`,
            });
            return;
        }
        if (value === PROPOSAL_FILTER.HISTORY && !isLogged) {
            ModalService.openModal(ChooseLoginMethodModal, {
                redirectURL: `${GovernanceRoutes.main}?${UrlParams.filter}=${PROPOSAL_FILTER.HISTORY}`,
            });
            return;
        }
        const params = new URLSearchParams(location.search);
        params.set(UrlParams.filter, value);
        history.push({ pathname: location.pathname, search: params.toString() });
    };

    const filterRef = useRef(null);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (!params.has(UrlParams.filter)) {
            params.append(UrlParams.filter, PROPOSAL_FILTER.ALL);
            history.replace({ search: params.toString() });
            return;
        }

        filterRef.current = params.get(UrlParams.filter);
        setFilter(params.get(UrlParams.filter));
    }, [location, isLogged]);

    useEffect(() => {
        if (isLogged || !filter) {
            return;
        }
        if (
            filter === PROPOSAL_FILTER.MY ||
            filter === PROPOSAL_FILTER.MY_VOTES ||
            filter === PROPOSAL_FILTER.HISTORY
        ) {
            setFilterValue(PROPOSAL_FILTER.ALL);
        }
    }, [isLogged, filter]);

    useEffect(() => {
        if (!filter) {
            return;
        }
        setLoading(true);
        getProposalsRequest({
            filter,
            pubkey: account?.accountId(),
            page,
            pageSize: PAGE_SIZE,
        }).then(result => {
            if (result.filter !== filterRef.current) {
                return;
            }
            setProposals(result.proposals.results);
            setTotal(result.total);
            setLoading(false);
        });
    }, [filter, account, page]);

    const creationRef = useRef(null);
    const hideBottomBlock = useIsOnViewport(creationRef);

    if (!proposals) {
        return <PageLoader />;
    }

    return (
        <>
            <MainBlock>
                <Background>
                    <Title>Aquarius Governance</Title>
                    <Description>
                        Aquarius protocol is governed by DAO voting with AQUA tokens. Vote and
                        participate in discussions to shape the future of Aquarius.
                    </Description>
                    <BackgroundLeft />
                    <BackgroundRight />
                </Background>
                <ProposalsBlockWrapper>
                    <ProposalsBlock>
                        <ProposalList>
                            <TitleBlock>
                                <ProposalsTitle>Proposals</ProposalsTitle>
                                <ToggleGroupStyled
                                    value={filter}
                                    options={Options}
                                    onChange={setFilterValue}
                                />
                                <SelectStyled
                                    value={filter}
                                    options={Options}
                                    onChange={setFilterValue}
                                />
                            </TitleBlock>

                            {!proposals ? (
                                <PageLoader />
                            ) : proposals.length ? (
                                <div>
                                    <List>
                                        {loading && (
                                            <Loader>
                                                <PageLoader />
                                            </Loader>
                                        )}
                                        {proposals.map(proposal => (
                                            <ProposalPreview
                                                key={proposal.id}
                                                proposal={proposal}
                                                withMyVotes={
                                                    filter === PROPOSAL_FILTER.MY_VOTES ||
                                                    filter === PROPOSAL_FILTER.HISTORY
                                                }
                                            />
                                        ))}
                                    </List>
                                    <Pagination
                                        pageSize={PAGE_SIZE}
                                        totalCount={total}
                                        onPageChange={setPage}
                                        currentPage={page}
                                        itemName="proposals"
                                    />
                                </div>
                            ) : (
                                <EmptyList>
                                    <EmptyTitle>There's nothing here.</EmptyTitle>
                                    <EmptyDescription>
                                        It looks like there are no proposals in the selected
                                        category yet.
                                    </EmptyDescription>
                                    <EmptyDescription>
                                        You can wait for new proposals or{' '}
                                        <EmptyLink onClick={() => onLinkClick()}>
                                            create your own.
                                        </EmptyLink>
                                    </EmptyDescription>
                                </EmptyList>
                            )}
                        </ProposalList>
                        <CreateProposal ref={creationRef} />
                    </ProposalsBlock>
                </ProposalsBlockWrapper>
                <FAQ />
            </MainBlock>
            {!hideBottomBlock && (
                <ScrollToSidebarButton onClick={() => scrollToRef(creationRef)}>
                    <span>Create discussion</span>
                    <ArrowDown />
                </ScrollToSidebarButton>
            )}
        </>
    );
};

export default GovernanceMainPage;
