import * as React from 'react';
import styled from 'styled-components';
import { commonMaxWidth, flexAllCenter } from '../../common/mixins';
import BalancesBlock from '../amm/BalancesBlock/BalancesBlock';
import { Header, Title } from '../profile/AmmRewards/AmmRewards';
import AssetDropdown from '../vote/components/AssetDropdown/AssetDropdown';
import { COLORS } from '../../common/styles';
import useAuthStore from '../../store/authStore/useAuthStore';
import { useEffect, useMemo, useState } from 'react';
import { ModalService, SorobanService, ToastService } from '../../common/services/globalServices';
import PageLoader from '../../common/basics/PageLoader';
import Input from '../../common/basics/Input';
import SwapIcon from '../../common/assets/img/icon-arrows-circle.svg';
import { useDebounce } from '../../common/hooks/useDebounce';
import Button from '../../common/basics/Button';
import { IconFail } from '../../common/basics/Icons';
import { USDT, USDC } from '../amm/Amm';
import * as SorobanClient from 'soroban-client';
import SuccessModal from '../amm/SuccessModal/SuccessModal';
import { CONTRACT_STATUS } from '../../common/services/soroban.service';

const Container = styled.main`
    background-color: ${COLORS.lightGray};
    height: 100%;
    position: relative;
    display: flex;
    flex: 1 0 auto;
    flex-direction: column;
    scroll-behavior: smooth;
    overflow: auto;
    padding-bottom: 6rem;
`;

const Content = styled.div`
    ${commonMaxWidth};
    width: 100%;
    padding: 6.3rem 4rem 0;
`;

const Form = styled.div`
    margin: 0 auto;
    width: 75rem;
    border-radius: 1rem;
    background: ${COLORS.white};
    box-shadow: 0 2rem 3rem 0 rgba(0, 6, 54, 0.06);
    padding: 6.4rem 4.8rem;
`;

const FormRow = styled.div`
    display: flex;
    margin-top: 5rem;
`;

const StyledInput = styled(Input)`
    flex: 1.2;
`;

const DropdownContainer = styled.div`
    flex: 1;
`;

const SwapDivider = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 3rem 0 4rem;
    height: 4.8rem;
`;

const StyledButton = styled(Button)`
    margin-top: 4.8rem;
    margin-left: auto;
`;

const Error = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-top: 1rem;
`;

const RevertButton = styled.div`
    cursor: pointer;
    padding: 1rem;
    border-radius: 0.3rem;
    ${flexAllCenter};

    &:hover {
        background-color: ${COLORS.lightGray};
    }
`;

const Swap = ({ balances }) => {
    const { account, isLogged } = useAuthStore();

    const [base, setBase] = useState(USDT);
    const [counter, setCounter] = useState(USDC);
    const [pools, setPools] = useState(null);

    const [baseAmount, setBaseAmount] = useState('');
    const [counterAmount, setCounterAmount] = useState('');
    const [estimatePending, setEstimatePending] = useState(false);
    const [swapPending, setSwapPending] = useState(false);
    const [bestPool, setBestPool] = useState(null);

    const debouncedAmount = useDebounce(baseAmount, 700);

    useEffect(() => {
        setPools(null);
        setBestPool(null);
        if (isLogged) {
            SorobanService.getPools(account?.accountId(), base, counter).then((res) => {
                setPools(res);
            });
        }
    }, [isLogged, base, counter]);

    useEffect(() => {
        if (!!Number(debouncedAmount)) {
            setEstimatePending(true);
            SorobanService.getSwapEstimatedAmount(
                account?.accountId(),
                base,
                counter,
                pools,
                debouncedAmount,
            ).then(({ amount, pool }) => {
                setCounterAmount(amount.toString());
                setBestPool(pool);
                setEstimatePending(false);
            });
        } else {
            setBaseAmount('');
        }
    }, [debouncedAmount]);

    const swapAssets = () => {
        if (!counterAmount || !baseAmount) {
            return;
        }
        setSwapPending(true);
        const SLIPPAGE = 0.01; // 1%

        const minCounterAmount = ((1 - SLIPPAGE) * Number(counterAmount)).toFixed(7);

        SorobanService.getGiveAllowanceTx(account?.accountId(), bestPool[0], base, baseAmount)
            .then((tx) => account.signAndSubmitTx(tx as SorobanClient.Transaction, true))
            .then(() =>
                SorobanService.getSwapTx(
                    account?.accountId(),
                    bestPool[0],
                    base,
                    counter,
                    baseAmount,
                    minCounterAmount,
                ),
            )
            .then((tx) => account.signAndSubmitTx(tx as SorobanClient.Transaction, true))
            .then((res) => {
                ModalService.openModal(SuccessModal, {
                    base,
                    counter,
                    baseAmount: baseAmount,
                    counterAmount: SorobanService.i128ToInt(res.value()),
                    title: 'Success swap',
                    isSwap: true,
                });
                setSwapPending(false);
                setBaseAmount('');
                setCounterAmount('');
                setBestPool(null);
            })
            .catch((e) => {
                console.log(e);
                ToastService.showErrorToast('Oops! Something went wrong');
                setSwapPending(false);
            });
    };

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

    const assets = useMemo(() => {
        return balances
            ?.filter(({ status }) => status === CONTRACT_STATUS.ACTIVE)
            .map(({ asset }) => asset);
    }, [balances]);

    const revertAssets = () => {
        const term = base;
        setBase(counter);
        setCounter(term);
        setBaseAmount('');
        setCounterAmount('');
    };

    if (!account || !assets) {
        return <PageLoader />;
    }

    return (
        <Container>
            <Content>
                <BalancesBlock balances={balances} />
                <Form>
                    <Header>
                        <Title>Swap assets</Title>
                    </Header>
                    <FormRow>
                        <StyledInput
                            value={baseAmount}
                            onChange={(e) => setBaseAmount(e.target.value)}
                            label="From"
                            disabled={!pools || !pools.length}
                        />

                        <DropdownContainer>
                            <AssetDropdown
                                asset={base}
                                onUpdate={setBase}
                                assetsList={assets}
                                exclude={counter}
                                label={baseAvailable}
                                disabled={estimatePending}
                                withoutReset
                            />
                        </DropdownContainer>
                    </FormRow>

                    <SwapDivider>
                        {estimatePending ? (
                            <PageLoader />
                        ) : (
                            <RevertButton onClick={() => revertAssets()}>
                                <SwapIcon />
                            </RevertButton>
                        )}
                    </SwapDivider>

                    <FormRow>
                        <StyledInput
                            value={counterAmount}
                            label="To(estimated)"
                            placeholder="0.0"
                            disabled
                        />

                        <DropdownContainer>
                            <AssetDropdown
                                asset={counter}
                                onUpdate={setCounter}
                                assetsList={assets}
                                exclude={base}
                                withoutReset
                                label={counterAvailable}
                                disabled={estimatePending}
                            />
                        </DropdownContainer>
                    </FormRow>

                    {pools && !pools.length && (
                        <Error>
                            <IconFail />
                            There are no liquidity pools for this market
                        </Error>
                    )}

                    <StyledButton
                        isBig
                        disabled={estimatePending}
                        pending={swapPending}
                        onClick={() => swapAssets()}
                    >
                        SWAP ASSETS
                    </StyledButton>
                </Form>
            </Content>
        </Container>
    );
};

export default Swap;
