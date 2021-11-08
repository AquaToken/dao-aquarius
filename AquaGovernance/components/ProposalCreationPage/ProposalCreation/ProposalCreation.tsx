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

const DatePickerResetStyles = createGlobalStyle`
  .react-datepicker {
    font-family: ${FONT_FAMILY.roboto};
    font-size: 1.6rem;
    background-color: ${COLORS.white};
    color: ${COLORS.paragraphText};
    border: none;
    border-radius: 0.5rem;
    box-shadow: 0 20px 30px rgba(0, 6, 54, 0.06);

    &__day {
      border-color: ${COLORS.gray};
      border-style: solid;
      border-width: 0 1px 1px 0;

      &--outside-month {
        color: ${COLORS.placeholder};
      }
    }

    &__day-name, &__day, &__time-name {
      display: inline-block;
      width: 4.6rem;
      line-height: 4.5rem;
      margin: 0;
    }

    &__triangle {
      display: none;
    }

    &__header {
      background-color: ${COLORS.white};
      border-bottom: none;
    }

    &__day--selected, &__day--keyboard-selected {
      border-radius: 0;
      background-color: ${COLORS.tooltip};
      color: ${COLORS.white};

      &:hover {
        background-color: #b12af5;
      }
    }

    &__current-month,
    &-time__header {
      font-weight: normal;
      font-size: 1.6rem;
      line-height: 2.8rem;
    }

    &__month {
      margin: 0;
      border-color: ${COLORS.gray};
      border-style: solid;
      border-width: 1px 0 0 1px;
    }

    &__time-list-item {
      line-height: 2rem;
    }

    &__time-container {
      width: 324px;

      .react-datepicker__time {
        .react-datepicker__time-box {
          width: 324px;
          overflow-x: unset;
          margin: 0;
          text-align: match-parent;

          ul.react-datepicker__time-list {
            display: flex;
            flex-wrap: wrap;
            height: auto;
            overflow-y: unset;
            border-color: ${COLORS.gray};
            border-style: solid;
            border-width: 1px 0 0 1px;

            li.react-datepicker__time-list-item {
              height: 4.5rem;
              min-width: 10.7rem;
              flex: 1;
              display: flex;
              align-items: center;
              justify-content: center;
              border-color: ${COLORS.gray};
              border-style: solid;
              border-width: 0 1px 1px 0;

              &--selected {
                background-color: ${COLORS.tooltip};

                &:hover {
                  background-color: #b12af5;
                }
              }
            }
          }
        }
      }
    }
  }
`;

interface proposalCreationProps {
    title: string;
    text: string;
    startTime: Date;
    startDate: Date;
    setTitle: (value: string) => void;
    setText: (value: string) => void;
    setStartTime: (date: Date) => void;
    setStartDate: (date: Date) => void;
    hasData: boolean;
    onSubmit: () => void;
}

const ProposalCreation = ({
    title,
    text,
    setTitle,
    setText,
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
                    &#9757; The cost of creating a proposal - 100,000 AQUA.
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
                                value={text}
                                onChange={(event) => {
                                    setText(event.target.value);
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
                                    placeholderText="MM.DD.YYYY"
                                    dateFormat="MM.dd.yyyy"
                                    popperModifiers={[
                                        {
                                            name: 'offset',
                                            options: {
                                                offset: [0, -10],
                                            },
                                        },
                                    ]}
                                />
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
                                            name: 'offset',
                                            options: {
                                                offset: [0, -10],
                                            },
                                        },
                                    ]}
                                />
                            </Time>
                            <DatePickerResetStyles />
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
