import styled from 'styled-components';

import { MoonpayQuote } from 'types/api-moonpay';
import { ModalProps } from 'types/modal';

import { respondDown } from 'web/mixins';
import { Breakpoints } from 'web/styles';

import { Button } from 'basics/buttons';
import { ModalDescription, ModalTitle } from 'basics/ModalAtoms';

const Container = styled.div`
    width: 52.8rem;
    display: flex;
    flex-direction: column;

    ${respondDown(Breakpoints.md)`
        width: 100%;
    `}
`;

interface BuyAquaCurrencyModalParams {
    quote: MoonpayQuote;
    counterAmount: number;
    counterCurrencyCode: string;
    proxyFee: number;
}

const BuyAquaCompleteModal = ({ close }: ModalProps<BuyAquaCurrencyModalParams>): JSX.Element => (
    <Container>
        <ModalTitle>Your AQUA are on its way</ModalTitle>
        <ModalDescription>
            Your AQUA tokens are on its way, you will receive them to your wallet shortly
        </ModalDescription>
        <Button isBig onClick={close}>
            Done
        </Button>
    </Container>
);

export default BuyAquaCompleteModal;
