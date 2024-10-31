import { MoonPayBuyWidget } from '@moonpay/moonpay-react';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

import { getMoonpayFederationMemo, getMoonpayProxyAddress } from 'api/moonpay';

import { MOONPAY_CURRENCY_PREFIXES } from 'constants/moonpay';
import { MainRoutes } from 'constants/routes';

import { getAquaAssetData } from 'helpers/assets';
import { formatBalance } from 'helpers/format-number';

import useAuthStore from 'store/authStore/useAuthStore';

import { StellarService } from 'services/globalServices';

import { MoonpayQuote } from 'types/api-moonpay';
import { ModalProps } from 'types/modal';

import { flexAllCenter, flexColumn, flexRowSpaceBetween, respondDown, respondUp } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import AquaLogoSmall from 'assets/aqua-logo-small.svg';
// TODO: same icon as assets/icon-arrow-right-long, add colors
import IconArrowRight from 'assets/icon-link-arrow.svg';

import { Button } from 'basics/buttons';
import { Input } from 'basics/inputs';
import { PageLoader } from 'basics/loaders';
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

const TermsWrapper = styled(CenteredWrapper)`
    margin-top: 1.6rem;
    font-size: 1rem;
    line-height: 1.8rem;
    color: ${COLORS.grayText};
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
    ${respondUp(Breakpoints.md)`
       min-height: 40vh;
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
    const [userAddress, setUserAddress] = useState(account?.accountId());

    const { quote, counterAmount, counterCurrencyCode, proxyFee } = params;
    console.log(userAddress);
    const {
        baseCurrencyAmount,
        baseCurrencyCode,
        quoteCurrencyCode,
        quoteCurrencyAmount,
        networkFeeAmount,
        feeAmount,
    } = quote;
    console.log(quote);

    const { aquaCode } = getAquaAssetData();
    const currencyPrefix = MOONPAY_CURRENCY_PREFIXES[baseCurrencyCode];

    const onClickConfirm = () => {
        setIsLoading(true);
        getMoonpayFederationMemo(userAddress)
            .then(federation => {
                console.log(federation);
                setProxyFederation(federation);
            })
            .then(() => getMoonpayProxyAddress(userAddress))
            .then(address => {
                setIsLoading(false);
                setIsConfirmed(true);
                setProxyAddress(address);
                console.log(address);
            });
    };

    const listValues = [
        {
            description: 'Payment token',
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
            description: 'Proxy fee',
            value: `${proxyFee} ${quoteCurrencyCode.toUpperCase()}`,
        },
        {
            description: 'Est. processing time',
            value: '-',
        },
        {
            description: 'Total',
            value: '-',
        },
    ];

    const isConfirmDisabled = isLoading || !userAddress;

    const onChangeInput = value => {
        if (!StellarService.isValidPublicKey(value) && value !== '') {
            return;
        }

        setUserAddress(value);
    };

    return (
        <Container>
            <ModalTitle>{isConfirmed ? 'Enter payment information' : 'Get AQUA'}</ModalTitle>
            <StyledModalDescription>
                <MoonPayBuyWidget
                    style={{ margin: '0', width: '100%' }}
                    variant="embedded"
                    walletAddress={proxyAddress}
                    walletAddressTag={proxyFederation}
                    baseCurrencyCode={baseCurrencyCode}
                    baseCurrencyAmount={baseCurrencyAmount.toString()}
                    defaultCurrencyCode={counterCurrencyCode}
                    onLogin={async () => console.log('Customer logged in!')}
                    visible={isConfirmed}
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

                        <Input
                            value={userAddress}
                            onChange={({ target }) => onChangeInput(target.value)}
                            placeholder="Enter stellar address"
                            inputMode="decimal"
                        />
                        <Button
                            isBig
                            fullWidth
                            disabled={isConfirmDisabled}
                            onClick={onClickConfirm}
                        >
                            {isLoading ? <PageLoader /> : 'Confirm order'}
                        </Button>
                        <TermsWrapper>
                            By clicking Confirm Order you agree to our{' '}
                            <NavLink to={MainRoutes.vote} exact title="Terms and Conditions">
                                Terms and Conditions
                            </NavLink>
                        </TermsWrapper>
                    </>
                )}
            </StyledModalDescription>
        </Container>
    );
};

export default BuyAquaConfirmModal;
