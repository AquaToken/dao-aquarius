import { MoonPayBuyWidget } from '@moonpay/moonpay-react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

import {
    getMoonpayProxyMemo,
    getMoonpayProxyAddress,
    getMoonpayProxyTrx,
    getMoonpayUrlSignature,
} from 'api/moonpay';

import { INTERVAL_IDS, INTERVAL_TIMES } from 'constants/intervals';
import { MOONPAY_USDC_CODE } from 'constants/moonpay';

import { getAquaAssetData } from 'helpers/assets';
import { getIsTestnetEnv } from 'helpers/env';
import { formatBalance } from 'helpers/format-number';
import Intervals from 'helpers/intervals';
import { getMoonpayCurrencyPrefix } from 'helpers/moonpay';

import useAuthStore from 'store/authStore/useAuthStore';

import { ToastService } from 'services/globalServices';

import { MoonpayQuote, ProxyTrxResponse } from 'types/api-moonpay';
import { ModalProps } from 'types/modal';

import {
    customScroll,
    flexAllCenter,
    flexColumn,
    flexRowSpaceBetween,
    respondDown,
    respondUp,
} from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import AquaLogoSmall from 'assets/aqua-logo-small.svg';
import IconArrowRight from 'assets/icon-link-arrow.svg';

import { Button } from 'basics/buttons';
import { DotsLoader } from 'basics/loaders';
import { ModalDescription, ModalTitle } from 'basics/ModalAtoms';

const Container = styled.div`
    width: 52.8rem;
    display: flex;
    flex-direction: column;

    ${respondDown(Breakpoints.md)`
        width: 100%;
    `}
`;

const CenteredWrapper = styled.div`
    ${flexAllCenter};
`;

const ListWrapper = styled.div`
    ${flexColumn};
    margin-top: 3.2rem;
    margin-bottom: 3.2rem;
`;

const ListItem = styled.div`
    ${flexRowSpaceBetween};
    padding: 1rem 0;
`;

const GrayText = styled.div`
    color: ${COLORS.grayText};
`;

const TitleText = styled.div`
    color: ${COLORS.titleText};
`;

const StyledModalDescription = styled(ModalDescription)`
    margin-bottom: 0;
    ${customScroll};

    ${respondUp(Breakpoints.md)`
       max-height: 90vh;
    `};
`;

const AquaBlock = styled.div`
    display: flex;
    background-color: ${COLORS.lightGray};
    padding: 2.4rem;
`;

const AquaLogo = styled(AquaLogoSmall)`
    width: 5.6rem;
    height: 5.6rem;
    margin-right: 1.6rem;
`;

const AquaInfoBlock = styled.div`
    ${flexColumn};
    flex: 1;
`;

const AquaDescription = styled.div`
    color: ${COLORS.descriptionText};
    font-size: 1.6rem;
    line-height: 2.8rem;
`;

const AquaValue = styled.div`
    color: ${COLORS.paragraphText};
    font-size: 1.6rem;
    line-height: 2.8rem;
`;

const StyledIconArrowRight = styled(IconArrowRight)`
    margin: 0 0.8rem;
    height: 100%;
`;

const HeaderDescription = styled.div`
    font-size: 1.6rem;
    line-height: 2.8rem;
    margin-bottom: 1rem;
    color: ${COLORS.grayText};
`;

const EmojiBlock = styled.div`
    font-size: 2.4rem;
    margin-right: 1.6rem;
`;

const FooterDescription = styled.div`
    display: flex;
    font-size: 1.6rem;
    line-height: 2.4rem;
    margin-top: 1.6rem;
    color: ${COLORS.grayText};
`;

const CoinDiscolaimer = styled.div`
    margin-top: 1.6rem;
    display: flex;
    justify-content: end;
    color: ${COLORS.purple};
    font-size: 1.4rem;
    font-weight: 600;
`;

interface BuyAquaCurrencyModalParams {
    quote: MoonpayQuote;
    counterAmount: number;
    counterCurrencyCode: string;
    proxyFee: number;
}

