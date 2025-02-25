import * as React from 'react';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';

import { findSwapPath, getAssetsList } from 'api/amm';

import { MainRoutes } from 'constants/routes';

import { getAssetString } from 'helpers/assets';

import { useDebounce } from 'hooks/useDebounce';

import useAuthStore from 'store/authStore/useAuthStore';

import { ModalService, SorobanService, ToastService } from 'services/globalServices';

import { Asset } from 'types/stellar';

import { respondDown } from 'web/mixins';
import ChooseLoginMethodModal from 'web/modals/auth/ChooseLoginMethodModal';
import { Breakpoints, COLORS } from 'web/styles';

import Button from 'basics/buttons/Button';

import NoTrustline from 'components/NoTrustline';

import AmountUsdEquivalent from './AmountUsdEquivalent/AmountUsdEquivalent';
import SwapFormDivider from './SwapFormDivider/SwapFormDivider';
import SwapFormError from './SwapFormError/SwapFormError';
import SwapFormHeader from './SwapFormHeader/SwapFormHeader';
import SwapFormPrice from './SwapFormPrice/SwapFormPrice';
import SwapFormRow from './SwapFormRow/SwapFormRow';

import SwapConfirmModal from '../SwapConfirmModal/SwapConfirmModal';

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
        position: relative;
    `}
`;

const StyledButton = styled(Button)`
    margin-top: 4.8rem;
    margin-left: auto;
    width: 45%;

    ${respondDown(Breakpoints.md)`
        width: 100%;
        margin-top: 2rem;
    `}
`;

interface SwapFormProps {
    base: Asset;
    counter: Asset;
}

