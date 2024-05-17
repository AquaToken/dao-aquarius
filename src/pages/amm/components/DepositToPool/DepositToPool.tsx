import * as React from 'react';
import styled from 'styled-components';
import { Breakpoints, COLORS } from '../../../../common/styles';
import { customScroll, flexRowSpaceBetween, respondDown } from '../../../../common/mixins';
import { ModalTitle } from '../../../../common/modals/atoms/ModalAtoms';
import Input from '../../../../common/basics/Input';
import Asset from '../../../vote/components/AssetDropdown/Asset';
import { useEffect, useState } from 'react';
import {
    ModalService,
    SorobanService,
    ToastService,
} from '../../../../common/services/globalServices';
import Button from '../../../../common/basics/Button';
import useAuthStore from '../../../../store/authStore/useAuthStore';
import SuccessModal from '../SuccessModal/SuccessModal';
import { formatBalance } from '../../../../common/helpers/helpers';
import Pair from '../../../vote/components/common/Pair';
import DotsLoader from '../../../../common/basics/DotsLoader';
import { getAssetString } from '../../../../store/assetsStore/actions';

const Container = styled.div`
    width: 52.3rem;
    max-height: 80vh;
    overflow: auto;

    ${customScroll};

    ${respondDown(Breakpoints.md)`
        width: 100%;
        max-height: 100vh;
    `}

    Button {
        width: fit-content;
        margin-left: auto;
    }
`;

const Form = styled.div`
    display: flex;
    flex-direction: column;
    margin-top: 3rem;
`;

const FormRow = styled.div`
    display: flex;
    margin: 3rem 0;
    position: relative;
`;

const DescriptionRow = styled.div`
    ${flexRowSpaceBetween};
    margin-bottom: 1.6rem;
    color: ${COLORS.grayText};

    span:last-child {
        color: ${COLORS.paragraphText};
    }
`;

const Balance = styled.div`
    position: absolute;
    bottom: calc(100% + 1.2rem);
    right: 0;
    font-size: 1.6rem;
    line-height: 1.8rem;
    color: ${COLORS.paragraphText};
`;

const BalanceClickable = styled.span`
    color: ${COLORS.purple};
    cursor: pointer;
`;

const PoolInfo = styled.div`
    display: flex;
    flex-direction: column;
    background-color: ${COLORS.lightGray};
    border-radius: 0.6rem;
    padding: 2.4rem;
    margin-bottom: 4.8rem;
`;

const PairWrap = styled.div`
    margin: 2.2rem 0;
`;

const DepositToPool = ({ params }) => {
    const { account } = useAuthStore();
    const { pool } = params;

    const [amounts, setAmounts] = useState(
        new Map<string, string>(pool.assets.map((asset) => [getAssetString(asset), ''])),
    );
    const [pending, setPending] = useState(false);
    const [reserves, setReserves] = useState(null);
    const [shares, setShares] = useState(null);

    useEffect(() => {
        SorobanService.getPoolReserves(pool.assets, pool.address).then((res) => {
            setReserves(res);
        });
    }, []);

    useEffect(() => {
        SorobanService.getTotalShares(pool.address).then((res) => {
            setShares(res);
        });
    }, []);

    const onSubmit = () => {
        const insufficientBalanceTokens = pool.assets.filter(
            (asset) => account.getAssetBalance(asset) < +amounts.get(getAssetString(asset)),
        );
        if (!!insufficientBalanceTokens.length) {
            ToastService.showErrorToast(
                `Insufficient balance ${insufficientBalanceTokens
                    .map(({ code }) => code)
                    .join(' ')}`,
            );
            return;
        }
        setPending(true);
        SorobanService.getDepositTx(account?.accountId(), pool.index, pool.assets, amounts)
            .then((tx) => account.signAndSubmitTx(tx, true))
            .then((res) => {
                setPending(false);

                const resultAmounts = res.value()[0].value();

                ModalService.confirmAllModals();

                ModalService.openModal(SuccessModal, {
                    assets: pool.assets,
                    amounts: resultAmounts.map((value) => SorobanService.i128ToInt(value.value())),
                    title: 'Deposit Successful',
                });
            })
            .catch((e) => {
                console.log(e);
                ToastService.showErrorToast('Oops! Something went wrong');
                setPending(false);
            });
    };

    console.log(pool);

    const onChangeInput = (asset, value) => {
        if (Number.isNaN(Number(value))) {
            return;
        }
        setAmounts(new Map(amounts.set(getAssetString(asset), value)));

        // empty pool
        if (reserves.get(getAssetString(asset)) === 0) {
            return;
        }

        pool.assets
            .filter((token) => getAssetString(token) !== getAssetString(asset))
            .forEach((token) => {
                const newAmount = (
                    (Number(value) * reserves.get(getAssetString(token))) /
                    reserves.get(getAssetString(asset))
                ).toFixed(7);
                setAmounts(
                    new Map(amounts.set(getAssetString(token), Number(newAmount).toString())),
                );
            });
    };

    return (
        <Container>
            <ModalTitle>Add liquidity</ModalTitle>
            <Form>
                {pool.assets.map((asset) => (
                    <FormRow>
                        <Balance>
                            Available:
                            <BalanceClickable
                                onClick={() =>
                                    onChangeInput(asset, account.getAssetBalance(asset).toString())
                                }
                            >
                                {' '}
                                {formatBalance(account.getAssetBalance(asset))} {asset.code}
                            </BalanceClickable>
                        </Balance>
                        <Input
                            value={amounts.get(getAssetString(asset))}
                            onChange={({ target }) => {
                                onChangeInput(asset, target.value);
                            }}
                            placeholder={`Enter ${asset.code} amount`}
                            label={`${asset.code} Amount`}
                            postfix={<Asset asset={asset} logoAndCode />}
                        />
                    </FormRow>
                ))}

                <DescriptionRow>
                    <span>Type</span>
                    <span>{pool.pool_type === 'stable' ? 'Stable swap' : 'Constant product'}</span>
                </DescriptionRow>
                <DescriptionRow>
                    <span>Fee</span>
                    <span>{pool.fee * 100} %</span>
                </DescriptionRow>
                <DescriptionRow>
                    <span>Liquidity</span>
                    <span>{pool.liquidity ? formatBalance(pool.liquidity / 1e7, true) : '0'}</span>
                </DescriptionRow>

                <PoolInfo>
                    <PairWrap>
                        <Pair
                            base={pool.assets[0]}
                            counter={pool.assets[1]}
                            thirdAsset={pool.assets[2]}
                            fourthAsset={pool.assets[3]}
                        />
                    </PairWrap>

                    <DescriptionRow>
                        <span>Pool shares</span>
                        <span>{shares !== null ? formatBalance(shares) : <DotsLoader />}</span>
                    </DescriptionRow>
                    {pool.assets.map((asset) => (
                        <DescriptionRow>
                            <span>Pooled {asset.code}</span>
                            <span>
                                {reserves !== null ? (
                                    formatBalance(reserves.get(getAssetString(asset)))
                                ) : (
                                    <DotsLoader />
                                )}
                            </span>
                        </DescriptionRow>
                    ))}
                </PoolInfo>

                <Button
                    isBig
                    onClick={() => onSubmit()}
                    pending={pending}
                    // @ts-ignore
                    disabled={[...amounts.values()].some((value) => !Number(value))}
                >
                    deposit
                </Button>
            </Form>
        </Container>
    );
};

export default DepositToPool;
