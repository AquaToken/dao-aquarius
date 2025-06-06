import * as React from 'react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

import { findSwapPath, getAssetsList } from 'api/amm';

import { useDebounce } from 'hooks/useDebounce';

import useAssetsStore from 'store/assetsStore/useAssetsStore';
import useAuthStore from 'store/authStore/useAuthStore';

import { ModalService, SorobanService } from 'services/globalServices';

import { Asset } from 'types/stellar';

import { cardBoxShadow, flexAllCenter, respondDown } from 'web/mixins';
import ChooseLoginMethodModal from 'web/modals/auth/ChooseLoginMethodModal';
import { Breakpoints, COLORS } from 'web/styles';

import SettingsIcon from 'assets/icon-settings.svg';

import Button from 'basics/buttons/Button';

import NoTrustline from 'components/NoTrustline';
import Price from 'components/Price';

import SwapSettingsModal, {
    SWAP_SLIPPAGE_ALIAS,
} from 'pages/swap/components/SwapSettingsModal/SwapSettingsModal';

import AmountUsdEquivalent from './AmountUsdEquivalent/AmountUsdEquivalent';
import SwapFormDivider from './SwapFormDivider/SwapFormDivider';
import SwapFormRow from './SwapFormRow/SwapFormRow';

import SwapConfirmModal from '../SwapConfirmModal/SwapConfirmModal';

const Form = styled.div<{ $isEmbedded?: boolean }>`
    margin: 0 auto 2rem;
    width: ${({ $isEmbedded }) => ($isEmbedded ? '100%' : '48rem')};
    border-radius: 4rem;
    background: ${COLORS.white};
    padding: ${({ $isEmbedded }) => ($isEmbedded ? '0' : '1.6rem')};
    ${({ $isEmbedded }) => !$isEmbedded && cardBoxShadow};
    position: relative;

    ${respondDown(Breakpoints.sm)`
        width: 100%;
        padding: ${({ $isEmbedded }) => ($isEmbedded ? '0' : '6.6rem 0.8em 2rem')};
        box-shadow: unset;
    `};
`;

const SwapRows = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
`;

const StyledButton = styled(Button)`
    margin-top: 0.8rem;
    margin-left: auto;

    ${respondDown(Breakpoints.md)`
        width: 100%;
        margin-top: 2rem;
    `}
`;

const SwapHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 3.2rem;

    h3 {
        font-size: 3.6rem;
        line-height: 4.2rem;
        color: ${COLORS.titleText};
        font-weight: 400;
    }

    div {
        ${flexAllCenter};
        padding: 0.5rem;
        border-radius: 0.3rem;
        cursor: pointer;

        &:hover {
            background-color: ${COLORS.lightGray};
        }
    }
`;

const SettingsButton = styled.div`
    ${flexAllCenter};
    border-radius: 50%;
    height: 4rem;
    width: 4rem;
    cursor: pointer;
    position: absolute;
    background-color: ${COLORS.white};
    border: 0.1rem solid ${COLORS.gray};
    top: 0;
    left: calc(100% + 1.6rem);

    &:hover {
        border: 0.1rem solid ${COLORS.grayText};
    }

    ${respondDown(Breakpoints.sm)`
       left: calc(100% - 5.6rem);
       top: 1.6rem
    `};
`;

interface SwapFormProps {
    base: Asset;
    counter: Asset;
    setBase: (asset: Asset) => void;
    setCounter: (asset: Asset) => void;
    isEmbedded?: boolean;
}

