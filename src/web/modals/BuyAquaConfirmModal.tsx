import { MoonPayBuyWidget } from '@moonpay/moonpay-react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

import { getMoonpayFederationMemo, getMoonpayProxyAddress, getMoonpayProxyTrx } from 'api/moonpay';

import { INTERVAL_IDS, INTERVAL_TIMES } from 'constants/intervals';

import { getAquaAssetData } from 'helpers/assets';
import { formatBalance } from 'helpers/format-number';
import Intervals from 'helpers/intervals';
import { getMoonpayCurrencyPrefix } from 'helpers/moonpay';

import useAuthStore from 'store/authStore/useAuthStore';

import { ModalService, ToastService } from 'services/globalServices';

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
// TODO: same icon as assets/icon-arrow-right-long, add colors
import CompleteModalBackImg from 'assets/background-moonpay-complete.svg';
import IconArrowRight from 'assets/icon-link-arrow.svg';

import { Button } from 'basics/buttons';
import { DotsLoader } from 'basics/loaders';
import { ModalDescription, ModalTitle } from 'basics/ModalAtoms';

import BuyAquaCompleteModal from './BuyAquaCompleteModal';

const ModalCompleteBackground = styled(CompleteModalBackImg)`
    object-position: center center;

    ${respondDown(Breakpoints.md)`
        width: 100%;
    `}
`;

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
    margin-bottom: 4.8rem;
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
    ${customScroll};
    ${respondUp(Breakpoints.md)`
       max-height: 70vh;
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

const MoonpayDescription = styled.div`
    font-size: 1.6rem;
    line-height: 2.8rem;
    margin-bottom: 4rem;
    color: ${COLORS.descriptionText};
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
    const [proxyFederation, setProxyFederation] = useState('');
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
        feeAmount,
    } = quote;

    const { aquaCode } = getAquaAssetData();
    const currencyPrefix = getMoonpayCurrencyPrefix(baseCurrencyCode);
    const isConfirmDisabled = isLoading || !userAddress;

    useEffect(() => {
        if (!isPaymentReceived) {
            return;
        }

        close();
        ModalService.openModal(BuyAquaCompleteModal, {}, true, <ModalCompleteBackground />);
    }, [isPaymentReceived]);

    useEffect(
        () => () => {
            Intervals.stop(INTERVAL_IDS.moonpayProxyTrx);
        },
        [],
    );

    const onClickConfirm = () => {
        setIsLoading(true);
        getMoonpayFederationMemo(userAddress)
            .then(federation => {
                setProxyFederation(federation);
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
            value: `${quoteCurrencyAmount} ${quoteCurrencyCode.toUpperCase()}`,
        },
        {
            description: 'Payment route',
            value: (
                <CenteredWrapper>
                    {baseCurrencyCode.toUpperCase()} <StyledIconArrowRight />
                    {quoteCurrencyCode.toUpperCase()} <StyledIconArrowRight />
                    {aquaCode}
                </CenteredWrapper>
            ),
        },
        {
            description: 'Network fee',
            value: `${networkFeeAmount} ${baseCurrencyCode.toUpperCase()}`,
        },
        {
            description: 'Card processing fee',
            value: `${feeAmount} ${baseCurrencyCode.toUpperCase()}`,
        },
        {
            description: 'Aquarius fee',
            value: `${proxyFee} ${quoteCurrencyCode.toUpperCase()}`,
        },
    ];

    return (
        <Container>
            <ModalTitle>{isConfirmed ? 'Purchase with onramp provider' : 'Get AQUA'}</ModalTitle>
            <StyledModalDescription>
                {isConfirmed && (
                    <MoonpayDescription>
                        Aquarius uses Moonpay to on-ramp {quoteCurrencyCode.toUpperCase()} via
                        credit & debit cards that is then automatically converted to {aquaCode}{' '}
                        token
                    </MoonpayDescription>
                )}

                <MoonPayBuyWidget
                    theme="light"
                    style={{ margin: '0', width: '100%', height: '470px' }}
                    variant="embedded"
                    walletAddress={proxyAddress}
                    walletAddressTag={proxyFederation}
                    baseCurrencyCode={baseCurrencyCode}
                    baseCurrencyAmount={baseCurrencyAmount.toString()}
                    defaultCurrencyCode={counterCurrencyCode}
                    // Maybe onUrlSignatureRequested is needed for security or any other reasons??
                    // onUrlSignatureRequested={handleGetSignature}
                    // Can be used for some statistics or analytics tracking
                    // onLogin={async () => console.log('Customer logged in!')}
                    visible={isConfirmed && !isPaymentReceived}
                />

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
                    </>
                )}
            </StyledModalDescription>
        </Container>
    );
};

export default BuyAquaConfirmModal;
