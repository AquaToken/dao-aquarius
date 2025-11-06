import * as React from 'react';

import Input from 'basics/inputs/Input';
import { ExternalLink } from 'basics/links';

import {
    Container,
    Heading,
    LedgerLink,
    Cards,
    Card,
    Divider,
    Description,
    FormBlock,
    HorizontalDivider,
    FormDescription,
    Form,
    StyledButton,
} from './Conditions.styled';

interface ConditionsProps {
    accountId: string;
    setAccountId: (value: string) => void;
    checkAccount: () => void;
}

const Conditions: React.FC<ConditionsProps> = ({ accountId, setAccountId, checkAccount }) => (
    <Container>
        <Heading>Snapshot Done! 📸</Heading>
        <LedgerLink>
            <span>Taken at ledger</span>
            <ExternalLink href="https://stellar.expert/explorer/public/ledger/39185028">
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
                    onChange={e => setAccountId(e.target.value)}
                />
                <StyledButton
                    isBig
                    onClick={(e: React.MouseEvent) => {
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

export default Conditions;
