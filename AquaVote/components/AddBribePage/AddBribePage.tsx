import * as React from 'react';
import { useEffect, useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { Breakpoints, COLORS, FONT_FAMILY } from '../../../common/styles';
import { flexAllCenter, respondDown } from '../../../common/mixins';
import ExternalLink from '../../../common/basics/ExternalLink';
import AssetDropdown from '../AssetDropdown/AssetDropdown';
import Swap from '../../../common/assets/img/icon-arrows-circle.svg';
import Dash from '../../../common/assets/img/icon-dash.svg';
import Button from '../../../common/basics/Button';
import Input from '../../../common/basics/Input';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { getMarketPair } from '../../api/api';
import { ModalService } from '../../../common/services/globalServices';
import CreatePairModal from '../MainPage/CreatePairModal/CreatePairModal';
import ChooseLoginMethodModal from '../../../common/modals/ChooseLoginMethodModal';
import useAuthStore from '../../../common/store/authStore/useAuthStore';
import ConfirmBribeModal from './ConfirmBribeModal/ConfirmBribeModal';

const MainBlock = styled.main`
    flex: 1 0 auto;
`;

const Background = styled.div`
    width: 100%;
    background-color: ${COLORS.lightGray};
    padding: 7.7rem 0 14.3rem;
    ${flexAllCenter};
`;

const Content = styled.div`
    display: flex;
    flex-direction: column;
    width: 79.2rem;

    ${respondDown(Breakpoints.md)`
        width: 100%;
    `}
`;

const Title = styled.span`
    font-weight: bold;
    font-size: 5.6rem;
    line-height: 6.4rem;
    color: ${COLORS.buttonBackground};
    margin-bottom: 1.2rem;

    ${respondDown(Breakpoints.md)`
        padding: 0 1.6rem;
    `}
`;

const Description = styled.div`
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.grayText};
    margin-bottom: 1.2rem;

    ${respondDown(Breakpoints.md)`
          padding: 0 1.6rem;
      `}
`;

const ExternalLinkStyled = styled(ExternalLink)`
    ${respondDown(Breakpoints.md)`
            padding: 0 1.6rem;
        `}
`;

const FormWrap = styled.div`
    display: flex;
    flex-direction: column;
    margin-top: -7.7rem;
    ${flexAllCenter};
`;

const Form = styled.div`
    width: 100%;
    background: ${COLORS.white};
    box-shadow: 0 2rem 3rem rgba(0, 6, 54, 0.06);
    border-radius: 0.5rem;
`;

const FormSectionTitle = styled.span`
    font-size: 3.6rem;
    line-height: 4.2rem;
    color: ${COLORS.buttonBackground};
    margin-bottom: 0.8rem;
`;

const FormSectionDescription = styled.span`
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.grayText};
    margin-bottom: 4.8rem;
`;

const FormSection = styled.section`
    display: flex;
    flex-direction: column;
    padding: 4.8rem;

    &:not(:last-child) {
        border-bottom: 0.1rem solid ${COLORS.gray};
    }

    ${respondDown(Breakpoints.md)`
          padding: 3.2rem 1.6rem;
    `}
`;

const FormRow = styled.div`
    display: flex;
    align-items: center;
    margin-top: 3rem;

    ${respondDown(Breakpoints.md)`
        flex-direction: column;
    `}
`;

const SwapIcon = styled(Swap)`
    margin: 0 2.2rem;
    min-width: 1.6rem;
    min-height: 1.6rem;

    ${respondDown(Breakpoints.md)`
        margin: 2.4rem 0 3.8rem;
    `}
`;
const DashIcon = styled(Dash)`
    margin: 0 2.2rem;
    min-width: 1.6rem;
    min-height: 1.6rem;

    ${respondDown(Breakpoints.md)`
        display: none;
    `}
`;

const NextButton = styled(Button)`
    margin-top: 4.8rem;
`;

const AmountInput = styled(Input)`
    margin-left: 6rem;

    ${respondDown(Breakpoints.md)`
         margin-left: 0;
         margin-top: 5.2rem;
    `}
`;

const DateEndInput = styled(Input)`
    ${respondDown(Breakpoints.md)`
         margin-top: 5.2rem;
    `}
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
    
    div.react-datepicker-popper {
      z-index: 200;
    }
    div.react-datepicker__day-name, .react-datepicker__day, .react-datepicker__time-name {
        display: inline-block;
        width: 4.6rem;
        line-height: 4.5rem;
        margin: 0;
    }
    div.react-datepicker__day--selected {
        border-radius: 0;
        background-color: #8620B9;
        color: #fff;
        
        &:hover {
            background-color: #8620B9;
        }
    }
    div.react-datepicker__day--keyboard-selected {
        background-color: unset;
        color: unset;
        
        &:hover {
          background-color: #f0f0f0;
        }
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

export const getWeekStartFromDay = (date: Date) => {
    const start = new Date(
        date.setDate(date.getDay() === 0 ? date.getDate() - 6 : date.getDate() - date.getDay() + 1),
    );

    const end = new Date(date.setDate(start.getDate() + 6));

    return { start, end };
};

enum CreateStep {
    'pair',
    'bribeAmount',
    'period',
}

const AddBribePage = () => {
    const [step, setStep] = useState(CreateStep.pair);
    const [base, setBase] = useState(null);
    const [counter, setCounter] = useState(null);
    const [pairInfo, setPairInfo] = useState(undefined);

    const [rewardAsset, setRewardAsset] = useState(null);
    const [amount, setAmount] = useState('');

    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const { isLogged } = useAuthStore();

    const resetForm = () => {
        setStep(CreateStep.pair);
        setBase(null);
        setCounter(null);
        setPairInfo(undefined);
        setRewardAsset(null);
        setAmount('');
        setStartDate(null);
        setEndDate(null);
    };

    useEffect(() => {
        if (!base || !counter) {
            setPairInfo(undefined);
            return;
        }

        setPairInfo(undefined);

        getMarketPair(base, counter).then((res) => {
            setPairInfo(res);
        });
    }, [base, counter]);

    const createPair = () => {
        if (isLogged) {
            ModalService.openModal(CreatePairModal, {
                base,
                counter,
            });
            return;
        }
        ModalService.openModal(ChooseLoginMethodModal, {});
    };

    const onSubmit = () => {
        if (!isLogged) {
            ModalService.openModal(ChooseLoginMethodModal, {});
            return;
        }
        ModalService.openModal(ConfirmBribeModal, {
            base,
            counter,
            rewardAsset,
            amount,
            startDate,
            endDate,
            marketKey: pairInfo.account_id,
            resetForm,
        });
    };

    const now = new Date();
    const weekForward = new Date(now.setDate(now.getDate() + 7));
    const minDate = getWeekStartFromDay(weekForward).start;

    return (
        <MainBlock>
            <Background>
                <Content>
                    <Title>Add bribe</Title>
                    <Description>
                        A bribe is created for a week, in order to create a bribe, select the
                        amount, currency and deposit an asset
                    </Description>
                    <ExternalLinkStyled>Read all rules</ExternalLinkStyled>
                </Content>
            </Background>
            <FormWrap>
                <Content>
                    <Form>
                        <FormSection>
                            <FormSectionTitle>Select market</FormSectionTitle>
                            <FormSectionDescription>
                                Select the market for which you want to add a bribe
                            </FormSectionDescription>
                            <FormRow>
                                <AssetDropdown
                                    asset={base}
                                    onUpdate={setBase}
                                    exclude={counter}
                                    placeholder="Search or pick asset"
                                    label="First asset"
                                />
                                <SwapIcon />
                                <AssetDropdown
                                    asset={counter}
                                    onUpdate={setCounter}
                                    exclude={base}
                                    placeholder="Search or pick asset"
                                    label="Second asset"
                                />
                            </FormRow>
                            {base && counter && pairInfo === null && (
                                <NextButton
                                    isBig
                                    fullWidth
                                    onClick={() => {
                                        createPair();
                                    }}
                                >
                                    create pair
                                </NextButton>
                            )}
                            {step === CreateStep.pair && (
                                <NextButton
                                    isBig
                                    fullWidth
                                    onClick={() => {
                                        setStep(CreateStep.bribeAmount);
                                    }}
                                    disabled={!base || !counter || !pairInfo}
                                >
                                    next
                                </NextButton>
                            )}
                        </FormSection>
                        {step >= CreateStep.bribeAmount && (
                            <FormSection>
                                <FormSectionTitle>Choose reward</FormSectionTitle>
                                <FormSectionDescription>
                                    Contribute a reward to the Aquarius Bribe Fund
                                </FormSectionDescription>
                                <FormRow>
                                    <AssetDropdown
                                        asset={rewardAsset}
                                        onUpdate={setRewardAsset}
                                        placeholder="Search or pick asset"
                                        label="Reward asset"
                                    />
                                    <AmountInput
                                        placeholder="0"
                                        type="number"
                                        label="Reward amount"
                                        value={amount}
                                        onChange={({ target }) => {
                                            setAmount(target.value);
                                        }}
                                    />
                                </FormRow>
                                {step === CreateStep.bribeAmount && (
                                    <NextButton
                                        isBig
                                        fullWidth
                                        disabled={!rewardAsset || !Number(amount)}
                                        onClick={() => setStep(CreateStep.period)}
                                    >
                                        next
                                    </NextButton>
                                )}
                            </FormSection>
                        )}

                        {step === CreateStep.period && (
                            <FormSection>
                                <FormSectionTitle>Enter period</FormSectionTitle>
                                <FormSectionDescription>
                                    A bribe can exist for a week, choose a suitable start date
                                </FormSectionDescription>
                                <FormRow>
                                    <DatePicker
                                        customInput={<Input label="Start date" />}
                                        calendarStartDay={1}
                                        selected={startDate || null}
                                        onChange={(res) => {
                                            const { start, end } = getWeekStartFromDay(res);
                                            setStartDate(start);
                                            setEndDate(end);
                                        }}
                                        dateFormat="MM.dd.yyyy"
                                        placeholderText="MM.DD.YYYY"
                                        popperModifiers={[
                                            {
                                                name: 'offset',
                                                options: {
                                                    offset: [0, -10],
                                                },
                                            },
                                        ]}
                                        minDate={minDate}
                                    />
                                    <DashIcon />
                                    <DatePicker
                                        customInput={<DateEndInput label="End date" />}
                                        disabled
                                        calendarStartDay={1}
                                        selected={endDate || null}
                                        dateFormat="MM.dd.yyyy"
                                    />
                                </FormRow>

                                <NextButton
                                    isBig
                                    fullWidth
                                    disabled={
                                        !base ||
                                        !counter ||
                                        !rewardAsset ||
                                        !Number(amount) ||
                                        !startDate
                                    }
                                    onClick={() => onSubmit()}
                                >
                                    Add bribe
                                </NextButton>

                                <GlobalStyle />
                            </FormSection>
                        )}
                    </Form>
                </Content>
            </FormWrap>
        </MainBlock>
    );
};

export default AddBribePage;
