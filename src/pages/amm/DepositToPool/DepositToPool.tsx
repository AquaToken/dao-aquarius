import * as React from 'react';
import styled from 'styled-components';
import { Breakpoints } from '../../../common/styles';
import { respondDown } from '../../../common/mixins';
import { ModalTitle } from '../../../common/modals/atoms/ModalAtoms';
import Input from '../../../common/basics/Input';
import Asset from '../../vote/components/AssetDropdown/Asset';
import { useState } from 'react';
import { SorobanService, ToastService } from '../../../common/services/globalServices';
import Button from '../../../common/basics/Button';

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
    margin-bottom: 2rem;
`;

const DepositToPool = ({ params, confirm }) => {
    const { base, counter, poolId } = params;

    const [baseAmount, setBaseAmount] = useState('');
    const [counterAmount, setCounterAmount] = useState('');
    const [pending, setPending] = useState(false);

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
