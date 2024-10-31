import { useEffect, useState } from 'react';
import styled from 'styled-components';

import { findSwapPath } from 'api/amm';
import { getMoonpayBuyQuote, getMoonpayCurrencies, getMoonpayProxyFees } from 'api/moonpay';

import {
    MOONPAY_CURRENCY_PREFIXES,
    DEFAULT_BUY_CRYPTO_CODE,
    DEFAULT_BUY_CRYPTO_CODE_TEST,
} from 'constants/moonpay';

import { getAquaAssetData } from 'helpers/assets';
import { getIsTestnetEnv } from 'helpers/env';
import { formatBalance, roundToPrecision } from 'helpers/format-number';
import { getAquaContract, getXlmContract } from 'helpers/soroban';

import { useDebounce } from 'hooks/useDebounce';

import useAuthStore from 'store/authStore/useAuthStore';

import { ModalService, ToastService } from 'services/globalServices';

import { MoonpayCurrencies, MoonpayCurrency, MoonpayQuote } from 'types/api-moonpay';

import {
    cardBoxShadow,
    flexAllCenter,
    flexColumn,
    flexColumnCenter,
    flexRowSpaceBetween,
} from 'web/mixins';
import BuyAquaConfirmModal from 'web/modals/BuyAquaConfirmModal';
import BuyAquaCurrencyModal from 'web/modals/BuyAquaCurrencyModal';
import { COLORS } from 'web/styles';

import ArrowRight from 'assets/icon-arrow-right.svg';
import SwapIcon from 'assets/icon-arrows-circle.svg';

import { BlankButton, Button, CircleButton } from 'basics/buttons';
import { BlankInput, Input } from 'basics/inputs';
import { PageLoader } from 'basics/loaders';

const Wrapper = styled.div`
    ${flexAllCenter};
`;

const Container = styled.div`
    ${cardBoxShadow};
    ${flexColumn};
    width: 62.4rem;
    height: 50.4rem;
    margin-top: 14.4rem;
    margin-bottom: 18rem;
    padding: 4.8rem;
`;

const HeaderContainer = styled.div`
    ${flexRowSpaceBetween};
    margin-bottom: 4rem;
`;

const ContentContainer = styled.div`
    ${flexColumnCenter};
`;

const FooterContainer = styled.div`
    margin-top: 3.2rem;
    ${flexAllCenter};
`;

const HeaderTitle = styled.h4`
    font-size: 3.6rem;
    line-height: 4.2rem;
    color: ${COLORS.titleText};
    font-weight: 400;
`;

const Label = styled.span`
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.descriptionText};
    font-weight: 400;
    opacity: 0.7;
`;

const BaseCurrencyLabel = styled(Label)`
    margin-bottom: 0.8rem;
`;

const CounterCurrencyLabel = styled(Label)`
    margin-top: 3.2rem;
    margin-bottom: 1.6rem;
`;

const ButtonSelect = styled(BlankButton)`
    ${flexAllCenter};
    background-color: ${COLORS.lightGray};
    color: ${COLORS.titleText};
    margin-left: 1rem;
    border-radius: 0.6rem;
    padding: 0.8rem 1.6rem;
    font-size: 1.6rem;
    line-height: 2.8rem;
`;

const ButtonArrowIcon = styled(ArrowRight)`
    transform: rotate(90deg);
    margin-left: 0.8rem;
`;

const SwitchButton = styled(CircleButton)`
    transform: rotate(90deg);
    margin-top: 3.2rem;
`;

const AmountInput = styled(BlankInput)`
    text-align: center;
    color: ${COLORS.titleText};
    caret-color: ${COLORS.purple};
    font-size: 5.4rem;
    font-weight: 700;

    &:focus {
        border: none;
    }
`;

