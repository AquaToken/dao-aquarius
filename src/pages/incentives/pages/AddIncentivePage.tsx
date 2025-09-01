import { addDays, startOfDay } from 'date-fns';
import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import DatePicker from 'react-datepicker';
import styled from 'styled-components';
import 'react-datepicker/dist/react-datepicker.css';

import { findSwapPath, getAssetsList, getPoolsForIncentives } from 'api/amm';

import { MAX_TOKEN_AMOUNT } from 'constants/incentives';
import { MINUTE, WEEK } from 'constants/intervals';
import { IncentivesRoutes } from 'constants/routes';

import { contractValueToAmount } from 'helpers/amount';
import { getAquaAssetData } from 'helpers/assets';
import {
    convertLocalDateToUTCIgnoringTimezone,
    convertUTCToLocalDateIgnoringTimezone,
} from 'helpers/date';
import { formatBalance } from 'helpers/format-number';

import { useDebounce } from 'hooks/useDebounce';

import useAssetsStore from 'store/assetsStore/useAssetsStore';
import useAuthStore from 'store/authStore/useAuthStore';

import { ModalService } from 'services/globalServices';
import { getIncentivesConfig } from 'services/soroban/contracts/ammContract';

import { PoolProcessed } from 'types/amm';
import { Token } from 'types/token';

import { DatePickerStyles } from 'web/DatePickerStyles';
import { respondDown } from 'web/mixins';
import ConfirmIncentiveModal from 'web/modals/ConfirmIncentiveModal';
import { Breakpoints, COLORS } from 'web/styles';

import ArrowLeft from 'assets/icon-arrow-left.svg';
import Fail from 'assets/icon-fail.svg';
import Success from 'assets/icon-success.svg';

import AssetPicker from 'basics/asset-picker/AssetPicker';
import Button from 'basics/buttons/Button';
import CircleButton from 'basics/buttons/CircleButton';
import ExternalLink from 'basics/ExternalLink';
import { Select } from 'basics/inputs';
import Input from 'basics/inputs/Input';
import { CircleLoader, PageLoader } from 'basics/loaders';
import Market from 'basics/Market';
import Tooltip, { TOOLTIP_POSITION } from 'basics/Tooltip';

import ChooseLoginMethodModal from 'modals/auth/ChooseLoginMethodModal';

import {
    Back,
    Background,
    Content,
    MainBlock,
    Title,
    Description,
    Form,
    FormSection,
    FormSectionTitle,
    FormSectionDescription,
    FormWrap,
    FormRow,
    DashIcon,
} from 'pages/bribes/pages/AddBribePage';

const ExternalLinkStyled = styled(ExternalLink)`
    ${respondDown(Breakpoints.md)`
            padding: 0 1.6rem;
        `}
`;

const MarketStyled = styled(Market)`
    pointer-events: none;
`;

const NextButton = styled(Button)`
    margin-top: 4.8rem;
`;

const AmountInput = styled(Input)`
    width: 50%;
    margin-left: 1.6rem;

    ${respondDown(Breakpoints.md)`
         margin-left: 0;
         margin-top: 5.2rem;
         width: 100%;
    `};
`;

const AssetPickerStyled = styled(AssetPicker)`
    border-radius: 0.5rem;
    height: 6.6rem;
    width: 50%;
    max-width: unset;

    ${respondDown(Breakpoints.md)`
         width: 100%;
    `};
`;

const FailIcon = styled(Fail)`
    width: 1.6rem;
    height: 1.6rem;
`;

const SuccessIcon = styled(Success)`
    width: 1.6rem;
    height: 1.6rem;
`;

const TooltipInner = styled.span`
    width: 20rem;
    white-space: pre-line;

    ${respondDown(Breakpoints.lg)`
        width: 15rem;
    `}
`;

enum Step {
    'market',
    'amount',
    'duration',
}