const BuyAquaConfirmModal = ({
    params,
    close,
}: ModalProps<BuyAquaCurrencyModalParams>): JSX.Element => {
    const { account } = useAuthStore();

    const [isConfirmed, setIsConfirmed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [proxyMemo, setProxyMemo] = useState('');
    const [proxyAddress, setProxyAddress] = useState('');
    const [proxyTrx, setProxyTrx] = useState<ProxyTrxResponse>(null);

    const { quote, counterAmount, counterCurrencyCode, proxyFee } = params;
    const userAddress = account?.accountId();
    const isPaymentReceived = proxyTrx?.operation_status === 'payment';

    const {
        baseCurrencyAmount,
        baseCurrencyCode,
        quoteCurrencyCode,
        quoteCurrencyAmount,
        networkFeeAmount,
        extraFeeAmount,
        feeAmount,
    } = quote;

    const { aquaCode } = getAquaAssetData();
    const currencyPrefix = getMoonpayCurrencyPrefix(baseCurrencyCode);
    // Hardcoded for now, as we only support USDC
    const quoteUiCode =
        quoteCurrencyCode === MOONPAY_USDC_CODE ? 'USDC' : quoteCurrencyCode.toUpperCase();
    const isConfirmDisabled = isLoading || !userAddress;
    const totalFee = feeAmount + extraFeeAmount + networkFeeAmount;

    useEffect(() => {
        if (!isPaymentReceived) {
            return;
        }

        close();

        ToastService.showSuccessToast(
            `Your AQUA tokens are on its way, you will receive them to your wallet shortly`,
        );
    }, [isPaymentReceived]);

    useEffect(
        () => () => {
            Intervals.stop(INTERVAL_IDS.moonpayProxyTrx);
        },
        [],
    );

    const handleGetSignature = (url: string): Promise<string> => {
        const signature = getMoonpayUrlSignature(url)
            .then(signature => signature)
            .catch(e => {
                ToastService.showErrorToast(e.message ?? e.toString());
                return '';
            });

        return signature;
    };

    const onClickConfirm = () => {
        setIsLoading(true);
        getMoonpayProxyMemo(userAddress)
            .then(memo => {
                setProxyMemo(memo);
            })
            .then(() => getMoonpayProxyAddress(userAddress))
            .then(address => {
                setIsLoading(false);
                setIsConfirmed(true);
                setProxyAddress(address);

                Intervals.set(
                    INTERVAL_IDS.moonpayProxyTrx,
                    () =>
                        getMoonpayProxyTrx(address).then(trxList => {
                            if (trxList.length > 0) {
                                setProxyTrx(trxList[0]);
                            }
                        }),
                    {
                        timeout: INTERVAL_TIMES.moonpayProxyTrx,
                    },
                );
            })
            .catch(e => {
                ToastService.showErrorToast(e.message ?? e.toString());
            });
    };

    const listValues = [
        {
            description: 'Transit token amount',
            value: `${quoteCurrencyAmount} ${quoteUiCode}`,
        },
        {
            description: 'Payment route',
            value: (
                <CenteredWrapper>
                    {baseCurrencyCode.toUpperCase()} <StyledIconArrowRight />
                    {quoteUiCode} <StyledIconArrowRight />
                    {aquaCode}
                </CenteredWrapper>
            ),
        },
        {
            description: 'Payment provider fee',
            value: `${totalFee} ${baseCurrencyCode.toUpperCase()}`,
        },
        {
            description: 'Operational costs',
            value: `${proxyFee} ${quoteUiCode}`,
        },
    ];

    return (
        <Container>
            <ModalTitle>Buy {aquaCode} with Galaxy Ramp</ModalTitle>
            <StyledModalDescription>
                {isConfirmed && (
                    <HeaderDescription>
                        You purchase {quoteUiCode} as a transit token, which will automatically be{' '}
                        converted into {aquaCode} using Stellar smart contracts.
                    </HeaderDescription>
                )}

                {proxyAddress && !isPaymentReceived && (
                    <MoonPayBuyWidget
                        theme="light"
                        style={{ margin: '0', width: '100%', height: '560px', borderRadius: '0px' }}
                        variant="embedded"
                        walletAddress={proxyAddress}
                        walletAddressTag={proxyMemo}
                        baseCurrencyCode={baseCurrencyCode}
                        baseCurrencyAmount={baseCurrencyAmount.toString()}
                        defaultCurrencyCode={counterCurrencyCode}
                        // currencyCode if provided, skips confirm screen and goes directly to payment lol
                        currencyCode={counterCurrencyCode}
                        // Can be used for some statistics or analytics tracking
                        // onLogin={async () => console.log('Customer logged in!')}
                        // Used for wallet address passed to the widget
                        onUrlSignatureRequested={getIsTestnetEnv() ? undefined : handleGetSignature}
                    />
                )}

                {!isConfirmed && (
                    <>
                        <AquaBlock>
                            <AquaLogo />
                            <AquaInfoBlock>
                                <AquaDescription>Buying: </AquaDescription>
                                <AquaValue>
                                    {formatBalance(counterAmount, true)} {aquaCode}
                                </AquaValue>
                            </AquaInfoBlock>
                            <AquaInfoBlock>
                                <AquaDescription>For: </AquaDescription>
                                <AquaValue>
                                    {currencyPrefix}
                                    {formatBalance(baseCurrencyAmount, true)}
                                </AquaValue>
                            </AquaInfoBlock>
                        </AquaBlock>
                        <ListWrapper>
                            {listValues.map(({ description, value }) => (
                                <ListItem key={description}>
                                    <GrayText>{description}</GrayText>
                                    <TitleText>{value}</TitleText>
                                </ListItem>
                            ))}
                        </ListWrapper>
                        <Button
                            isBig
                            fullWidth
                            disabled={isConfirmDisabled}
                            onClick={onClickConfirm}
                        >
                            {isLoading ? (
                                <>
                                    Loading payment provider app
                                    <DotsLoader />
                                </>
                            ) : (
                                'Confirm order'
                            )}
                        </Button>
                        <FooterDescription>
                            <EmojiBlock>☝️</EmojiBlock>
                            <div>
                                You will be redirected to Moonpay to purchase {quoteUiCode} as a
                                transit token. This token will then be automatically converted into{' '}
                                {aquaCode} using Stellar smart contracts.
                            </div>
                        </FooterDescription>
                    </>
                )}
            </StyledModalDescription>
            <CoinDiscolaimer>
                Powered by Galaxy Ramp, a Coindisco Ltd. product. © 2024
            </CoinDiscolaimer>
        </Container>
    );
};

export default BuyAquaConfirmModal;