const SwapForm = ({ base, counter }: SwapFormProps): React.ReactNode => {
    const [error, setError] = useState(false);

    const [baseAmount, setBaseAmount] = useState('');
    const [counterAmount, setCounterAmount] = useState('');
    const [bestPathXDR, setBestPathXDR] = useState(null);
    const [bestPath, setBestPath] = useState(null);
    const [bestPools, setBestPools] = useState(null);
    const [estimatePending, setEstimatePending] = useState(false);
    const [isSend, setIsSend] = useState(true);

    const [isPriceReverted, setIsPriceReverted] = useState(false);

    const debouncedBaseAmount = useDebounce(baseAmount, 700);
    const debouncedCounterAmount = useDebounce(counterAmount, 700);

    const [assetsList, setAssetsList] = useState(null);

    const history = useHistory();
    const { account, isLogged } = useAuthStore();

    useEffect(() => {
        getAssetsList().then(res => setAssetsList(res));
    }, []);

    useEffect(() => {
        if (debouncedCounterAmount.current) {
            return;
        }
        if (Number(debouncedBaseAmount.current)) {
            setEstimatePending(true);
            setIsSend(true);

            findSwapPath(
                SorobanService.getAssetContractId(base),
                SorobanService.getAssetContractId(counter),
                debouncedBaseAmount.current,
                true,
            )
                .then(res => {
                    if (!res.success) {
                        setError(true);
                        setCounterAmount('');
                        setEstimatePending(false);
                    } else {
                        setError(false);
                        setEstimatePending(false);
                        if (!baseAmount) {
                            return;
                        }
                        setCounterAmount((Number(res.amount) / 1e7).toFixed(7));
                        setBestPathXDR(res.swap_chain_xdr);
                        setBestPath(res.tokens);
                        setBestPools(res.pools);
                    }
                })
                .catch(() => {
                    setError(true);
                    setEstimatePending(false);
                });
        } else {
            setBestPathXDR(null);
            setBestPath(null);
            setBestPools(null);
            setCounterAmount('');
        }
    }, [debouncedBaseAmount, base, counter]);

    useEffect(() => {
        if (debouncedBaseAmount.current) {
            return;
        }
        if (Number(debouncedCounterAmount.current)) {
            setEstimatePending(true);
            setIsSend(false);

            findSwapPath(
                SorobanService.getAssetContractId(base),
                SorobanService.getAssetContractId(counter),
                debouncedCounterAmount.current,
                false,
            )
                .then(res => {
                    if (!res.success) {
                        setError(true);
                        setBaseAmount('');
                        setEstimatePending(false);
                    } else {
                        setError(false);
                        setEstimatePending(false);
                        if (!counterAmount) {
                            return;
                        }
                        setBaseAmount((Number(res.amount) / 1e7).toFixed(7));
                        setBestPathXDR(res.swap_chain_xdr);
                        setBestPath(res.tokens);
                        setBestPools(res.pools);
                    }
                })
                .catch(() => {
                    setError(true);
                    setEstimatePending(false);
                });
        } else {
            setBestPathXDR(null);
            setBestPath(null);
            setBestPools(null);
            setBaseAmount('');
        }
    }, [debouncedCounterAmount, base, counter]);

    const swapAssets = () => {
        if (!isLogged) {
            return ModalService.openModal(ChooseLoginMethodModal, {});
        }
        if (!counterAmount || !baseAmount) {
            return;
        }
        if (Number(baseAmount) > account.getAssetBalance(base)) {
            ToastService.showErrorToast(`Insufficient ${base.code} balance`);
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
            isSend,
        }).then(({ isConfirmed }) => {
            if (isConfirmed) {
                setBaseAmount('');
                setCounterAmount('');
                setBestPathXDR(null);
                setBestPath(null);
                setBestPools(null);
                setIsPriceReverted(false);
            }
        });
    };

    const onAmountChange = (value, isBase) => {
        if (Number.isNaN(Number(value))) {
            return;
        }
        const [integerPart, fractionalPart] = value.split('.');
        const roundedValue =
            fractionalPart && fractionalPart.length > 7
                ? `${integerPart}.${fractionalPart.slice(0, 7)}`
                : value;

        if (isBase) {
            setCounterAmount('');
            setBaseAmount(roundedValue);
        } else {
            setBaseAmount('');
            setCounterAmount(roundedValue);
        }
    };

    const revertAssets = () => {
        history.push(`${MainRoutes.swap}/${getAssetString(counter)}/${getAssetString(base)}`);
        setBaseAmount('');
        setCounterAmount('');
        setBestPathXDR(null);
        setBestPath(null);
        setBestPools(null);
        setIsPriceReverted(false);
    };
    const setSource = asset => {
        history.push(`${MainRoutes.swap}/${getAssetString(asset)}/${getAssetString(counter)}`);
    };

    const setDestination = asset => {
        history.push(`${MainRoutes.swap}/${getAssetString(base)}/${getAssetString(asset)}`);
    };
    return (
        <Form>
            <SwapFormHeader />

            <SwapFormRow
                isBase
                asset={base}
                setAsset={setSource}
                amount={baseAmount}
                setAmount={value => onAmountChange(value, true)}
                exclude={counter}
                pending={estimatePending}
                assetsList={assetsList}
                inputPostfix={
                    baseAmount ? (
                        <AmountUsdEquivalent amount={debouncedBaseAmount.current} asset={base} />
                    ) : null
                }
                isDestination={!isSend}
            />

            <SwapFormDivider pending={estimatePending} onRevert={revertAssets} />

            <SwapFormRow
                asset={counter}
                setAsset={setDestination}
                amount={counterAmount}
                setAmount={value => onAmountChange(value, false)}
                exclude={base}
                pending={estimatePending}
                assetsList={assetsList}
                inputPostfix={
                    <AmountUsdEquivalent
                        amount={counterAmount}
                        asset={counter}
                        sourceAmount={baseAmount}
                        sourceAsset={base}
                    />
                }
                isDestination={isSend}
            />

            <SwapFormPrice
                baseCode={base.code}
                baseAmount={baseAmount}
                counterCode={counter.code}
                counterAmount={counterAmount}
                isReverted={isPriceReverted}
                setIsReverted={setIsPriceReverted}
                pending={estimatePending}
            />

            <SwapFormError error={error} />

            <NoTrustline asset={counter} />

            <StyledButton
                isBig
                disabled={
                    estimatePending ||
                    !counterAmount ||
                    (account && account.getAssetBalance(counter) === null) ||
                    (account && account.getAssetBalance(base) === null)
                }
                onClick={() => swapAssets()}
            >
                SWAP ASSETS
            </StyledButton>
        </Form>
    );
};

export default SwapForm;
