import * as React from 'react';
import BigNumber from 'bignumber.js';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { FilterOptions, getPools, PoolsSortFields } from 'api/amm';

import { CONCENTRATED_TICK_SPACING_BY_FEE, POOL_TYPE } from 'constants/amm';
import { AppRoutes } from 'constants/routes';
import { CONTRACT_STATUS } from 'constants/soroban';

import ErrorHandler from 'helpers/error-handler';
import { getAssetString } from 'helpers/assets';
import { formatBalance } from 'helpers/format-number';
import { openCurrentWalletIfExist } from 'helpers/wallet-connect-helpers';

import { LoginTypes } from 'store/authStore/types';
import useAuthStore from 'store/authStore/useAuthStore';

import { BuildSignAndSubmitStatuses } from 'services/auth/wallet-connect/wallet-connect.service';
import { SorobanService, ToastService } from 'services/globalServices';

import { PoolCreationFeeInfo, PoolExtended, PoolProcessed } from 'types/amm';
import { Transaction } from 'types/stellar';
import { Token, TokenType } from 'types/token';

import ArrowLeft from 'assets/icons/arrows/arrow-left-16.svg';
import Tick from 'assets/icons/small-icons/check/check-11x9.svg';

import Alert from 'basics/Alert';
import AssetDropdown from 'basics/asset-pickers/AssetDropdown';
import AssetLogo from 'basics/AssetLogo';
import Button from 'basics/buttons/Button';
import Checkbox from 'basics/inputs/Checkbox';
import Input from 'basics/inputs/Input';
import ToggleGroup from 'basics/inputs/ToggleGroup';
import PageLoader from 'basics/loaders/PageLoader';
import Tooltip, { TOOLTIP_POSITION } from 'basics/Tooltip';

import { PageContainer } from 'styles/commonPageStyles';
import { flexRowSpaceBetween, respondDown } from 'styles/mixins';
import {
    Form,
    FormBackButton,
    FormPageContentWrap,
    FormPageHeaderTitle,
    FormPageHeaderWrap,
    FormSection,
    FormSectionDescription,
    FormSectionTitle,
    FormWrap,
} from 'styles/sharedFormPage.styled';
import { Breakpoints, COLORS } from 'styles/style-constants';

import ConcentratedAddLiquidityForm, {
    ConcentratedAddLiquidityFormData,
} from '../components/AddLiquidity/Concentrated/form/ConcentratedAddLiquidityForm';
import AddLiquidityForm, {
    AddLiquidityFormData,
} from '../components/AddLiquidity/Regular/AddLiquidityForm';
import ContractNotFound from '../components/ContractNotFound/ContractNotFound';
import PoolsList from '../components/PoolsList/PoolsList';

const ErrorLabel = styled.span<{ $isError?: boolean }>`
    color: ${({ $isError }) => ($isError ? COLORS.red500 : COLORS.textTertiary)};
`;

const StyledForm = styled(Form)`
    padding: 0 4.8rem;
    margin-bottom: 5rem;

    ${respondDown(Breakpoints.sm)`
        padding: 1.6rem;
        margin-bottom: 2rem;
    `}
`;

const StyledFormSection = styled(FormSection)`
    padding: 4.8rem 0;

    &:last-child {
        border-bottom: none;
    }

    ${respondDown(Breakpoints.sm)`
        padding: 1.6rem 0;
    `}
`;

const FormDescription = styled.span`
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.textGray};
`;

const PoolType = styled.div<{ $isActive?: boolean }>`
    ${flexRowSpaceBetween};
    cursor: pointer;
    width: 100%;
    padding: 3.7rem 3.2rem;
    border-radius: 1rem;
    background-color: ${({ $isActive }) => ($isActive ? COLORS.purple500 : COLORS.gray50)};
    color: ${({ $isActive }) => ($isActive ? COLORS.white : COLORS.textTertiary)};

    svg {
        display: ${({ $isActive }) => ($isActive ? 'block' : 'none')};
        width: 3rem;
        margin-left: 0.4rem;
    }

    &:first-of-type {
        margin-top: 5.8rem;
    }
`;