const AddIncentivePage = () => {
    const [markets, setMarkets] = useState<PoolProcessed[] | null>(null);
    const [selectedMarket, setSelectedMarket] = useState<PoolProcessed | null>(null);
    const [step, setStep] = useState(Step.market);
    const [config, setConfig] = useState(null);

    const [rewardToken, setRewardToken] = useState<Token>(getAquaAssetData().aquaStellarAsset);
    const [assetsList, setAssetsList] = useState(null);
    const [amount, setAmount] = useState<string | null>(null);
    const [aquaEquivalent, setAquaEquivalent] = useState(null);
    const [xdr, setXDR] = useState(null);
    const [isInvalidAmount, setIsInvalidAmount] = useState(false);

    const [startDay, setStartDay] = useState<number | null>(null);
    const [endDay, setEndDay] = useState<number | null>(null);

    const { processNewAssets } = useAssetsStore();

    const debouncedAmount = useDebounce(amount, 700);

    const { aquaContract } = getAquaAssetData();

    const { isLogged } = useAuthStore();

    useEffect(() => {
        getIncentivesConfig().then(setConfig);
    }, []);

    useEffect(() => {
        getPoolsForIncentives().then(setMarkets);
    }, []);

    useEffect(() => {
        getAssetsList().then(res => {
            processNewAssets(res);
            setAssetsList(res);
        });
    }, []);

    const nextDay = convertUTCToLocalDateIgnoringTimezone(startOfDay(addDays(Date.now(), 1)));

    useEffect(() => {
        if (!debouncedAmount) {
            setAquaEquivalent(0);
            setXDR(null);
            return;
        }

        if (rewardToken.contract === aquaContract) {
            setAquaEquivalent(debouncedAmount.current);
            setXDR(null);
            return;
        }
        findSwapPath(
            rewardToken.contract,
            aquaContract,
            +debouncedAmount.current,
            true,
            rewardToken.decimal,
        ).then(res => {
            setAquaEquivalent(contractValueToAmount(res.amount, 7));
            setXDR(res.swap_chain_xdr);
        });
    }, [debouncedAmount, rewardToken]);

    const OPTIONS = useMemo(() => {
        if (!markets) return [];

        return markets.map(market => ({
            label: (
                <MarketStyled
                    assets={market.tokens}
                    withoutLink
                    fee={market.fee}
                    poolType={market.pool_type}
                />
            ),
            value: market,
        }));
    }, [markets]);

    const setTestDate = () => {
        const start = 3 * MINUTE + Date.now();
        const end = start + WEEK;
        setStartDay(convertLocalDateToUTCIgnoringTimezone(new Date(start)).getTime());
        setEndDay(convertLocalDateToUTCIgnoringTimezone(new Date(end)).getTime());
    };

    const amountInputPostfix =
        debouncedAmount.current !== null && aquaEquivalent === null ? (
            <CircleLoader size="small" />
        ) : Number(aquaEquivalent) >= config?.minAquaAmount ? (
            <SuccessIcon />
        ) : isInvalidAmount ? (
            <Tooltip
                content={<div>Value must be less or equal {formatBalance(MAX_TOKEN_AMOUNT)}</div>}
                position={+window.innerWidth > 992 ? TOOLTIP_POSITION.top : TOOLTIP_POSITION.left}
                isShow={true}
                background={COLORS.pinkRed}
            >
                <FailIcon />
            </Tooltip>
        ) : (
            <Tooltip
                content={
                    <TooltipInner>
                        The incentive appears to be under {formatBalance(config?.minAquaAmount)}{' '}
                        AQUA in value.
                    </TooltipInner>
                }
                position={+window.innerWidth > 992 ? TOOLTIP_POSITION.top : TOOLTIP_POSITION.left}
                isShow={true}
                background={COLORS.pinkRed}
            >
                <FailIcon />
            </Tooltip>
        );

    const onSubmit = () => {
        if (!isLogged) {
            ModalService.openModal(ChooseLoginMethodModal, {});
            return;
        }

        ModalService.openModal(ConfirmIncentiveModal, {
            pool: selectedMarket,
            rewardToken,
            amountPerDay: amount,
            startDate: convertUTCToLocalDateIgnoringTimezone(new Date(startDay)).getTime(),
            endDate: convertUTCToLocalDateIgnoringTimezone(new Date(endDay)).getTime(),
            swapChainedXdr: xdr,
        });
    };

    if (!markets || !config) {
        return (
            <MainBlock>
                <PageLoader />
            </MainBlock>
        );
    }

    return (
        <MainBlock>
            <Background>
                <Content>
                    <Back to={IncentivesRoutes.main}>
                        <CircleButton label="Incentives">
                            <ArrowLeft />
                        </CircleButton>
                    </Back>
                    <Title>Create Incentive</Title>
                    <Description>
                        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ad fuga fugiat
                        itaque, modi molestiae, necessitatibus nostrum officia omnis perspiciatis
                        possimus quis quo recusandae, rerum similique sunt suscipit ut!
                        Consequuntur, quidem?
                    </Description>
                    <ExternalLinkStyled href="">Learn more</ExternalLinkStyled>
                </Content>
            </Background>
            <FormWrap>
                <Content>
                    <Form
                        onSubmit={event => {
                            event.preventDefault();
                        }}
                    >
                        <FormSection>
                            <FormSectionTitle>Select market</FormSectionTitle>
                            <FormSectionDescription>
                                Choose a market for your incentive.
                            </FormSectionDescription>
                            <FormRow>
                                <Select
                                    options={OPTIONS}
                                    value={selectedMarket}
                                    onChange={setSelectedMarket}
                                />
                            </FormRow>

                            {step === Step.market && (
                                <NextButton
                                    isBig
                                    fullWidth
                                    onClick={() => {
                                        setStep(Step.amount);
                                    }}
                                    disabled={!selectedMarket}
                                >
                                    next
                                </NextButton>
                            )}
                        </FormSection>

                        {step >= Step.amount && (
                            <FormSection>
                                <FormSectionTitle>Set reward</FormSectionTitle>
                                <FormSectionDescription>
                                    Set the reward asset and amount that will be distributed during
                                    period. Note, your incentive should be worth at least ... AQUA,
                                    otherwise it won't be accepted.
                                </FormSectionDescription>
                                <FormRow>
                                    <AssetPickerStyled
                                        asset={rewardToken}
                                        onUpdate={setRewardToken}
                                        assetsList={assetsList}
                                        label="Reward token"
                                    />

                                    <AmountInput
                                        placeholder="0"
                                        type="number"
                                        label="Reward per day"
                                        value={amount}
                                        required
                                        onChange={({ target }) => {
                                            setAmount(target.value);
                                        }}
                                        postfix={
                                            debouncedAmount.current && rewardToken
                                                ? amountInputPostfix
                                                : null
                                        }
                                        inputMode="decimal"
                                    />
                                </FormRow>
                                {step === Step.amount && (
                                    <NextButton
                                        isBig
                                        fullWidth
                                        disabled={
                                            !rewardToken || !Number(amount) || Number(amount) <= 0
                                        }
                                        onClick={() => setStep(Step.duration)}
                                    >
                                        next
                                    </NextButton>
                                )}
                            </FormSection>
                        )}

                        {step === Step.duration && (
                            <FormSection>
                                <FormSectionTitle>Set period</FormSectionTitle>
                                <FormSectionDescription>
                                    Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                                    Assumenda cum et explicabo facilis, libero numquam soluta
                                    tempore temporibus voluptas voluptatibus!
                                </FormSectionDescription>
                                <FormRow>
                                    <DatePicker
                                        customInput={<Input label="Start date" />}
                                        calendarStartDay={1}
                                        selected={startDay ? new Date(startDay) : null}
                                        onChange={res => {
                                            setStartDay(startOfDay(res).getTime());
                                        }}
                                        dateFormat="MM.dd.yyyy"
                                        placeholderText="MM.DD.YYYY"
                                        disabledKeyboardNavigation
                                        popperModifiers={[
                                            {
                                                name: 'offset',
                                                options: {
                                                    offset: [0, -10],
                                                },
                                            },
                                        ]}
                                        minDate={nextDay}
                                    />
                                    <DashIcon />

                                    <DatePicker
                                        customInput={<Input label="End date" />}
                                        calendarStartDay={1}
                                        selected={endDay ? new Date(endDay) : null}
                                        onChange={res => {
                                            setEndDay(startOfDay(res).getTime());
                                        }}
                                        dateFormat="MM.dd.yyyy"
                                        placeholderText="MM.DD.YYYY"
                                        disabledKeyboardNavigation
                                        disabled={!startDay}
                                        popperModifiers={[
                                            {
                                                name: 'offset',
                                                options: {
                                                    offset: [0, -10],
                                                },
                                            },
                                        ]}
                                        minDate={addDays(startDay, config.duration / 24 / 60 / 60)}
                                    />
                                </FormRow>

                                <Button
                                    isSmall
                                    style={{ marginTop: '2rem' }}
                                    withGradient
                                    isRounded
                                    onClick={() => setTestDate()}
                                >
                                    Test Button: Set date to one week from now + 3 min
                                </Button>

                                <NextButton
                                    isBig
                                    fullWidth
                                    onClick={() => onSubmit()}
                                    disabled={
                                        isLogged &&
                                        (!startDay || !endDay || !amount || !selectedMarket)
                                    }
                                >
                                    {isLogged ? 'Create incentive' : 'Connect Wallet'}
                                </NextButton>

                                <DatePickerStyles />
                            </FormSection>
                        )}
                    </Form>
                </Content>
            </FormWrap>
        </MainBlock>
    );
};

export default AddIncentivePage;
