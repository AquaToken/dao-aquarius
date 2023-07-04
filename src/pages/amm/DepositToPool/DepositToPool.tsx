import * as React from 'react';
import styled from 'styled-components';
import { Breakpoints } from '../../../common/styles';
import { respondDown } from '../../../common/mixins';
import { ModalTitle } from '../../../common/modals/atoms/ModalAtoms';
import Input from '../../../common/basics/Input';
import Asset from '../../vote/components/AssetDropdown/Asset';
import { useEffect, useMemo, useState } from 'react';
import { SorobanService, ToastService } from '../../../common/services/globalServices';
import Button from '../../../common/basics/Button';
import useAuthStore from '../../../store/authStore/useAuthStore';

const Container = styled.div`
    width: 52.3rem;

    ${respondDown(Breakpoints.md)`
        width: 100%;
    `}
`;

const Form = styled.div`
    display: flex;
    flex-direction: column;
    margin-top: 3rem;
`;

const FormRow = styled.div`
    display: flex;
    padding: 3rem 0;
`;

const DepositToPool = ({ params }) => {
    const { account } = useAuthStore();
    const { base, counter, poolId } = params;

    const [baseAmount, setBaseAmount] = useState('');
    const [counterAmount, setCounterAmount] = useState('');
    const [pending, setPending] = useState(false);
    const [price, setPrice] = useState(null);

    useEffect(() => {
        SorobanService.getPoolPrice(base, counter).then((res) => {
            setPrice(res);
        });
    }, []);

    const baseAvailable = useMemo(() => {
        if (!account) {
            return null;
        }

        return `Available: ${account.getAssetBalance(base)} ${base.code}`;
    }, [account, base]);

    const counterAvailable = useMemo(() => {
        if (!account) {
            return null;
        }

        return `Available: ${account.getAssetBalance(counter)} ${counter.code}`;
    }, [account, counter]);

    const onSubmit = () => {
        setPending(true);

        SorobanService.deposit(poolId, base, counter, baseAmount, counterAmount).catch((e) => {
            console.log(e);
            ToastService.showErrorToast('Oops! Something went wrong');
            setPending(false);
        });
    };

    const onChangeBase = (e) => {
        const { value } = e.target;
        setBaseAmount(value);

        // empty pool
        if (Number.isNaN(price)) {
            return;
        }

        // clear input
        if (!Number(value)) {
            return setCounterAmount('');
        }

        return setCounterAmount((value / price).toFixed(7));
    };

    const onChangeCounter = (e) => {
        const { value } = e.target;
        setCounterAmount(value);

        // empty pool
        if (Number.isNaN(price)) {
            return;
        }

        // clear input
        if (!Number(value)) {
            return setBaseAmount('');
        }

        return setBaseAmount((value * price).toFixed(7));
    };

    return (
        <Container>
            <ModalTitle>Increase liquidity position</ModalTitle>
            <Form>
                <FormRow>
                    <Input
                        value={baseAmount}
                        onChange={(e) => {
                            onChangeBase(e);
                        }}
                        placeholder="Enter amount"
                        label={baseAvailable}
                        postfix={<Asset asset={base} inRow />}
                        disabled={price === null}
                    />
                </FormRow>
                <FormRow>
                    <Input
                        value={counterAmount}
                        onChange={(e) => {
                            onChangeCounter(e);
                        }}
                        placeholder="Enter amount"
                        label={counterAvailable}
                        postfix={<Asset asset={counter} inRow />}
                        disabled={price === null}
                    />
                </FormRow>
                <Button
                    onClick={() => onSubmit()}
                    pending={pending}
                    disabled={!baseAmount || !counterAmount}
                >
                    deposit
                </Button>
            </Form>
        </Container>
    );
};

export default DepositToPool;