const DropdownContainer = styled.div`
    display: flex;
    position: relative;
    flex-direction: column;
`;

const StyledAssetDropdown = styled(AssetDropdown)`
    margin-top: 6.7rem;
`;

const RemoveButton = styled.div`
    position: absolute;
    right: 0;
    bottom: 7.8rem;
    color: ${COLORS.red500};
    cursor: pointer;
`;

const FormRow = styled.div`
    display: flex;
    gap: 5.4rem;

    ${respondDown(Breakpoints.sm)`
        flex-direction: column;
    `}
`;

const InputStyled = styled(Input)`
    margin-top: 3.2rem;
`;

const FormSectionDescriptionStyled = styled(FormSectionDescription)`
    margin-bottom: 3.7rem;
`;

const AddRowButton = styled(Button)`
    margin-right: auto;
`;

const ToggleGroupStyled = styled(ToggleGroup)`
    width: fit-content;
`;

const TooltipStyled = styled(Tooltip)`
    margin-top: 3.7rem;
`;

const TooltipInner = styled.span`
    font-size: 1.4rem;
    line-height: 2rem;
    text-transform: none;
    font-weight: 400;
    width: 20rem;
    white-space: pre-line;

    ${respondDown(Breakpoints.sm)`
        width: 9rem;
    `}
`;

const CreationFee = styled.div`
    font-size: 1.6rem;
    margin-top: -1.3rem;
    margin-bottom: 3.2rem;
    padding: 2.4rem;
    background-color: ${COLORS.gray50};
    ${flexRowSpaceBetween};

    ${respondDown(Breakpoints.md)`
        flex-direction: column;
        gap: 4rem;
        justify-content: flex-start;
        align-items: flex-start;
    `}
`;

const CreationFeeCost = styled.div`
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 1.6rem;
    line-height: 2.8rem;
`;

const StyledCheckbox = styled(Checkbox)`
    width: fit-content;
`;

const FEE_OPTIONS = [
    { value: 10, label: '0.1%' },
    { value: 30, label: '0.3%' },
    { value: 100, label: '1%' },
];

const STABLE_POOL_FEE_PERCENTS = {
    min: '0.01',
    max: '1',
    default: '0.1',
};

const buildCreatePoolPreview = (
    tokens: Token[],
    poolType: POOL_TYPE,
    fee: string,
    tickSpacing?: number,
): PoolExtended => ({
    index: '',
    address: '',
    share_token_address: '',
    tokens_addresses: tokens.map(token => token.contract),
    reserves: tokens.map(() => '0'),
    pool_type: poolType,
    fee,
    a: null,
    deposit_killed: false,
    swap_killed: false,
    claim_killed: false,
    share_token_decimals: 0,
    tokens_str: tokens.map(token => token.code),
    volume: '0',
    liquidity: '0',
    reward_tps: '0',
    total_share: '0',
    apy: '0',
    liquidity_usd: '0',
    volume_usd: '0',
    apy_tier: 0,
    rewards_tps: '0',
    rewards_apy: '0',
    incentive_tps_per_token: {},
    incentive_apy_per_token: {},
    incentive_apy: '0',
    total_apy: '0',
    tokens,
    stats: [],
    membersCount: 0,
    tick_spacing: tickSpacing,
});

