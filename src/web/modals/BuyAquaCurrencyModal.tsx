import { useMemo, useState } from 'react';
import styled from 'styled-components';

import { MoonpayCurrencies, MoonpayCurrency } from 'types/api-moonpay';
import { ModalProps } from 'types/modal';

import { flexAllCenter, flexRowSpaceBetween, respondDown, respondUp } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import Search from 'assets/icon-search.svg';
import IconTick16 from 'assets/icon-tick-16.svg';

import { BlankButton } from 'basics/buttons';
import { Input } from 'basics/inputs';
import Label from 'basics/Label';
import { ModalDescription, ModalTitle } from 'basics/ModalAtoms';

const Container = styled.div`
    width: 52.8rem;
    display: flex;
    flex-direction: column;

    ${respondDown(Breakpoints.md)`
        width: 100%;
    `}
`;

const CurrencyInput = styled(Input)`
    margin-top: 4rem;
    margin-bottom: 3.2rem;

    ${respondDown(Breakpoints.md)`
        width: 100%;
    `}
`;

const CurrencyWrapper = styled(BlankButton)`
    ${flexAllCenter};
    width: 100%;
    padding: 1rem 0.8rem;

    &:hover {
        background-color: ${COLORS.gray50};
    }
`;

const CurrencyNameBlock = styled.div`
    ${flexRowSpaceBetween};
    width: 100%;
    margin-left: 1.6rem;
    color: ${COLORS.textPrimary};
`;

const PurpleTickIcon = styled(IconTick16)`
    color: ${COLORS.purple500};
`;

const CustomModalDescription = styled(ModalDescription)`
    ${respondUp(Breakpoints.md)`
        max-height: 50vh;
    `};
`;

interface BuyAquaCurrencyModalParams {
    availableCurrencies: MoonpayCurrencies;
    currentCurrency: MoonpayCurrency;
    onChooseCurrency: (currency: MoonpayCurrency) => void;
}

const BuyAquaCurrencyModal = ({
    params,
    close,
}: ModalProps<BuyAquaCurrencyModalParams>): JSX.Element => {
    const { availableCurrencies, currentCurrency, onChooseCurrency } = params;

    const [searchText, setSearchText] = useState('');

    const filteredCurrencies = useMemo(
        () =>
            availableCurrencies.filter(
                ({ code, name }) =>
                    code.toLowerCase().includes(searchText.toLowerCase()) ||
                    name.toLowerCase().includes(searchText.toLowerCase()),
            ),
        [searchText],
    );

    const onClickCurrency = currency => {
        onChooseCurrency(currency);
        close();
    };

    return (
        <Container>
            <ModalTitle>Payment currency</ModalTitle>

            <CurrencyInput
                placeholder="Search by name or code"
                value={searchText}
                onChange={({ target }) => setSearchText(target.value)}
                postfix={<Search />}
                autoFocus
            />

            <CustomModalDescription>
                {filteredCurrencies.map(currency => {
                    const isSelected = currentCurrency.code === currency.code;

                    return (
                        <CurrencyWrapper
                            key={currency.code}
                            disabled={isSelected}
                            onClick={() => onClickCurrency(currency)}
                        >
                            <Label labelSize="big" labelText={currency.code} />

                            <CurrencyNameBlock>
                                {currency.name} {isSelected && <PurpleTickIcon />}
                            </CurrencyNameBlock>
                        </CurrencyWrapper>
                    );
                })}
                {!filteredCurrencies.length && `Nothing found for search "${searchText}"`}
            </CustomModalDescription>
        </Container>
    );
};

export default BuyAquaCurrencyModal;
