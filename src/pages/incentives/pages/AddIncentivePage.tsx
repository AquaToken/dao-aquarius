import { addDays, startOfDay } from 'date-fns';
import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import DatePicker from 'react-datepicker';
import styled from 'styled-components';
import 'react-datepicker/dist/react-datepicker.css';

import { findSwapPath, getAssetsList, getPoolsForIncentives } from 'api/amm';

import {
    MAX_INCENTIVES_PER_TOKEN,
    MAX_INCENTIVES_TOKENS_PER_POOL,
    MAX_TOKEN_AMOUNT,
} from 'constants/incentives';
import { MINUTE } from 'constants/intervals';
import { IncentivesRoutes } from 'constants/routes';

import { contractValueToAmount } from 'helpers/amount';
import { getAquaAssetData } from 'helpers/assets';
import {
    convertLocalDateToUTCIgnoringTimezone,
    convertUTCToLocalDateIgnoringTimezone,
} from 'helpers/date';
import { formatBalance } from 'helpers/format-number';
import { getTokensFromCache } from 'helpers/token';

import { useDebounce } from 'hooks/useDebounce';

import useAssetsStore from 'store/assetsStore/useAssetsStore';
import useAuthStore from 'store/authStore/useAuthStore';

import { ModalService } from 'services/globalServices';
import { getIncentivesConfig, getPoolIncentivesMap } from 'services/soroban/contracts/ammContract';

import { PoolProcessed } from 'types/amm';
import { Token } from 'types/token';

import { DatePickerStyles } from 'web/DatePickerStyles';
import { respondDown } from 'web/mixins';
import ConfirmIncentiveModal from 'web/modals/ConfirmIncentiveModal';
import { Breakpoints, COLORS } from 'web/styles';

import ArrowLeft from 'assets/icon-arrow-left.svg';
import Fail from 'assets/icon-fail.svg';
import Success from 'assets/icon-success.svg';

import Alert from 'basics/Alert';
import AssetPicker from 'basics/asset-picker/AssetPicker';
import Button from 'basics/buttons/Button';
import CircleButton from 'basics/buttons/CircleButton';
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

