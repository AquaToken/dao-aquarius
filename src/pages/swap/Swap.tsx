import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import {
    commonMaxWidth,
    flexAllCenter,
    flexRowSpaceBetween,
    respondDown,
} from '../../common/mixins';
import AssetDropdown from '../vote/components/AssetDropdown/AssetDropdown';
import { Breakpoints, COLORS } from '../../common/styles';
import useAuthStore from '../../store/authStore/useAuthStore';
import { ModalService, SorobanService } from '../../common/services/globalServices';
import PageLoader from '../../common/basics/PageLoader';
import Input from '../../common/basics/Input';
import SwapIcon from '../../common/assets/img/icon-arrows-circle.svg';
import SettingsIcon from '../../common/assets/img/icon-settings.svg';
import { useDebounce } from '../../common/hooks/useDebounce';
import Button from '../../common/basics/Button';
import { IconFail } from '../../common/basics/Icons';
import { USDC, USDT } from '../amm/AmmLegacy';
import { CONTRACT_STATUS } from '../../common/services/soroban.service';
import ChooseLoginMethodModal from '../../common/modals/ChooseLoginMethodModal';
import { formatBalance } from '../../common/helpers/helpers';
import SwapConfirmModal from './SwapConfirmModal/SwapConfirmModal';
import SwapSettingsModal from './SwapSettingsModal/SwapSettingsModal';
import { findSwapPath } from '../amm/api/api';

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

    ${respondDown(Breakpoints.md)`
        padding: 2rem 1.6rem 0;
    `}
`;

const Header = styled.div`
    ${flexRowSpaceBetween};
    margin-bottom: 4.8rem;
`;

export const Title = styled.h2`
    font-size: 3.6rem;
    line-height: 4.2rem;
    color: ${COLORS.titleText};
    font-weight: 400;

    ${respondDown(Breakpoints.sm)`
        font-size: 2.8rem;
   `}
`;

const Form = styled.div`
    margin: 0 auto;
    width: 75rem;
    border-radius: 1rem;
    background: ${COLORS.white};
    box-shadow: 0 2rem 3rem 0 rgba(0, 6, 54, 0.06);
    padding: 6.4rem 4.8rem;

    ${respondDown(Breakpoints.md)`
        width: 100%;
        padding: 1.6rem;
    `}
`;

const FormRow = styled.div`
    display: flex;
    margin-top: 5rem;
    position: relative;

    ${respondDown(Breakpoints.sm)`
        flex-direction: column;
        gap: 0.5rem;
        margin-top: 2rem;
    `}
`;

const Balance = styled.div`
    position: absolute;
    bottom: calc(100% + 1.2rem);
    right: 0;
    font-size: 1.6rem;
    line-height: 1.8rem;
    color: ${COLORS.paragraphText};

    ${respondDown(Breakpoints.sm)`
       font-size: 1.2rem;
    `}
`;

const BalanceClickable = styled.span`
    color: ${COLORS.purple};
    cursor: pointer;
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

    ${respondDown(Breakpoints.sm)`
       margin: 1rem 0 0;
    `}
`;

const StyledButton = styled(Button)`
    margin-top: 4.8rem;
    margin-left: auto;
    width: 45%;

    ${respondDown(Breakpoints.sm)`
        width: 100%;
        margin-top: 2rem;
    `}
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

const Prices = styled.div`
    color: ${COLORS.grayText};
    margin-top: 3rem;
`;

const SettingsButton = styled.div`
    ${flexAllCenter};
    border-radius: 0.3rem;
    padding: 1rem;
    cursor: pointer;

    &:hover {
        background-color: ${COLORS.lightGray};
    }
`;

