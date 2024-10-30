import { MoonPayBuyWidget } from '@moonpay/moonpay-react';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

import { getMoonpayFederationMemo, getMoonpayProxyAddress } from 'api/moonpay';

import { MainRoutes } from 'constants/routes';

import { getAquaAssetData } from 'helpers/assets';

import useAuthStore from 'store/authStore/useAuthStore';

import { StellarService } from 'services/globalServices';

import { MoonpayQuote } from 'types/api-moonpay';
import { ModalProps } from 'types/modal';

import { flexAllCenter, flexColumn, flexRowSpaceBetween, respondDown, respondUp } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

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

const TermsWrapper = styled.div`
    ${flexAllCenter};
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

const ListDescription = styled.div`
    color: ${COLORS.grayText};
`;

const ListValue = styled.div`
    color: ${COLORS.titleText};
`;

const StyledModalDescription = styled(ModalDescription)`
    ${respondUp(Breakpoints.md)`
       min-height: 40vh;
    `};
`;

interface BuyAquaCurrencyModalParams {
    quote: MoonpayQuote;
    counterAmount: number;
    counterCurrencyCode: string;
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

    const { quote, counterAmount, counterCurrencyCode } = params;
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
            value: `${baseCurrencyCode.toUpperCase()} - ${quoteCurrencyCode.toUpperCase()} - ${aquaCode}`,
        },
        {
            description: 'Network fee',
            value: networkFeeAmount,
        },
        {
            description: 'Card processing fee',
            value: '-',
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
                        <ListWrapper>
                            Buying {counterAmount} AQUA For {baseCurrencyAmount} {baseCurrencyCode}
                            {listValues.map(({ description, value }) => (
                                <ListItem key={description}>
                                    <ListDescription>{description}</ListDescription>
                                    <ListValue>{value}</ListValue>
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
