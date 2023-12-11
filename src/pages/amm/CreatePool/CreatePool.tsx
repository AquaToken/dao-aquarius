import * as React from 'react';
import styled from 'styled-components';
import * as SorobanClient from 'soroban-client';
import { respondDown } from '../../../common/mixins';
import { Breakpoints } from '../../../common/styles';
import ToggleGroup from '../../../common/basics/ToggleGroup';
import { useState } from 'react';
import Pair from '../../vote/components/common/Pair';
import { ModalTitle } from '../../../common/modals/atoms/ModalAtoms';
import Input from '../../../common/basics/Input';
import Button from '../../../common/basics/Button';
import { ModalService, SorobanService } from '../../../common/services/globalServices';
import useAuthStore from '../../../store/authStore/useAuthStore';
import { AMM_SMART_CONTACT_ID } from '../../../common/services/soroban.service';
import { AQUA } from '../Amm';

const Container = styled.div`
    width: 52.8rem;
    display: flex;
    flex-direction: column;

    ${respondDown(Breakpoints.md)`
          width: 100%;
      `}
`;

const Form = styled.div`
    display: flex;
    flex-direction: column;
    margin-top: 2.4rem;
`;

const Label = styled.span`
    font-size: 1.6rem;
    margin-bottom: 0.5rem;
`;

const ToggleGroupStyle = styled(ToggleGroup)`
    width: fit-content;
    margin-bottom: 2.4rem;
`;

const InputStyled = styled(Input)`
    margin-top: 5rem;
`;

const ButtonStyled = styled(Button)`
    margin-top: 3.2rem;
`;

enum POOL_TYPE {
    CONTSANT = 'constant',
    STABLESWAP = 'stableswap',
}

const TYPE_OPTIONS = [
    { value: POOL_TYPE.CONTSANT, label: 'Constant product' },
    { value: POOL_TYPE.STABLESWAP, label: 'Stable swap' },
];

const FEE_OPTIONS = [
    { value: 10, label: '0.1%' },
    { value: 30, label: '0.3%' },
    { value: 100, label: '1%' },
];

const CreatePool = ({ params }) => {
    const { base, counter } = params;
    const [pending, setPending] = useState(false);
    const [type, setType] = useState(POOL_TYPE.CONTSANT);
    const [fee, setFee] = useState(10);
    const [stableFee, setStableFee] = useState('0.06');
    const [a, setA] = useState('85');

    const { account } = useAuthStore();

    const createPool = () => {
        setPending(true);
        if (type !== POOL_TYPE.CONTSANT) {
            SorobanService.getGiveAllowanceTx(account.accountId(), AMM_SMART_CONTACT_ID, AQUA, '1')
                .then((tx) => account.signAndSubmitTx(tx as SorobanClient.Transaction, true))
                .then(() =>
                    SorobanService.getInitStableSwapPoolTx(
                        account.accountId(),
                        base,
                        counter,
                        Number(a),
                        Number(stableFee),
                    ),
                )
                .then((tx) => {
                    return account.signAndSubmitTx(tx as SorobanClient.Transaction).then(() => {
                        setPending(false);
                        ModalService.confirmAllModals();
                    });
                });
            return;
        }

        SorobanService.getInitConstantPoolTx(account.accountId(), base, counter, fee).then((tx) => {
            return account.signAndSubmitTx(tx as SorobanClient.Transaction).then(() => {
                setPending(false);
                ModalService.confirmAllModals();
            });
        });
    };

    return (
        <Container>
            <ModalTitle>Create pool</ModalTitle>
            <Pair base={base} counter={counter} />
            <Form>
                <ToggleGroupStyle value={type} options={TYPE_OPTIONS} onChange={setType} />
                {type === POOL_TYPE.CONTSANT ? (
                    <>
                        <Label>Fee:</Label>
                        <ToggleGroupStyle value={fee} options={FEE_OPTIONS} onChange={setFee} />
                    </>
                ) : (
                    <>
                        <InputStyled
                            label="Swap Fee (0.04 - 1%)"
                            value={stableFee}
                            onChange={(e) => setStableFee(e.target.value)}
                        />
                        <InputStyled
                            label="A (1-5000)"
                            value={a}
                            onChange={(e) => setA(e.target.value)}
                        />
                    </>
                )}
                <ButtonStyled onClick={() => createPool()} pending={pending}>
                    Create pool
                </ButtonStyled>
            </Form>
        </Container>
    );
};

export default CreatePool;
