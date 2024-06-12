import * as React from 'react';
import styled from 'styled-components';
import { useEffect, useState } from 'react';
import { Breakpoints, COLORS } from '../styles';
import { respondDown } from '../mixins';
import Button from '../basics/Button';
import { ModalDescription, ModalTitle } from './atoms/ModalAtoms';
import Checkbox from '../basics/Checkbox';

const Container = styled.div`
    width: 52.8rem;

    ${respondDown(Breakpoints.md)`
        width: 100%;
    `}
`;

const CheckboxBlock = styled.div`
    padding: 1.5rem 0 1.6rem;
    border-bottom: 0.1rem dashed ${COLORS.gray};
`;

const StyledButton = styled(Button)`
    margin-top: 3.3rem;
`;

const Warning = styled.div`
    border: 0.1rem solid ${COLORS.pinkRed};
    background-color: ${COLORS.pinkRed}0f;
    padding: 2rem;
    border-radius: 0.5rem;
    margin-top: -3rem;
`;

export const SHOW_PURPOSE_ALIAS_MAIN_NET = 'show purpose main net';

const MainNetPurposeModal = ({ close }) => {
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        if (checked) {
            localStorage.setItem(SHOW_PURPOSE_ALIAS_MAIN_NET, 'false');
        } else {
            localStorage.setItem(SHOW_PURPOSE_ALIAS_MAIN_NET, 'true');
        }
    }, [checked]);

    return (
        <Container>
            <ModalTitle>Aquarius AMM</ModalTitle>
            <ModalDescription>
                <p>Welcome to Aquarius AMM preview. Please note the following important warning:</p>
            </ModalDescription>
            <Warning>
                <h2>Use of Cryptocurrency and Test Version:</h2>
                <ul>
                    <li>
                        <strong>Risk of Loss:</strong> Our site uses cryptocurrency for transactions
                        and operations. Cryptocurrencies are highly volatile and can significantly
                        change in value over short periods of time. There is a risk of losing all
                        invested funds.
                    </li>
                    <li>
                        <strong>Test Version:</strong> This is a test version of our site. As such,
                        it may contain bugs, errors, and incomplete features that could affect your
                        experience and the security of your funds.
                    </li>
                    <li>
                        <strong>Security:</strong> Ensure you understand the principles of working
                        with cryptocurrencies and take all necessary measures to protect your funds,
                        including using secure wallets and two-factor authentication.
                    </li>
                    <li>
                        <strong>No Guarantees:</strong> We do not provide any guarantees for the
                        return of your funds in case of losses caused by market fluctuations,
                        technical failures, or actions of third parties.
                    </li>
                    <li>
                        <strong>Informed Decision:</strong> Before using our site and conducting any
                        transactions with cryptocurrencies, we strongly recommend that you
                        thoroughly study all available information and, if necessary, consult with a
                        financial advisor.
                    </li>
                </ul>
                <p>
                    By using our site, you confirm that you are aware of the risks and take full
                    responsibility for your actions.
                </p>
            </Warning>

            <CheckboxBlock>
                <Checkbox label="Don’t show again" checked={checked} onChange={setChecked} />
            </CheckboxBlock>

            <StyledButton fullWidth onClick={() => close()}>
                I understand
            </StyledButton>
        </Container>
    );
};

export default MainNetPurposeModal;