const InputStyled = styled(Input)`
    ${respondDown(Breakpoints.md)`
           margin-bottom: 4.8rem;
    `}
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
    const [firstStepPending, setFirstStepPending] = useState(false);
    const [poolConfig, setPoolConfig] = useState(null);

    const { aquaContract, aquaStellarAsset } = getAquaAssetData();

    const [rewardToken, setRewardToken] = useState<Token>(aquaStellarAsset);
    const [assetsList, setAssetsList] = useState(getTokensFromCache());
    const [amount, setAmount] = useState<string | null>(null);
    const [aquaEquivalent, setAquaEquivalent] = useState(null);
    const [xdr, setXDR] = useState(null);

    const [startDay, setStartDay] = useState<number | null>(null);
    const [endDay, setEndDay] = useState<number | null>(null);

    const { processNewAssets } = useAssetsStore();

    const debouncedAmount = useDebounce(amount, 700);

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

    const currentTokenConfig = useMemo(() => {
        if (!poolConfig) return null;

        return poolConfig.find(({ token }) => token.contract === rewardToken.contract) ?? null;
    }, [poolConfig, rewardToken]);

    const amountInputPostfix =
        debouncedAmount.current !== null && aquaEquivalent === null ? (
            <CircleLoader size="small" />
        ) : Number(aquaEquivalent) < config?.minAquaAmount ? (
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
        ) : +amount < MAX_TOKEN_AMOUNT ? (
            <SuccessIcon />
        ) : (
            <Tooltip
                content={<div>Value must be less or equal {formatBalance(MAX_TOKEN_AMOUNT)}</div>}
                position={+window.innerWidth > 992 ? TOOLTIP_POSITION.top : TOOLTIP_POSITION.left}
                isShow={true}
                background={COLORS.pinkRed}
            >
                <FailIcon />
            </Tooltip>
        );

    useEffect(() => {
        if (!selectedMarket) return;

        setPoolConfig(null);
        setFirstStepPending(true);

        getPoolIncentivesMap(selectedMarket.address).then(res => {
            setPoolConfig(res);

            if (res.length !== MAX_INCENTIVES_TOKENS_PER_POOL) {
                setFirstStepPending(false);
                setAssetsList(getTokensFromCache());
                return;
            }

            const hasTokenInConfig = res.find(
                ({ token }) => token.contract === rewardToken.contract,
            );

            if (!hasTokenInConfig) {
                setRewardToken(res[0].token);
                setAmount('');
            }
            setAssetsList(res.map(({ token }) => token));
            setFirstStepPending(false);
        });
    }, [selectedMarket]);

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

    const setTestDate = () => {
        const start = 3 * MINUTE + Date.now();
        const end = start + config?.duration * 1000;
        setStartDay(convertLocalDateToUTCIgnoringTimezone(new Date(start)).getTime());
        setEndDay(convertLocalDateToUTCIgnoringTimezone(new Date(end)).getTime());
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
                        <CircleButton label="Pool Incentives">
                            <ArrowLeft />
                        </CircleButton>
                    </Back>
                    <Title>Create Pool Incentive</Title>
                    <Description>
                        Launch a new incentive for any Aquarius pool. Select a token, amount, and
                        timeframe — rewards flow automatically to liquidity providers.
                    </Description>
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
                            <FormSectionTitle>Choose Pool</FormSectionTitle>
                            <FormSectionDescription>
                                Select the liquidity pool where your rewards will be distributed.
                            </FormSectionDescription>
                            <FormRow>
                                <Select
                                    options={OPTIONS}
                                    value={selectedMarket}
                                    onChange={setSelectedMarket}
                                    placeholder="Select a pool"
                                />
                            </FormRow>

                            {step === Step.market && (
                                <NextButton
                                    isBig
                                    fullWidth
                                    onClick={() => setStep(Step.amount)}
                                    disabled={!selectedMarket || !poolConfig}
                                    pending={firstStepPending}
                                >
                                    Continue
                                </NextButton>
                            )}
                        </FormSection>

                        {step >= Step.amount && (
                            <FormSection>
                                <FormSectionTitle>Set Rewards</FormSectionTitle>
                                <FormSectionDescription>
                                    Choose the token and daily amount to distribute. Incentives must
                                    equal at least {formatBalance(config?.minAquaAmount)} AQUA in
                                    value per day to be accepted.
                                </FormSectionDescription>
                                <FormRow>
                                    <AssetPickerStyled
                                        asset={rewardToken}
                                        onUpdate={setRewardToken}
                                        assetsList={assetsList}
                                        label="Select reward token"
                                    />

                                    <AmountInput
                                        placeholder="0"
                                        type="number"
                                        label="Daily reward amount"
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
                                        Continue
                                    </NextButton>
                                )}
                            </FormSection>
                        )}

                        {step === Step.duration && (
                            <FormSection>
                                <FormSectionTitle>Set Period</FormSectionTitle>
                                <FormSectionDescription>
                                    Choose the start and end dates for your incentive. Rewards will
                                    begin distributing from the start date until the end date
                                    automatically.
                                </FormSectionDescription>
                                <FormRow>
                                    <DatePicker
                                        customInput={<InputStyled label="Start date" />}
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
                                        customInput={<InputStyled label="End date" />}
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
                                    Test Button: Set date from now + 3 min
                                </Button>

                                {currentTokenConfig &&
                                    currentTokenConfig.count >= MAX_INCENTIVES_PER_TOKEN && (
                                        <Alert
                                            title="The maximum number of incentives has been reached."
                                            text={`At the moment, 10 incentives have been created for the ${rewardToken.code} token. To create another one, please wait until one of the active incentives expires.`}
                                        />
                                    )}

                                <NextButton
                                    isBig
                                    fullWidth
                                    onClick={() => onSubmit()}
                                    disabled={
                                        (isLogged &&
                                            (!startDay || !endDay || !amount || !selectedMarket)) ||
                                        (currentTokenConfig &&
                                            currentTokenConfig.count >= MAX_INCENTIVES_PER_TOKEN)
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
