import * as React from 'react';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';

import { getAssetString } from 'helpers/assets';

import useAuthStore from 'store/authStore/useAuthStore';

import { Asset } from 'types/stellar';

import { useDebounce } from 'hooks/useDebounce';
import { respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import Button from 'basics/buttons/Button';

import { findSwapPath } from 'pages/amm/api/api';

import AmountUsdEquivalent from './AmountUsdEquivalent/AmountUsdEquivalent';
import SwapFormDivider from './SwapFormDivider/SwapFormDivider';
import SwapFormError from './SwapFormError/SwapFormError';
import SwapFormHeader from './SwapFormHeader/SwapFormHeader';
import SwapFormPrice from './SwapFormPrice/SwapFormPrice';
import SwapFormRow from './SwapFormRow/SwapFormRow';

import NoTrustline from '../../../../common/components/NoTrustline/NoTrustline';
import ChooseLoginMethodModal from '../../../../common/modals/ChooseLoginMethodModal';
import MainNetWarningModal, {
    SHOW_PURPOSE_ALIAS_MAIN_NET,
} from '../../../../common/modals/MainNetWarningModal';
import {
    ModalService,
    SorobanService,
    ToastService,
} from '../../../../common/services/globalServices';
import { MainRoutes } from '../../../../routes';
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

    const [isPriceReverted, setIsPriceReverted] = useState(false);

    const debouncedAmount = useDebounce(baseAmount, 700);

    const history = useHistory();
    const { account, isLogged } = useAuthStore();

    useEffect(() => {
        if (Number(debouncedAmount.current)) {
            setEstimatePending(true);

            findSwapPath(
                SorobanService.getAssetContractId(base),
                SorobanService.getAssetContractId(counter),
                debouncedAmount.current,
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
    const submitWithWarning = () => {
        const showPurpose = JSON.parse(localStorage.getItem(SHOW_PURPOSE_ALIAS_MAIN_NET) || 'true');
        if (showPurpose) {
            ModalService.openModal(MainNetWarningModal, {}, false).then(({ isConfirmed }) => {
                if (isConfirmed) {
                    swapAssets();
                }
            });
            return;
        }
        swapAssets();
    };

    const onAmountChange = value => {
        if (Number.isNaN(Number(value))) {
            return;
        }
        const [integerPart, fractionalPart] = value.split('.');
        const roundedValue =
            fractionalPart && fractionalPart.length > 7
                ? `${integerPart}.${fractionalPart.slice(0, 7)}`
                : value;

        setBaseAmount(roundedValue);
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
                setAmount={onAmountChange}
                exclude={counter}
                pending={estimatePending}
                inputPostfix={
                    baseAmount ? (
                        <AmountUsdEquivalent amount={debouncedAmount.current} asset={base} />
                    ) : null
                }
            />

            <SwapFormDivider pending={estimatePending} onRevert={revertAssets} />

            <SwapFormRow
                asset={counter}
                setAsset={setDestination}
                amount={counterAmount}
                exclude={base}
                pending={estimatePending}
                inputPostfix={
                    <AmountUsdEquivalent
                        amount={counterAmount}
                        asset={counter}
                        sourceAmount={baseAmount}
                        sourceAsset={base}
                    />
                }
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
                onClick={() => submitWithWarning()}
            >
                SWAP ASSETS
            </StyledButton>
        </Form>
    );
};

export default SwapForm;