const Swap = ({ balances }) => {
    const { account, isLogged } = useAuthStore();

    const [base, setBase] = useState(USDT);
    const [counter, setCounter] = useState(USDC);
    const [error, setError] = useState(false);

    const [baseAmount, setBaseAmount] = useState('');
    const [counterAmount, setCounterAmount] = useState('');
    const [bestPathXDR, setBestPathXDR] = useState(null);
    const [bestPath, setBestPath] = useState(null);
    const [bestPools, setBestPools] = useState(null);
    const [estimatePending, setEstimatePending] = useState(false);

    const debouncedAmount = useDebounce(baseAmount, 700);

    useEffect(() => {
        if (!!Number(debouncedAmount.current)) {
            setEstimatePending(true);

            findSwapPath(
                SorobanService.getAssetContractId(base),
                SorobanService.getAssetContractId(counter),
                debouncedAmount.current,
            ).then((res) => {
                // @ts-ignore
                if (!res.success) {
                    setError(true);
                    setEstimatePending(false);
                } else {
                    setEstimatePending(false);
                    // @ts-ignore
                    setCounterAmount((res.amount / 1e7).toFixed(7));
                    // @ts-ignore
                    setBestPathXDR(res.swap_chain_xdr);
                    // @ts-ignore
                    setBestPath(res.tokens);
                    // @ts-ignore
                    setBestPools(res.pools);
                }
            });
        } else {
            setBaseAmount('');
            setBestPathXDR(null);
            setBestPath(null);
            setBestPools(null);
        }
    }, [debouncedAmount, base, counter]);

    useEffect(() => {
        setCounterAmount('');
    }, [baseAmount, base, counter]);

    const swapAssets = () => {
        if (!isLogged) {
            return ModalService.openModal(ChooseLoginMethodModal, {});
        }
        if (!counterAmount || !baseAmount) {
            return;
        }
        ModalService.openModal(SwapConfirmModal, {
            base,
            counter,
            baseAmount,
            counterAmount,
            bestPathXDR,
            bestPath,
            bestPools,
        }).then(({ isConfirmed }) => {
            if (isConfirmed) {
                setBaseAmount('');
                setCounterAmount('');
                setBestPathXDR(null);
                setBestPath(null);
                setBestPools(null);
            }
        });
    };

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
        setBestPathXDR(null);
        setBestPath(null);
        setBestPools(null);
    };

    return (
        <Container>
            <Content>
                <Form>
                    <Header>
                        <Title>Swap assets</Title>
                        <SettingsButton
                            onClick={() => ModalService.openModal(SwapSettingsModal, {})}
                        >
                            <SettingsIcon />
                        </SettingsButton>
                    </Header>
                    <FormRow>
                        {account && account.getAssetBalance(base) && (
                            <Balance>
                                Available:
                                <BalanceClickable
                                    onClick={() =>
                                        setBaseAmount(account.getAssetBalance(base).toString())
                                    }
                                >
                                    {' '}
                                    {account.getAssetBalance(base)} {base.code}
                                </BalanceClickable>
                            </Balance>
                        )}
                        <StyledInput
                            value={baseAmount}
                            onChange={(e) => setBaseAmount(e.target.value)}
                            label="From"
                        />

                        <DropdownContainer>
                            <AssetDropdown
                                asset={base}
                                onUpdate={setBase}
                                assetsList={assets}
                                exclude={counter}
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
                        {account && account.getAssetBalance(counter) && (
                            <Balance>
                                Balance: {account.getAssetBalance(counter)} {counter.code}
                            </Balance>
                        )}
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
                                disabled={estimatePending}
                            />
                        </DropdownContainer>
                    </FormRow>

                    {baseAmount && counterAmount && !estimatePending && (
                        <Prices>
                            1 {base.code} = {formatBalance(+counterAmount / +baseAmount)}{' '}
                            {counter.code} / 1 {counter.code} ={' '}
                            {formatBalance(+baseAmount / +counterAmount)} {base.code}
                        </Prices>
                    )}

                    {error && (
                        <Error>
                            <IconFail />
                            There are no exchange paths for the selected pairs.
                        </Error>
                    )}

                    <StyledButton
                        isBig
                        disabled={estimatePending || !counterAmount}
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