const BuyAqua = (): JSX.Element => {
    const { isLogged } = useAuthStore();
    const [availableCurrencies, setAvailableCurrencies] = useState<MoonpayCurrencies>(null);
    const [currentCurrency, setCurrentCurrency] = useState(null);
    const [baseAmount, setBaseAmount] = useState('');
    const [counterAmount, setCounterAmount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingRates, setIsLoadingRates] = useState(true);
    const [quote, setQuote] = useState<MoonpayQuote>(null);
    const [proxyFee, setProxyFee] = useState<number>(0);

    const debouncedAmount = useDebounce(baseAmount, 700, true);

    const baseContract = getAquaContract();
    const counterContract = getXlmContract();

    const isTestnet = getIsTestnetEnv();
    const { aquaCode } = getAquaAssetData();

    const counterCurrencyCode = isTestnet ? DEFAULT_BUY_CRYPTO_CODE_TEST : DEFAULT_BUY_CRYPTO_CODE;

    const isContinueDisabled = Number(baseAmount) === 0 || isLoadingRates;

    const currencyPrefix = MOONPAY_CURRENCY_PREFIXES[currentCurrency?.code];
    const amountInputValue = !baseAmount ? '' : `${currencyPrefix}${baseAmount}`;

    const onChangeInput = (value, newCurrency?: MoonpayCurrency) => {
        const precision = newCurrency?.precision || currentCurrency?.precision;
        const newPrefix = MOONPAY_CURRENCY_PREFIXES[newCurrency?.code] || currencyPrefix;
        const pureValue = value.toString().replace(newPrefix, '');
        const pureeValueNum = Number(pureValue);

        if (Number.isNaN(pureeValueNum)) {
            return;
        }

        if (pureValue && pureeValueNum !== 0) {
            setIsLoadingRates(true);
        }

        setBaseAmount(roundToPrecision(pureValue, precision));
    };

    useEffect(() => {
        getMoonpayProxyFees()
            .then(fee => {
                setProxyFee(fee);
            })
            .catch(e => {
                console.log(e);
                ToastService.showErrorToast(e.message ?? e.toString());
            });

        console.log('Base contract ' + baseContract);
        console.log('Counter contract ' + counterContract);
        getMoonpayCurrencies()
            .then(currencies => {
                setAvailableCurrencies(currencies.filter(currency => currency.type === 'fiat'));
                const usd = currencies.find(currency => currency.code === 'usd');
                console.log('selected currency:');
                console.log(usd);
                setCurrentCurrency(usd);
                onChangeInput(usd.minBuyAmount, usd);
            })
            .catch(e => {
                console.log(e);
                ToastService.showErrorToast(e.message ?? e.toString());
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    useEffect(() => {
        if (!currentCurrency || !baseAmount || Number(baseAmount) === 0) {
            setIsLoadingRates(false);
            return;
        }
        setIsLoadingRates(true);

        getMoonpayBuyQuote({
            cryptoCode: counterCurrencyCode,
            baseCurrencyCode: currentCurrency.code,
            baseCurrencyAmount: baseAmount,
        })
            .then(quote => {
                setQuote(quote);
                console.log('moonpay quote: ');
                console.log(quote);
                return quote;
            })
            .then((quote: MoonpayQuote) => {
                findSwapPath(baseContract, counterContract, quote.quoteCurrencyAmount)
                    .then(res => {
                        if (res.success) {
                            // setError(false);
                            // setEstimatePending(false);
                            // if (!baseAmount) {
                            //     return;
                            // }
                            setCounterAmount(Number(res.amount) / 1e7);
                            // setBestPathXDR(res.swap_chain_xdr);
                            // setBestPath(res.tokens);
                            // setBestPools(res.pools);
                        } else {
                            // setError(true);
                            // setCounterAmount('');
                            // setEstimatePending(false);
                        }
                    })
                    .catch(e => ToastService.showErrorToast(e.message ?? e.toString()))
                    .finally(() => {
                        setIsLoadingRates(false);
                    });
            })
            .catch(e => {
                ToastService.showErrorToast(e.message ?? e.toString());
                setIsLoadingRates(false);
            });
    }, [debouncedAmount, currentCurrency]);

    const onChooseCurrency = currency => {
        setCurrentCurrency(currency);
        onChangeInput(currency.minBuyAmount, currency);
    };

    const openCurrencyModal = () => {
        ModalService.openModal(BuyAquaCurrencyModal, {
            availableCurrencies,
            currentCurrency,
            onChooseCurrency,
        });
    };

    const openConfirmModal = () => {
        ModalService.openModal(BuyAquaConfirmModal, {
            quote,
            counterAmount,
            counterCurrencyCode,
            proxyFee,
        });
    };

    if (isLoading) {
        return <PageLoader />;
    }

    return (
        <Wrapper>
            <Container>
                <HeaderContainer>
                    <HeaderTitle>Buy {aquaCode}</HeaderTitle>
                    <Label>
                        <Wrapper>
                            For:
                            <ButtonSelect onClick={() => openCurrencyModal()}>
                                {currentCurrency.code.toUpperCase()} - {currentCurrency.name}{' '}
                                <ButtonArrowIcon />
                            </ButtonSelect>
                        </Wrapper>
                    </Label>
                </HeaderContainer>
                <ContentContainer>
                    <BaseCurrencyLabel>
                        {currentCurrency.code.toUpperCase()} amount:
                    </BaseCurrencyLabel>
                    <AmountInput
                        autoFocus
                        value={amountInputValue}
                        onChange={({ target }) => onChangeInput(target.value)}
                        placeholder={`Enter ${currencyPrefix} amount`}
                        inputMode="decimal"
                    />

                    {isLoadingRates ? (
                        <PageLoader />
                    ) : (
                        <SwitchButton onClick={() => {}} disabled>
                            <SwapIcon />
                        </SwitchButton>
                    )}
                    <CounterCurrencyLabel>
                        {formatBalance(counterAmount, true)} {aquaCode}
                    </CounterCurrencyLabel>
                </ContentContainer>
                <FooterContainer>
                    <Button
                        isBig
                        fullWidth
                        disabled={isContinueDisabled}
                        onClick={() => openConfirmModal()}
                    >
                        Continue
                    </Button>
                </FooterContainer>
            </Container>
        </Wrapper>
    );
};

export default BuyAqua;
