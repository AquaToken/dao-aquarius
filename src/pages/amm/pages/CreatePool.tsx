import { xdr } from '@stellar/stellar-sdk';
import * as React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';

import { FilterOptions, getPools, PoolsSortFields } from 'api/amm';

import { AmmRoutes } from 'constants/routes';

import { formatBalance } from 'helpers/format-number';
import { openCurrentWalletIfExist } from 'helpers/wallet-connect-helpers';

import { LoginTypes } from 'store/authStore/types';
import useAuthStore from 'store/authStore/useAuthStore';

import { SorobanService, ToastService } from 'services/globalServices';
import { CONTRACT_STATUS, POOL_TYPE } from 'services/soroban.service';
import { BuildSignAndSubmitStatuses } from 'services/wallet-connect.service';

import { PoolProcessed } from 'types/amm';
import { Transaction } from 'types/stellar';

import { flexRowSpaceBetween, respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import ArrowLeft from 'assets/icon-arrow-left.svg';
import Tick from 'assets/icon-tick-white.svg';

import Alert from 'basics/Alert';
import AssetDropdown from 'basics/AssetDropdown';
import AssetLogo from 'basics/AssetLogo';
import Button from 'basics/buttons/Button';
import CircleButton from 'basics/buttons/CircleButton';
import Checkbox from 'basics/inputs/Checkbox';
import Input from 'basics/inputs/Input';
import ToggleGroup from 'basics/inputs/ToggleGroup';
import PageLoader from 'basics/loaders/PageLoader';
import Tooltip, { TOOLTIP_POSITION } from 'basics/Tooltip';

import {
    Back,
    Background,
    Content,
    Form,
    FormSection,
    FormSectionDescription,
    FormSectionTitle,
    FormWrap,
    MainBlock,
    Title,
} from '../../bribes/pages/AddBribePage';
import ContractNotFound from '../components/ContractNotFound/ContractNotFound';
import PoolsList from '../components/PoolsList/PoolsList';

const ErrorLabel = styled.span<{ $isError?: boolean }>`
    color: ${({ $isError }) => ($isError ? COLORS.pinkRed : COLORS.paragraphText)};
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
    color: ${COLORS.grayText};
`;

const PoolType = styled.div<{ $isActive?: boolean }>`
    ${flexRowSpaceBetween};
    cursor: pointer;
    width: 100%;
    padding: 3.7rem 3.2rem;
    border-radius: 1rem;
    background-color: ${({ $isActive }) => ($isActive ? COLORS.purple : COLORS.lightGray)};
    color: ${({ $isActive }) => ($isActive ? COLORS.white : COLORS.paragraphText)};

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
    color: ${COLORS.pinkRed};
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
    background-color: ${COLORS.lightGray};
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
    const [createInfo, setCreateInfo] = useState(null);

    const [agreeWithFee, setAgreeWithFee] = useState(false);

    const [pools, setPools] = useState<PoolProcessed[] | null>(null);

    const { account } = useAuthStore();

    const history = useHistory();

    const isStableFeeInputError =
        stableFee &&
        (Number(stableFee) < Number(STABLE_POOL_FEE_PERCENTS.min) ||
            Number(stableFee) > Number(STABLE_POOL_FEE_PERCENTS.max));

    useEffect(() => {
        if (type === POOL_TYPE.constant) {
            setAssetsCount(2);
            setThirdAsset(null);
            setFourthAsset(null);
        }
    }, [type]);

    useEffect(() => {
        SorobanService.getCreationFeeInfo().then(res => {
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
                    asset =>
                        !!pool.assets.find(
                            poolAsset =>
                                poolAsset.code === asset.code && poolAsset.issuer === asset.issuer,
                        ),
                ) &&
                selectedAssets.length === pool.assets.length &&
                type === pool.pool_type &&
                +(type === POOL_TYPE.constant ? constantFee / 100 : stableFee) ===
                    +(Number(pool.fee) * 100).toFixed(2),
        );
    }, [pools, firstAsset, secondAsset, thirdAsset, fourthAsset, type, stableFee, constantFee]);

    useEffect(() => {
        if (!firstAsset) {
            setFirstAssetStatus(null);
            return;
        }
        SorobanService.getContractData(SorobanService.getAssetContractId(firstAsset)).then(
            ({ status }) => {
                setFirstAssetStatus(status);
            },
        );
    }, [firstAsset]);

    useEffect(() => {
        if (!secondAsset) {
            setSecondAssetStatus(null);
            return;
        }
        SorobanService.getContractData(SorobanService.getAssetContractId(secondAsset)).then(
            ({ status }) => {
                setSecondAssetStatus(status);
            },
        );
    }, [secondAsset]);

    useEffect(() => {
        if (!thirdAsset) {
            setThirdAssetStatus(null);
            return;
        }
        SorobanService.getContractData(SorobanService.getAssetContractId(thirdAsset)).then(
            ({ status }) => {
                setThirdAssetStatus(status);
            },
        );
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
        SorobanService.getContractData(SorobanService.getAssetContractId(fourthAsset)).then(
            ({ status }) => {
                setFourthAssetStatus(status);
            },
        );
    }, [fourthAsset]);

    const signAndSubmitCreation = (tx: Transaction) =>
        account
            .signAndSubmitTx(tx, true)
            .then(
                (res: {
                    status?: BuildSignAndSubmitStatuses;
                    value: () => {
                        value: () => { value: () => { toString: (format: string) => string } };
                    }[];
                }) => {
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
                    const poolAddress = SorobanService.scValToNative(res.value()[1] as xdr.ScVal);
                    ToastService.showSuccessToast('Pool successfully created');
                    history.push(`${AmmRoutes.analytics}${poolAddress}`);
                },
            )
            .catch(() => {
                setPending(false);
            });

    const createStablePool = () => {
        if (
            createInfo &&
            Number(account.getAssetBalance(createInfo.token)) < Number(createInfo.stableFee)
        ) {
            ToastService.showErrorToast(
                `You need at least ${createInfo.stableFee} ${createInfo.token.code} to create pool`,
            );
            return;
        }

        if (account.authType === LoginTypes.walletConnect) {
            openCurrentWalletIfExist();
        }

        setPending(true);

        SorobanService.getInitStableSwapPoolTx(
            account.accountId(),
            [firstAsset, secondAsset, thirdAsset, fourthAsset].filter(asset => asset !== null),
            Number(stableFee),
            createInfo,
        )
            .then(tx => signAndSubmitCreation(tx))
            .catch(e => {
                ToastService.showErrorToast(e.message ?? e.toString());
                setPending(false);
            });
    };

    const createConstantPool = () => {
        if (
            createInfo &&
            Number(account.getAssetBalance(createInfo.token)) < Number(createInfo.constantFee)
        ) {
            ToastService.showErrorToast(
                `You need at least ${createInfo.constantFee} ${createInfo.token.code} to create pool`,
            );
            return;
        }
        if (account.authType === LoginTypes.walletConnect) {
            openCurrentWalletIfExist();
        }
        setPending(true);
        SorobanService.getInitConstantPoolTx(
            account.accountId(),
            firstAsset,
            secondAsset,
            constantFee,
            createInfo,
        )
            .then(tx => signAndSubmitCreation(tx))
            .catch(e => {
                ToastService.showErrorToast(e.message ?? e.toString());
                setPending(false);
            });
    };

    const createPool = () => {
        if (type === POOL_TYPE.stable) {
            return createStablePool();
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
        <MainBlock>
            <Background>
                <Content>
                    <Back to={AmmRoutes.analytics}>
                        <CircleButton label="Pools">
                            <ArrowLeft />
                        </CircleButton>
                    </Back>
                    <Title>Create Pool</Title>
                </Content>
            </Background>
            <FormWrap>
                <Content>
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
                            {type === POOL_TYPE.stable && (
                                <Alert
                                    title="Note:"
                                    text="Stable pools are for assets with a 1:1 price ratio (e.g., USDC/USDT). Avoid using them for volatile assets."
                                />
                            )}
                        </StyledFormSection>

                        <StyledFormSection>
                            <FormSectionTitle>Select tokens for pool</FormSectionTitle>
                            <StyledAssetDropdown
                                label="First asset"
                                asset={firstAsset}
                                onUpdate={setFirstAsset}
                                excludeList={[secondAsset, thirdAsset, fourthAsset].filter(
                                    asset => asset !== null,
                                )}
                                pending={firstAsset && firstAssetStatus === null}
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
                                    background={COLORS.pinkRed}
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
                                            type === POOL_TYPE.stable
                                                ? createInfo.stableFee
                                                : createInfo.constantFee,
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
                                    !stableFee ||
                                    Boolean(existingPools.length)
                                }
                            >
                                Create pool
                            </Button>
                        </StyledFormSection>
                    </StyledForm>
                    {Boolean(existingPools.length) && (
                        <StyledForm ref={existingPoolsRef}>
                            <StyledFormSection>
                                <FormSectionTitle>Existing pools</FormSectionTitle>
                                <FormDescription>
                                    {type === POOL_TYPE.constant ? 'Volatile' : 'Stable'} pool{' '}
                                    {existingPools[0].assets.map(({ code }) => code).join(' / ')}{' '}
                                    with fee = {(Number(existingPools[0].fee) * 100).toFixed(2)}%
                                    already exists.
                                </FormDescription>
                                <PoolsList pools={existingPools} onUpdate={() => {}} />
                            </StyledFormSection>
                        </StyledForm>
                    )}
                </Content>
            </FormWrap>
        </MainBlock>
    );
};

export default CreatePool;
