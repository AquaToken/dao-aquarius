import * as React from 'react';
import createStellarIdenticon from 'stellar-identicon-js';

import { AccountIdenticonImage, AccountInputIdenticonWrapper } from './AccountIdenticon.styled';

interface Props {
    pubKey: string;
}

export const AccountIdenticon = ({ pubKey }: Props) => {
    const url = createStellarIdenticon(pubKey).toDataURL();

    return <AccountIdenticonImage src={url} alt="" />;
};

export const AccountInputIdenticon = ({ pubKey }: Props) => (
    <AccountInputIdenticonWrapper>
        <AccountIdenticon pubKey={pubKey} />
    </AccountInputIdenticonWrapper>
);

export default AccountIdenticon;
