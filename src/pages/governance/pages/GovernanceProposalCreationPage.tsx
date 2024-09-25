import * as React from 'react';
import { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import styled from 'styled-components';

import { CREATE_DISCUSSION_COST } from './GovernanceMainPage';

import { respondDown } from '../../../common/mixins';
import { ModalService, ToastService } from '../../../common/services/globalServices';
import { Breakpoints, COLORS } from '../../../common/styles';
import { GovernanceRoutes } from '../../../routes';
import useAuthStore from '../../../store/authStore/useAuthStore';
import { getProposalRequest } from '../api/api';
import NotEnoughAquaModal from '../components/GovernanceMainPage/NotEnoughAquaModal/NotEnoughAquaModal';
import CreateDiscussionModal from '../components/GovernanceProposalCreationPage/CreateDiscussionModal/CreateDiscussionModal';
import ProposalCreation from '../components/GovernanceProposalCreationPage/ProposalCreation/ProposalCreation';
import ProposalScreen from '../components/GovernanceVoteProposalPage/Proposal/ProposalScreen';

const MainBlock = styled.main`
    flex: 1 0 auto;

    ${respondDown(Breakpoints.md)`
         background: ${COLORS.lightGray};
    `}
`;

export enum statePage {
    creation = 'creation',
    check = 'check',
}

const defaultText =
    '<p><strong>Summary</strong></p><p>Insert your short summary here.</p><p><br></p><p><strong>Motivation</strong></p><p>Insert proposal motivation here.</p><p><br></p><p><strong>Specification</strong></p><p>Insert proposal specification here. Describe the implementation plan.</p>';

const GovernanceProposalCreationPage = ({ isEdit }: { isEdit?: boolean }): JSX.Element => {
    const { id } = useParams<{ id?: string }>();
    const history = useHistory();

    useEffect(() => {
        if (!isEdit) {
            return;
        }
        getProposalRequest(id)
            .then(response => {
                setTitle(response.data.title);
                setText(response.data.text);
                setDiscordChannel(response.data.discord_channel_name ?? '');
                setDiscordChannelOwner(response.data.discord_username ?? '');
                setDiscordChannelUrl(response.data.discord_channel_url ?? '');
            })
            .catch(() => {
                ToastService.showErrorToast('Something went wrong!');
                history.push(`${GovernanceRoutes.proposal}/${id}`);
            });
    }, [isEdit]);

    const [title, setTitle] = useState('');
    const [text, setText] = useState(defaultText);
    const [screenState, setScreenState] = useState(statePage.creation);
    const [discordChannel, setDiscordChannel] = useState('');
    const [discordChannelUrl, setDiscordChannelUrl] = useState('');
    const [discordChannelOwner, setDiscordChannelOwner] = useState('');

    const { account } = useAuthStore();
    const accountId = account?.accountId();

    const hasData = !!(title && text && accountId);
    const onSubmit = () => {
        if (hasData) setScreenState(statePage.check);
    };

    const onEdit = () => {
        const aquaBalance = account.getAquaBalance();
        const hasNecessaryBalance = aquaBalance >= CREATE_DISCUSSION_COST;

        if (!hasNecessaryBalance) {
            ModalService.openModal(NotEnoughAquaModal, { cost: CREATE_DISCUSSION_COST });
            return;
        }

        ModalService.openModal(CreateDiscussionModal, {
            text,
            title,
            isEdit,
            id,
        });
    };

    const dateNow = new Date().toISOString();

    switch (screenState) {
        case statePage.creation: {
            return (
                <MainBlock>
                    <ProposalCreation
                        isEdit={isEdit}
                        title={title}
                        text={text}
                        setTitle={setTitle}
                        setText={setText}
                        hasData={hasData}
                        onSubmit={isEdit ? onEdit : onSubmit}
                        discordChannel={discordChannel}
                        setDiscordChannel={setDiscordChannel}
                        discordChannelOwner={discordChannelOwner}
                        setDiscordChannelOwner={setDiscordChannelOwner}
                        discordChannelUrl={discordChannelUrl}
                        setDiscordChannelUrl={setDiscordChannelUrl}
                    />
                </MainBlock>
            );
        }

        case statePage.check: {
            return (
                <MainBlock>
                    <ProposalScreen
                        proposal={{
                            id: 0,
                            is_simple_proposal: true,
                            title,
                            text,
                            proposed_by: accountId,
                            start_at: dateNow,
                            end_at: null,
                            vote_against_issuer: '',
                            vote_against_result: '0',
                            vote_for_issuer: '',
                            vote_for_result: '0',
                            aqua_circulating_supply: '1',
                            discord_username: discordChannelOwner,
                            discord_channel_name: discordChannel,
                            discord_channel_url: discordChannelUrl,
                            proposal_status: null,
                            payment_status: null,
                            last_updated_at: '',
                            created_at: '',
                            history_proposal: [],
                            version: 1,
                        }}
                        setScreenState={setScreenState}
                    />
                </MainBlock>
            );
        }
    }
};

export default GovernanceProposalCreationPage;
