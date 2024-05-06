import * as React from 'react';
import styled from 'styled-components';
import { Breakpoints, COLORS } from '../../../../common/styles';
import { flexRowSpaceBetween, respondDown } from '../../../../common/mixins';
import { ModalTitle } from '../../../../common/modals/atoms/ModalAtoms';
import Input from '../../../../common/basics/Input';
import Asset from '../../../vote/components/AssetDropdown/Asset';
import { useEffect, useMemo, useState } from 'react';
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

const Container = styled.div`
    width: 52.3rem;

    ${respondDown(Breakpoints.md)`
        width: 100%;
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

    const base = useMemo(() => {
        return pool.assets[0];
    }, [pool]);

    const counter = useMemo(() => {
        return pool.assets[1];
    }, [pool]);

    const [baseAmount, setBaseAmount] = useState('');
    const [counterAmount, setCounterAmount] = useState('');
    const [pending, setPending] = useState(false);
    const [price, setPrice] = useState(null);
    const [shares, setShares] = useState(null);
    const [basePooled, setBasePooled] = useState(null);
    const [counterPooled, setCounterPooled] = useState(null);

    useEffect(() => {
        SorobanService.getPoolPrice(account?.accountId(), base, counter, pool.address).then(
            (res) => {
                setPrice(res);
            },
        );
    }, []);

    useEffect(() => {
        SorobanService.getTokenBalance(base, pool.address).then((res) => {
            setBasePooled(res);
        });
    }, []);

    useEffect(() => {
        SorobanService.getTokenBalance(counter, pool.address).then((res) => {
            setCounterPooled(res);
        });
    }, []);

    useEffect(() => {
        SorobanService.getTotalShares(pool.address).then((res) => {
            setShares(res);
        });
    }, []);

    const onSubmit = () => {
        setPending(true);

        const baseId = SorobanService.getAssetContractId(base);
        const counterId = SorobanService.getAssetContractId(counter);

        const [firstAsset, secondAsset] = baseId > counterId ? [counter, base] : [base, counter];
        const [firstAssetAmount, secondAssetAmount] =
            baseId > counterId ? [counterAmount, baseAmount] : [baseAmount, counterAmount];

        SorobanService.getDepositTx(
            account?.accountId(),
            pool.index,
            firstAsset,
            secondAsset,
            firstAssetAmount,
            secondAssetAmount,
        )
            .then((tx) => account.signAndSubmitTx(tx, true))
            .then((res) => {
                setPending(false);

                const [baseResultAmount, counterResultAmount] = res.value()[0].value();

                ModalService.confirmAllModals();

                ModalService.openModal(SuccessModal, {
                    base,
                    counter,
                    baseAmount: SorobanService.i128ToInt(
                        baseId === SorobanService.getAssetContractId(firstAsset)
                            ? baseResultAmount.value()
                            : counterResultAmount.value(),
                    ),
                    counterAmount: SorobanService.i128ToInt(
                        baseId === SorobanService.getAssetContractId(firstAsset)
                            ? counterResultAmount.value()
                            : baseResultAmount.value(),
                    ),
                    title: 'Success deposit',
                });
            })
            .catch((e) => {
                console.log(e);
                ToastService.showErrorToast('Oops! Something went wrong');
                setPending(false);
            });
    };

    const onChangeBase = (value: string) => {
        setBaseAmount(value);

        // empty pool
        if (Number.isNaN(price)) {
            return;
        }

        // clear input
        if (!Number(value)) {
            return setCounterAmount('');
        }

        return setCounterAmount((+value / price).toFixed(7));
    };

    const onChangeCounter = (value: string) => {
        setCounterAmount(value);

        // empty pool
        if (Number.isNaN(price)) {
            return;
        }

        // clear input
        if (!Number(value)) {
            return setBaseAmount('');
        }

        return setBaseAmount((+value * price).toFixed(7));
    };

    return (
        <Container>
            <ModalTitle>Increase liquidity position</ModalTitle>
            <Form>
                <FormRow>
                    <Balance>
                        Available:
                        <BalanceClickable
                            onClick={() => onChangeBase(account.getAssetBalance(base).toString())}
                        >
                            {' '}
                            {formatBalance(account.getAssetBalance(base))} {base.code}
                        </BalanceClickable>
                    </Balance>
                    <Input
                        value={baseAmount}
                        onChange={({ target }) => {
                            onChangeBase(target.value);
                        }}
                        placeholder={`Enter ${base.code} amount`}
                        label={`${base.code} Amount`}
                        postfix={<Asset asset={base} logoAndCode />}
                        disabled={price === null}
                    />
                </FormRow>
                <FormRow>
                    <Balance>
                        Available:
                        <BalanceClickable
                            onClick={() =>
                                onChangeCounter(account.getAssetBalance(counter).toString())
                            }
                        >
                            {' '}
                            {formatBalance(account.getAssetBalance(counter))} {counter.code}
                        </BalanceClickable>
                    </Balance>
                    <Input
                        value={counterAmount}
                        onChange={({ target }) => {
                            onChangeCounter(target.value);
                        }}
                        placeholder={`Enter ${counter.code} amount`}
                        label={`${counter.code} Amount`}
                        postfix={<Asset asset={counter} logoAndCode />}
                        disabled={price === null}
                    />
                </FormRow>

                <DescriptionRow>
                    <span>Type</span>
                    <span>{pool.pool_type === 'stable' ? 'Stable swap' : 'Constant product'}</span>
                </DescriptionRow>
                <DescriptionRow>
                    <span>Fee</span>
                    <span>{pool.fee} %</span>
                </DescriptionRow>
                <DescriptionRow>
                    <span>Liquidity</span>
                    <span>{formatBalance(pool.liquidity / 1e7, true)}</span>
                </DescriptionRow>

                <PoolInfo>
                    <PairWrap>
                        <Pair base={base} counter={counter} />
                    </PairWrap>

                    <DescriptionRow>
                        <span>Pool shares</span>
                        <span>{shares !== null ? formatBalance(shares) : <DotsLoader />}</span>
                    </DescriptionRow>
                    <DescriptionRow>
                        <span>Pooled {base.code}</span>
                        <span>
                            {basePooled !== null ? formatBalance(basePooled) : <DotsLoader />}
                        </span>
                    </DescriptionRow>
                    <DescriptionRow>
                        <span>Pooled {counter.code}</span>
                        <span>
                            {counterPooled !== null ? formatBalance(counterPooled) : <DotsLoader />}
                        </span>
                    </DescriptionRow>
                </PoolInfo>

                <Button
                    isBig
                    onClick={() => onSubmit()}
                    pending={pending}
                    disabled={!Number(baseAmount) || !Number(counterAmount)}
                >
                    deposit
                </Button>
            </Form>
        </Container>
    );
};

export default DepositToPool;
