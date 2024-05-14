import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { flexRowSpaceBetween } from '../../../common/mixins';
import { COLORS } from '../../../common/styles';
import { AmmRoutes } from '../../../routes';
import ArrowLeft from '../../../common/assets/img/icon-arrow-left.svg';
import Tick from '../../../common/assets/img/icon-tick-white.svg';
import {
    Back,
    BackButton,
    Background,
    Content,
    Form,
    FormSection,
    FormSectionTitle,
    FormWrap,
    MainBlock,
    Title,
} from '../../bribes/pages/AddBribePage';
import AssetDropdown from '../../vote/components/AssetDropdown/AssetDropdown';
import { SorobanService, ToastService } from '../../../common/services/globalServices';
import Button from '../../../common/basics/Button';
import Input from '../../../common/basics/Input';
import ToggleGroup from '../../../common/basics/ToggleGroup';
import useAuthStore from '../../../store/authStore/useAuthStore';
import { CONTRACT_STATUS } from '../../../common/services/soroban.service';
import PoolsList from '../components/PoolsList/PoolsList';
import { FilterOptions, getPools } from '../api/api';
import { useHistory } from 'react-router-dom';

const StyledForm = styled(Form)`
    padding: 0 4.8rem;
    margin-bottom: 5rem;
`;

const StyledFormSection = styled(FormSection)`
    padding: 4.8rem 0;

    &:last-child {
        border-bottom: none;
    }
`;

const FormDescription = styled.span`
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.grayText};
`;

const PoolType = styled.div<{ isActive?: boolean }>`
    ${flexRowSpaceBetween};
    cursor: pointer;
    width: 100%;
    padding: 3.7rem 3.2rem;
    border-radius: 1rem;
    background-color: ${({ isActive }) => (isActive ? COLORS.purple : COLORS.lightGray)};
    color: ${({ isActive }) => (isActive ? COLORS.white : COLORS.paragraphText)};

    svg {
        display: ${({ isActive }) => (isActive ? 'block' : 'none')};
    }

    &:first-of-type {
        margin-top: 5.8rem;
    }
`;

const DropdownContainer = styled.div`
    display: flex;
    position: relative;
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
    margin-top: 3.7rem;
    margin-bottom: 5.8rem;
`;

const AddRowButton = styled(Button)`
    margin-top: 3.7rem;
    width: fit-content;
`;

enum PoolTypes {
    stable = 'stable',
    constant = 'constant',
}

const FEE_OPTIONS = [
    { value: 10, label: '0.1%' },
    { value: 30, label: '0.3%' },
    { value: 100, label: '1%' },
];

