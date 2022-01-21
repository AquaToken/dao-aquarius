import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

import { Breakpoints, COLORS } from '../../../../common/styles';
import Input from '../../../../common/basics/Input';
import ReactQuill from 'react-quill';
import Button from '../../../../common/basics/Button';
import { ReactQuillCSS } from '../../App';
import { formatBalance, getDateString } from '../../../../common/helpers/helpers';
import { CREATE_PROPOSAL_COST } from '../../MainPage/MainPage';
import Select, { Option } from '../../../../common/basics/Select';
import { respondDown } from '../../../../common/mixins';

const Background = styled.div`
    position: absolute;
    z-index: -1;
    top: 11.2rem;
    left: 0;
    width: 100%;
    background-color: ${COLORS.lightGray};
    height: 42rem;
`;

const Container = styled.div`
    padding: 5rem 0;
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
    margin-top: 10rem;
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

const SectionDate = styled(SectionForm)`
    display: flex;
    column-gap: 4.8rem;

    ${respondDown(Breakpoints.md)`
         flex-direction: column;
    `}
`;
const DateBlock = styled.div`
    flex: 1 0 0;

    ${respondDown(Breakpoints.md)`
        margin-bottom: 3.2rem;
    `}
`;
const Time = styled.div`
    flex: 1 0 0;
`;

const Label = styled.label`
    display: block;
    margin-bottom: 1.2rem;
    font-size: 1.6rem;
    line-height: 1.8rem;
    color: ${COLORS.paragraphText};
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

const Options: Option<number>[] = [
    { label: '3 days', value: DAY * 3 },
    { label: '4 days', value: DAY * 4 },
    { label: '5 days', value: DAY * 5 },
    { label: '6 days', value: DAY * 6 },
    { label: '7 days', value: DAY * 7 },
];

interface proposalCreationProps {
    title: string;
    text: string;
    period: number;
    setTitle: (value: string) => void;
    setText: (value: string) => void;
    setPeriod: (period: number) => void;
    hasData: boolean;
    onSubmit: () => void;
}

const ProposalCreation = ({
    title,
    text,
    setTitle,
    setText,
    period,
    setPeriod,
    hasData,
    onSubmit,
}: proposalCreationProps): JSX.Element => {
    const [textFocused, setTextFocused] = useState(false);
    const [updateIndex, setUpdateIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setUpdateIndex((prev) => prev + 1);
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    const endDate = useMemo(() => Date.now() + period, [updateIndex, period]);

    return (
        <>
            <Background />
            <Container>
                <Title>New proposal</Title>
                <Description>
                    There is a fee of {formatBalance(CREATE_PROPOSAL_COST)} AQUA to create a
                    proposal. This fee is burned by being sent to the AQUA issuer wallet.
                    <br />
                    If your proposal is accepted, you will get a reward of{' '}
                    {formatBalance(CREATE_PROPOSAL_COST * 1.5)} AQUA.
                    <br />
                    <br />
                    Please make sure your proposal is clear, well written and follows the suggested
                    format. Before you submit the proposal, we recommend sharing it on Discord to
                    get the feedback from the community and ensure it has a good chance of being
                    accepted.
                    <br />
                    <br />
                    Proposals must have clearly defined action points, be relevant to Aquarius and
                    have a feasible technical plan for implementation. Otherwise, they might be
                    taken down before the voting ends.
                </Description>
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
                        <SectionDate>
                            <DateBlock>
                                <Label>Duration of voting</Label>
                                <Select options={Options} value={period} onChange={setPeriod} />
                            </DateBlock>
                            <Time>
                                <Label>End date</Label>
                                <Input
                                    disabled
                                    value={getDateString(endDate, { withTime: true })}
                                />
                            </Time>
                        </SectionDate>
                        <Button fullWidth isBig disabled={!hasData}>
                            PREVIEW
                        </Button>
                    </ContainerForm>
                </form>
            </Container>
        </>
    );
};

export default ProposalCreation;
