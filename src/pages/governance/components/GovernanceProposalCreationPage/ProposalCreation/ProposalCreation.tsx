import * as React from 'react';
import { useState } from 'react';
import styled from 'styled-components';

import { Breakpoints, COLORS } from '../../../../../common/styles';
import Input from '../../../../../common/basics/Input';
import ReactQuill from 'react-quill';
import Button from '../../../../../common/basics/Button';
import { ReactQuillCSS } from '../../../Governance';
import { formatBalance } from '../../../../../common/helpers/helpers';
import {
    APPROVED_PROPOSAL_REWARD,
    CREATE_DISCUSSION_COST,
    CREATE_PROPOSAL_COST,
} from '../../../pages/GovernanceMainPage';
import { respondDown } from '../../../../../common/mixins';
import { BackButton } from '../../GovernanceVoteProposalPage/Proposal/ProposalScreen';
import ArrowLeft from '../../../../../common/assets/img/icon-arrow-left.svg';
import { useParams } from 'react-router-dom';
import { GovernanceRoutes } from '../../../../../routes';

const Background = styled.div`
    width: 100%;
    background-color: ${COLORS.lightGray};
    padding-top: 7.7rem;
    padding-bottom: 16.4rem;
    margin-bottom: -11.7rem;
`;

const Container = styled.div`
    max-width: 79.2rem;
    height: 100%;
    margin: 0 auto;
`;

const Title = styled.h3`
    font-size: 5.6rem;
    line-height: 6.4rem;
    font-weight: bold;
    color: ${COLORS.titleText};

    ${respondDown(Breakpoints.md)`
        font-size: 4rem;
        line-height: 4.5rem;
        padding: 0 1.6rem;
    `}
`;

const Description = styled.div`
    margin-top: 1.2rem;
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.descriptionText};
    opacity: 0.7;

    ${respondDown(Breakpoints.md)`
        padding: 0 1.6rem;
    `}
`;

const ContainerForm = styled.div`
    padding: 4.8rem;
    background-color: ${COLORS.white};
    box-shadow: 0 2rem 3rem rgba(0, 6, 54, 0.06);
    border-radius: 0.5rem;

    ${respondDown(Breakpoints.md)`
        padding: 3.2rem 1.6rem;
    `}
`;

const SectionForm = styled.div`
    margin-bottom: 4.8rem;
`;

const Label = styled.label`
    display: block;
    margin-bottom: 1.2rem;
    font-size: 1.6rem;
    line-height: 1.8rem;
    color: ${COLORS.paragraphText};
`;

const InfoRow = styled.div`
    display: flex;
    align-items: center;
    font-weight: 400;
    font-size: 1.4rem;
    line-height: 2rem;
    color: ${COLORS.grayText};

    &:first-child {
        margin-top: 4rem;
    }

    &:not(:last-child) {
        margin-bottom: 1.6rem;
    }
`;

const InfoIcon = styled.span`
    width: 1.8rem;
    margin-right: 1.6rem;
`;

const BackTo = styled.div`
    display: flex;
    column-gap: 1.6rem;
    align-items: center;
    margin-bottom: 3.2rem;
`;

const StyledReactQuill = styled(ReactQuill)<{ focused: boolean }>`
    ${ReactQuillCSS};

    .ql-toolbar {
        box-sizing: border-box;
        border-radius: 0.5rem 0.5rem 0 0;
        border-color: ${COLORS.gray};
        border-bottom-color: ${({ focused }) => (focused ? COLORS.purple : COLORS.gray)};
        border-bottom-width: ${({ focused }) => (focused ? '0.2rem' : '0.1rem')};
    }

    .ql-container {
        box-sizing: border-box;
        border-radius: 0 0 0.5rem 0.5rem;
        border-color: ${({ focused }) => (focused ? COLORS.purple : COLORS.gray)};
        border-width: ${({ focused }) => (focused ? '0.2rem' : '0.1rem')};
        padding: 1.2rem 1.5rem;
    }

    .ql-editor {
        width: 100%;
        min-height: 30rem;
        box-sizing: content-box;
        border: ${({ focused }) => (focused ? 'none' : '0.1rem solid transparent')};
        font-size: 1.6rem;
        line-height: 2.8rem;
        padding: 0;
    }
`;

export const DAY = 24 * 60 * 60 * 1000;