const CreatePool = ({ balances }) => {
    const [type, setType] = useState(PoolTypes.stable);
    const [assetsCount, setAssetsCount] = useState(2);
    const [firstAsset, setFirstAsset] = useState(null);
    const [secondAsset, setSecondAsset] = useState(null);
    const [thirdAsset, setThirdAsset] = useState(null);
    const [fourthAsset, setFourthAsset] = useState(null);
    const [constantFee, setConstantFee] = useState(10);
    const [stableFee, setStableFee] = useState('0.06');
    const [a, setA] = useState('85');
    const [pending, setPending] = useState(false);

    const [pools, setPools] = useState(null);

    const { account } = useAuthStore();

    const history = useHistory();

    useEffect(() => {
        if (type === PoolTypes.constant) {
            setAssetsCount(2);
            setThirdAsset(null);
            setFourthAsset(null);
        }
    }, [type]);

    const assets = useMemo(() => {
        return balances
            ?.filter(({ status }) => status === CONTRACT_STATUS.ACTIVE)
            .map(({ asset }) => asset);
    }, [balances]);

    useEffect(() => {
        getPools(FilterOptions.all, 1, 1000).then((res) => setPools(res[0]));
    }, []);

    const existingPools = useMemo(() => {
        console.log(pools);
        if (!pools || !firstAsset || !secondAsset) {
            return [];
        }
        const selectedAssets = [firstAsset, secondAsset, thirdAsset, fourthAsset].filter(
            (asset) => asset !== null,
        );

        return pools.filter((pool) =>
            selectedAssets.every(
                (asset) =>
                    !!pool.assets.find(
                        (poolAsset) =>
                            poolAsset.code === asset.code && poolAsset.issuer === asset.issuer,
                    ),
            ),
        );
    }, [pools, firstAsset, secondAsset, thirdAsset, fourthAsset]);

    const createPool = () => {
        if (type === PoolTypes.stable) {
            return createStablePool();
        }
        createConstantPool();
    };

    const createStablePool = () => {
        if (!Number(a) || Number(a) < 1 || Number(a) > 5000) {
            ToastService.showErrorToast('Incorrect A value');
        }

        if (!Number(stableFee) || Number(stableFee) < 0.04 || Number(stableFee) > 1) {
            ToastService.showErrorToast('Incorrect Fee value');
        }

        setPending(true);

        SorobanService.getInitStableSwapPoolTx(
            account.accountId(),
            [firstAsset, secondAsset, thirdAsset, fourthAsset].filter((asset) => asset !== null),
            Number(a),
            Number(stableFee),
        )
            .then((tx) => {
                return account.signAndSubmitTx(tx).then((res) => {
                    const poolAddress = SorobanService.getContactIdFromHash(
                        res.value()[1].value().value().toString('hex'),
                    );
                    ToastService.showSuccessToast('Pool successfully created');
                    history.push(`${AmmRoutes.analytics}${poolAddress}`);
                });
            })
            .catch(() => {
                ToastService.showErrorToast('Something went wrong');
                setPending(false);
            });
    };

    const createConstantPool = () => {
        setPending(true);
        SorobanService.getInitConstantPoolTx(
            account.accountId(),
            firstAsset,
            secondAsset,
            constantFee,
        ).then((tx) =>
            account.signAndSubmitTx(tx).then((res) => {
                const poolAddress = SorobanService.getContactIdFromHash(
                    res.value()[1].value().value().toString('hex'),
                );
                ToastService.showSuccessToast('Pool successfully created');
                history.push(`${AmmRoutes.analytics}${poolAddress}`);
            }),
        );
    };

    return (
        <MainBlock>
            <Background>
                <Content>
                    <Back to={AmmRoutes.analytics}>
                        <BackButton>
                            <ArrowLeft />
                        </BackButton>
                        <span>Pools</span>
                    </Back>
                    <Title>Create Pool</Title>
                </Content>
            </Background>
            <FormWrap>
                <Content>
                    <StyledForm
                        onSubmit={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                        }}
                    >
                        <StyledFormSection>
                            <FormSectionTitle>Select pool type</FormSectionTitle>
                            <PoolType
                                isActive={type === PoolTypes.stable}
                                onClick={() => setType(PoolTypes.stable)}
                            >
                                Stable swap <Tick />
                            </PoolType>
                            <PoolType
                                isActive={type === PoolTypes.constant}
                                onClick={() => setType(PoolTypes.constant)}
                            >
                                Constant product
                                <Tick />
                            </PoolType>
                        </StyledFormSection>
                        <StyledFormSection>
                            <FormSectionTitle>Tokens in pool</FormSectionTitle>
                            <StyledAssetDropdown
                                label="First asset"
                                asset={firstAsset}
                                assetsList={assets}
                                onUpdate={setFirstAsset}
                                excludeList={[secondAsset, thirdAsset, fourthAsset].filter(
                                    (asset) => asset !== null,
                                )}
                            />
                            <StyledAssetDropdown
                                label="Second asset"
                                asset={secondAsset}
                                assetsList={assets}
                                onUpdate={setSecondAsset}
                                excludeList={[firstAsset, thirdAsset, fourthAsset].filter(
                                    (asset) => asset !== null,
                                )}
                            />
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
                                        assetsList={assets}
                                        onUpdate={setThirdAsset}
                                        excludeList={[firstAsset, secondAsset, fourthAsset].filter(
                                            (asset) => asset !== null,
                                        )}
                                    />
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
                                        assetsList={assets}
                                        onUpdate={setFourthAsset}
                                        excludeList={[firstAsset, secondAsset, thirdAsset].filter(
                                            (asset) => asset !== null,
                                        )}
                                    />
                                </DropdownContainer>
                            )}
                            {type === PoolTypes.stable && assetsCount < 4 && (
                                <AddRowButton
                                    likeDisabled
                                    isPurpleText
                                    onClick={() => setAssetsCount((count) => count + 1)}
                                >
                                    Add {assetsCount === 2 ? 'third' : 'fourth'} asset
                                </AddRowButton>
                            )}
                        </StyledFormSection>
                        <StyledFormSection>
                            <FormSectionTitle>Fees</FormSectionTitle>
                            {type === PoolTypes.stable ? (
                                <FormRow>
                                    <Input
                                        label="Swap Fee (0.04 - 1%)"
                                        value={stableFee}
                                        onChange={(e) => setStableFee(e.target.value)}
                                    />
                                    <Input
                                        label="A (1-5000)"
                                        value={a}
                                        onChange={(e) => setA(e.target.value)}
                                    />
                                </FormRow>
                            ) : (
                                <FormRow>
                                    <ToggleGroup
                                        value={constantFee}
                                        options={FEE_OPTIONS}
                                        onChange={setConstantFee}
                                    />
                                </FormRow>
                            )}
                            <Button
                                isBig
                                fullWidth
                                onClick={() => createPool()}
                                pending={pending}
                                disabled={
                                    !firstAsset ||
                                    !secondAsset ||
                                    (assetsCount > 2 && !thirdAsset) ||
                                    (assetsCount === 4 && !fourthAsset)
                                }
                            >
                                Create pool
                            </Button>
                        </StyledFormSection>
                    </StyledForm>
                    {Boolean(existingPools.length) && (
                        <StyledForm>
                            <StyledFormSection>
                                <FormSectionTitle>Existing pools</FormSectionTitle>
                                <FormDescription>
                                    There are already pools with similar parameters, you can join
                                    one of them
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
