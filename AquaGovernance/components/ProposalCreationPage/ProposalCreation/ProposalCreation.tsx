import * as React from 'react';
import styled, { createGlobalStyle } from 'styled-components';

import { COLORS, FONT_FAMILY } from '../../../../common/styles';

import Input from '../../../../common/basics/Input';
import TextArea from '../../../../common/basics/TextArea';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Button from '../../../../common/basics/Button';

const Background = styled.div`
    position: absolute;
    z-index: -1;
    top: 11.2rem;
    left: 0;
    width: 100%;
    background-color: ${COLORS.lightGray};
    height: 30%;
`;

const Container = styled.div`
    padding: 5% 0 2%;
    max-width: 79.2rem;
    height: 100%;
    margin: 0 auto;
`;

const Title = styled.h3`
    font-size: 5.6rem;
    line-height: 6.4rem;
    font-weight: bold;
    color: ${COLORS.titleText};
`;

const Description = styled.div`
    margin-top: 1.2rem;
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.descriptionText};
    opacity: 0.7;
`;

const ContainerForm = styled.div`
    padding: 4.8rem;
    margin-top: 3.4rem;
    background-color: ${COLORS.white};
    box-shadow: 0 2rem 3rem rgba(0, 6, 54, 0.06);
    border-radius: 0.5rem;
`;

const SectionForm = styled.div`
    margin-bottom: 4.8rem;
`;

const SectionDate = styled(SectionForm)`
    display: flex;
    column-gap: 4.8rem;
`;
const Date = styled.div`
    flex: 1 0 0;
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

const GlobalStyle = createGlobalStyle`
    div.react-datepicker {
        font-family: ${FONT_FAMILY.roboto};
        font-size: 1.6rem;
        background-color: #fff;
        color: #000636;
        border: none;
        border-radius: 0.5rem;
        box-shadow: 0 20px 30px rgba(0, 6, 54, 0.06);
    }
    div.react-datepicker__triangle {
        display: none;
    }
    div.react-datepicker__header {
        background-color: white;
        border-bottom: none;
    }
    div.react-datepicker__day-name, .react-datepicker__day, .react-datepicker__time-name {
        display: inline-block;
        width: 4.6rem;
        line-height: 4.5rem;
        margin: 0;
    }
    div.react-datepicker__day--selected, div.react-datepicker__day--keyboard-selected {
        border-radius: 0;
        background-color: #8620B9;
        color: #fff;
    }
    div.react-datepicker__current-month  {
        color: #000;
        font-weight: normal;
        font-size: 1.6rem;
        line-height: 2.8rem;
    }
    div.react-datepicker__month {
        margin: 0;
        border-left: 1px solid #E8E8ED;
        border-top: 1px solid #E8E8ED;
    }
    div.react-datepicker__day {
        width: 4.6rem;
        line-height: 4.5rem;
        margin: 0;
        border-right: 1px solid #E8E8ED;
        border-bottom: 1px solid #E8E8ED;
  }
    div.react-datepicker__day--outside-month {
        color: #B3B4C3;
    }
`;
interface proposalCreationProps {
    title: string;
    body: string;
    startTime: Date;
    startDate: Date;
    setTitle: (value: string) => void;
    setBody: (value: string) => void;
    setStartTime: (date: Date) => void;
    setStartDate: (date: Date) => void;
    hasData: boolean;
    onSubmit: () => void;
}

const ProposalCreation = ({
    title,
    body,
    setTitle,
    setBody,
    startTime,
    startDate,
    setStartTime,
    setStartDate,
    hasData,
    onSubmit,
}: proposalCreationProps): JSX.Element => {
    return (
        <>
            <Background />
            <Container>
                <Title>New proposal</Title>
                <Description>
                    ☝️ The cost of creating a proposal - 100,000 AQUA.
                    <br /> This amount will not be received by someone in particular, but will be
                    burned.
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
                            <TextArea
                                id="body"
                                name="body"
                                // wrap="hard"
                                // cols={80}
                                // rows={10}
                                value={body}
                                onChange={(event) => {
                                    setBody(event.target.value);
                                }}
                            />
                        </SectionForm>
                        <SectionDate>
                            <Date>
                                <Label>End day</Label>
                                <DatePicker
                                    customInput={<Input />}
                                    selected={startDate}
                                    onChange={(date) => setStartDate(date)}
                                    placeholderText="MM/DD/YYYY"
                                    popperModifiers={[
                                        {
                                            name: 'offset',
                                            options: {
                                                offset: [0, -10],
                                            },
                                        },
                                    ]}
                                />
                                <GlobalStyle />
                            </Date>
                            <Time>
                                <Label>End time</Label>
                                <DatePicker
                                    customInput={<Input />}
                                    selected={startTime}
                                    onChange={(time) => setStartTime(time)}
                                    showTimeSelect
                                    showTimeSelectOnly
                                    timeIntervals={60}
                                    timeCaption="Time"
                                    dateFormat="HH:mm"
                                    timeFormat="HH:mm"
                                    placeholderText="00:00"
                                    popperModifiers={[
                                        {
                                            name: 'arrow',
                                            options: {
                                                padding: 10,
                                            },
                                        },
                                    ]}
                                />
                            </Time>
                        </SectionDate>
                        <Button fullWidth isBig disabled={!hasData}>
                            Go to publish
                        </Button>
                    </ContainerForm>
                </form>
            </Container>
        </>
    );
};

export default ProposalCreation;
