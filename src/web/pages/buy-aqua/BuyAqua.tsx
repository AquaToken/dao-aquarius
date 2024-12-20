import { useEffect, useState } from 'react';
import styled from 'styled-components';

import { findSwapPath } from 'api/amm';
import { getMoonpayBuyQuote, getMoonpayCurrencies, getMoonpayProxyFees } from 'api/moonpay';

import { DEFAULT_FIAT_CURRENCY } from 'constants/moonpay';

import { getAquaAssetData } from 'helpers/assets';
import { getIsTestnetEnv } from 'helpers/env';
import { formatBalance, roundToPrecision } from 'helpers/format-number';
import { getMoonpayCurrencyPrefix, getMoonpayProxyCrypto } from 'helpers/moonpay';
import { getAquaContract, getUsdcContract, getXlmContract } from 'helpers/soroban';

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
import ChooseLoginMethodModal from 'web/modals/auth/ChooseLoginMethodModal';
import BuyAquaConfirmModal from 'web/modals/BuyAquaConfirmModal';
import BuyAquaCurrencyModal from 'web/modals/BuyAquaCurrencyModal';
import { COLORS } from 'web/styles';

import IconArrowRight from 'assets/icon-arrow-right.svg';

import { BlankButton, Button } from 'basics/buttons';
import { BlankInput } from 'basics/inputs';
import { CircleLoader, PageLoader } from 'basics/loaders';

import NoTrustline from 'components/NoTrustline';

const CenteredWrapper = styled.div`
    ${flexAllCenter};
`;

const Container = styled.div`
    ${cardBoxShadow};
    ${flexColumn};
    background-color: ${COLORS.white};
    width: 62.4rem;
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
    height: 2.8rem;
    margin-bottom: 1.6rem;
`;

const ErrorCounterCurrencyLabel = styled(CounterCurrencyLabel)`
    color: ${COLORS.pinkRed};
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

const ButtonArrowIcon = styled(IconArrowRight)`
    transform: rotate(90deg);
    margin-left: 0.8rem;
`;

const CircleLoaderWrapper = styled(CircleLoader)`
    line-height: 2.8rem;
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
    const { isLogged, account } = useAuthStore();
    const [availableCurrencies, setAvailableCurrencies] = useState<MoonpayCurrencies>(null);
    const [currentCurrency, setCurrentCurrency] = useState(null);
    const [baseAmount, setBaseAmount] = useState('');
    const [counterAmount, setCounterAmount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingRates, setIsLoadingRates] = useState(true);
    const [quote, setQuote] = useState<MoonpayQuote>(null);
    const [proxyFee, setProxyFee] = useState<number>(0);

    const { aquaCode, aquaStellarAsset } = getAquaAssetData();

    const debouncedAmount = useDebounce(baseAmount, 700, true);

    const hasTrustline = account?.getAssetBalance(aquaStellarAsset) !== null;

    const baseContract = getIsTestnetEnv() ? getXlmContract() : getUsdcContract();
    const counterContract = getAquaContract();
    const proxyCryptoCode = getMoonpayProxyCrypto();

    const currencyPrefix = getMoonpayCurrencyPrefix(currentCurrency?.code);
    const amountInputValue = !baseAmount ? '' : `${currencyPrefix}${baseAmount}`;
    const isWrongAmount =
        baseAmount > currentCurrency?.maxBuyAmount || baseAmount < currentCurrency?.minBuyAmount;
    const isContinueDisabled = isLogged
        ? Number(baseAmount) === 0 || isLoadingRates || isWrongAmount || !hasTrustline
        : false;

    const onChangeInput = (value, newCurrency?: MoonpayCurrency) => {
        const precision = newCurrency?.precision || currentCurrency?.precision;
        const newPrefix = getMoonpayCurrencyPrefix(newCurrency?.code) || currencyPrefix;
        const pureValue = value.toString().replace(newPrefix, '');
        const pureValueNum = Number(pureValue);

        if (Number.isNaN(pureValueNum)) {
            return;
        }

        if (pureValue && pureValueNum !== 0) {
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
                ToastService.showErrorToast(e.message ?? e.toString());
            });

        getMoonpayCurrencies()
            .then(currencies => {
                setAvailableCurrencies(currencies.filter(currency => currency.type === 'fiat'));
                const usd = currencies.find(currency => currency.code === DEFAULT_FIAT_CURRENCY);
                setCurrentCurrency(usd);
                onChangeInput(usd.minBuyAmount, usd);
            })
            .catch(e => {
                ToastService.showErrorToast(e.message ?? e.toString());
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    useEffect(() => {
        if (!currentCurrency || !baseAmount || Number(baseAmount) === 0 || isWrongAmount) {
            setIsLoadingRates(false);
            return;
        }
        setIsLoadingRates(true);

        getMoonpayBuyQuote({
            cryptoCode: proxyCryptoCode,
            baseCurrencyCode: currentCurrency.code,
            baseCurrencyAmount: baseAmount,
        })
            .then(quote => {
                setQuote(quote);
                return quote;
            })
            .then((quote: MoonpayQuote) => {
                findSwapPath(baseContract, counterContract, quote.quoteCurrencyAmount)
                    .then(res => {
                        if (res.success) {
                            setCounterAmount(Number(res.amount) / 1e7);
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
    }, [debouncedAmount]);

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
            counterCurrencyCode: proxyCryptoCode,
            proxyFee,
        });
    };

    const openSignInModal = () => {
        ModalService.openModal(ChooseLoginMethodModal, {});
    };

    if (isLoading) {
        return <PageLoader />;
    }

    return (
        <CenteredWrapper>
            <Container>
                <HeaderContainer>
                    <HeaderTitle>Buy {aquaCode}</HeaderTitle>
                    <Label>
                        <CenteredWrapper>
                            For:
                            <ButtonSelect onClick={() => openCurrencyModal()}>
                                {currentCurrency.code.toUpperCase()} - {currentCurrency.name}{' '}
                                <ButtonArrowIcon />
                            </ButtonSelect>
                        </CenteredWrapper>
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

                    {isWrongAmount ? (
                        <ErrorCounterCurrencyLabel>
                            Min - {currencyPrefix}
                            {currentCurrency.minBuyAmount}. Max - {currencyPrefix}
                            {currentCurrency.maxBuyAmount}
                        </ErrorCounterCurrencyLabel>
                    ) : (
                        <CounterCurrencyLabel>
                            {isLoadingRates ? (
                                <CircleLoaderWrapper size="small" />
                            ) : (
                                `${formatBalance(counterAmount, true)} ${aquaCode}`
                            )}
                        </CounterCurrencyLabel>
                    )}
                    <NoTrustline asset={aquaStellarAsset} />
                </ContentContainer>
                <FooterContainer>
                    <Button
                        isBig
                        fullWidth
                        disabled={isContinueDisabled}
                        onClick={isLogged ? openConfirmModal : openSignInModal}
                    >
                        {isLogged ? 'Continue' : 'Connect wallet'}
                    </Button>
                </FooterContainer>
            </Container>
        </CenteredWrapper>
    );
};

export default BuyAqua;