const SwapForm = ({
    base,
    counter,
    setBase,
    setCounter,
    isEmbedded,
}: SwapFormProps): React.ReactNode => {
    const [hasError, setHasError] = useState(false);

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

    const { account, isLogged } = useAuthStore();

    const { processNewAssets } = useAssetsStore();

    useEffect(() => {
        getAssetsList().then(res => {
            processNewAssets(res);
            setAssetsList(res);
        });
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
                        setHasError(true);
                        setCounterAmount('');
                        setEstimatePending(false);
                    } else {
                        setHasError(false);
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
                    setHasError(true);
                    setEstimatePending(false);
                });
        } else {
            setBestPathXDR(null);
            setBestPath(null);
            setBestPools(null);
            setCounterAmount('');
        }
    }, [debouncedBaseAmount]);

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
                        setHasError(true);
                        setBaseAmount('');
                        setEstimatePending(false);
                    } else {
                        setHasError(false);
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
                    setHasError(true);
                    setEstimatePending(false);
                });
        } else {
            setBestPathXDR(null);
            setBestPath(null);
            setBestPools(null);
            setBaseAmount('');
        }
    }, [debouncedCounterAmount]);

    useEffect(() => {
        if ((isSend && !baseAmount) || (!isSend && !counterAmount)) {
            return;
        }
        setEstimatePending(true);

        findSwapPath(
            SorobanService.getAssetContractId(base),
            SorobanService.getAssetContractId(counter),
            isSend ? baseAmount : counterAmount,
            isSend,
        )
            .then(res => {
                if (!res.success) {
                    setHasError(true);
                    if (isSend) {
                        setCounterAmount('');
                    } else {
                        setBaseAmount('');
                    }
                    setEstimatePending(false);
                } else {
                    setHasError(false);
                    setEstimatePending(false);

                    const amount = (Number(res.amount) / 1e7).toFixed(7);

                    if (isSend) {
                        setCounterAmount(amount);
                    } else {
                        setBaseAmount(amount);
                    }
                    setBestPathXDR(res.swap_chain_xdr);
                    setBestPath(res.tokens);
                    setBestPools(res.pools);
                }
            })
            .catch(() => {
                setHasError(true);
                setEstimatePending(false);
            });
    }, [base, counter]);

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
        if (isBase) {
            setBaseAmount(value);
        } else {
            setCounterAmount(value);
        }
    };

    const resetAmount = isBase => {
        if (isBase) {
            setCounterAmount('');
        } else {
            setBaseAmount('');
        }
    };

    const revertAssets = () => {
        const temp = base;
        setBase(counter);
        setCounter(temp);
        setBaseAmount(counterAmount ?? '');
        setCounterAmount('');
        setBestPathXDR(null);
        setBestPath(null);
        setBestPools(null);
        setIsPriceReverted(false);
    };

    const SLIPPAGE = localStorage.getItem(SWAP_SLIPPAGE_ALIAS) || '1'; // 1%

    const isInsufficient = isSend
        ? Number(baseAmount) > account?.getAvailableForSwapBalance(base)
        : (1 + Number(SLIPPAGE) / 100) * Number(baseAmount) >
          account?.getAvailableForSwapBalance(base);

    const getButtonText = () => {
        if (hasError) {
            return 'No exchange paths available';
        }
        if (!isLogged) {
            return 'Connect wallet';
        }
        if (!baseAmount) {
            return 'Enter amount';
        }

        if (account && isInsufficient) {
            return 'Insufficient balance';
        }

        return 'Swap assets';
    };

    return (
        <Form $isEmbedded={isEmbedded}>
            {isEmbedded ? (
                <SwapHeader>
                    <h3> Swap assets</h3>

                    <div onClick={() => ModalService.openModal(SwapSettingsModal, {})}>
                        <SettingsIcon />
                    </div>
                </SwapHeader>
            ) : (
                <SettingsButton onClick={() => ModalService.openModal(SwapSettingsModal, {})}>
                    <SettingsIcon />
                </SettingsButton>
            )}

            <SwapRows>
                <SwapFormRow
                    isBase
                    asset={base}
                    setAsset={setBase}
                    amount={baseAmount}
                    setAmount={value => onAmountChange(value, true)}
                    resetAmount={() => resetAmount(true)}
                    assetsList={assetsList}
                    usdEquivalent={
                        <AmountUsdEquivalent amount={debouncedBaseAmount.current} asset={base} />
                    }
                    isEmbedded={isEmbedded}
                />

                <SwapFormDivider pending={estimatePending} onRevert={revertAssets} />

                <SwapFormRow
                    asset={counter}
                    setAsset={setCounter}
                    amount={counterAmount}
                    assetsList={assetsList}
                    setAmount={value => onAmountChange(value, false)}
                    resetAmount={() => resetAmount(false)}
                    usdEquivalent={
                        <AmountUsdEquivalent
                            amount={counterAmount}
                            asset={counter}
                            sourceAmount={baseAmount}
                            sourceAsset={base}
                        />
                    }
                    isEmbedded={isEmbedded}
                />
            </SwapRows>

            <Price
                baseCode={base.code}
                baseAmount={baseAmount}
                counterCode={counter.code}
                counterAmount={counterAmount}
                isReverted={isPriceReverted}
                setIsReverted={setIsPriceReverted}
                pending={estimatePending}
                hasError={hasError}
            />

            <NoTrustline asset={counter} isRounded />

            <StyledButton
                isBig
                isRounded={!isEmbedded}
                fullWidth
                disabled={
                    hasError ||
                    (account && isInsufficient) ||
                    (isLogged &&
                        (estimatePending ||
                            !counterAmount ||
                            (account && account.getAssetBalance(counter) === null) ||
                            (account && account.getAssetBalance(base) === null)))
                }
                onClick={() => swapAssets()}
            >
                {getButtonText()}
            </StyledButton>
        </Form>
    );
};

export default SwapForm;
