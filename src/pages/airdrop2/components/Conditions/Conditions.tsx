import * as React from 'react';
import styled from 'styled-components';
import { Breakpoints, COLORS } from '../../../../common/styles';
import ExternalLink from '../../../../common/basics/ExternalLink';
import Input from '../../../../common/basics/Input';
import Button from '../../../../common/basics/Button';
import { respondDown } from '../../../../common/mixins';

const Container = styled.section`
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 78rem;
    margin: -9rem auto 0;
    padding: 3.2rem 1.6rem 1.6rem;
    background: ${COLORS.white};
    box-shadow: 0 2rem 3rem rgba(0, 6, 54, 0.06);
    border-radius: 0.5rem;
    letter-spacing: 0;

    ${respondDown(Breakpoints.sm)`
        margin: 1rem auto 0;
        padding: 0 1.6rem;
        box-shadow: none;
        width: initial;
        background-color: transparent;
    `}
`;

const Heading = styled.h2`
    font-size: 3.6rem;
    font-weight: 400;
    line-height: 4.2rem;
    color: ${COLORS.titleText};
    margin-bottom: 1.2rem;

    ${respondDown(Breakpoints.md)`
        font-size: 1.8rem;
        line-height: 3rem;
    `}
`;

const LedgerLink = styled.p`
    display: flex;
    align-items: center;
    font-size: 1.8rem;
    line-height: 3.2rem;
    color: ${COLORS.darkGrayText};
    margin-bottom: 1.5rem;

    span {
        margin-right: 0.6rem;
    }
`;

const Cards = styled.div`
    position: relative;
    display: flex;
    align-items: center;

    ${respondDown(Breakpoints.sm)`
        flex-direction: column;
    `}
`;

const Card = styled.div`
    flex: 1;
    min-width: 0;
    position: relative;
    padding: 3rem;
    text-align: center;

    ${respondDown(Breakpoints.sm)`
        max-width: 40rem;
        background: ${COLORS.white};
        box-shadow: 0 2rem 3rem rgba(0, 6, 54, 0.06);
        border-radius: 0.5rem;
        margin-bottom: 1.6rem;
    `}
`;

const Divider = styled.div`
    flex: none;
    height: 13rem;
    width: 0.1rem;
    background-color: rgba(35, 2, 77, 0.1);

    ${respondDown(Breakpoints.sm)`
        display: none;
    `}
`;

const Description = styled.div`
    font-size: 1.8rem;
    font-weight: 400;
    line-height: 3.2rem;
    color: ${COLORS.darkGrayText};

    ${respondDown(Breakpoints.md)`
        font-size: 1.4rem;
        line-height: 2.5rem;
    `}
`;

const FormBlock = styled.div`
    width: 100%;
    padding: 2.5rem 2.4rem 0;
    z-index: 10;

    ${respondDown(Breakpoints.sm)`
        padding: 2.4rem 3.2rem 3.2rem;
        max-width: 40rem;
        background: ${COLORS.white};
        box-shadow: 0 2rem 3rem rgba(0, 6, 54, 0.06);
    `}
`;

const HorizontalDivider = styled.div`
    border-top: 1px solid ${COLORS.border};
    width: 100%;
    margin-bottom: 3rem;

    ${respondDown(Breakpoints.sm)`
        display: none;
    `}
`;

const FormDescription = styled.div`
    color: ${COLORS.paragraphText};
    margin-bottom: 3rem;
    font-size: 1.6rem;
    line-height: 3rem;

    ${respondDown(Breakpoints.sm)`
        font-size: 1.4rem;
        line-height: 2.5rem;
        color: ${COLORS.descriptionText};
        margin-bottom: 1.3rem;
    `}
`;

const Form = styled.form`
    display: flex;
    justify-content: space-around;
    align-items: center;
    width: 100%;
    margin-bottom: 2.6rem;

    ${respondDown(Breakpoints.sm)`
        margin-bottom: 0;
        flex-direction: column;
    `}
`;

const StyledButton = styled(Button)`
    margin-left: 2.5rem;

    ${respondDown(Breakpoints.sm)`
        width: 100%;
        margin-top: 2.7rem;
        margin-left: 0;
    `}
`;

const Conditions = ({ accountId, setAccountId, checkAccount }) => {
    return (
        <Container>
            <Heading>Snapshot Done! 📸</Heading>
            <LedgerLink>
                <span>Taken at ledger</span>
                <ExternalLink href="https://horizon.stellar.org/ledgers/39185028">
                    #39185028
                </ExternalLink>
            </LedgerLink>

            <Cards>
                <Card>
                    <Heading>Jan. 15, 2022</Heading>
                    <Description>
                        Snapshot of the Stellar network was taken at 00:00:00 UTC.
                    </Description>
                </Card>
                <Divider />
                <Card>
                    <Heading>{'>'}500 XLM</Heading>
                    <Description>
                        And at least 1 AQUA in your Stellar wallet to be eligible.
                    </Description>
                </Card>
            </Cards>
            <FormBlock>
                <HorizontalDivider />
                <FormDescription>
                    Check your Stellar addresses to see if they're eligible
                </FormDescription>
                <Form>
                    <Input
                        placeholder="Enter your public key (starts with G)"
                        value={accountId}
                        onChange={(e) => setAccountId(e.target.value)}
                    />
                    <StyledButton
                        isBig
                        onClick={(e) => {
                            e.preventDefault();
                            checkAccount();
                        }}
                    >
                        Check
                    </StyledButton>
                </Form>
            </FormBlock>
        </Container>
    );
};

export default Conditions;