interface proposalCreationProps {
    title: string;
    text: string;
    setTitle: (value: string) => void;
    setText: (value: string) => void;
    hasData: boolean;
    onSubmit: () => void;
    discordChannel: string;
    setDiscordChannel: (value: string) => void;
    discordChannelOwner: string;
    setDiscordChannelOwner: (value: string) => void;
    discordChannelUrl: string;
    setDiscordChannelUrl: (value: string) => void;
    isEdit?: boolean;
}

const ProposalCreation = ({
    title,
    text,
    setTitle,
    setText,
    hasData,
    onSubmit,
    discordChannelOwner,
    setDiscordChannelOwner,
    isEdit,
}: proposalCreationProps): JSX.Element => {
    const [textFocused, setTextFocused] = useState(false);
    const { id } = useParams<{ id?: string }>();

    return (
        <>
            <Background>
                <Container>
                    <BackTo>
                        <BackButton
                            to={
                                isEdit
                                    ? `${GovernanceRoutes.proposal}/${id}`
                                    : GovernanceRoutes.main
                            }
                        >
                            <ArrowLeft />
                        </BackButton>
                        {isEdit ? 'Back to discussion' : 'Back to proposals'}
                    </BackTo>

                    <Title>{isEdit ? 'Edit proposal' : 'New proposal'}</Title>

                    <Description>
                        There is a <b>{formatBalance(CREATE_DISCUSSION_COST)} AQUA</b> fee to create
                        a <b>7 day proposal discussion.</b> To move a proposal{' '}
                        <b>from discussion to active</b> status, a further{' '}
                        {formatBalance(CREATE_PROPOSAL_COST)} AQUA is needed.{' '}
                        <b>
                            Any proposal edits are treated as a new proposal and incur a{' '}
                            {formatBalance(CREATE_DISCUSSION_COST)} AQUA fee.
                        </b>{' '}
                        All fees are sent to the AQUA issuer wallet, burning them from the supply.
                        <br />
                        <br />
                        If your proposal is accepted, you will get a reward of{' '}
                        {formatBalance(APPROVED_PROPOSAL_REWARD)} AQUA.
                    </Description>
                </Container>
            </Background>
            <Container>
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        onSubmit();
                    }}
                >
                    <ContainerForm>
                        <SectionForm>
                            <Label htmlFor="name">Title</Label>
                            <Input
                                autoComplete="off"
                                id="name"
                                name="name"
                                placeholder="Less than 140 characters"
                                maxLength={140}
                                value={title}
                                onChange={(event) => {
                                    setTitle(event.target.value);
                                }}
                            />
                        </SectionForm>
                        {!isEdit && (
                            <SectionForm>
                                <Label>Discord discussion owner nickname (optional)</Label>
                                <Input
                                    placeholder="Nickname#0000"
                                    value={discordChannelOwner}
                                    maxLength={64}
                                    onChange={(event) => {
                                        setDiscordChannelOwner(event.target.value);
                                    }}
                                    pattern="^.{3,32}#[0-9]{4}$"
                                    onInvalid={(e) =>
                                        (e.target as HTMLInputElement).setCustomValidity(
                                            'Format Nickname#0000',
                                        )
                                    }
                                    onInput={(e) =>
                                        (e.target as HTMLInputElement).setCustomValidity('')
                                    }
                                />
                            </SectionForm>
                        )}

                        <SectionForm>
                            <Label htmlFor="body">Content</Label>
                            <StyledReactQuill
                                focused={textFocused}
                                id="body"
                                value={text}
                                onChange={setText}
                                onFocus={() => setTextFocused(true)}
                                onBlur={() => setTextFocused(false)}
                            />
                        </SectionForm>

                        <Button fullWidth isBig disabled={!hasData}>
                            {isEdit ? 'SUBMIT CHANGES' : 'NEXT'}
                        </Button>

                        <div>
                            <InfoRow>
                                <InfoIcon>☝️</InfoIcon>
                                Please make sure your proposal is clear, well written and follows
                                the suggested format.
                            </InfoRow>

                            <InfoRow>
                                <InfoIcon>☝️</InfoIcon>
                                Proposals must have clearly defined action points, be relevant to
                                Aquarius and have a feasible technical plan for implementation.
                            </InfoRow>

                            <InfoRow>
                                <InfoIcon />
                                <i>Otherwise, they might be taken down.</i>
                            </InfoRow>
                        </div>
                    </ContainerForm>
                </form>
            </Container>
        </>
    );
};

export default ProposalCreation;
