import * as React from 'react';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';

import { findSwapPath, getAssetsList } from 'api/amm';

import { MainRoutes } from 'constants/routes';

import { getAssetString } from 'helpers/assets';

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

import SwapSettingsModal from 'pages/swap/components/SwapSettingsModal/SwapSettingsModal';

import AmountUsdEquivalent from './AmountUsdEquivalent/AmountUsdEquivalent';
import SwapFormDivider from './SwapFormDivider/SwapFormDivider';
import SwapFormPrice from './SwapFormPrice/SwapFormPrice';
import SwapFormRow from './SwapFormRow/SwapFormRow';

import SwapConfirmModal from '../SwapConfirmModal/SwapConfirmModal';

const Form = styled.div`
    margin: 0 auto 2rem;
    width: 48rem;
    border-radius: 4rem;
    background: ${COLORS.white};
    padding: 1.6rem;
    ${cardBoxShadow};
    position: relative;

    ${respondDown(Breakpoints.sm)`
        width: 100%;
        padding: 6.6rem 0.8em 2rem;
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
}

const SwapForm = ({ base, counter }: SwapFormProps): React.ReactNode => {
    const [hasError, setHasError] = useState(false);

    const [baseAmount, setBaseAmount] = useState('');
    const [counterAmount, setCounterAmount] = useState('');
    const [bestPathXDR, setBestPathXDR] = useState(null);
    const [bestPath, setBestPath] = useState(null);
    const [bestPools, setBestPools] = useState(null);
    const [estimatePending, setEstimatePending] = useState(false);

    const [isPriceReverted, setIsPriceReverted] = useState(false);

    const debouncedAmount = useDebounce(baseAmount, 700);

    const [assetsList, setAssetsList] = useState(null);

    const history = useHistory();
    const { account, isLogged } = useAuthStore();

    const { processNewAssets } = useAssetsStore();

    useEffect(() => {
        getAssetsList().then(res => {
            processNewAssets(res);
            setAssetsList(res);
        });
    }, []);

    useEffect(() => {
        if (debouncedAmount.current !== baseAmount) {
            return;
        }
        if (Number(debouncedAmount.current)) {
            setEstimatePending(true);

            findSwapPath(
                SorobanService.getAssetContractId(base),
                SorobanService.getAssetContractId(counter),
                debouncedAmount.current,
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
                setIsPriceReverted(false);
            }
        });
    };

    const onAmountChange = value => {
        setBaseAmount(value);
    };

    const revertAssets = () => {
        history.push(`${MainRoutes.swap}/${getAssetString(counter)}/${getAssetString(base)}`);
        setBaseAmount(counterAmount ?? '');
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

        if (account && Number(baseAmount) > account?.getAssetBalance(base)) {
            return 'Insufficient balance';
        }

        return 'Swap assets';
    };

    return (
        <Form>
            <SettingsButton onClick={() => ModalService.openModal(SwapSettingsModal, {})}>
                <SettingsIcon />
            </SettingsButton>

            <SwapRows>
                <SwapFormRow
                    isBase
                    asset={base}
                    setAsset={setSource}
                    amount={baseAmount}
                    setAmount={onAmountChange}
                    assetsList={assetsList}
                    usdEquivalent={
                        <AmountUsdEquivalent amount={debouncedAmount.current} asset={base} />
                    }
                />

                <SwapFormDivider pending={estimatePending} onRevert={revertAssets} />

                <SwapFormRow
                    asset={counter}
                    setAsset={setDestination}
                    amount={counterAmount}
                    assetsList={assetsList}
                    usdEquivalent={
                        <AmountUsdEquivalent
                            amount={counterAmount}
                            asset={counter}
                            sourceAmount={baseAmount}
                            sourceAsset={base}
                        />
                    }
                />
            </SwapRows>

            <SwapFormPrice
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
                isRounded
                fullWidth
                disabled={
                    hasError ||
                    (account && Number(baseAmount) > account?.getAssetBalance(base)) ||
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