const CreatePool = () => {
    const [type, setType] = useState(POOL_TYPE.constant);
    const [assetsCount, setAssetsCount] = useState(2);
    const [firstAsset, setFirstAsset] = useState(null);
    const [firstAssetStatus, setFirstAssetStatus] = useState(null);
    const [secondAsset, setSecondAsset] = useState(null);
    const [secondAssetStatus, setSecondAssetStatus] = useState(null);
    const [thirdAsset, setThirdAsset] = useState(null);
    const [thirdAssetStatus, setThirdAssetStatus] = useState(null);
    const [fourthAsset, setFourthAsset] = useState(null);
    const [fourthAssetStatus, setFourthAssetStatus] = useState(null);
    const [constantFee, setConstantFee] = useState(10);
    const [stableFee, setStableFee] = useState(STABLE_POOL_FEE_PERCENTS.default);
    const [pending, setPending] = useState(false);
    const [createInfo, setCreateInfo] = useState<PoolCreationFeeInfo | null>(null);
    const [regularDepositFormData, setRegularDepositFormData] =
        useState<AddLiquidityFormData | null>(null);
    const [concentratedDepositFormData, setConcentratedDepositFormData] =
        useState<ConcentratedAddLiquidityFormData | null>(null);

    const [agreeWithFee, setAgreeWithFee] = useState(false);

    const [pools, setPools] = useState<PoolProcessed[] | null>(null);

    const { account } = useAuthStore();

    const navigate = useNavigate();

    const isStableFeeInputError =
        stableFee &&
        (Number(stableFee) < Number(STABLE_POOL_FEE_PERCENTS.min) ||
            Number(stableFee) > Number(STABLE_POOL_FEE_PERCENTS.max));

    useEffect(() => {
        if (type === POOL_TYPE.constant || type === POOL_TYPE.concentrated) {
            setAssetsCount(2);
            setThirdAsset(null);
            setFourthAsset(null);
        }
    }, [type]);

    useEffect(() => {
        SorobanService.amm.getCreationFeeInfo().then(res => {
            setCreateInfo(res);
        });
    }, []);

    useEffect(() => {
        getPools(FilterOptions.all, 1, 1000, PoolsSortFields.liquidityUp).then(res =>
            setPools(res.pools),
        );
    }, []);

    const existingPools = useMemo(() => {
        if (!pools || !firstAsset || !secondAsset) {
            return [];
        }
        const selectedAssets = [firstAsset, secondAsset, thirdAsset, fourthAsset].filter(
            asset => asset !== null,
        );

        return pools.filter(
            pool =>
                selectedAssets.every(
                    asset => !!pool.tokens.find(poolAsset => poolAsset.contract === asset.contract),
                ) &&
                selectedAssets.length === pool.tokens.length &&
                type === pool.pool_type &&
                +(type === POOL_TYPE.stable ? stableFee : constantFee / 100) ===
                    +(Number(pool.fee) * 100).toFixed(2),
        );
    }, [pools, firstAsset, secondAsset, thirdAsset, fourthAsset, type, stableFee, constantFee]);

    useEffect(() => {
        if (!firstAsset) {
            setFirstAssetStatus(null);
            return;
        }
        SorobanService.token.getTokenContractData(firstAsset.contract).then(({ status }) => {
            setFirstAssetStatus(status);
        });
    }, [firstAsset]);

    useEffect(() => {
        if (!secondAsset) {
            setSecondAssetStatus(null);
            return;
        }
        SorobanService.token.getTokenContractData(secondAsset.contract).then(({ status }) => {
            setSecondAssetStatus(status);
        });
    }, [secondAsset]);

    useEffect(() => {
        if (!thirdAsset) {
            setThirdAssetStatus(null);
            return;
        }
        SorobanService.token.getTokenContractData(thirdAsset.contract).then(({ status }) => {
            setThirdAssetStatus(status);
        });
    }, [thirdAsset]);

    const existingPoolsRef = useRef(null);

    useEffect(() => {
        if (existingPools.length && existingPoolsRef.current) {
            existingPoolsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [existingPools, existingPoolsRef]);

    useEffect(() => {
        if (!fourthAsset) {
            setFourthAssetStatus(null);
            return;
        }
        SorobanService.token.getTokenContractData(fourthAsset.contract).then(({ status }) => {
            setFourthAssetStatus(status);
        });
    }, [fourthAsset]);

    const signAndSubmitCreation = (tx: Transaction, poolAddress: string) =>
        account
            .signAndSubmitTx(tx, true)
            .then((res: { status?: BuildSignAndSubmitStatuses }) => {
                setPending(false);
                if (!res) {
                    return;
                }

                if (
                    (res as { status: BuildSignAndSubmitStatuses }).status ===
                    BuildSignAndSubmitStatuses.pending
                ) {
                    ToastService.showSuccessToast('More signatures required to complete');
                    return;
                }
                ToastService.showSuccessToast('Pool successfully created');
                navigate(AppRoutes.section.amm.to.pool({ poolAddress }));
            })
            .catch(e => {
                const text = ErrorHandler(e);
                ToastService.showErrorToast(text);
                setPending(false);
            });

    const selectedAssets = useMemo(
        () =>
            [firstAsset, secondAsset, thirdAsset, fourthAsset].filter(
                asset => asset !== null,
            ) as Token[],
        [firstAsset, secondAsset, thirdAsset, fourthAsset],
    );

    const orderedConcentratedAssets = useMemo(
        () =>
            selectedAssets.length === 2
                ? SorobanService.token.orderTokens([...selectedAssets])
                : selectedAssets,
        [selectedAssets],
    );

    const createPoolPreview = useMemo(() => {
        if (!selectedAssets.length) {
            return null;
        }

        if (type === POOL_TYPE.concentrated) {
            return buildCreatePoolPreview(
                orderedConcentratedAssets,
                type,
                String(constantFee / 10000),
                CONCENTRATED_TICK_SPACING_BY_FEE[constantFee],
            );
        }

        return buildCreatePoolPreview(
            selectedAssets,
            type,
            String((type === POOL_TYPE.stable ? Number(stableFee) : constantFee / 100) / 100),
        );
    }, [selectedAssets, orderedConcentratedAssets, type, constantFee, stableFee]);

    const hasAllSelectedAssets =
        !!firstAsset &&
        !!secondAsset &&
        (assetsCount < 3 || !!thirdAsset) &&
        (assetsCount < 4 || !!fourthAsset);
    const hasContractErrors = [
        firstAssetStatus,
        secondAssetStatus,
        thirdAssetStatus,
        fourthAssetStatus,
    ].some(status => status === CONTRACT_STATUS.NOT_FOUND);
    const isPoolConfigurationValid =
        hasAllSelectedAssets &&
        !hasContractErrors &&
        !isStableFeeInputError &&
        (type !== POOL_TYPE.stable || !!stableFee) &&
        !existingPools.length;
    const isRegularInitialDepositValid = !!regularDepositFormData?.hasAllAmounts;
    const isConcentratedInitialDepositValid =
        !!concentratedDepositFormData &&
        !concentratedDepositFormData.isDepositDisabled &&
        concentratedDepositFormData.tickLower !== null &&
        concentratedDepositFormData.tickUpper !== null;
    const hasValidInitialDeposit =
        type === POOL_TYPE.concentrated
            ? isConcentratedInitialDepositValid
            : isRegularInitialDepositValid;

    useEffect(() => {
        setRegularDepositFormData(null);
        setConcentratedDepositFormData(null);
    }, [
        type,
        firstAsset,
        secondAsset,
        thirdAsset,
        fourthAsset,
        assetsCount,
        constantFee,
        stableFee,
    ]);

    const getInsufficientBalanceTokens = (
        assets: Token[],
        balances: Map<string, string> | null,
        amounts: Map<string, string>,
    ) =>
        assets.filter(asset => {
            const requestedAmount =
                amounts.get(getAssetString(asset)) || amounts.get(asset.contract) || '0';
            const availableBalance =
                asset.type === TokenType.soroban
                    ? balances?.get(getAssetString(asset)) || '0'
                    : String(account?.getAssetBalance(asset) || '0');

            return new BigNumber(availableBalance).lt(requestedAmount);
        });

    const createStablePool = () => {
        if (!account || !createInfo || !regularDepositFormData) {
            return;
        }

        if (
            createInfo &&
            Number(account.getAssetBalance(createInfo.token)) < Number(createInfo.stableFee)
        ) {
            ToastService.showErrorToast(
                `You need at least ${createInfo.stableFee} ${createInfo.token.code} to create pool`,
            );
            return;
        }

        const insufficientBalanceTokens = getInsufficientBalanceTokens(
            selectedAssets,
            regularDepositFormData.balances,
            regularDepositFormData.amounts,
        );

        if (insufficientBalanceTokens.length) {
            ToastService.showErrorToast(
                `Insufficient balance ${insufficientBalanceTokens
                    .map(({ code }) => code)
                    .join(' ')}`,
            );
            return;
        }

        if (account.authType === LoginTypes.walletConnect) {
            openCurrentWalletIfExist();
        }

        setPending(true);

        SorobanService.amm
            .getCreateAndDepositStablePoolTx(
                account.accountId(),
                selectedAssets,
                Number(stableFee),
                createInfo,
                regularDepositFormData.amounts,
            )
            .then(({ tx, poolAddress }) => signAndSubmitCreation(tx, poolAddress))
            .catch(e => {
                ToastService.showErrorToast(e.message ?? e.toString());
                setPending(false);
            });
    };

    const createConstantPool = () => {
        if (!account || !createInfo || !regularDepositFormData || !firstAsset || !secondAsset) {
            return;
        }

        if (
            createInfo &&
            Number(account.getAssetBalance(createInfo.token)) < Number(createInfo.constantFee)
        ) {
            ToastService.showErrorToast(
                `You need at least ${createInfo.constantFee} ${createInfo.token.code} to create pool`,
            );
            return;
        }

        const insufficientBalanceTokens = getInsufficientBalanceTokens(
            [firstAsset, secondAsset],
            regularDepositFormData.balances,
            regularDepositFormData.amounts,
        );

        if (insufficientBalanceTokens.length) {
            ToastService.showErrorToast(
                `Insufficient balance ${insufficientBalanceTokens
                    .map(({ code }) => code)
                    .join(' ')}`,
            );
            return;
        }

        if (account.authType === LoginTypes.walletConnect) {
            openCurrentWalletIfExist();
        }
        setPending(true);
        SorobanService.amm
            .getCreateAndDepositConstantPoolTx(
                account.accountId(),
                firstAsset,
                secondAsset,
                constantFee,
                createInfo,
                regularDepositFormData.amounts,
            )
            .then(({ tx, poolAddress }) => signAndSubmitCreation(tx, poolAddress))
            .catch(e => {
                ToastService.showErrorToast(e.message ?? e.toString());
                setPending(false);
            });
    };

    const createConcentratedPool = () => {
        if (
            !account ||
            !createInfo ||
            !concentratedDepositFormData ||
            !firstAsset ||
            !secondAsset ||
            concentratedDepositFormData.tickLower === null ||
            concentratedDepositFormData.tickUpper === null
        ) {
            return;
        }

        if (
            createInfo &&
            Number(account.getAssetBalance(createInfo.token)) < Number(createInfo.concentratedFee)
        ) {
            ToastService.showErrorToast(
                `You need at least ${createInfo.concentratedFee} ${createInfo.token.code} to create pool`,
            );
            return;
        }

        const [baseToken, counterToken] = orderedConcentratedAssets;
        const desiredAmounts = new Map([
            [baseToken.contract, concentratedDepositFormData.amount0 || '0'],
            [counterToken.contract, concentratedDepositFormData.amount1 || '0'],
        ]);
        const insufficientBalanceTokens = getInsufficientBalanceTokens(
            [baseToken, counterToken],
            concentratedDepositFormData.tokenBalances,
            desiredAmounts,
        );

        if (insufficientBalanceTokens.length) {
            ToastService.showErrorToast(
                `Insufficient balance ${insufficientBalanceTokens
                    .map(({ code }) => code)
                    .join(' ')}`,
            );
            return;
        }

        if (account.authType === LoginTypes.walletConnect) {
            openCurrentWalletIfExist();
        }
        setPending(true);
        SorobanService.amm
            .getCreateAndDepositConcentratedPoolTx(
                account.accountId(),
                baseToken,
                counterToken,
                constantFee,
                createInfo,
                concentratedDepositFormData.tickLower,
                concentratedDepositFormData.tickUpper,
                desiredAmounts,
            )
            .then(({ tx, poolAddress }) => signAndSubmitCreation(tx, poolAddress))
            .catch(e => {
                ToastService.showErrorToast(e.message ?? e.toString());
                setPending(false);
            });
    };

    const createPool = () => {
        if (type === POOL_TYPE.stable) {
            return createStablePool();
        }
        if (type === POOL_TYPE.concentrated) {
            return createConcentratedPool();
        }
        createConstantPool();
    };

    const onStableFeeChane = (value: string) => {
        if (Number.isNaN(Number(value))) {
            return;
        }
        const [integerPart, fractionalPart] = value.split('.');

        const roundedValue =
            fractionalPart && fractionalPart.length > 2
                ? `${integerPart}.${fractionalPart.slice(0, 2)}`
                : value;

        setStableFee(roundedValue);
    };

    if (!createInfo) {
        return <PageLoader />;
    }

    return (
        <PageContainer>
            <FormPageHeaderWrap>
                <FormPageContentWrap>
                    <FormBackButton label="Pools" to={AppRoutes.section.amm.link.index}>
                        <ArrowLeft />
                    </FormBackButton>

                    <FormPageHeaderTitle>Create Pool</FormPageHeaderTitle>
                </FormPageContentWrap>
            </FormPageHeaderWrap>
            <FormWrap>
                <FormPageContentWrap>
                    <StyledForm
                        onSubmit={(event: React.SyntheticEvent<HTMLFormElement>) => {
                            event.preventDefault();
                            event.stopPropagation();
                        }}
                    >
                        <StyledFormSection>
                            <FormSectionTitle>Select pool type</FormSectionTitle>
                            <PoolType
                                $isActive={type === POOL_TYPE.constant}
                                onClick={() => setType(POOL_TYPE.constant)}
                            >
                                <div>
                                    <h3>Volatile</h3>
                                    <p>
                                        Simple model for general purpose AMM pools (constant product
                                        pool).
                                    </p>
                                </div>
                                <Tick />
                            </PoolType>
                            <PoolType
                                $isActive={type === POOL_TYPE.stable}
                                onClick={() => setType(POOL_TYPE.stable)}
                            >
                                <div>
                                    <h3>Stable</h3>
                                    <p>
                                        Highly efficient AMM model for correlated assets (e.g.,
                                        stablecoins) with lower slippage.
                                    </p>
                                </div>
                                <Tick />
                            </PoolType>
                            <PoolType
                                $isActive={type === POOL_TYPE.concentrated}
                                onClick={() => setType(POOL_TYPE.concentrated)}
                            >
                                <div>
                                    <h3>Concentrated</h3>
                                    <p>
                                        Concentrated liquidity model with custom tick ranges and
                                        better capital efficiency.
                                    </p>
                                </div>
                                <Tick />
                            </PoolType>
                            {type === POOL_TYPE.stable && (
                                <Alert
                                    title="Note:"
                                    text="Stable pools are for assets with a 1:1 price ratio (e.g., USDC/USDT). Avoid using them for volatile assets."
                                />
                            )}
                        </StyledFormSection>

                        <StyledFormSection>
                            <FormSectionTitle>Select tokens for pool</FormSectionTitle>
                            {type === POOL_TYPE.concentrated && (
                                <Alert
                                    title="Rebasing yield is not supported"
                                    text="You can create a concentrated pool with rebasing tokens, but any balance growth or yield accrual will not be reflected inside concentrated positions."
                                />
                            )}
                            <StyledAssetDropdown
                                label="First asset"
                                asset={firstAsset}
                                onUpdate={setFirstAsset}
                                excludeList={[secondAsset, thirdAsset, fourthAsset].filter(
                                    asset => asset !== null,
                                )}
                                pending={firstAsset && firstAssetStatus === null}
                                withCustomTokens
                            />
                            {firstAssetStatus === CONTRACT_STATUS.NOT_FOUND && (
                                <ContractNotFound
                                    asset={firstAsset}
                                    onSuccess={() => setFirstAssetStatus(CONTRACT_STATUS.ACTIVE)}
                                />
                            )}
                            <StyledAssetDropdown
                                label="Second asset"
                                asset={secondAsset}
                                onUpdate={setSecondAsset}
                                excludeList={[firstAsset, thirdAsset, fourthAsset].filter(
                                    asset => asset !== null,
                                )}
                                withCustomTokens
                            />
                            {secondAssetStatus === CONTRACT_STATUS.NOT_FOUND && (
                                <ContractNotFound
                                    asset={secondAsset}
                                    onSuccess={() => setSecondAssetStatus(CONTRACT_STATUS.ACTIVE)}
                                />
                            )}
                            {assetsCount >= 3 && (
                                <DropdownContainer>
                                    {assetsCount === 3 && (
                                        <RemoveButton
                                            onClick={() => {
                                                setAssetsCount(2);
                                                setThirdAsset(null);
                                            }}
                                        >
                                            Remove
                                        </RemoveButton>
                                    )}
                                    <StyledAssetDropdown
                                        label="Third asset"
                                        asset={thirdAsset}
                                        onUpdate={setThirdAsset}
                                        excludeList={[firstAsset, secondAsset, fourthAsset].filter(
                                            asset => asset !== null,
                                        )}
                                        withCustomTokens
                                    />
                                    {thirdAssetStatus === CONTRACT_STATUS.NOT_FOUND && (
                                        <ContractNotFound
                                            asset={thirdAsset}
                                            onSuccess={() =>
                                                setThirdAssetStatus(CONTRACT_STATUS.ACTIVE)
                                            }
                                        />
                                    )}
                                </DropdownContainer>
                            )}
                            {assetsCount >= 4 && (
                                <DropdownContainer>
                                    <RemoveButton
                                        onClick={() => {
                                            setAssetsCount(3);
                                            setFourthAsset(null);
                                        }}
                                    >
                                        Remove
                                    </RemoveButton>
                                    <StyledAssetDropdown
                                        label="Fourth asset"
                                        asset={fourthAsset}
                                        onUpdate={setFourthAsset}
                                        excludeList={[firstAsset, secondAsset, thirdAsset].filter(
                                            asset => asset !== null,
                                        )}
                                        withCustomTokens
                                    />
                                    {fourthAssetStatus === CONTRACT_STATUS.NOT_FOUND && (
                                        <ContractNotFound
                                            asset={fourthAsset}
                                            onSuccess={() =>
                                                setFourthAssetStatus(CONTRACT_STATUS.ACTIVE)
                                            }
                                        />
                                    )}
                                </DropdownContainer>
                            )}
                            {type === POOL_TYPE.stable && assetsCount < 4 && (
                                <TooltipStyled
                                    isShow={assetsCount === 3}
                                    showOnHover
                                    content={
                                        <TooltipInner>
                                            Creating pools with 4 assets is temporarily disabled
                                        </TooltipInner>
                                    }
                                    position={TOOLTIP_POSITION.right}
                                    background={COLORS.red500}
                                >
                                    <AddRowButton
                                        secondary
                                        isPurpleText
                                        disabled={assetsCount === 3}
                                        onClick={() => setAssetsCount(count => count + 1)}
                                    >
                                        Add {assetsCount === 2 ? 'third' : 'fourth'} asset
                                    </AddRowButton>
                                </TooltipStyled>
                            )}
                        </StyledFormSection>
                        <StyledFormSection>
                            <FormSectionTitle>Pool swap fees</FormSectionTitle>
                            <FormSectionDescriptionStyled>
                                Pool fees are paid by users swapping assets and distributed to
                                liquidity providers.
                            </FormSectionDescriptionStyled>
                            {type === POOL_TYPE.stable ? (
                                <FormRow>
                                    <InputStyled
                                        label={
                                            <ErrorLabel $isError={isStableFeeInputError}>
                                                {isStableFeeInputError
                                                    ? `Fee should be in range ${STABLE_POOL_FEE_PERCENTS.min}% - ${STABLE_POOL_FEE_PERCENTS.max}%`
                                                    : `Swap Fee (${STABLE_POOL_FEE_PERCENTS.min}% - ${STABLE_POOL_FEE_PERCENTS.max}%)`}
                                            </ErrorLabel>
                                        }
                                        placeholder={STABLE_POOL_FEE_PERCENTS.min}
                                        value={stableFee}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                            onStableFeeChane(e.target.value)
                                        }
                                        inputMode="decimal"
                                    />
                                </FormRow>
                            ) : (
                                <FormRow>
                                    <ToggleGroupStyled
                                        value={constantFee}
                                        options={FEE_OPTIONS}
                                        onChange={setConstantFee}
                                    />
                                </FormRow>
                            )}
                        </StyledFormSection>

                        {isPoolConfigurationValid && createPoolPreview && (
                            <StyledFormSection>
                                <FormSectionTitle>Initial deposit</FormSectionTitle>
                                <FormSectionDescriptionStyled>
                                    Initial deposit is required. Pool creation and first deposit
                                    will be executed in a single batch transaction.
                                </FormSectionDescriptionStyled>
                                <Alert
                                    title="Required step"
                                    text="You cannot create a pool without funding it in the same transaction."
                                />
                                {type === POOL_TYPE.concentrated ? (
                                    <ConcentratedAddLiquidityForm
                                        pool={createPoolPreview}
                                        onDataChange={setConcentratedDepositFormData}
                                        initialTickSpacing={
                                            CONCENTRATED_TICK_SPACING_BY_FEE[constantFee]
                                        }
                                        skipPoolDataLoading
                                        disableNetworkEstimate
                                    />
                                ) : (
                                    <AddLiquidityForm
                                        pool={createPoolPreview}
                                        onDataChange={setRegularDepositFormData}
                                        showPoolSummaryRows={false}
                                        showPoolInfo={false}
                                        withPoolInfoCardSpacing={false}
                                    />
                                )}
                            </StyledFormSection>
                        )}

                        <StyledFormSection>
                            <FormSectionTitle>Pool creation fee</FormSectionTitle>
                            <FormSectionDescriptionStyled>
                                A pool creation fee helps prevent abuse and spam. Creating a pool
                                provides no direct benefit to the creator.
                            </FormSectionDescriptionStyled>
                            <CreationFee>
                                <CreationFeeCost>
                                    <AssetLogo asset={createInfo.token} isCircle={false} />
                                    <span>
                                        {formatBalance(
                                            Number(
                                                type === POOL_TYPE.stable
                                                    ? createInfo.stableFee
                                                    : type === POOL_TYPE.concentrated
                                                      ? createInfo.concentratedFee
                                                      : createInfo.constantFee,
                                            ),
                                        )}{' '}
                                        {createInfo.token.code}
                                    </span>
                                </CreationFeeCost>
                                <StyledCheckbox
                                    checked={agreeWithFee}
                                    onChange={setAgreeWithFee}
                                    label="I acknowledge the fee"
                                />
                            </CreationFee>
                            <Button
                                isBig
                                fullWidth
                                onClick={() => createPool()}
                                pending={pending}
                                disabled={
                                    !account ||
                                    !agreeWithFee ||
                                    !firstAsset ||
                                    !secondAsset ||
                                    (assetsCount > 2 && !thirdAsset) ||
                                    (assetsCount === 4 && !fourthAsset) ||
                                    [
                                        firstAssetStatus,
                                        secondAssetStatus,
                                        thirdAssetStatus,
                                        fourthAssetStatus,
                                    ].some(status => status === CONTRACT_STATUS.NOT_FOUND) ||
                                    isStableFeeInputError ||
                                    (type === POOL_TYPE.stable && !stableFee) ||
                                    Boolean(existingPools.length) ||
                                    !hasValidInitialDeposit
                                }
                            >
                                Create pool and deposit
                            </Button>
                        </StyledFormSection>
                    </StyledForm>
                    {Boolean(existingPools.length) && (
                        <StyledForm ref={existingPoolsRef}>
                            <StyledFormSection>
                                <FormSectionTitle>Existing pools</FormSectionTitle>
                                <FormDescription>
                                    {type === POOL_TYPE.constant
                                        ? 'Volatile'
                                        : type === POOL_TYPE.stable
                                          ? 'Stable'
                                          : 'Concentrated'}{' '}
                                    pool{' '}
                                    {existingPools[0].tokens.map(({ code }) => code).join(' / ')}{' '}
                                    with fee = {(Number(existingPools[0].fee) * 100).toFixed(2)}%
                                    already exists.
                                </FormDescription>
                                <PoolsList pools={existingPools} onUpdate={() => {}} />
                            </StyledFormSection>
                        </StyledForm>
                    )}
                </FormPageContentWrap>
            </FormWrap>
        </PageContainer>
    );
};

export default CreatePool;
