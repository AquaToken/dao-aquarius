import * as React from 'react';
import styled from 'styled-components';
import { Breakpoints } from '../../../common/styles';
import { respondDown } from '../../../common/mixins';
import { ModalTitle } from '../../../common/modals/atoms/ModalAtoms';
import Input from '../../../common/basics/Input';
import Asset from '../../vote/components/AssetDropdown/Asset';
import { useMemo, useState } from 'react';
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

const DepositToPool = ({ params, confirm }) => {
    const { account } = useAuthStore();
    const { base, counter, poolId } = params;

    const [baseAmount, setBaseAmount] = useState('');
    const [counterAmount, setCounterAmount] = useState('');
    const [pending, setPending] = useState(false);

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

        SorobanService.deposit(poolId, base, counter, baseAmount, counterAmount)
            .then((res) => {
                console.log(res);
                ToastService.showSuccessToast('Deposit was completed successfully');
                setPending(false);
                confirm();
            })
            .catch((e) => {
                console.log(e);
                ToastService.showErrorToast('Oops! Something went wrong');
                setPending(false);
            });
    };

    return (
        <Container>
            <ModalTitle>Increase liquidity position</ModalTitle>
            <Form>
                <FormRow>
                    <Input
                        value={baseAmount}
                        onChange={(e) => {
                            setBaseAmount(e.target.value);
                        }}
                        placeholder="Enter amount"
                        label={baseAvailable}
                        postfix={<Asset asset={base} inRow />}
                    />
                </FormRow>
                <FormRow>
                    <Input
                        value={counterAmount}
                        onChange={(e) => {
                            setCounterAmount(e.target.value);
                        }}
                        placeholder="Enter amount"
                        label={counterAvailable}
                        postfix={<Asset asset={counter} inRow />}
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
