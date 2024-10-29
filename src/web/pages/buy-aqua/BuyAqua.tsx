import { useEffect, useState } from 'react';
import styled from 'styled-components';

import { findSwapPath } from 'api/amm';
import { getMoonpayBuyQuote, getMoonpayCurrencies } from 'api/moonpay';

import { DEFAULT_BUY_CRYPTO_CODE, DEFAULT_BUY_CRYPTO_CODE_TEST } from 'constants/moonpay';

import { getIsTestnetEnv } from 'helpers/env';
import { getMoonpayBaseContract, getMoonpayCounterContract } from 'helpers/moonpay';

import { useDebounce } from 'hooks/useDebounce';

import useAuthStore from 'store/authStore/useAuthStore';

import { ModalService, ToastService } from 'services/globalServices';

import { MoonpayCurrencies, MoonpayQuote } from 'types/api-moonpay';

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

import { BlankButton, Button } from 'basics/buttons';
import { Input } from 'basics/inputs';
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

const BuyAqua = (): JSX.Element => {
    const { isLogged } = useAuthStore();
    const [availableCurrencies, setAvailableCurrencies] = useState<MoonpayCurrencies>(null);
    const [currentCurrency, setCurrentCurrency] = useState(null);
    const [baseAmount, setBaseAmount] = useState('');
    const [counterAmount, setCounterAmount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingRates, setIsLoadingRates] = useState(true);
    const [quote, setQuote] = useState<MoonpayQuote>(null);

    const debouncedAmount = useDebounce(baseAmount, 700, true);

    const baseContract = getMoonpayBaseContract();
    const counterContract = getMoonpayCounterContract();

    const isTestnet = getIsTestnetEnv();
    const counterCurrencyCode = isTestnet ? DEFAULT_BUY_CRYPTO_CODE_TEST : DEFAULT_BUY_CRYPTO_CODE;

    const isContinueDisabled = !baseAmount || isLoadingRates;

    const onChangeInput = value => {
        if (Number.isNaN(Number(value))) {
            return;
        }
        if (value) {
            setIsLoadingRates(true);
        }
        setBaseAmount(value);
    };

    useEffect(() => {
        console.log('Base contract ' + baseContract);
        console.log('Counter contract ' + counterContract);
        getMoonpayCurrencies()
            .then(currencies => {
                setAvailableCurrencies(currencies.filter(currency => currency.type === 'fiat'));
                const usd = currencies.find(currency => currency.code === 'usd');
                console.log('selected currency:' + usd);
                console.log(usd);
                setCurrentCurrency(usd);
                onChangeInput(usd.minBuyAmount);
            })
            .catch(e => {
                ToastService.showErrorToast(e.message ?? e.toString());
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    useEffect(() => {
        if (!currentCurrency && !baseAmount) {
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
                            setCounterAmount((Number(res.amount) / 1e7).toFixed(7));
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
        onChangeInput(currency.minBuyAmount);
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
        });
    };

    if (isLoading) {
        return <PageLoader />;
    }

    return (
        <Wrapper>
            <Container>
                <HeaderContainer>
                    <HeaderTitle>Buy AQUA</HeaderTitle>
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
                    <Label>{currentCurrency.code.toUpperCase()} amount:</Label>
                    <Input
                        value={baseAmount}
                        onChange={({ target }) => onChangeInput(target.value)}
                        placeholder={`Enter ${currentCurrency.code} amount`}
                        inputMode="decimal"
                    />
                    {isLoadingRates && <PageLoader />}
                    <Label>{counterAmount} AQUA</Label>
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
