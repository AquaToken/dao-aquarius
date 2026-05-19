import * as React from 'react';

import { isValidContract, isValidPublicKey } from 'services/stellar/utils/validators';

import {
    AccountInput,
    PastePostfixButton,
    PastePostfixContent,
    PastePostfixLabel,
} from './AccountFilterInput.styled';

import { AccountIdenticon, AccountInputIdenticon } from '../AccountIdenticon/AccountIdenticon';
import ResetButton from '../ResetButton/ResetButton';

interface Props {
    value: string;
    accountId: string | null;
    onChange: (value: string) => void;
    onPaste: () => void;
    onClear: () => void;
}

const AccountFilterInput = ({ value, accountId, onChange, onPaste, onClear }: Props) => {
    const hasAccountPrefix = isValidPublicKey(value) || isValidContract(value);

    const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onChange(event.target.value.trim().toUpperCase());
    };

    const renderPostfix = () => {
        if (value) {
            return <ResetButton onClick={onClear} aria-label="Clear account filter" />;
        }

        if (!accountId) {
            return null;
        }

        return (
            <PastePostfixButton onClick={onPaste}>
                <PastePostfixContent>
                    <AccountIdenticon pubKey={accountId} />
                    <PastePostfixLabel>Paste my account</PastePostfixLabel>
                </PastePostfixContent>
            </PastePostfixButton>
        );
    };

    return (
        <AccountInput
            value={value}
            onChange={onInputChange}
            placeholder="Account"
            inputSize="medium"
            $hasLargePostfix={!value && Boolean(accountId)}
            $hasAccountPrefix={hasAccountPrefix}
            prefixCustom={hasAccountPrefix ? <AccountInputIdenticon pubKey={value} /> : null}
            postfix={renderPostfix()}
        />
    );
};

export default AccountFilterInput;
